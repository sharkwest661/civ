// src/utils/gameUtils.js

/**
 * Enhanced Game Utilities
 *
 * This file contains consolidated utility functions for Empire's Legacy,
 * eliminating code duplication across components and providing a single
 * source of truth for game calculations and formatting.
 */

import {
  RESOURCE_TYPES,
  RESOURCE_DISPLAY,
  TERRITORY_TYPES,
  TERRITORY_COLORS,
  WORKER_SPECIALIZATIONS,
  BUILDING_SLOT_LIMITS,
  BUILDING_TYPES,
  CIVILIZATION_COLORS,
} from "../constants/gameConstants";

// =============================================================================
// TERRITORY UTILITIES
// =============================================================================

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
 * Get territory building slot limit based on territory type
 *
 * @param {Object} territory - Territory object
 * @returns {number} Building slot limit
 */
export const getTerritoryBuildingSlotLimit = (territory) => {
  if (!territory) return 0;
  if (territory.isCapital) return BUILDING_SLOT_LIMITS.CAPITAL;
  if (territory.resource) return BUILDING_SLOT_LIMITS.RESOURCE;
  return BUILDING_SLOT_LIMITS.DEFAULT;
};

/**
 * Get territory fill color based on territory properties and state
 *
 * @param {Object} territory - Territory object
 * @param {boolean} isSelected - Whether the territory is selected
 * @param {boolean} isHovered - Whether the territory is being hovered
 * @returns {string} Hex color code for the territory
 */
export const getTerritoryFillColor = (
  territory,
  isSelected = false,
  isHovered = false
) => {
  if (!territory) {
    return TERRITORY_COLORS.UNEXPLORED;
  }

  // Determine base color from territory type
  let baseColor;
  if (territory.isCapital) {
    baseColor = TERRITORY_COLORS.CAPITAL;
  } else if (territory.isOwned) {
    baseColor = TERRITORY_COLORS.OWNED;
  } else if (territory.isExplored) {
    baseColor = TERRITORY_COLORS.EXPLORED;
  } else if (territory.hasStrategicResource) {
    baseColor = TERRITORY_COLORS.STRATEGIC;
  } else if (territory.hasLuxuryResource) {
    baseColor = TERRITORY_COLORS.LUXURY;
  } else if (territory.hasDanger) {
    baseColor = TERRITORY_COLORS.DANGER;
  } else {
    baseColor = TERRITORY_COLORS.UNEXPLORED;
  }

  // Lighten color if selected or hovered
  if (isSelected || isHovered) {
    return lightenColor(baseColor, 0.15);
  }

  return baseColor;
};

/**
 * Get territory stroke style (width and color) based on territory state
 *
 * @param {Object} territory - Territory object
 * @returns {Object} Stroke style object with strokeWidth and stroke properties
 */
export const getTerritoryStrokeStyle = (territory) => {
  const baseStrokeWidth = territory && territory.isUnderAttack ? 3 : 2;
  const baseStrokeColor =
    territory && territory.isUnderAttack ? "#ff5555" : "#454545";

  return {
    strokeWidth: baseStrokeWidth,
    stroke: baseStrokeColor,
  };
};

// =============================================================================
// RESOURCE UTILITIES
// =============================================================================

/**
 * Get resource icon and color based on resource type
 *
 * @param {string} resourceType - The resource type (food, production, etc.)
 * @returns {Object} Object containing icon and color for the resource
 */
export const getResourceDisplay = (resourceType) => {
  return (
    RESOURCE_DISPLAY[resourceType] || {
      icon: "❓",
      color: "text.primary",
      name: "Unknown",
      description: "Unknown resource type",
    }
  );
};

/**
 * Get color for a resource type
 *
 * @param {string} resourceType - The resource type
 * @returns {string} The Chakra UI color key for the resource
 */
export const getResourceColor = (resourceType) => {
  const resourceMapping = {
    food: "resource.food",
    production: "resource.production",
    science: "resource.science",
    gold: "resource.gold",
    happiness: "resource.happiness",
    culture: "resource.culture",
    influence: "resource.influence",
    farm: "resource.food",
    mine: "resource.production",
    library: "resource.science",
    market: "resource.gold",
  };

  return resourceMapping[resourceType] || "text.primary";
};

/**
 * Get era color for technology display
 *
 * @param {string} era - The technology era
 * @returns {string} The Chakra UI color key for the era
 */
