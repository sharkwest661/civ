// src/utils/workerUtils.js
import { WORKER_SPECIALIZATIONS } from "../constants/gameConstants";
import { Briefcase, User, Brain } from "lucide-react";

/**
 * Worker Utility Functions
 *
 * Centralizes worker-related logic that was previously duplicated across components
 */

/**
 * Get detailed information about a worker's specialization
 *
 * @param {Object} specialization - The specialization object (e.g., {type: 'diligent', subtype: 'farming'})
 * @returns {Object|null} Formatted specialization info with icon, color, name, and description
 */
export const getWorkerSpecializationInfo = (specialization) => {
  if (!specialization) return null;

  switch (specialization.type) {
    case "diligent":
      return {
        icon: Briefcase,
        color: "resource.gold",
        name: "Diligent",
        subtype: specialization.subtype,
        description: `+15% ${specialization.subtype} production`,
        tooltip: `Diligent Worker: +15% ${specialization.subtype} production`,
      };
    case "strong":
      return {
        icon: User,
        color: "resource.production",
        name: "Strong",
        subtype: specialization.subtype,
        description: `+15% ${specialization.subtype} efficiency`,
        tooltip: `Strong Worker: +15% ${specialization.subtype} efficiency`,
      };
    case "clever":
      return {
        icon: Brain,
        color: "resource.science",
        name: "Clever",
        subtype: specialization.subtype,
        description: `+15% ${specialization.subtype} output`,
        tooltip: `Clever Worker: +15% ${specialization.subtype} output`,
      };
    default:
      return null;
  }
};

/**
 * Format a specialization subtype for display (capitalize first letter)
 *
 * @param {string} subtype - The specialization subtype
 * @returns {string} Formatted subtype
 */
export const formatSpecializationSubtype = (subtype) => {
  if (!subtype) return "";
  return subtype.charAt(0).toUpperCase() + subtype.slice(1);
};

/**
 * Check if a worker specialization is ideal for a specific building type
 *
 * @param {Object} specialization - The specialization object
 * @param {string} buildingType - The building type
 * @returns {boolean} Whether the worker is ideal for the building
 */
export const isWorkerIdealForBuilding = (specialization, buildingType) => {
  if (!specialization || !buildingType) return false;

  // Map building types to worker specializations
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

/**
 * Calculate worker capacity for a building based on its level
 *
 * @param {number} level - Building level
 * @returns {number} Worker capacity
 */
export const getBuildingWorkerCapacity = (level = 1) => {
  return level + 1; // Level 1: 2 workers, Level 2: 3 workers, Level 3: 4 workers
};

/**
 * Calculate production bonus for a worker in a building
 *
 * @param {Object} specialization - Worker specialization
 * @param {string} buildingType - Building type
 * @param {boolean} isRecentlyReassigned - Whether the worker was recently reassigned (50% penalty)
 * @returns {number} Production multiplier (e.g., 1.0, 1.15, 0.5)
 */
export const calculateWorkerProductionMultiplier = (
  specialization,
  buildingType,
  isRecentlyReassigned = false
) => {
  let multiplier = 1.0;

  // Apply specialization bonus if applicable
  if (specialization) {
    // Map building types to specialization subtypes
    const resourceMapping = {
      farm: "farming",
      mine: "production",
      library: "science",
      market: "gold",
    };

    const buildingResource = resourceMapping[buildingType];

    // Apply bonus if worker specialization matches building resource
    if (
      specialization.type === "diligent" &&
      specialization.subtype === buildingResource
    ) {
      multiplier *= 1 + (specialization.bonus || 0.15);
    }
  }

  // Apply penalty for recently reassigned workers
  if (isRecentlyReassigned) {
    multiplier *= 0.5;
  }

  return multiplier;
};

/**
 * Generate a new, unique worker ID
 *
 * @returns {string} Unique worker ID
 */
export const generateWorkerId = () => {
  return `worker_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
};

/**
 * Get a random worker specialization
 *
 * @returns {Object|null} Random specialization or null
 */
export const generateRandomSpecialization = () => {
  // 25% chance of having specialization
  if (Math.random() >= 0.25) return null;

  // Select specialization type randomly
  const specializationTypes = Object.keys(WORKER_SPECIALIZATIONS);
  const selectedTypeKey =
    specializationTypes[Math.floor(Math.random() * specializationTypes.length)];
  const selectedType = WORKER_SPECIALIZATIONS[selectedTypeKey];

  // Select subtype randomly
  const selectedSubtype =
    selectedType.subtypes[
      Math.floor(Math.random() * selectedType.subtypes.length)
    ];

  return {
    type: selectedTypeKey,
    subtype: selectedSubtype,
    bonus: 0.15, // 15% bonus
  };
};
