// src/stores/militaryStore.js
import { create } from "zustand";
import { generateUniqueId } from "../utils/gameUtils";
import { getNeighbors, hexToId, idToHex } from "../utils/hexUtils";

/**
 * Military Store
 *
 * Manages the military system including:
 * - Military units and armies
 * - Combat mechanics and tactical cards
 * - Territory control and conquest
 */
export const useMilitaryStore = create((set, get) => ({
  // Military units by territory
  // Format: { territoryId: { units: [unit1, unit2, ...], } }
  militaryUnits: {},

  // Available tactical cards for the player
  tacticalCards: {},

  // Currently selected cards for combat
  selectedCards: {
    player: [],
    opponent: [],
  },

  // Current combat state
  combat: {
    active: false,
    attackingTerritoryId: null,
    defendingTerritoryId: null,
    attackingUnits: [],
    defendingUnits: [],
    currentRound: 0,
    totalRounds: 3,
    result: null, // 'victory', 'defeat', 'draw'
    battleLog: [],
  },

  // Military unit types with their stats
  unitTypes: {
    warrior: {
      id: "warrior",
      name: "Warrior",
      strength: 5,
      cost: {
        production: 20,
      },
      requiredWorkers: 1,
      requiredResources: {},
      maintenanceCost: {
        gold: 1,
      },
      movementRange: 1,
      description: "Basic infantry unit with balanced stats.",
      icon: "⚔️",
    },
    archer: {
      id: "archer",
      name: "Archer",
      strength: 4,
      ranged: true,
      cost: {
        production: 25,
      },
      requiredWorkers: 1,
      requiredResources: {},
      maintenanceCost: {
        gold: 1,
      },
      movementRange: 1,
      description: "Ranged unit effective against infantry.",
      icon: "🏹",
    },
    horseman: {
      id: "horseman",
      name: "Horseman",
      strength: 7,
      cost: {
        production: 30,
      },
      requiredWorkers: 1,
      requiredResources: {
        horses: 1,
      },
      maintenanceCost: {
        gold: 2,
      },
      movementRange: 2,
      description: "Fast cavalry unit with high strength.",
      icon: "🐎",
    },
    swordsman: {
      id: "swordsman",
      name: "Swordsman",
      strength: 10,
      cost: {
        production: 35,
      },
      requiredWorkers: 1,
      requiredResources: {
        iron: 1,
      },
      maintenanceCost: {
        gold: 2,
      },
      movementRange: 1,
      description: "Advanced infantry with high combat strength.",
      icon: "🗡️",
    },
  },

  // Tactical card types
  tacticalCardTypes: {
    // Basic cards
    "frontal-assault": {
      id: "frontal-assault",
      name: "Frontal Assault",
      type: "basic",
      strength: 2,
      description: "A straightforward attack formation.",
      icon: "⚔️",
    },
    "defensive-stance": {
      id: "defensive-stance",
      name: "Defensive Stance",
      type: "basic",
      strength: 2,
      defensive: true,
      description: "A cautious defensive formation.",
      icon: "🛡️",
    },
    "flanking-maneuver": {
      id: "flanking-maneuver",
      name: "Flanking Maneuver",
      type: "basic",
      strength: 3,
      counters: ["defensive-stance"],
      description: "Attack from the sides to counter defensive positions.",
      icon: "↪️",
    },

    // Intermediate cards
    ambush: {
      id: "ambush",
      name: "Ambush",
      type: "intermediate",
      strength: 4,
      terrain: ["forest"],
      description: "Surprise attack, more effective in forests.",
      icon: "🌳",
    },
    "high-ground": {
      id: "high-ground",
      name: "High Ground",
      type: "intermediate",
      strength: 3,
      terrain: ["hills", "mountains"],
      description: "Take advantage of elevated positions.",
      icon: "⛰️",
    },
    "shield-wall": {
      id: "shield-wall",
      name: "Shield Wall",
      type: "intermediate",
      strength: 3,
      defensive: true,
      description: "A strong defensive formation.",
      icon: "🛡️",
    },

    // Advanced cards
    "pincer-movement": {
      id: "pincer-movement",
      name: "Pincer Movement",
      type: "advanced",
      strength: 5,
      counters: ["frontal-assault"],
      description: "Surround the enemy from multiple directions.",
      icon: "🔄",
    },
    "feigned-retreat": {
      id: "feigned-retreat",
      name: "Feigned Retreat",
      type: "advanced",
      strength: 5,
      counters: ["frontal-assault"],
      description: "Pretend to retreat, then counter-attack.",
      icon: "↩️",
    },
    "night-attack": {
      id: "night-attack",
      name: "Night Attack",
      type: "advanced",
      strength: 6,
      counters: ["high-ground", "shield-wall"],
      description: "A surprise attack under the cover of darkness.",
      icon: "🌙",
    },
  },

  // Initialize player's tactical cards
  initializeTacticalCards: () => {
    set((state) => {
      // Start with basic cards
      const initialCards = {
        "frontal-assault": {
          id: "frontal-assault",
          count: 3,
        },
        "defensive-stance": {
          id: "defensive-stance",
          count: 3,
        },
        "flanking-maneuver": {
          id: "flanking-maneuver",
          count: 2,
        },
      };

      return {
        tacticalCards: initialCards,
      };
    });
  },

  // Military unit actions

  /**
   * Train a new military unit
   * @param {string} territoryId - The territory ID where the unit will be placed
   * @param {string} unitTypeId - The type of unit to train
   * @param {function} convertWorker - Function to convert a worker to military
   * @param {function} payResources - Function to pay resources
   * @returns {boolean} - Success status
   */
  trainUnit: (territoryId, unitTypeId, convertWorker, payResources) => {
    const state = get();
    const unitType = state.unitTypes[unitTypeId];

    if (!unitType) return false;

    // Create new unit
    const newUnit = {
      id: generateUniqueId(`unit_${unitTypeId}_`),
      type: unitTypeId,
      strength: unitType.strength,
      health: 100,
      experience: 0,
      level: 1,
      movesLeft: unitType.movementRange,
      position: territoryId,
    };

    // Convert worker (from worker store)
    const workerConverted = convertWorker(territoryId);
    if (!workerConverted) return false;

    // Pay resources (from resources store)
    const resourcesPaid = payResources(unitType.cost);
    if (!resourcesPaid) {
      // Revert worker conversion if resource payment fails
      // This would need a worker restoration function
      return false;
    }

    // Add unit to territory
    set((state) => {
      const territoryUnits = state.militaryUnits[territoryId] || { units: [] };

      return {
        militaryUnits: {
          ...state.militaryUnits,
          [territoryId]: {
            ...territoryUnits,
            units: [...territoryUnits.units, newUnit],
          },
        },
      };
    });

    return true;
  },

  /**
   * Get units in a territory
   * @param {string} territoryId - The territory ID
   * @returns {Array} - Array of units
   */
  getUnitsInTerritory: (territoryId) => {
    const state = get();
    return state.militaryUnits[territoryId]?.units || [];
  },

  /**
   * Get total military strength in a territory
   * @param {string} territoryId - The territory ID
   * @returns {number} - Total military strength
   */
  getTerritoryStrength: (territoryId) => {
    const units = get().getUnitsInTerritory(territoryId);

    return units.reduce((total, unit) => {
      const unitType = get().unitTypes[unit.type];
      const baseStrength = unitType?.strength || 0;

      // Apply health percentage
      const healthMultiplier = unit.health / 100;

      // Apply experience bonus (5% per level)
      const experienceMultiplier = 1 + (unit.level - 1) * 0.05;

      return total + baseStrength * healthMultiplier * experienceMultiplier;
    }, 0);
  },

  /**
   * Move a unit from one territory to another
   * @param {string} unitId - The unit ID
   * @param {string} fromTerritoryId - Source territory ID
   * @param {string} toTerritoryId - Destination territory ID
   * @returns {boolean} - Success status
   */
  moveUnit: (unitId, fromTerritoryId, toTerritoryId) => {
    let success = false;

    set((state) => {
      // Find the unit
      const fromTerritory = state.militaryUnits[fromTerritoryId];
      if (!fromTerritory) return state;

      const unitIndex = fromTerritory.units.findIndex(
        (unit) => unit.id === unitId
      );
      if (unitIndex === -1) return state;

      const unit = fromTerritory.units[unitIndex];

      // Check if unit has moves left
      if (unit.movesLeft <= 0) return state;

      // Check if territories are adjacent
      const fromHex = idToHex(fromTerritoryId);
      const toHex = idToHex(toTerritoryId);

      // Get neighbors of fromHex
      const neighbors = getNeighbors(fromHex);
      const isAdjacent = neighbors.some(
        (neighbor) => hexToId(neighbor) === toTerritoryId
      );

      if (!isAdjacent) return state;

      // Remove unit from source territory
      const updatedFromUnits = [...fromTerritory.units];
      updatedFromUnits.splice(unitIndex, 1);

      // Add unit to destination territory
      const toTerritory = state.militaryUnits[toTerritoryId] || { units: [] };
      const updatedUnit = {
        ...unit,
        position: toTerritoryId,
        movesLeft: unit.movesLeft - 1,
      };

      success = true;

      return {
        militaryUnits: {
          ...state.militaryUnits,
          [fromTerritoryId]: {
            ...fromTerritory,
            units: updatedFromUnits,
          },
          [toTerritoryId]: {
            ...toTerritory,
            units: [...toTerritory.units, updatedUnit],
          },
        },
      };
    });

    return success;
  },

  /**
   * Reset units' movement points at end of turn
   */
  resetUnitMovement: () => {
    set((state) => {
      const updatedMilitaryUnits = {};

      Object.entries(state.militaryUnits).forEach(
        ([territoryId, territory]) => {
          updatedMilitaryUnits[territoryId] = {
            ...territory,
            units: territory.units.map((unit) => {
              const unitType = state.unitTypes[unit.type];
              return {
                ...unit,
                movesLeft: unitType.movementRange,
              };
            }),
          };
        }
      );

      return {
        militaryUnits: updatedMilitaryUnits,
      };
    });
  },

  /**
   * Calculate unit maintenance cost
   * @returns {Object} - Maintenance costs by resource type
   */
  calculateMaintenance: () => {
    const state = get();
    const costs = { gold: 0 };

    Object.values(state.militaryUnits).forEach((territory) => {
      territory.units.forEach((unit) => {
        const unitType = state.unitTypes[unit.type];
        if (unitType.maintenanceCost) {
          Object.entries(unitType.maintenanceCost).forEach(
            ([resource, amount]) => {
              costs[resource] = (costs[resource] || 0) + amount;
            }
          );
        }
      });
    });

    return costs;
  },

  // Combat system

  /**
   * Start a combat between two territories
   * @param {string} attackingTerritoryId - ID of attacking territory
   * @param {string} defendingTerritoryId - ID of defending territory
   * @param {function} getTerritory - Function to get territory data
   * @returns {boolean} - Whether combat was initiated successfully
   */
  startCombat: (attackingTerritoryId, defendingTerritoryId, getTerritory) => {
    const state = get();

    // Get attacking units
    const attackingUnits = state.getUnitsInTerritory(attackingTerritoryId);
    if (attackingUnits.length === 0) return false;

    // Get defending units
    const defendingUnits = state.getUnitsInTerritory(defendingTerritoryId);

    // Get territory types for terrain modifiers
    const attackingTerritory = getTerritory(attackingTerritoryId);
    const defendingTerritory = getTerritory(defendingTerritoryId);

    if (!attackingTerritory || !defendingTerritory) return false;

    // Reset selected cards
    set({
      selectedCards: {
        player: [],
        opponent: [],
      },
      combat: {
        active: true,
        attackingTerritoryId,
        defendingTerritoryId,
        attackingUnits,
        defendingUnits,
        attackingTerritory,
        defendingTerritory,
        currentRound: 1,
        totalRounds: 3,
        result: null,
        battleLog: [
          {
            round: 0,
            message: `Combat initiated between ${
              attackingTerritory.type || "unknown"
            } territory and ${defendingTerritory.type || "unknown"} territory.`,
          },
        ],
      },
    });

    return true;
  },

  /**
   * Select a tactical card for the current combat round
   * @param {string} cardId - ID of the card to select
   * @param {string} side - 'player' or 'opponent'
   */
  selectCard: (cardId, side = "player") => {
    const state = get();

    if (!state.combat.active) return false;
    if (state.combat.currentRound > state.combat.totalRounds) return false;

    // For player, check if card is available
    if (side === "player") {
      const card = state.tacticalCards[cardId];
      if (!card || card.count <= 0) return false;
    }

    set((state) => {
      // Update selected cards for the current side
      const updatedSelectedCards = { ...state.selectedCards };

      // Replace any existing card for the current round
      const roundIndex = state.combat.currentRound - 1;
      updatedSelectedCards[side][roundIndex] = cardId;

      return {
        selectedCards: updatedSelectedCards,
      };
    });

    return true;
  },

  /**
   * Progress to the next round of combat
   * @returns {boolean} - Whether the combat is still active
   */
  nextCombatRound: () => {
    let combatActive = true;

    set((state) => {
      if (!state.combat.active) return state;

      const currentRound = state.combat.currentRound;
      const totalRounds = state.combat.totalRounds;

      // If all rounds complete, resolve combat
      if (currentRound >= totalRounds) {
        const outcome = resolveCombat(state);
        combatActive = false;

        return {
          combat: {
            ...state.combat,
            active: false,
            result: outcome.result,
            battleLog: [
              ...state.combat.battleLog,
              {
                round: "Final",
                message: outcome.message,
              },
            ],
          },
        };
      }

      // Otherwise, proceed to next round
      const playerCard = state.selectedCards.player[currentRound - 1];
      const opponentCard = state.selectedCards.opponent[currentRound - 1];

      // Resolve this round
      const roundOutcome = resolveRound(
        state,
        playerCard,
        opponentCard,
        currentRound
      );

      // AI selects card for next round
      const aiCardSelection = selectAICard(state, currentRound);

      const updatedSelectedCards = { ...state.selectedCards };
      if (aiCardSelection) {
        updatedSelectedCards.opponent[currentRound] = aiCardSelection;
      }

      return {
        combat: {
          ...state.combat,
          currentRound: currentRound + 1,
          battleLog: [
            ...state.combat.battleLog,
            {
              round: currentRound,
              message: roundOutcome.message,
              playerCard,
              opponentCard,
              playerScore: roundOutcome.playerScore,
              opponentScore: roundOutcome.opponentScore,
              winner: roundOutcome.winner,
            },
          ],
        },
        selectedCards: updatedSelectedCards,
      };
    });

    return combatActive;
  },

  /**
   * End combat and apply results
   * @param {function} updateTerritoryControl - Function to update territory control
   * @returns {object} - Combat outcome details
   */
  endCombat: (updateTerritoryControl) => {
    const state = get();

    if (!state.combat.active && !state.combat.result) return null;

    const outcome = {
      result: state.combat.result,
      attackingTerritoryId: state.combat.attackingTerritoryId,
      defendingTerritoryId: state.combat.defendingTerritoryId,
      battleLog: [...state.combat.battleLog],
    };

    // Update territory control based on outcome
    if (outcome.result === "victory") {
      // Award experience to surviving units
      set((state) => {
        const updatedMilitaryUnits = { ...state.militaryUnits };

        // Add experience to attacking units
        if (updatedMilitaryUnits[state.combat.attackingTerritoryId]) {
          updatedMilitaryUnits[state.combat.attackingTerritoryId].units =
            updatedMilitaryUnits[state.combat.attackingTerritoryId].units.map(
              (unit) => ({
                ...unit,
                experience: unit.experience + 10,
                level:
                  unit.experience + 10 >= 100 ? unit.level + 1 : unit.level,
              })
            );
        }

        return {
          militaryUnits: updatedMilitaryUnits,
        };
      });

      // Update territory control
      updateTerritoryControl(
        state.combat.defendingTerritoryId,
        state.combat.attackingTerritoryId
      );
    }

    // Reset combat state
    set({
      combat: {
        active: false,
        attackingTerritoryId: null,
        defendingTerritoryId: null,
        attackingUnits: [],
        defendingUnits: [],
        currentRound: 0,
        totalRounds: 3,
        result: null,
        battleLog: [],
      },
      selectedCards: {
        player: [],
        opponent: [],
      },
    });

    return outcome;
  },

  // Tactical Card Management

  /**
   * Add a tactical card to player's deck
   * @param {string} cardId - ID of the card to add
   * @param {number} count - Number of copies to add
   */
  addTacticalCard: (cardId, count = 1) => {
    set((state) => {
      const cardType = state.tacticalCardTypes[cardId];
      if (!cardType) return state;

      const existingCard = state.tacticalCards[cardId];

      return {
        tacticalCards: {
          ...state.tacticalCards,
          [cardId]: {
            id: cardId,
            count: (existingCard?.count || 0) + count,
          },
        },
      };
    });
  },

  /**
   * Use a tactical card (remove from deck)
   * @param {string} cardId - ID of the card to use
   * @returns {boolean} - Whether the card was successfully used
   */
  useTacticalCard: (cardId) => {
    let success = false;

    set((state) => {
      const card = state.tacticalCards[cardId];
      if (!card || card.count <= 0) return state;

      success = true;

      return {
        tacticalCards: {
          ...state.tacticalCards,
          [cardId]: {
            ...card,
            count: card.count - 1,
          },
        },
      };
    });

    return success;
  },

  /**
   * Get available cards for the player
   * @returns {Array} - Array of card objects with counts
   */
  getAvailableCards: () => {
    const state = get();

    return Object.entries(state.tacticalCards)
      .filter(([_, card]) => card.count > 0)
      .map(([cardId, card]) => ({
        ...state.tacticalCardTypes[cardId],
        count: card.count,
      }));
  },

  /**
   * Initialize the military system
   */
  initializeMilitary: () => {
    // Initialize player's tactical cards
    get().initializeTacticalCards();
  },
}));