export const getEraColor = (era) => {
  switch (era) {
    case "Primitive":
      return "resource.food"; // Green
    case "Ancient":
      return "resource.production"; // Orange
    case "Classical":
      return "resource.science"; // Blue
    case "Medieval":
      return "resource.happiness"; // Red
    case "Renaissance":
      return "resource.gold"; // Yellow
    default:
      return "text.primary";
  }
};

/**
 * Get branch color for technology display
 *
 * @param {string} branch - The technology branch
 * @returns {string} The Chakra UI color key for the branch
 */
export const getBranchColor = (branch) => {
  switch (branch) {
    case "Military":
      return "resource.happiness"; // Red
    case "Economic":
      return "resource.gold"; // Yellow
    case "Science":
      return "resource.science"; // Blue
    case "Cultural":
      return "resource.culture"; // Purple
    default:
      return "text.primary";
  }
};

/**
 * Map resource types to resource display values including icons and colors
 *
 * @param {string} type - Building or resource type
 * @returns {Object} Resource display information
 */
export const getBuildingResourceInfo = (type) => {
  const mapping = {
    farm: { resource: RESOURCE_TYPES.FOOD, icon: "🌾", color: "resource.food" },
    mine: {
      resource: RESOURCE_TYPES.PRODUCTION,
      icon: "⚒️",
      color: "resource.production",
    },
    library: {
      resource: RESOURCE_TYPES.SCIENCE,
      icon: "🔬",
      color: "resource.science",
    },
    market: {
      resource: RESOURCE_TYPES.GOLD,
      icon: "💰",
      color: "resource.gold",
    },
  };

  return (
    mapping[type] || { resource: "unknown", icon: "❓", color: "text.primary" }
  );
};

// =============================================================================
// WORKER UTILITIES
// =============================================================================

/**
 * Get worker specialization info
 *
 * @param {Object} specialization - The specialization object
 * @returns {Object} Object containing icon, color, tooltip, and other information
 */
export const getWorkerSpecializationInfo = (specialization) => {
  if (!specialization) return null;

  switch (specialization.type) {
    case "diligent":
      return {
        icon: "💼",
        color: "resource.gold",
        name: "Diligent",
        tooltip: `Diligent Worker: +15% ${specialization.subtype} production`,
        description: `+15% ${specialization.subtype} production`,
        subtype: specialization.subtype,
      };
    case "strong":
      return {
        icon: "💪",
        color: "resource.production",
        name: "Strong",
        tooltip: `Strong Worker: +15% ${specialization.subtype} efficiency`,
        description: `+15% ${specialization.subtype} efficiency`,
        subtype: specialization.subtype,
      };
    case "clever":
      return {
        icon: "🧠",
        color: "resource.science",
        name: "Clever",
        tooltip: `Clever Worker: +15% ${specialization.subtype} output`,
        description: `+15% ${specialization.subtype} output`,
        subtype: specialization.subtype,
      };
    default:
      return null;
  }
};

/**
 * Format specialization subtype for display
 *
 * @param {string} subtype - Specialization subtype
 * @returns {string} Formatted subtype
 */
export const formatSubtype = (subtype) => {
  if (!subtype) return "";
  return subtype.charAt(0).toUpperCase() + subtype.slice(1);
};

/**
 * Check if a worker is ideal for a specific building type
 *
 * @param {string} workerId - Worker ID
 * @param {Object} workerSpecializations - Worker specializations object
 * @param {string} buildingType - Building type
 * @returns {boolean} Whether the worker is ideal for the building
 */
export const isWorkerIdealForBuilding = (
  workerId,
  workerSpecializations,
  buildingType
) => {
  if (!workerId || !workerSpecializations[workerId] || !buildingType) {
    return false;
  }

  const specialization = workerSpecializations[workerId];

  // Match building types to worker specializations
  const buildingToSpecialization = {
    farm: "farming",
    mine: "production",
    library: "science",
    market: "gold",
  };

  const idealSubtype = buildingToSpecialization[buildingType];

  return (
    specialization.type === "diligent" &&
    specialization.subtype === idealSubtype
  );
};

// =============================================================================
// BUILDING UTILITIES
// =============================================================================

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
 * Get efficiency text based on building level
 *
 * @param {number} level - Building level
 * @returns {string} Efficiency description
 */
export const getBuildingEfficiencyText = (level) => {
  switch (level) {
    case 1:
      return "Base production";
    case 2:
      return "1.5× productivity";
    case 3:
      return "2× productivity";
    default:
      return "Base production";
  }
};

