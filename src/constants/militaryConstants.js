// src/constants/militaryConstants.js

/**
 * Military system constants for Empire's Legacy
 */

// Military unit types
export const UNIT_TYPES = {
  WARRIOR: "warrior",
  ARCHER: "archer",
  HORSEMAN: "horseman",
  SWORDSMAN: "swordsman",
};

// Unit Icons
export const UNIT_ICONS = {
  [UNIT_TYPES.WARRIOR]: "⚔️",
  [UNIT_TYPES.ARCHER]: "🏹",
  [UNIT_TYPES.HORSEMAN]: "🐎",
  [UNIT_TYPES.SWORDSMAN]: "🗡️",
};

// Tactical card types
export const TACTICAL_CARD_TYPES = {
  BASIC: "basic",
  INTERMEDIATE: "intermediate",
  ADVANCED: "advanced",
};

// Card Icons
export const CARD_ICONS = {
  "frontal-assault": "⚔️",
  "defensive-stance": "🛡️",
  "flanking-maneuver": "↪️",
  ambush: "🌳",
  "high-ground": "⛰️",
  "shield-wall": "🛡️",
  "pincer-movement": "🔄",
  "feigned-retreat": "↩️",
  "night-attack": "🌙",
};

// Combat result types
export const COMBAT_RESULTS = {
  VICTORY: "victory",
  DEFEAT: "defeat",
  DRAW: "draw",
};

// Terrain type effects on combat
export const TERRAIN_EFFECTS = {
  forest: {
    defense: 1,
    cards: ["ambush"],
  },
  hills: {
    defense: 1,
    cards: ["high-ground"],
  },
  mountains: {
    defense: 2,
    cards: ["high-ground"],
  },
  plains: {
    attack: 1,
    cards: ["frontal-assault", "flanking-maneuver"],
  },
  desert: {
    cards: ["flanking-maneuver"],
  },
  swamp: {
    defense: 1,
    movement: -1,
    cards: ["ambush"],
  },
};

// Unit advantage matrix
// Format: { [unitType]: { advantageAgainst: [...unitTypes], disadvantageAgainst: [...unitTypes] } }
export const UNIT_ADVANTAGES = {
  [UNIT_TYPES.WARRIOR]: {
    advantageAgainst: [],
    disadvantageAgainst: [UNIT_TYPES.HORSEMAN],
  },
  [UNIT_TYPES.ARCHER]: {
    advantageAgainst: [UNIT_TYPES.WARRIOR],
    disadvantageAgainst: [UNIT_TYPES.HORSEMAN],
  },
  [UNIT_TYPES.HORSEMAN]: {
    advantageAgainst: [UNIT_TYPES.WARRIOR, UNIT_TYPES.ARCHER],
    disadvantageAgainst: [UNIT_TYPES.SWORDSMAN],
  },
  [UNIT_TYPES.SWORDSMAN]: {
    advantageAgainst: [UNIT_TYPES.HORSEMAN],
    disadvantageAgainst: [UNIT_TYPES.ARCHER],
  },
};

// Combat mechanics
export const COMBAT_MECHANICS = {
  ROUNDS_PER_COMBAT: 3,
  UNIT_ADVANTAGE_BONUS: 0.5, // 50% bonus when unit has advantage
  TERRAIN_BONUS_MULTIPLIER: 0.2, // 20% bonus for favorable terrain
  HOME_TERRITORY_DEFENSE_BONUS: 1, // +1 strength for defending home territory
  MAX_CARDS_PER_ROUND: 1,
  EXPERIENCE_PER_COMBAT: 10,
  CASUALTY_BASE_RATE: 0.1, // 10% chance of unit loss in combat
};

// Card effectiveness matrix - which cards counter others
export const CARD_COUNTERS = {
  "frontal-assault": [],
  "defensive-stance": ["flanking-maneuver"],
  "flanking-maneuver": ["defensive-stance"],
  ambush: ["frontal-assault"],
  "high-ground": ["flanking-maneuver"],
  "shield-wall": ["frontal-assault", "flanking-maneuver"],
  "pincer-movement": ["frontal-assault", "defensive-stance"],
  "feigned-retreat": ["frontal-assault"],
  "night-attack": ["high-ground", "shield-wall"],
};

export default {
  UNIT_TYPES,
  UNIT_ICONS,
  TACTICAL_CARD_TYPES,
  CARD_ICONS,
  COMBAT_RESULTS,
  TERRAIN_EFFECTS,
  UNIT_ADVANTAGES,
  COMBAT_MECHANICS,
  CARD_COUNTERS,
};
