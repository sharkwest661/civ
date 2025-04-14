import { create } from "zustand";

/**
 * Technology Store
 *
 * Manages the technology research system including:
 * - Available technologies
 * - Research progress
 * - Technology effects
 */
export const useTechnologyStore = create((set, get) => ({
  // Current research - the technology currently being researched
  currentResearch: null,

  // All technologies with their details
  technologies: {
    // Primitive Era
    agriculture: {
      id: "agriculture",
      name: "Agriculture",
      description: "Enables farms and basic food production",
      cost: 20,
      era: "Primitive",
      branch: "Economic",
      requirements: [],
      effects: ["Unlocks Farm building", "+5% food production"],
      researched: true, // Already researched at game start
      progress: 20, // Complete
    },
    pottery: {
      id: "pottery",
      name: "Pottery",
      description: "Enables food storage and preservation",
      cost: 30,
      era: "Primitive",
      branch: "Economic",
      requirements: ["agriculture"],
      effects: ["Unlocks Granary building", "+10% food storage"],
      researched: false,
      progress: 0,
    },
    hunting: {
      id: "hunting",
      name: "Hunting",
      description: "Enables hunting and gathering in forests",
      cost: 25,
      era: "Primitive",
      branch: "Military",
      requirements: [],
      effects: ["Unlocks Hunting Lodge", "+1 food from forest territories"],
      researched: false,
      progress: 0,
    },
    mining: {
      id: "mining",
      name: "Mining",
      description: "Enables extraction of resources from hills and mountains",
      cost: 35,
      era: "Primitive",
      branch: "Economic",
      requirements: [],
      effects: ["Unlocks Mine building", "Access to stone and iron resources"],
      researched: false,
      progress: 0,
    },

    // Ancient Era
    writing: {
      id: "writing",
      name: "Writing",
      description: "Enables record keeping and knowledge preservation",
      cost: 40,
      era: "Ancient",
      branch: "Science",
      requirements: ["pottery"],
      effects: ["Unlocks Library building", "+10% science production"],
      researched: false,
      progress: 0,
    },
    bronze_working: {
      id: "bronze_working",
      name: "Bronze Working",
      description: "Enables creation of bronze tools and weapons",
      cost: 45,
      era: "Ancient",
      branch: "Military",
      requirements: ["mining"],
      effects: ["Unlocks Bronze Warrior unit", "+10% production in mines"],
      researched: false,
      progress: 0,
    },
    masonry: {
      id: "masonry",
      name: "Masonry",
      description: "Enables advanced stone construction",
      cost: 45,
      era: "Ancient",
      branch: "Economic",
      requirements: ["mining"],
      effects: ["Unlocks Walls", "+15% building durability"],
      researched: false,
      progress: 0,
    },
    sailing: {
      id: "sailing",
      name: "Sailing",
      description: "Enables naval exploration and transportation",
      cost: 40,
      era: "Ancient",
      branch: "Economic",
      requirements: [],
      effects: ["Unlocks Fishing Boats", "Allows exploration of water tiles"],
      researched: false,
      progress: 0,
    },

    // Classical Era
    mathematics: {
      id: "mathematics",
      name: "Mathematics",
      description: "Enables advanced calculations and engineering",
      cost: 60,
      era: "Classical",
      branch: "Science",
      requirements: ["writing"],
      effects: ["Unlocks Aqueduct building", "+15% science production"],
      researched: false,
      progress: 0,
    },
    iron_working: {
      id: "iron_working",
      name: "Iron Working",
      description: "Enables iron weapons and tools",
      cost: 65,
      era: "Classical",
      branch: "Military",
      requirements: ["bronze_working"],
      effects: ["Unlocks Swordsman unit", "+20% military strength"],
      researched: false,
      progress: 0,
    },
    currency: {
      id: "currency",
      name: "Currency",
      description: "Enables advanced economic systems",
      cost: 60,
      era: "Classical",
      branch: "Economic",
      requirements: ["mathematics"],
      effects: ["Unlocks Market building", "+15% gold production"],
      researched: false,
      progress: 0,
    },

    // Medieval Era
    feudalism: {
      id: "feudalism",
      name: "Feudalism",
      description: "Enables advanced governance and military organization",
      cost: 80,
      era: "Medieval",
      branch: "Military",
      requirements: ["iron_working"],
      effects: ["Unlocks Knight unit", "+10% military production"],
      researched: false,
      progress: 0,
    },
    guilds: {
      id: "guilds",
      name: "Guilds",
      description: "Enables specialized worker organizations",
      cost: 85,
      era: "Medieval",
      branch: "Economic",
      requirements: ["currency"],
      effects: ["Unlocks Workshop building", "+15% production in cities"],
      researched: false,
      progress: 0,
    },

    // Renaissance Era
    gunpowder: {
      id: "gunpowder",
      name: "Gunpowder",
      description: "Enables firearms and advanced weaponry",
      cost: 100,
      era: "Renaissance",
      branch: "Military",
      requirements: ["feudalism"],
      effects: ["Unlocks Musketman unit", "+25% military strength"],
      researched: false,
      progress: 0,
    },
    printing_press: {
      id: "printing_press",
      name: "Printing Press",
      description: "Enables mass production of books and knowledge sharing",
      cost: 100,
      era: "Renaissance",
      branch: "Science",
      requirements: ["guilds"],
      effects: ["Unlocks University building", "+20% science production"],
      researched: false,
      progress: 0,
    },
  },

  // Technology actions

  // Start researching a technology
  startResearch: (techId) => {
    set((state) => {
      // Make sure the technology exists
      if (!state.technologies[techId]) return state;

      // Check if already researched
      if (state.technologies[techId].researched) return state;

      // Check if requirements are met
      const tech = state.technologies[techId];
      const areRequirementsMet = tech.requirements.every(
        (reqId) =>
          state.technologies[reqId] && state.technologies[reqId].researched
      );

      if (!areRequirementsMet) return state;

      return {
        currentResearch: techId,
      };
    });
  },

  // Update research progress
  updateResearchProgress: (sciencePoints) => {
    set((state) => {
      const currentResearch = state.currentResearch;

      // If no current research, nothing to update
      if (!currentResearch) return state;

      const tech = state.technologies[currentResearch];
      const newProgress = Math.min(tech.cost, tech.progress + sciencePoints);
      const isComplete = newProgress >= tech.cost;

      // Update the technology progress
      const updatedTechnologies = {
        ...state.technologies,
        [currentResearch]: {
          ...tech,
          progress: newProgress,
          researched: isComplete,
        },
      };

      // If research is complete, clear current research
      return {
        technologies: updatedTechnologies,
        currentResearch: isComplete ? null : currentResearch,
      };
    });
  },

  // Cancel current research
  cancelResearch: () => {
    set({ currentResearch: null });
  },

  // Get all available technologies that can be researched
  getAvailableTechnologies: () => {
    const state = get();
    const available = {};

    Object.entries(state.technologies).forEach(([id, tech]) => {
      // Skip already researched techs
      if (tech.researched) return;

      // Check if all requirements are met
      const areRequirementsMet = tech.requirements.every(
        (reqId) =>
          state.technologies[reqId] && state.technologies[reqId].researched
      );

      if (areRequirementsMet) {
        available[id] = tech;
      }
    });

    return available;
  },

  // Get technologies by era
  getTechnologiesByEra: () => {
    const state = get();
    const byEra = {};

    Object.values(state.technologies).forEach((tech) => {
      if (!byEra[tech.era]) {
        byEra[tech.era] = [];
      }
      byEra[tech.era].push(tech);
    });

    return byEra;
  },

  // Apply a technology's effects
  applyTechnologyEffects: (techId) => {
    // This would interact with other stores to apply effects
    // For now, it's just a placeholder
    console.log(`Applying effects for: ${techId}`);
  },
}));

export default useTechnologyStore;
