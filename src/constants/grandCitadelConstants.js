// src/constants/grandCitadelConstants.js

/**
 * Grand Citadel Wonder - Used for Wonder Victory
 */
export const GRAND_CITADEL = {
  id: "grandcitadel",
  name: "Grand Citadel",
  description:
    "The ultimate wonder that showcases your civilization's greatness",
  productionCost: 200,
  constructionTime: 5, // Turns to complete
  requirements: {
    territoryTypes: ["plains", "hills"],
    technologies: ["masonry", "mathematics", "feudalism"], // Required technologies
    resources: {
      // Special resources required
      marble: 2,
      gold: 1,
      crystal: 1,
    },
  },
  effects: [
    "+20% to all resource production",
    "+15% cultural influence",
    "+10 happiness",
    "Enables Wonder Victory if maintained for 5 turns",
  ],
  wonderVictory: {
    requiredTurns: 5, // Turns to maintain for Victory
  },
};

/**
 * Check if Grand Citadel can be built
 *
 * @param {Object} playerState - Current player state
 * @returns {Object} - { canBuild: boolean, reasons: string[] }
 */
export const canBuildGrandCitadel = (playerState) => {
  const reasons = [];

  // Check technologies
  const requiredTechs = GRAND_CITADEL.requirements.technologies;
  const missingTechs = requiredTechs.filter(
    (techId) =>
      !playerState.technologies[techId] ||
      !playerState.technologies[techId].researched
  );

  if (missingTechs.length > 0) {
    reasons.push(`Missing required technologies: ${missingTechs.join(", ")}`);
  }

  // Check resources
  const requiredResources = GRAND_CITADEL.requirements.resources;
  const missingResources = [];

  Object.entries(requiredResources).forEach(([resource, amount]) => {
    const available = playerState.resources[resource] || 0;
    if (available < amount) {
      missingResources.push(`${resource} (have ${available}/${amount})`);
    }
  });

  if (missingResources.length > 0) {
    reasons.push(`Missing required resources: ${missingResources.join(", ")}`);
  }

  // Check production
  if (playerState.resources.production < GRAND_CITADEL.productionCost) {
    reasons.push(
      `Insufficient production (have ${playerState.resources.production}/${GRAND_CITADEL.productionCost})`
    );
  }

  return {
    canBuild: reasons.length === 0,
    reasons,
  };
};

export default GRAND_CITADEL;
