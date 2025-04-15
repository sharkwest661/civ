// src/utils/militaryUtils.js
import {
  UNIT_TYPES,
  UNIT_ICONS,
  TERRAIN_EFFECTS,
  UNIT_ADVANTAGES,
  COMBAT_MECHANICS,
  CARD_COUNTERS,
} from "../constants/militaryConstants";
import { generateUniqueId } from "./gameUtils";

/**
 * Military utility functions for Empire's Legacy
 */

/**
 * Calculate total unit strength for a group of units
 * @param {Array} units - Array of unit objects
 * @param {Object} unitTypes - Unit type definitions
 * @returns {number} - Total strength value
 */
export const calculateUnitStrength = (units, unitTypes) => {
  if (!units || units.length === 0) return 0;

  return units.reduce((total, unit) => {
    const unitType = unitTypes[unit.type];
    const baseStrength = unitType?.strength || 0;

    // Apply health percentage
    const healthMultiplier = unit.health / 100;

    // Apply experience bonus (5% per level)
    const experienceMultiplier = 1 + (unit.level - 1) * 0.05;

    return total + baseStrength * healthMultiplier * experienceMultiplier;
  }, 0);
};

/**
 * Check if a territory has enough capacity for more units
 * @param {Array} currentUnits - Current units in territory
 * @param {Object} territory - Territory object
 * @returns {boolean} - Whether the territory can host more units
 */
export const checkTerritoryCapacity = (currentUnits, territory) => {
  // Base capacity is 3 units per territory
  let capacity = 3;

  // Capital and cities have higher capacity
  if (territory.isCapital) capacity = 5;
  if (territory.buildings) {
    // Check for fortifications or barracks that increase capacity
    territory.buildings.forEach((building) => {
      if (building.type === "barracks") capacity += building.level;
      if (building.type === "fortification") capacity += building.level;
    });
  }

  return currentUnits.length < capacity;
};

/**
 * Calculate movement cost between territories
 * @param {Object} fromTerritory - Source territory
 * @param {Object} toTerritory - Destination territory
 * @returns {number} - Movement cost (1 = normal, >1 = harder)
 */
export const calculateMovementCost = (fromTerritory, toTerritory) => {
  if (!fromTerritory || !toTerritory) return 1;

  // Base cost is 1 movement point
  let cost = 1;

  // Some terrain types are harder to move through
  const terrainEffects = TERRAIN_EFFECTS[toTerritory.type];
  if (terrainEffects && terrainEffects.movement) {
    cost += terrainEffects.movement;
  }

  // Ensure minimum cost of 1
  return Math.max(1, cost);
};

/**
 * Check if a unit can move to a territory
 * @param {Object} unit - The unit to move
 * @param {Object} toTerritory - Destination territory
 * @param {Boolean} isAtWar - Whether the player is at war with the territory owner
 * @returns {boolean} - Whether the move is valid
 */
export const canMoveUnitToTerritory = (unit, toTerritory, isAtWar = false) => {
  // Can't move if no movement points left
  if (unit.movesLeft <= 0) return false;

  // Can only move to enemy territory if at war
  if (toTerritory.owner && toTerritory.owner !== "player1" && !isAtWar)
    return false;

  return true;
};

/**
 * Calculate combat advantage based on unit types
 * @param {Array} attackingUnits - Array of attacking unit objects
 * @param {Array} defendingUnits - Array of defending unit objects
 * @returns {Object} - Advantage factors for attacker and defender
 */
