// src/utils/territoryUtils.js
import {
  TERRITORY_COLORS,
  TERRITORY_TYPES,
  BUILDING_SLOT_LIMITS,
} from "../constants/gameConstants";

/**
 * Territory Utility Functions
 *
 * Centralizes territory-related logic that was previously duplicated across components
 */

/**
 * Get the display color for a territory based on its state
 *
 * @param {Object} territory - The territory object
 * @param {boolean} isSelected - Whether the territory is selected
 * @param {boolean} isHovered - Whether the territory is hovered
 * @returns {string} Hex color code
 */
export const getTerritoryColor = (
  territory,
  isSelected = false,
  isHovered = false
) => {
  // Handle missing territory
  if (!territory || !territory.type) {
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

  // Lighten color if hovered or selected
  if (isSelected || isHovered) {
    return lightenColor(baseColor, 0.15);
  }

  return baseColor;
};

/**
 * Get stroke style for a territory
 *
 * @param {Object} territory - The territory object
 * @returns {Object} Stroke style with width and color
 */
export const getTerritoryStrokeStyle = (territory) => {
  const baseStrokeWidth = territory.isUnderAttack ? 3 : 2;
  const baseStrokeColor = territory.isUnderAttack ? "#ff5555" : "#454545";

  return {
    strokeWidth: baseStrokeWidth,
    stroke: baseStrokeColor,
  };
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
 * Get territory building slot limit based on territory properties
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
 * Check if a territory can have a specific building type
 *
 * @param {Object} territory - Territory object
 * @param {Object} buildingType - Building type object
 * @returns {boolean} Whether the building can be constructed
 */
export const canBuildInTerritory = (territory, buildingType) => {
  if (!territory || !territory.type || !buildingType) return false;
  if (!territory.isOwned) return false;

  // Check building slot limit
  const slotLimit = getTerritoryBuildingSlotLimit(territory);
  if ((territory.buildings?.length || 0) >= slotLimit) return false;

  // Check if territory type is suitable
  return buildingType.requirements.territoryTypes.includes(territory.type);
};

/**
 * Get a CSS animation for new or pulsing territories
 *
 * @param {Object} territory - Territory object
 * @returns {string|null} CSS animation string or null
 */
export const getTerritoryAnimation = (territory) => {
  if (territory.isNewlyDiscovered || territory.isNewlyClaimed) {
    return "pulse 2s infinite";
  }
  return null;
};

/**
 * Utility function to lighten a hex color
 *
 * @param {string} color - Hex color code (e.g., "#ff0000")
 * @param {number} amount - Amount to lighten (0-1)
 * @returns {string} Lightened hex color
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
 * Get a resource icon for a territory
 *
 * @param {string} resourceType - Resource type
 * @returns {string} Unicode icon or first letter
 */
export const getResourceIcon = (resourceType) => {
  if (!resourceType) return "";

  const resourceIcons = {
    wheat: "🌾",
    wood: "🌲",
    stone: "🪨",
    iron: "⚒️",
    gold: "💰",
    horses: "🐎",
    fish: "🐟",
    spices: "🌶️",
    gems: "💎",
    silk: "🧵",
    fruit: "🍎",
  };

  return resourceIcons[resourceType] || resourceType.slice(0, 1).toUpperCase();
};