// Helper functions

/**
 * Resolve a combat round
 * @param {object} state - Current military state
 * @param {string} playerCardId - ID of player's selected card
 * @param {string} opponentCardId - ID of opponent's selected card
 * @param {number} round - Current round number
 * @returns {object} - Round outcome
 */
function resolveRound(state, playerCardId, opponentCardId, round) {
  const playerCard = state.tacticalCardTypes[playerCardId];
  const opponentCard = state.tacticalCardTypes[opponentCardId];

  if (!playerCard || !opponentCard) {
    return {
      winner: "opponent",
      message: "Invalid card selection",
      playerScore: 0,
      opponentScore: 1,
    };
  }

  // Calculate base scores
  let playerScore = playerCard.strength;
  let opponentScore = opponentCard.strength;

  // Apply counters
  if (playerCard.counters && playerCard.counters.includes(opponentCardId)) {
    playerScore += 2;
  }

  if (opponentCard.counters && opponentCard.counters.includes(playerCardId)) {
    opponentScore += 2;
  }

  // Apply terrain bonuses
  if (playerCard.terrain && state.combat.attackingTerritory) {
    if (playerCard.terrain.includes(state.combat.attackingTerritory.type)) {
      playerScore += 1;
    }
  }

  if (opponentCard.terrain && state.combat.defendingTerritory) {
    if (opponentCard.terrain.includes(state.combat.defendingTerritory.type)) {
      opponentScore += 1;
    }
  }

  // Apply unit type modifiers
  // TODO: Implement unit type interactions

  // Defensive bonus for defender
  if (opponentCard.defensive) {
    opponentScore += 1;
  }

  // Determine winner
  let winner;
  let message;

  if (playerScore > opponentScore) {
    winner = "player";
    message = `Round ${round}: Player wins with ${playerCard.name} (${playerScore}) vs ${opponentCard.name} (${opponentScore})`;
  } else if (opponentScore > playerScore) {
    winner = "opponent";
    message = `Round ${round}: Opponent wins with ${opponentCard.name} (${opponentScore}) vs ${playerCard.name} (${playerScore})`;
  } else {
    winner = "draw";
    message = `Round ${round}: Draw - Both sides scored ${playerScore}`;
  }

  return {
    winner,
    message,
    playerScore,
    opponentScore,
  };
}