export const calculateUnitTypeAdvantage = (attackingUnits, defendingUnits) => {
  let attackerAdvantage = 0;
  let defenderAdvantage = 0;

  // Count each unit type for both sides
  const attackerTypes = attackingUnits.reduce((counts, unit) => {
    counts[unit.type] = (counts[unit.type] || 0) + 1;
    return counts;
  }, {});

  const defenderTypes = defendingUnits.reduce((counts, unit) => {
    counts[unit.type] = (counts[unit.type] || 0) + 1;
    return counts;
  }, {});

  // Check each attacking unit against defending unit types
  Object.entries(attackerTypes).forEach(([attackerType, count]) => {
    const advantages = UNIT_ADVANTAGES[attackerType];
    if (!advantages) return;

    advantages.advantageAgainst.forEach((advantageType) => {
      if (defenderTypes[advantageType]) {
        attackerAdvantage +=
          count *
          defenderTypes[advantageType] *
          COMBAT_MECHANICS.UNIT_ADVANTAGE_BONUS;
      }
    });

    advantages.disadvantageAgainst.forEach((disadvantageType) => {
      if (defenderTypes[disadvantageType]) {
        defenderAdvantage +=
          count *
          defenderTypes[disadvantageType] *
          COMBAT_MECHANICS.UNIT_ADVANTAGE_BONUS;
      }
    });
  });

  // Check each defending unit against attacking unit types
  Object.entries(defenderTypes).forEach(([defenderType, count]) => {
    const advantages = UNIT_ADVANTAGES[defenderType];
    if (!advantages) return;

    advantages.advantageAgainst.forEach((advantageType) => {
      if (attackerTypes[advantageType]) {
        defenderAdvantage +=
          count *
          attackerTypes[advantageType] *
          COMBAT_MECHANICS.UNIT_ADVANTAGE_BONUS;
      }
    });

    // Disadvantages already counted in the attacker loop
  });

  return {
    attackerAdvantage,
    defenderAdvantage,
  };
};

/**
 * Calculate terrain combat modifiers
 * @param {Object} territory - Territory where combat takes place
 * @param {Boolean} isDefender - Whether these modifiers apply to the defender
 * @returns {number} - Terrain modifier value
 */
export const calculateTerrainModifier = (territory, isDefender) => {
  if (!territory || !territory.type) return 0;

  const terrainEffects = TERRAIN_EFFECTS[territory.type];
  if (!terrainEffects) return 0;

  // Defensive terrain bonus only applies to defender
  if (isDefender && terrainEffects.defense) {
    return terrainEffects.defense;
  }

  // Attack bonus only applies to attacker
  if (!isDefender && terrainEffects.attack) {
    return terrainEffects.attack;
  }

  return 0;
};

/**
 * Check if a tactical card is effective in the current territory
 * @param {Object} card - Tactical card object
 * @param {Object} territory - Territory object
 * @returns {boolean} - Whether the card gets a terrain bonus
 */
export const isCardEffectiveInTerrain = (card, territory) => {
  if (!card || !card.terrain || !territory || !territory.type) return false;

  return card.terrain.includes(territory.type);
};

/**
 * Check if a tactical card counters another card
 * @param {string} cardId - ID of the card to check
 * @param {string} targetCardId - ID of the potential target card
 * @returns {boolean} - Whether the card counters the target
 */
export const doesCardCounterOther = (cardId, targetCardId) => {
  if (!cardId || !targetCardId) return false;

  const counters = CARD_COUNTERS[cardId];
  if (!counters) return false;

  return counters.includes(targetCardId);
};

/**
 * Generate a new military unit
 * @param {string} unitType - Type of unit to create
 * @param {string} territoryId - Territory where unit is created
 * @param {Object} unitTypes - Unit type definitions
 * @returns {Object} - New unit object
 */
export const createMilitaryUnit = (unitType, territoryId, unitTypes) => {
  const baseUnit = unitTypes[unitType];
  if (!baseUnit) return null;

  return {
    id: generateUniqueId(`unit_${unitType}_`),
    type: unitType,
    strength: baseUnit.strength,
    health: 100,
    experience: 0,
    level: 1,
    movesLeft: baseUnit.movementRange,
    position: territoryId,
  };
};

/**
 * Apply combat damage to units
 * @param {Array} units - Array of unit objects
 * @param {number} damageAmount - Amount of damage to distribute
 * @returns {Array} - Updated units with damage applied
 */
