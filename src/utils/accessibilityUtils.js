// src/utils/accessibilityUtils.js

/**
 * Accessibility Utilities
 *
 * This file provides pure utility functions for enhancing accessibility
 * throughout the Empire's Legacy application.
 */

/**
 * Check if a color has sufficient contrast with white text
 * WCAG AA requires a contrast ratio of at least 4.5:1 for normal text
 *
 * @param {string} backgroundColor - Hex color code (e.g. "#123456")
 * @returns {boolean} Whether the color has sufficient contrast with white
 */
export const hasContrastWithWhite = (backgroundColor) => {
  // Remove # if present
  const hex = backgroundColor.replace("#", "");

  // Convert hex to RGB
  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;

  // Calculate luminance
  const luminance =
    0.2126 * adjustGamma(r) + 0.7152 * adjustGamma(g) + 0.0722 * adjustGamma(b);

  // White has luminance of 1.0
  // Contrast ratio calculation
  const contrast = (1.0 + 0.05) / (luminance + 0.05);

  // WCAG AA requires contrast of at least 4.5:1 for normal text
  return contrast >= 4.5;
};

// Helper function for luminance calculation
const adjustGamma = (color) => {
  return color <= 0.03928
    ? color / 12.92
    : Math.pow((color + 0.055) / 1.055, 2.4);
};

/**
 * Returns a darker or lighter text color based on background contrast
 *
 * @param {string} backgroundColor - Hex color code
 * @returns {string} Either white or dark gray for text, based on contrast
 */
export const getAccessibleTextColor = (backgroundColor) => {
  return hasContrastWithWhite(backgroundColor) ? "#FFFFFF" : "#333333";
};

/**
 * Generates ARIA labels for different game elements
 */
export const ariaLabels = {
  /**
   * Generate ARIA label for a territory
   *
   * @param {Object} territory - Territory object
   * @param {number} q - Q coordinate
   * @param {number} r - R coordinate
   * @returns {string} ARIA label for the territory
   */
  territory: (territory, q, r) => {
    if (!territory) return `Territory at coordinates ${q},${r}`;

    const parts = [`Territory at coordinates ${q},${r}`];

    if (territory.type && territory.type !== "unexplored") {
      parts.push(`Type: ${territory.type}`);
    }

    if (territory.isCapital) {
      parts.push("Capital territory");
    }

    if (territory.isOwned) {
      parts.push("Owned territory");
    } else if (territory.isExplored) {
      parts.push("Explored territory");
    } else {
      parts.push("Unexplored territory");
    }

    if (territory.resource && territory.isExplored) {
      parts.push(`Resource: ${territory.resource}`);
    }

    return parts.join(", ");
  },

  /**
   * Generate ARIA label for a building
   *
   * @param {Object} building - Building object
   * @param {number} workerCount - Number of workers in the building
   * @returns {string} ARIA label for the building
   */
  building: (building, workerCount = 0) => {
    if (!building) return "Building";

    const parts = [`${building.name}`];
    parts.push(`Level ${building.level || 1}`);
    parts.push(`${workerCount} workers assigned`);

    return parts.join(", ");
  },

  /**
   * Generate ARIA label for a worker
   *
   * @param {Object} specialization - Worker specialization object
   * @returns {string} ARIA label for the worker
   */
  worker: (specialization) => {
    if (!specialization) return "Worker without specialization";

    return `${specialization.name} worker specialized in ${specialization.subtype}`;
  },

  /**
   * Generate ARIA label for a resource
   *
   * @param {string} type - Resource type
   * @param {Object} resource - Resource object with amount and production
   * @returns {string} ARIA label for the resource
   */
  resource: (type, resource) => {
    if (!resource) return `${type} resource`;

    return `${type}: ${Math.floor(resource.amount)} with ${
      resource.production > 0 ? "+" : ""
    }${resource.production} per turn`;
  },
};

export default {
  hasContrastWithWhite,
  getAccessibleTextColor,
  ariaLabels,
};