/**
 * Resolve the entire combat
 * @param {object} state - Current military state
 * @returns {object} - Combat outcome
 */
function resolveCombat(state) {
  // Count round wins
  let playerWins = 0;
  let opponentWins = 0;

  state.combat.battleLog.forEach((log) => {
    if (log.winner === "player") playerWins++;
    if (log.winner === "opponent") opponentWins++;
  });

  // Determine overall winner
  let result;
  let message;

  if (playerWins > opponentWins) {
    result = "victory";
    message = `Combat Result: Victory! Player won ${playerWins} rounds to ${opponentWins}.`;
  } else if (opponentWins > playerWins) {
    result = "defeat";
    message = `Combat Result: Defeat. Opponent won ${opponentWins} rounds to ${playerWins}.`;
  } else {
    result = "draw";
    message = `Combat Result: Draw. Both sides won ${playerWins} rounds.`;
  }

  return {
    result,
    message,
  };
}

/**
 * AI selects a card for the current round
 * @param {object} state - Current military state
 * @param {number} round - Current round number
 * @returns {string} - Selected card ID
 */
function selectAICard(state, round) {
  // Simple AI implementation - randomly select a card
  const availableCards = Object.keys(state.tacticalCardTypes);

  // Slightly weight selection toward cards that might counter player's previous cards
  const playerPrevCard =
    round > 1 ? state.selectedCards.player[round - 2] : null;

  if (playerPrevCard) {
    const counterCards = availableCards.filter((cardId) => {
      const card = state.tacticalCardTypes[cardId];
      return card.counters && card.counters.includes(playerPrevCard);
    });

    if (counterCards.length > 0 && Math.random() > 0.5) {
      return counterCards[Math.floor(Math.random() * counterCards.length)];
    }
  }

  // Otherwise random selection
  return availableCards[Math.floor(Math.random() * availableCards.length)];
}

export default useMilitaryStore;