/**
 * Calculate building production based on building type, level and worker count
 *
 * @param {Object} building - Building object
 * @param {number} workerCount - Number of workers assigned
 * @returns {string} Formatted production output
 */
export const calculateBuildingProduction = (building, workerCount) => {
  if (!building || workerCount === 0) return "0";

  const buildingInfo = getBuildingResourceInfo(building.type);
  const level = building.level || 1;
  const levelMultiplier = level === 1 ? 1 : level === 2 ? 1.5 : 2;

  // Simple calculation - in a real implementation, this would consider worker specializations
  const baseProduction = 5 * workerCount * levelMultiplier;

  return `${Math.round(baseProduction)} ${buildingInfo.icon}`;
};

/**
 * Check if a building can be constructed in a territory
 *
 * @param {Object} building - Building object
 * @param {Object} territory - Territory object
 * @returns {boolean} Whether the building can be built in the territory
 */
export const canBuildInTerritory = (building, territory) => {
  if (!territory || !territory.type || !territory.isOwned) return false;

  // Check building slot limit
  const slotLimit = getTerritoryBuildingSlotLimit(territory);
  if ((territory.buildings?.length || 0) >= slotLimit) return false;

  // Check if territory type is suitable
  return building.requirements.territoryTypes.includes(territory.type);
};

// =============================================================================
// COLOR UTILITIES
// =============================================================================

/**
 * Lighten a color by a specified amount
 *
 * @param {string} color - Hex color code (e.g., "#123456")
 * @param {number} amount - Amount to lighten (0-1)
 * @returns {string} Lightened hex color code
 */
export const lightenColor = (color, amount) => {
  // Convert hex to RGB
  const hex = color.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Lighten
  const newR = Math.min(255, Math.round(r + (255 - r) * amount));
  const newG = Math.min(255, Math.round(g + (255 - g) * amount));
  const newB = Math.min(255, Math.round(b + (255 - b) * amount));

  // Convert back to hex
  return `#${newR.toString(16).padStart(2, "0")}${newG
    .toString(16)
    .padStart(2, "0")}${newB.toString(16).padStart(2, "0")}`;
};

/**
 * Darken a color by a specified amount
 *
 * @param {string} color - Hex color code (e.g., "#123456")
 * @param {number} amount - Amount to darken (0-1)
 * @returns {string} Darkened hex color code
 */
export const darkenColor = (color, amount) => {
  // Convert hex to RGB
  const hex = color.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Darken
  const newR = Math.max(0, Math.round(r * (1 - amount)));
  const newG = Math.max(0, Math.round(g * (1 - amount)));
  const newB = Math.max(0, Math.round(b * (1 - amount)));

  // Convert back to hex
  return `#${newR.toString(16).padStart(2, "0")}${newG
    .toString(16)
    .padStart(2, "0")}${newB.toString(16).padStart(2, "0")}`;
};

/**
 * Get notification background color based on type
 *
 * @param {string} type - Notification type
 * @returns {string} Hex color code for notification background
 */
export const getNotificationColor = (type) => {
  switch (type) {
    case "success":
      return "#2e4c34"; // Green
    case "warning":
      return "#4c3e2e"; // Yellow-orange
    case "danger":
      return "#4c2e2e"; // Red
    case "special":
      return "#3e2e4c"; // Purple
    case "info":
    default:
      return "#2e3e4c"; // Blue
  }
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Generate a unique ID
 *
 * @param {string} prefix - Optional prefix for the ID
 * @returns {string} Unique ID
 */
export const generateUniqueId = (prefix = "") => {
  return `${prefix}${Date.now()}_${Math.floor(Math.random() * 1000)}`;
};

/**
 * Format number with commas for thousands
 *
 * @param {number} number - Number to format
 * @returns {string} Formatted number
 */
export const formatNumber = (number) => {
  return Math.floor(number).toLocaleString();
};

/**
 * Calculate percentage and ensure it's between 0-100
 *
 * @param {number} value - Current value
 * @param {number} total - Total value
 * @returns {number} Percentage (0-100)
 */
export const calculatePercentage = (value, total) => {
  if (!total) return 0;
  return Math.min(100, Math.max(0, (value / total) * 100));
};

// Export all constants for convenience
export {
  RESOURCE_TYPES,
  TERRITORY_TYPES,
  BUILDING_TYPES,
  BUILDING_SLOT_LIMITS,
  WORKER_SPECIALIZATIONS,
  TERRITORY_COLORS,
  RESOURCE_DISPLAY,
  CIVILIZATION_COLORS,
};
