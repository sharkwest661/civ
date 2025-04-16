// src/constants/gameConstants.js

/**
 * Game-specific constants for Empire's Legacy
 */

// Game phases
export const GAME_PHASES = {
  ASSIGNMENT: "Assignment",
  BUILDING: "Building",
  RESEARCH: "Research",
  MILITARY: "Military",
  // DIPLOMACY: "Diplomacy", // Removed diplomacy phase
};

// Map constants
export const MAP_CONFIG = {
  DEFAULT_RADIUS: 7,
  DEFAULT_HEX_SIZE: 40,
  MAX_ZOOM: 2,
  MIN_ZOOM: 0.5,
  ZOOM_STEP: 0.1,
};

// Territory types
export const TERRITORY_TYPES = {
  PLAINS: "plains",
  FOREST: "forest",
  HILLS: "hills",
  MOUNTAINS: "mountains",
  DESERT: "desert",
  SWAMP: "swamp",
};

// Territory colors
export const TERRITORY_COLORS = {
  CAPITAL: "#873e23", // Amber-Brown
  OWNED: "#2e4c34", // Forest Green
  EXPLORED: "#31394a", // Slate Gray
  UNEXPLORED: "#0d1520", // Near Black
  STRATEGIC: "#3e2e4c", // Deep Purple
  LUXURY: "#2e3e4c", // Steel Blue
  DANGER: "#4c2e2e", // Deep Red
};

// Resource types
export const RESOURCE_TYPES = {
  FOOD: "food",
  PRODUCTION: "production",
  SCIENCE: "science",
  GOLD: "gold",
  HAPPINESS: "happiness",
  CULTURE: "culture",
  // INFLUENCE: "influence", // Removed influence resource
};

// Resource icons and colors
export const RESOURCE_DISPLAY = {
  [RESOURCE_TYPES.FOOD]: {
    icon: "🌾",
    color: "resource.food",
    name: "Food",
    description:
      "Food is used to grow your population. Each new worker requires increasing amounts of food.",
  },
  [RESOURCE_TYPES.PRODUCTION]: {
    icon: "⚒️",
    color: "resource.production",
    name: "Production",
    description:
      "Production points are used to construct buildings and military units.",
  },
  [RESOURCE_TYPES.SCIENCE]: {
    icon: "🔬",
    color: "resource.science",
    name: "Science",
    description:
      "Science advances your technologies, unlocking new abilities and buildings.",
  },
  [RESOURCE_TYPES.GOLD]: {
    icon: "💰",
    color: "resource.gold",
    name: "Gold",
    description:
      "Gold funds special actions, maintenance costs, and can be used for trade.",
  },
  [RESOURCE_TYPES.HAPPINESS]: {
    icon: "😊",
    color: "resource.happiness",
    name: "Happiness",
    description:
      "Happiness affects worker productivity and population growth. Keep your empire happy!",
  },
  [RESOURCE_TYPES.CULTURE]: {
    icon: "🏛️",
    color: "resource.culture",
    name: "Culture",
    description:
      "Culture expands your territory and provides influence over other civilizations.",
  },
  // Removed INFLUENCE resource display
};

// Building types
export const BUILDING_TYPES = {
  FARM: {
    id: "farm",
    name: "Farm",
    description: "Produces food for population growth",
    productionCost: 20,
    resourceProduction: { type: RESOURCE_TYPES.FOOD, amount: 5 },
    requirements: {
      territoryTypes: [TERRITORY_TYPES.PLAINS, TERRITORY_TYPES.HILLS],
    },
  },
  MINE: {
    id: "mine",
    name: "Mine",
    description: "Produces production points for construction",
    productionCost: 30,
    resourceProduction: { type: RESOURCE_TYPES.PRODUCTION, amount: 5 },
    requirements: {
      territoryTypes: [TERRITORY_TYPES.HILLS, TERRITORY_TYPES.MOUNTAINS],
    },
  },
  LIBRARY: {
    id: "library",
    name: "Library",
    description: "Produces science points for research",
    productionCost: 40,
    resourceProduction: { type: RESOURCE_TYPES.SCIENCE, amount: 5 },
    requirements: {
      territoryTypes: [TERRITORY_TYPES.PLAINS, TERRITORY_TYPES.FOREST],
    },
  },
  MARKET: {
    id: "market",
    name: "Market",
    description: "Produces gold for economy",
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
  DILIGENT: {
    type: "diligent",
    name: "Diligent",
    bonus: 0.15,
    subtypes: ["farming", "production", "gold"],
    description: "More efficient at resource production",
  },
  STRONG: {
    type: "strong",
    name: "Strong",
    bonus: 0.15,
    subtypes: ["military", "exploration", "construction"],
    description: "More efficient at physical tasks",
  },
  CLEVER: {
    type: "clever",
    name: "Clever",
    bonus: 0.15,
    subtypes: ["science", "espionage"], // Removed diplomacy specialization
    description: "More efficient at knowledge tasks",
  },
};

// Building slot limits
export const BUILDING_SLOT_LIMITS = {
  DEFAULT: 1,
  CAPITAL: 2,
  RESOURCE: 2,
};

// Animation durations
export const ANIMATION = {
  TOOLTIP_DELAY: 800,
  DISCOVERY_PULSE: 3000,
  TRANSITION_DURATION: 200,
};

// UI constants
export const UI = {
  TOOLTIP: {
    WIDTH: 200,
    HEIGHT_BASE: 90,
    HEIGHT_WITH_RESOURCE: 120,
    OFFSET_Y: 15,
  },
  SIDE_PANEL: {
    WIDTH: 550,
  },
};

// Civilization types
export const CIVILIZATION_TYPES = {
  SOLARIAN: "solarian",
  CELESTIAL: "celestial",
  NORTHERN: "northern",
  DESERT: "desert",
  FOREST: "forest",
  ISLAND: "island",
};

// Civilization colors
export const CIVILIZATION_COLORS = {
  [CIVILIZATION_TYPES.SOLARIAN]: "#c17443", // Copper
  [CIVILIZATION_TYPES.CELESTIAL]: "#43c1be", // Teal
  [CIVILIZATION_TYPES.NORTHERN]: "#4374c1", // Cold Blue
  [CIVILIZATION_TYPES.DESERT]: "#c1a843", // Warm Gold
  [CIVILIZATION_TYPES.FOREST]: "#6fc143", // Vibrant Green
  [CIVILIZATION_TYPES.ISLAND]: "#c14358", // Cherry Red
};
