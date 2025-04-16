// src/utils/militaryAI.js
/**
 * AI Strategy Module for Military Decisions
 *
 * This module handles AI decision making for military actions like:
 * - Where to position units
 * - Which territories to attack
 * - What units to train
 * - Which tactical cards to use
 */

import { hexDistance, getNeighbors, hexToId } from "./hexUtils";
import { assessAttackChances } from "./militaryUtils";

/**
 * Calculate the strategic value of a territory
 *
 * @param {Object} territory - Territory to evaluate
 * @param {Object} territories - All territories object
 * @param {Array} playerTerritories - Array of player-owned territory IDs
 * @returns {number} Strategic value score
 */
export const calculateTerritoryValue = (
  territory,
  territories,
  playerTerritories
) => {
  if (!territory) return 0;

  let value = 10; // Base value

  // Resource value
  if (territory.resource) {
    // Strategic resources are most valuable
    if (["iron", "horses", "saltpeter"].includes(territory.resource)) {
      value += 30;
    }
    // Luxury resources add happiness value
    else if (["gems", "silk", "spices", "wine"].includes(territory.resource)) {
      value += 25;
    }
    // Standard resources still have value
    else {
      value += 15;
    }
  }

  // Territory type value
  switch (territory.type) {
    case "plains":
      value += 5; // Good for farms
      break;
    case "hills":
      value += 8; // Good for mines
      break;
    case "mountains":
      value += 10; // Good for defense and sometimes has valuable resources
      break;
    case "forest":
      value += 7; // Good for production
      break;
    default:
      break;
  }

  // Buildings add value
  if (territory.buildings && territory.buildings.length > 0) {
    value += territory.buildings.length * 10;

    // High level buildings are worth more
    territory.buildings.forEach((building) => {
      if (building.level > 1) {
        value += (building.level - 1) * 15;
      }
    });
  }

  // Strategic position value - territories close to player are more valuable
  if (playerTerritories && playerTerritories.length > 0) {
    // Find closest player territory
    let minDistance = Infinity;
    playerTerritories.forEach((playerTerrId) => {
      const playerTerritory = territories[playerTerrId];
      if (playerTerritory) {
        const distance = hexDistance(
          { q: territory.q, r: territory.r },
          { q: playerTerritory.q, r: playerTerritory.r }
        );
        minDistance = Math.min(minDistance, distance);
      }
    });

    // Closer territories are more valuable as targets
    if (minDistance < Infinity) {
      // Territories right next to player are highest priority
      if (minDistance === 1) {
        value += 40;
      } else if (minDistance <= 3) {
        value += 30 - minDistance * 5;
      }
    }
  }

  // Capital territories are extremely valuable
  if (territory.isCapital) {
    value += 100;
  }

  return value;
};

/**
 * Select the best territory to attack
 *
 * @param {Object} ownedTerritories - AI's owned territories
 * @param {Object} allTerritories - All territories object
 * @param {Object} militaryUnits - Military units by territory ID
 * @param {Function} getTerritory - Function to get territory by ID
 * @param {string} playerID - Player's ID
 * @param {string} difficulty - AI difficulty level
 * @returns {Object} Attack plan with source and target territory IDs
 */
