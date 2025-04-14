// src/utils/gameUtils.js

/**
 * Game-related utility functions and constants
 */

// Resource related constants
export const RESOURCE_TYPES = {
  FOOD: "food",
  PRODUCTION: "production",
  SCIENCE: "science",
  GOLD: "gold",
  HAPPINESS: "happiness",
  CULTURE: "culture",
  INFLUENCE: "influence",
};

// Territory type constants
export const TERRITORY_TYPES = {
  PLAINS: "plains",
  FOREST: "forest",
  HILLS: "hills",
  MOUNTAINS: "mountains",
  DESERT: "desert",
  SWAMP: "swamp",
};

// Building types and their properties
export const BUILDING_TYPES = {
  FARM: {
    id: "farm",
    name: "Farm",
    description: "Produces food",
    productionCost: 20,
    resourceProduction: { type: RESOURCE_TYPES.FOOD, amount: 5 },
    requirements: {
      territoryTypes: [TERRITORY_TYPES.PLAINS, TERRITORY_TYPES.HILLS],
    },
  },
  MINE: {
    id: "mine",
    name: "Mine",
    description: "Produces production points",
    productionCost: 30,
    resourceProduction: { type: RESOURCE_TYPES.PRODUCTION, amount: 5 },
    requirements: {
      territoryTypes: [TERRITORY_TYPES.HILLS, TERRITORY_TYPES.MOUNTAINS],
    },
  },
  LIBRARY: {
    id: "library",
    name: "Library",
    description: "Produces science points",
    productionCost: 40,
    resourceProduction: { type: RESOURCE_TYPES.SCIENCE, amount: 5 },
    requirements: {
      territoryTypes: [TERRITORY_TYPES.PLAINS, TERRITORY_TYPES.FOREST],
    },
  },
  MARKET: {
    id: "market",
    name: "Market",
    description: "Produces gold",
    productionCost: 30,
    resourceProduction: { type: RESOURCE_TYPES.GOLD, amount: 5 },
    requirements: {
      territoryTypes: [
        TERRITORY_TYPES.PLAINS,
        TERRITORY_TYPES.FOREST,
        TERRITORY_TYPES.HILLS,
      ],
    },
  },
};

// Worker specialization types
export const WORKER_SPECIALIZATIONS = {
  DILIGENT: "diligent",
  STRONG: "strong",
  CLEVER: "clever",
};

// Worker specialization subtypes
export const SPECIALIZATION_SUBTYPES = {
  DILIGENT: ["farming", "production", "gold"],
  STRONG: ["military", "exploration", "construction"],
  CLEVER: ["science", "espionage", "diplomacy"],
};

/**
 * Get resource icon and color based on resource type
 *
 * @param {string} resourceType - The resource type (food, production, etc.)
 * @returns {Object} Object containing icon and color for the resource
 */
export const getResourceDisplay = (resourceType) => {
  const displays = {
    [RESOURCE_TYPES.FOOD]: { icon: "🌾", color: "resource.food" },
    [RESOURCE_TYPES.PRODUCTION]: { icon: "⚒️", color: "resource.production" },
    [RESOURCE_TYPES.SCIENCE]: { icon: "🔬", color: "resource.science" },
    [RESOURCE_TYPES.GOLD]: { icon: "💰", color: "resource.gold" },
    [RESOURCE_TYPES.HAPPINESS]: { icon: "😊", color: "resource.happiness" },
    [RESOURCE_TYPES.CULTURE]: { icon: "🏛️", color: "resource.culture" },
    [RESOURCE_TYPES.INFLUENCE]: { icon: "🤝", color: "resource.influence" },
  };

  return displays[resourceType] || { icon: "❓", color: "text.primary" };
};

/**
 * Get worker specialization info
 *
 * @param {Object} specialization - The specialization object
 * @returns {Object} Object containing icon, color, name and description
 */
export const getWorkerSpecializationInfo = (specialization) => {
  if (!specialization) return null;

  switch (specialization.type) {
    case WORKER_SPECIALIZATIONS.DILIGENT:
      return {
        icon: "💼",
        color: "resource.gold",
        name: "Diligent",
        description: `+15% ${specialization.subtype} production`,
        subtype: specialization.subtype,
      };
    case WORKER_SPECIALIZATIONS.STRONG:
      return {
        icon: "💪",
        color: "resource.production",
        name: "Strong",
        description: `+15% ${specialization.subtype} efficiency`,
        subtype: specialization.subtype,
      };
    case WORKER_SPECIALIZATIONS.CLEVER:
      return {
        icon: "🧠",
        color: "resource.science",
        name: "Clever",
        description: `+15% ${specialization.subtype} output`,
        subtype: specialization.subtype,
      };
    default:
      return null;
  }
};

/**
 * Calculate building capacity based on level
 *
 * @param {number} level - Building level
 * @returns {number} Worker capacity
 */
export const getBuildingCapacity = (level = 1) => {
  return level + 1; // Level 1: 2 slots, Level 2: 3 slots, Level 3: 4 slots
};

/**
 * Get territory building slot limit based on territory type
 *
 * @param {Object} territory - Territory object
 * @returns {number} Building slot limit
 */
export const getTerritoryBuildingSlotLimit = (territory) => {
  if (!territory) return 0;
  if (territory.isCapital) return 2;
  if (territory.resource) return 2;
  return 1;
};

/**
 * Format territory type for display (capitalize first letter)
 *
 * @param {string} type - Territory type
 * @returns {string} Formatted territory type
 */
export const formatTerritoryType = (type) => {
  if (!type) return "Unknown";
  return type.charAt(0).toUpperCase() + type.slice(1);
};

/**
 * Calculate building production based on building type, level and worker count
 *
 * @param {Object} building - Building object
 * @param {number} workerCount - Number of workers assigned
 * @returns {string} Formatted production output
 */
export const calculateBuildingProduction = (building, workerCount) => {
  if (workerCount === 0) return "0";

  const baseValues = {
    farm: { resource: RESOURCE_TYPES.FOOD, icon: "🌾" },
    mine: { resource: RESOURCE_TYPES.PRODUCTION, icon: "⚒️" },
    library: { resource: RESOURCE_TYPES.SCIENCE, icon: "🔬" },
    market: { resource: RESOURCE_TYPES.GOLD, icon: "💰" },
  };

  const baseInfo = baseValues[building.type] || { resource: "?", icon: "" };
  const level = building.level || 1;
  const levelMultiplier = level === 1 ? 1 : level === 2 ? 1.5 : 2;

  // Simple calculation - in a real implementation, this would consider worker specializations
  const baseProduction = 5 * workerCount * levelMultiplier;

  return `${Math.round(baseProduction)} ${baseInfo.icon}`;
};