export const applyDamageToUnits = (units, damageAmount) => {
  if (!units || units.length === 0 || damageAmount <= 0) return units;

  // Calculate damage per unit (simple distribution)
  const damagePerUnit = Math.floor(damageAmount / units.length);
  let remainingDamage = damageAmount - damagePerUnit * units.length;

  // Apply damage to each unit
  return units.map((unit, index) => {
    // Apply extra damage to first units until remainingDamage is used
    const extraDamage = index < remainingDamage ? 1 : 0;
    const totalDamage = damagePerUnit + extraDamage;

    // Apply damage to health
    const newHealth = Math.max(0, unit.health - totalDamage);

    return {
      ...unit,
      health: newHealth,
    };
  });
};

/**
 * Select optimal unit for a situation
 * @param {Array} availableUnits - Array of available unit objects
 * @param {string} enemyUnitType - Type of enemy unit to counter
 * @param {string} terrainType - Type of terrain
 * @returns {Object} - The selected unit or null
 */
export const selectOptimalUnit = (
  availableUnits,
  enemyUnitType,
  terrainType
) => {
  if (!availableUnits || availableUnits.length === 0) return null;

  // Score each unit based on the situation
  const scoredUnits = availableUnits.map((unit) => {
    let score = 0;

    // Check for unit type advantage
    const advantages = UNIT_ADVANTAGES[unit.type];
    if (advantages && enemyUnitType) {
      if (advantages.advantageAgainst.includes(enemyUnitType)) {
        score += 3; // Big bonus for having advantage
      } else if (advantages.disadvantageAgainst.includes(enemyUnitType)) {
        score -= 2; // Penalty for disadvantage
      }
    }

    // Check for terrain suitability
    if (terrainType) {
      const terrainEffects = TERRAIN_EFFECTS[terrainType];
      if (terrainEffects) {
        // Units with ranged attacks are better in defensive terrain
        if (unit.type === UNIT_TYPES.ARCHER && terrainEffects.defense) {
          score += terrainEffects.defense;
        }

        // Horsemen are better in open terrain
        if (unit.type === UNIT_TYPES.HORSEMAN && terrainType === "plains") {
          score += 2;
        }
      }
    }

    // Consider unit health and experience
    score += (unit.health / 100) * 2; // Prefer healthier units
    score += (unit.level - 1) * 1.5; // Prefer experienced units

    return { unit, score };
  });

  // Sort by score and return the best unit
  scoredUnits.sort((a, b) => b.score - a.score);
  return scoredUnits[0]?.unit || null;
};

/**
 * Get display name for a unit type
 * @param {string} unitType - Unit type identifier
 * @returns {string} - Human-readable unit name
 */
export const getUnitDisplayName = (unitType) => {
  switch (unitType) {
    case UNIT_TYPES.WARRIOR:
      return "Warrior";
    case UNIT_TYPES.ARCHER:
      return "Archer";
    case UNIT_TYPES.HORSEMAN:
      return "Horseman";
    case UNIT_TYPES.SWORDSMAN:
      return "Swordsman";
    default:
      return unitType;
  }
};

/**
 * Get icon for a unit type
 * @param {string} unitType - Unit type identifier
 * @returns {string} - Unit icon
 */
export const getUnitIcon = (unitType) => {
  return UNIT_ICONS[unitType] || "⚔️";
};

/**
 * Calculate whether an attack would likely succeed
 * @param {Array} attackingUnits - Array of attacking unit objects
 * @param {Array} defendingUnits - Array of defending unit objects
 * @param {Object} attackingTerritory - Territory from which attack originates
 * @param {Object} defendingTerritory - Territory being attacked
 * @returns {Object} - Assessment with chance of success and factors
 */