export const selectBestAttackTarget = (
  ownedTerritories,
  allTerritories,
  militaryUnits,
  getTerritory,
  playerID = "player1",
  difficulty = "normal"
) => {
  // Get player territories
  const playerTerritories = Object.entries(allTerritories)
    .filter(([_, territory]) => territory.owner === playerID)
    .map(([id]) => id);

  // Get AI's territories with military units
  const aiTerritoriesWithUnits = Object.keys(ownedTerritories).filter(
    (id) => militaryUnits[id] && militaryUnits[id].units.length > 0
  );

  if (aiTerritoriesWithUnits.length === 0) return null;

  const attackPlans = [];

  // For each AI territory with units, evaluate all neighboring targets
  aiTerritoriesWithUnits.forEach((sourceTerritoryId) => {
    const sourceTerritory = allTerritories[sourceTerritoryId];
    const attackingUnits = militaryUnits[sourceTerritoryId].units;

    // Skip if no units available
    if (attackingUnits.length === 0) return;

    // Get neighboring territories
    const neighbors = getNeighbors({
      q: sourceTerritory.q,
      r: sourceTerritory.r,
    });

    // Evaluate each neighboring territory as a potential target
    neighbors.forEach((neighbor) => {
      const targetTerritoryId = hexToId(neighbor);
      const targetTerritory = allTerritories[targetTerritoryId];

      // Skip if no territory data or if AI already owns it
      if (
        !targetTerritory ||
        targetTerritory.owner === ownedTerritories[sourceTerritoryId].owner
      ) {
        return;
      }

      // Get defending units (if any)
      const defendingUnits = militaryUnits[targetTerritoryId]?.units || [];

      // Assess attack chances
      const assessment = assessAttackChances(
        attackingUnits,
        defendingUnits,
        sourceTerritory,
        targetTerritory
      );

      // Calculate strategic value
      const strategicValue = calculateTerritoryValue(
        targetTerritory,
        allTerritories,
        playerTerritories
      );

      // Calculate overall score based on win probability and strategic value
      let attackScore = assessment.winProbability * 100 + strategicValue;

      // Adjust score based on difficulty
      if (difficulty === "easy") {
        // Easy AI makes suboptimal choices
        attackScore *= 0.7;
        // Randomly adjust score for unpredictability
        attackScore *= 0.8 + Math.random() * 0.4;
      } else if (difficulty === "hard") {
        // Hard AI values strategic targets higher
        attackScore *= 1.2;
        // Hard AI is more willing to take risks for high-value targets
        if (strategicValue > 50) {
          attackScore += 20;
        }
      }

      // Create attack plan
      attackPlans.push({
        sourceId: sourceTerritoryId,
        targetId: targetTerritoryId,
        attackingUnits: attackingUnits.length,
        defendingUnits: defendingUnits.length,
        winProbability: assessment.winProbability,
        strategicValue,
        attackScore,
        assessment,
      });
    });
  });

  // No valid attack options
  if (attackPlans.length === 0) return null;

  // Sort attack plans by score (highest first)
  attackPlans.sort((a, b) => b.attackScore - a.attackScore);

  // Get the best attack plan
  const bestPlan = attackPlans[0];

  // On easy difficulty, might not choose the absolute best option
  if (difficulty === "easy" && attackPlans.length > 1 && Math.random() < 0.3) {
    return attackPlans[1]; // Choose the second best option sometimes
  }

  return bestPlan;
};

/**
 * Select the best tactical card to play
 *
 * @param {Object} availableCards - Available tactical cards
 * @param {string} opponentCardId - Opponent's card ID (if known)
 * @param {Object} attackingTerritory - Territory from which attack originates
 * @param {Object} defendingTerritory - Territory being attacked
 * @param {boolean} isAttacker - Whether the AI is attacking
 * @param {string} difficulty - AI difficulty level
 * @returns {string} Selected card ID
 */