export const assessAttackChances = (
  attackingUnits,
  defendingUnits,
  attackingTerritory,
  defendingTerritory
) => {
  // Base strength calculations
  const attackStrength = calculateUnitStrength(attackingUnits, UNIT_TYPES);
  const defenseStrength = calculateUnitStrength(defendingUnits, UNIT_TYPES);

  // Unit type advantages
  const { attackerAdvantage, defenderAdvantage } = calculateUnitTypeAdvantage(
    attackingUnits,
    defendingUnits
  );

  // Terrain modifiers
  const attackerTerrainMod = calculateTerrainModifier(
    attackingTerritory,
    false
  );
  const defenderTerrainMod = calculateTerrainModifier(defendingTerritory, true);

  // Home territory bonus for defender
  const homeTerritoryBonus = defendingTerritory.owner
    ? COMBAT_MECHANICS.HOME_TERRITORY_DEFENSE_BONUS
    : 0;

  // Calculate final strength values
  const finalAttackStrength =
    attackStrength + attackerAdvantage + attackerTerrainMod;
  const finalDefenseStrength =
    defenseStrength +
    defenderAdvantage +
    defenderTerrainMod +
    homeTerritoryBonus;

  // Calculate strength ratio and win probability
  const strengthRatio = finalAttackStrength / finalDefenseStrength;
  let winProbability = 0;

  if (strengthRatio >= 3) {
    winProbability = 0.9; // 90% chance to win with overwhelming force
  } else if (strengthRatio >= 2) {
    winProbability = 0.75; // 75% chance with double strength
  } else if (strengthRatio >= 1.5) {
    winProbability = 0.65; // 65% chance with significant advantage
  } else if (strengthRatio >= 1) {
    winProbability = 0.55; // 55% chance with slight advantage
  } else if (strengthRatio >= 0.75) {
    winProbability = 0.4; // 40% chance when slightly weaker
  } else if (strengthRatio >= 0.5) {
    winProbability = 0.25; // 25% chance when significantly weaker
  } else {
    winProbability = 0.1; // 10% chance when overwhelmingly outmatched
  }

  // Assessment factors
  const factors = [
    {
      name: "Unit strength",
      attacker: attackStrength.toFixed(1),
      defender: defenseStrength.toFixed(1),
      favorable: attackStrength > defenseStrength,
    },
    {
      name: "Unit type advantage",
      attacker:
        attackerAdvantage > 0 ? `+${attackerAdvantage.toFixed(1)}` : "0",
      defender:
        defenderAdvantage > 0 ? `+${defenderAdvantage.toFixed(1)}` : "0",
      favorable: attackerAdvantage > defenderAdvantage,
    },
    {
      name: "Terrain modifier",
      attacker: attackerTerrainMod > 0 ? `+${attackerTerrainMod}` : "0",
      defender: defenderTerrainMod > 0 ? `+${defenderTerrainMod}` : "0",
      favorable: attackerTerrainMod >= defenderTerrainMod,
    },
    {
      name: "Home territory bonus",
      attacker: "0",
      defender: homeTerritoryBonus > 0 ? `+${homeTerritoryBonus}` : "0",
      favorable: homeTerritoryBonus === 0,
    },
  ];

  return {
    winProbability,
    attackStrength: finalAttackStrength,
    defenseStrength: finalDefenseStrength,
    factors,
    assessment:
      winProbability >= 0.6
        ? "Favorable"
        : winProbability >= 0.4
        ? "Balanced"
        : "Unfavorable",
  };
};

/**
 * Calculate experience gain for units based on combat outcome
 * @param {Array} units - Array of unit objects
 * @param {boolean} won - Whether the combat was won
 * @returns {Array} - Updated units with experience gain
 */
export const calculateExperienceGain = (units, won) => {
  if (!units || units.length === 0) return units;

  // Base experience gain
  const baseGain = COMBAT_MECHANICS.EXPERIENCE_PER_COMBAT;

  // Bonus for winning
  const winBonus = won ? 5 : 0;

  return units.map((unit) => {
    const totalGain = baseGain + winBonus;
    const newExperience = unit.experience + totalGain;

    // Check for level up (100 XP per level)
    const newLevel = Math.floor(newExperience / 100) + 1;

    return {
      ...unit,
      experience: newExperience % 100, // Reset experience on level up
      level: Math.max(unit.level, newLevel), // Never decrease level
    };
  });
};

export default {
  calculateUnitStrength,
  checkTerritoryCapacity,
  calculateMovementCost,
  canMoveUnitToTerritory,
  calculateUnitTypeAdvantage,
  calculateTerrainModifier,
  isCardEffectiveInTerrain,
  doesCardCounterOther,
  createMilitaryUnit,
  applyDamageToUnits,
  selectOptimalUnit,
  getUnitDisplayName,
  getUnitIcon,
  assessAttackChances,
  calculateExperienceGain,
};