export const selectBestTacticalCard = (
  availableCards,
  opponentCardId,
  attackingTerritory,
  defendingTerritory,
  isAttacker,
  difficulty = "normal"
) => {
  if (!availableCards || availableCards.length === 0) return null;

  const scoredCards = availableCards.map((card) => {
    let score = card.strength * 10; // Base score is card strength

    // Check if card counters opponent's card
    if (
      opponentCardId &&
      card.counters &&
      card.counters.includes(opponentCardId)
    ) {
      score += 30; // Big bonus for counter
    }

    // Check terrain effectiveness
    const relevantTerritory = isAttacker
      ? attackingTerritory
      : defendingTerritory;
    if (card.terrain && relevantTerritory && relevantTerritory.type) {
      if (card.terrain.includes(relevantTerritory.type)) {
        score += 25; // Bonus for terrain effectiveness
      }
    }

    // Adjust for the role
    if (isAttacker && !card.defensive) {
      score += 15; // Offensive cards better for attacker
    } else if (!isAttacker && card.defensive) {
      score += 15; // Defensive cards better for defender
    }

    // Card rarity/type bonus
    if (card.type === "advanced") {
      score += 10;
    } else if (card.type === "intermediate") {
      score += 5;
    }

    // On hard difficulty, AI makes better choices
    if (difficulty === "hard") {
      // Better prioritization of terrain and counters
      if (
        opponentCardId &&
        card.counters &&
        card.counters.includes(opponentCardId)
      ) {
        score += 10; // Extra bonus for counter
      }

      if (card.terrain && relevantTerritory && relevantTerritory.type) {
        if (card.terrain.includes(relevantTerritory.type)) {
          score += 10; // Extra bonus for terrain effectiveness
        }
      }
    }

    // On easy difficulty, AI makes suboptimal choices
    if (difficulty === "easy") {
      // Add randomness to decisions
      score *= 0.7 + Math.random() * 0.6;
    }

    return { card, score };
  });

  // Sort by score (highest first)
  scoredCards.sort((a, b) => b.score - a.score);

  // Get the best card
  const bestCard = scoredCards[0];

  // On easy difficulty, might not choose the absolute best option
  if (difficulty === "easy" && scoredCards.length > 1 && Math.random() < 0.3) {
    return scoredCards[1].card.id; // Choose the second best option sometimes
  }

  return bestCard ? bestCard.card.id : null;
};

/**
 * Decide what unit type to train next
 *
 * @param {Object} unitTypes - Available unit types
 * @param {Array} existingUnits - Current units in the territory
 * @param {Object} territory - Territory where unit will be trained
 * @param {number} availableProduction - Available production points
 * @param {Object} availableResources - Available special resources
 * @param {string} difficulty - AI difficulty level
 * @returns {string} Selected unit type ID
 */
export const decideUnitTraining = (
  unitTypes,
  existingUnits,
  territory,
  availableProduction,
  availableResources,
  difficulty = "normal"
) => {
  if (!unitTypes || !territory || availableProduction <= 0) return null;

  const scoredUnitTypes = Object.entries(unitTypes).map(
    ([typeId, unitType]) => {
      // Skip if we can't afford it
      if (unitType.cost.production > availableProduction) {
        return { typeId, score: -1000 };
      }

      // Check required resources
      let hasRequiredResources = true;
      if (unitType.requiredResources) {
        Object.entries(unitType.requiredResources).forEach(
          ([resource, amount]) => {
            if (
              !availableResources[resource] ||
              availableResources[resource] < amount
            ) {
              hasRequiredResources = false;
            }
          }
        );
      }

      if (!hasRequiredResources) {
        return { typeId, score: -1000 };
      }

      let score = 50; // Base score

      // Unit strength score
      score += unitType.strength * 2;

      // Movement bonus
      score += unitType.movementRange * 10;

      // Unit variety - try to maintain a mix of units
      const existingUnitCounts = existingUnits.reduce((counts, unit) => {
        counts[unit.type] = (counts[unit.type] || 0) + 1;
        return counts;
      }, {});

      // Prefer types we don't have many of
      const currentCount = existingUnitCounts[typeId] || 0;
      score -= currentCount * 5;

      // Territory type considerations
      if (territory.type === "plains" && typeId === "horseman") {
        score += 15; // Horsemen are better in plains
      } else if (territory.type === "hills" && typeId === "archer") {
        score += 10; // Archers are better in hills
      } else if (territory.type === "mountains" && typeId === "warrior") {
        score += 10; // Warriors are better in mountains for defense
      }

      // Special units if we have resources
      if (typeId === "horseman" && availableResources.horses) {
        score += 20;
      } else if (typeId === "swordsman" && availableResources.iron) {
        score += 25;
      }

      // Hard AI optimization
      if (difficulty === "hard") {
        // Hard AI prefers stronger units
        score += unitType.strength * 1.5;

        // Hard AI is better at using special resources
        if (
          (typeId === "horseman" && availableResources.horses) ||
          (typeId === "swordsman" && availableResources.iron)
        ) {
          score += 15;
        }
      }

      // Easy AI randomization
      if (difficulty === "easy") {
        score *= 0.7 + Math.random() * 0.6;
      }

      return { typeId, score };
    }
  );

  // Filter out units we can't afford or don't have resources for
  const validUnitTypes = scoredUnitTypes.filter((unit) => unit.score > 0);

  if (validUnitTypes.length === 0) return null;

  // Sort by score (highest first)
  validUnitTypes.sort((a, b) => b.score - a.score);

  // Get the best unit type
  const bestUnitType = validUnitTypes[0];

  // On easy difficulty, might not choose the absolute best option
  if (
    difficulty === "easy" &&
    validUnitTypes.length > 1 &&
    Math.random() < 0.3
  ) {
    return validUnitTypes[1].typeId; // Choose the second best option sometimes
  }

  return bestUnitType ? bestUnitType.typeId : null;
};

// === AI Military Action Controller ===

/**
 * Performs a full AI military turn
 *
 * @param {Object} aiState - Complete AI state
 * @param {Object} gameState - Complete game state
 * @param {Object} actions - Action functions for the AI to use
 * @param {string} difficulty - AI difficulty level
 * @returns {Object} Results of AI actions
 */
export const performAIMilitaryTurn = (
  aiState,
  gameState,
  actions,
  difficulty = "normal"
) => {
  const results = {
    unitsTrained: [],
    attacksExecuted: [],
    cardPlayed: null,
    moved: [],
  };

  try {
    // 1. Decide on unit training (if production available)
    if (
      aiState.resources &&
      aiState.resources.production &&
      aiState.resources.production.amount > 0
    ) {
      // For each territory, consider training units
      Object.keys(aiState.territories).forEach((territoryId) => {
        const territory = gameState.territories[territoryId];

        // Skip if already processed or can't train here
        if (results.unitsTrained.some((u) => u.territoryId === territoryId))
          return;

        // Decide what unit to train
        const unitTypeToTrain = decideUnitTraining(
          gameState.unitTypes,
          aiState.militaryUnits[territoryId]?.units || [],
          territory,
          aiState.resources.production.amount,
          aiState.resources.strategicResources || {},
          difficulty
        );

        if (unitTypeToTrain) {
          // Train the unit
          const success = actions.trainUnit(
            territoryId,
            unitTypeToTrain,
            aiState.availableWorkerCount > 0
          );

          if (success) {
            results.unitsTrained.push({
              territoryId,
              unitType: unitTypeToTrain,
            });
          }
        }
      });
    }

    // 2. Perform attacks
    const attackPlan = selectBestAttackTarget(
      aiState.territories,
      gameState.territories,
      aiState.militaryUnits,
      (id) => gameState.territories[id],
      "player1",
      difficulty
    );

    if (attackPlan && attackPlan.winProbability >= 0.4) {
      // Only attack if decent chance
      // Execute the attack
      const attackResult = actions.executeAttack(
        attackPlan.sourceId,
        attackPlan.targetId
      );

      if (attackResult) {
        results.attacksExecuted.push({
          sourceId: attackPlan.sourceId,
          targetId: attackPlan.targetId,
          result: attackResult,
        });

        // Play tactical card if in combat
        if (gameState.combat && gameState.combat.active) {
          const cardToPlay = selectBestTacticalCard(
            aiState.availableCards,
            gameState.selectedCards?.player[gameState.combat.currentRound - 1],
            gameState.territories[attackPlan.sourceId],
            gameState.territories[attackPlan.targetId],
            true, // AI is attacking
            difficulty
          );

          if (cardToPlay) {
            actions.playTacticalCard(cardToPlay);
            results.cardPlayed = cardToPlay;
          }
        }
      }
    }

    // 3. Move units to strategic positions
    // (This would be implemented based on threat assessment)
  } catch (error) {
    console.error("Error in AI military turn:", error);
  }

  return results;
};

export default {
  calculateTerritoryValue,
  selectBestAttackTarget,
  selectBestTacticalCard,
  decideUnitTraining,
  performAIMilitaryTurn,
};
