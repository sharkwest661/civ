// src/stores/enhancedMilitaryStore.js
import { create } from "zustand";
import { generateUniqueId } from "../utils/gameUtils";
import { getNeighbors, hexToId, idToHex } from "../utils/hexUtils";
import { selectBestTacticalCard } from "../utils/militaryAI";

/**
 * Enhanced Military Store
 *
 * Adds advanced combat resolution, unit specialization, and expanded tactical cards
 */
export const useMilitaryStore = create((set, get) => ({
  // Military units by territory
  // Format: { territoryId: { units: [unit1, unit2, ...], } }
  militaryUnits: {},

  // Available tactical cards for the player
  tacticalCards: {},

  // Currently selected cards for combat
  selectedCards: {
    player: [],
    opponent: [],
  },

  // Current combat state
  combat: {
    active: false,
    attackingTerritoryId: null,
    defendingTerritoryId: null,
    attackingUnits: [],
    defendingUnits: [],
    currentRound: 0,
    totalRounds: 3,
    result: null, // 'victory', 'defeat', 'draw'
    battleLog: [],
    casualties: {
      attacker: 0,
      defender: 0,
    },
    territoryControl: 0, // How much control is gained (0-100)
  },

  // Military unit types with their stats - EXPANDED
  unitTypes: {
    // Basic units
    warrior: {
      id: "warrior",
      name: "Warrior",
      strength: 5,
      cost: {
        production: 20,
      },
      requiredWorkers: 1,
      requiredResources: {},
      maintenanceCost: {
        gold: 1,
      },
      movementRange: 1,
      description: "Basic infantry unit with balanced stats.",
      icon: "⚔️",
      era: "Primitive",
      upgradeTo: "swordsman",
    },
    archer: {
      id: "archer",
      name: "Archer",
      strength: 4,
      ranged: true,
      cost: {
        production: 25,
      },
      requiredWorkers: 1,
      requiredResources: {},
      maintenanceCost: {
        gold: 1,
      },
      movementRange: 1,
      description: "Ranged unit effective against infantry.",
      icon: "🏹",
      era: "Primitive",
      upgradeTo: "crossbowman",
    },
    horseman: {
      id: "horseman",
      name: "Horseman",
      strength: 7,
      cost: {
        production: 30,
      },
      requiredWorkers: 1,
      requiredResources: {
        horses: 1,
      },
      maintenanceCost: {
        gold: 2,
      },
      movementRange: 2,
      description: "Fast cavalry unit with high strength.",
      icon: "🐎",
      era: "Ancient",
      upgradeTo: "knight",
    },
    swordsman: {
      id: "swordsman",
      name: "Swordsman",
      strength: 10,
      cost: {
        production: 35,
      },
      requiredWorkers: 1,
      requiredResources: {
        iron: 1,
      },
      maintenanceCost: {
        gold: 2,
      },
      movementRange: 1,
      description: "Advanced infantry with high combat strength.",
      icon: "🗡️",
      era: "Classical",
      specialAbility: "formationFighting", // +1 strength for each adjacent swordsman
    },

    // NEW ADVANCED UNITS
    battering_ram: {
      id: "battering_ram",
      name: "Battering Ram",
      strength: 8,
      siege: true, // Special flag for siege units
      cost: {
        production: 45,
      },
      requiredWorkers: 2, // More workers needed
      requiredResources: {
        wood: 2,
      },
      maintenanceCost: {
        gold: 2,
      },
      movementRange: 1,
      description: "Siege unit effective against fortifications and buildings.",
      icon: "🔨",
      era: "Classical",
      specialAbility: "fortificationDamage", // +200% damage to fortifications
      vulnerableTo: ["horseman"], // Weak against certain unit types
    },

    scout: {
      id: "scout",
      name: "Scout",
      strength: 2,
      cost: {
        production: 15,
      },
      requiredWorkers: 1,
      requiredResources: {},
      maintenanceCost: {
        gold: 1,
      },
      movementRange: 3, // Very fast
      description:
        "Fast reconnaissance unit with low combat strength but high visibility.",
      icon: "👁️",
      era: "Primitive",
      specialAbility: "enhancedVisibility", // Can see further
      upgradeTo: "ranger",
    },

    spearman: {
      id: "spearman",
      name: "Spearman",
      strength: 6,
      cost: {
        production: 25,
      },
      requiredWorkers: 1,
      requiredResources: {},
      maintenanceCost: {
        gold: 1,
      },
      movementRange: 1,
      description: "Defense-oriented unit with bonus against cavalry.",
      icon: "🔱",
      era: "Ancient",
      specialAbility: "antiCavalry", // +3 strength against cavalry units
      upgradeTo: "pikeman",
    },

    slinger: {
      id: "slinger",
      name: "Slinger",
      strength: 3,
      ranged: true,
      cost: {
        production: 20,
      },
      requiredWorkers: 1,
      requiredResources: {},
      maintenanceCost: {
        gold: 1,
      },
      movementRange: 1,
      description: "Early ranged unit with low cost.",
      icon: "🧶",
      era: "Primitive",
      upgradeTo: "archer",
    },

    chariot: {
      id: "chariot",
      name: "Chariot",
      strength: 6,
      cost: {
        production: 28,
      },
      requiredWorkers: 1,
      requiredResources: {
        horses: 1,
      },
      maintenanceCost: {
        gold: 2,
      },
      movementRange: 2,
      description: "Early cavalry unit effective on open terrain.",
      icon: "🏇",
      era: "Ancient",
      specialAbility: "terrainBonus", // +2 strength on plains
      terrainEffectiveness: {
        plains: 2, // Bonus on plains
        forest: -1, // Penalty in forests
        mountains: -2, // Major penalty in mountains
      },
      upgradeTo: "horseman",
    },

    crossbowman: {
      id: "crossbowman",
      name: "Crossbowman",
      strength: 7,
      ranged: true,
      cost: {
        production: 40,
      },
      requiredWorkers: 1,
      requiredResources: {
        iron: 1,
      },
      maintenanceCost: {
        gold: 2,
      },
      movementRange: 1,
      description: "Advanced ranged unit with high strength.",
      icon: "🏹",
      era: "Medieval",
      upgradeTo: "musketman",
    },

    knight: {
      id: "knight",
      name: "Knight",
      strength: 12,
      cost: {
        production: 50,
      },
      requiredWorkers: 1,
      requiredResources: {
        horses: 1,
        iron: 1,
      },
      maintenanceCost: {
        gold: 3,
      },
      movementRange: 2,
      description: "Heavy cavalry unit with high strength.",
      icon: "🐎",
      era: "Medieval",
      specialAbility: "charge", // +2 strength when attacking
      upgradeTo: "lancer",
    },

    pikeman: {
      id: "pikeman",
      name: "Pikeman",
      strength: 9,
      cost: {
        production: 35,
      },
      requiredWorkers: 1,
      requiredResources: {
        iron: 1,
      },
      maintenanceCost: {
        gold: 2,
      },
      movementRange: 1,
      description: "Advanced anti-cavalry unit.",
      icon: "🔱",
      era: "Medieval",
      specialAbility: "antiCavalry", // +4 strength against cavalry units
      upgradeTo: "halberdier",
    },

    catapult: {
      id: "catapult",
      name: "Catapult",
      strength: 10,
      siege: true,
      ranged: true,
      cost: {
        production: 60,
      },
      requiredWorkers: 2,
      requiredResources: {
        wood: 2,
      },
      maintenanceCost: {
        gold: 3,
      },
      movementRange: 1,
      description: "Siege engine that can attack from a distance.",
      icon: "🏹",
      era: "Classical",
      specialAbility: "fortificationDamage", // +200% damage to fortifications
      vulnerableTo: ["horseman", "knight"], // Weak against certain unit types
      upgradeTo: "trebuchet",
    },

    musketman: {
      id: "musketman",
      name: "Musketman",
      strength: 14,
      ranged: true,
      cost: {
        production: 55,
      },
      requiredWorkers: 1,
      requiredResources: {
        iron: 1,
        saltpeter: 1,
      },
      maintenanceCost: {
        gold: 3,
      },
      movementRange: 1,
      description: "Gunpowder infantry unit with high strength.",
      icon: "🔫",
      era: "Renaissance",
      specialAbility: "volleyFire", // +3 strength when defending
    },
  },

  // Expanded tactical card types
  tacticalCardTypes: {
    // Basic cards
    "frontal-assault": {
      id: "frontal-assault",
      name: "Frontal Assault",
      type: "basic",
      strength: 2,
      description: "A straightforward attack formation.",
      icon: "⚔️",
    },
    "defensive-stance": {
      id: "defensive-stance",
      name: "Defensive Stance",
      type: "basic",
      strength: 2,
      defensive: true,
      description: "A cautious defensive formation.",
      icon: "🛡️",
    },
    "flanking-maneuver": {
      id: "flanking-maneuver",
      name: "Flanking Maneuver",
      type: "basic",
      strength: 3,
      counters: ["defensive-stance"],
      description: "Attack from the sides to counter defensive positions.",
      icon: "↪️",
    },

    // Intermediate cards
    ambush: {
      id: "ambush",
      name: "Ambush",
      type: "intermediate",
      strength: 4,
      terrain: ["forest"],
      description: "Surprise attack, more effective in forests.",
      icon: "🌳",
    },
    "high-ground": {
      id: "high-ground",
      name: "High Ground",
      type: "intermediate",
      strength: 3,
      terrain: ["hills", "mountains"],
      description: "Take advantage of elevated positions.",
      icon: "⛰️",
    },
    "shield-wall": {
      id: "shield-wall",
      name: "Shield Wall",
      type: "intermediate",
      strength: 3,
      defensive: true,
      description: "A strong defensive formation.",
      icon: "🛡️",
    },

    // Advanced cards
    "pincer-movement": {
      id: "pincer-movement",
      name: "Pincer Movement",
      type: "advanced",
      strength: 5,
      counters: ["frontal-assault"],
      description: "Surround the enemy from multiple directions.",
      icon: "🔄",
    },
    "feigned-retreat": {
      id: "feigned-retreat",
      name: "Feigned Retreat",
      type: "advanced",
      strength: 5,
      counters: ["frontal-assault"],
      description: "Pretend to retreat, then counter-attack.",
      icon: "↩️",
    },
    "night-attack": {
      id: "night-attack",
      name: "Night Attack",
      type: "advanced",
      strength: 6,
      counters: ["high-ground", "shield-wall"],
      description: "A surprise attack under the cover of darkness.",
      icon: "🌙",
    },

    // NEW TACTICAL CARDS
    "double-envelopment": {
      id: "double-envelopment",
      name: "Double Envelopment",
      type: "advanced",
      strength: 6,
      counters: ["frontal-assault", "defensive-stance"],
      description: "Completely surround the enemy forces for maximum effect.",
      icon: "⭕",
      unitRequirement: "horseman", // Requires specific unit type
    },

    "guerrilla-tactics": {
      id: "guerrilla-tactics",
      name: "Guerrilla Tactics",
      type: "intermediate",
      strength: 4,
      terrain: ["forest", "hills"],
      description:
        "Hit-and-run tactics particularly effective in rough terrain.",
      icon: "🌲",
      counters: ["frontal-assault"],
    },

    "forced-march": {
      id: "forced-march",
      name: "Forced March",
      type: "intermediate",
      strength: 3,
      description:
        "Push troops to move quickly, gaining surprise but at the cost of fatigue.",
      icon: "👣",
      effect: "initiative", // Gives initiative in combat
      drawback: "fatigue", // Reduces strength in subsequent rounds
    },

    "wedge-formation": {
      id: "wedge-formation",
      name: "Wedge Formation",
      type: "basic",
      strength: 3,
      description:
        "A triangular formation that concentrates force at a single point.",
      icon: "▲",
      counters: ["shield-wall"],
      unitRequirement: "warrior", // Requires specific unit type
    },

    "skirmish-line": {
      id: "skirmish-line",
      name: "Skirmish Line",
      type: "basic",
      strength: 2,
      description: "Spread out formation that's effective with ranged units.",
      icon: "〰️",
      unitBonus: { archer: 2, slinger: 2 }, // Better with specific units
    },

    "scorched-earth": {
      id: "scorched-earth",
      name: "Scorched Earth",
      type: "advanced",
      strength: 4,
      defensive: true,
      description:
        "Destroy resources to deny them to the enemy and slow their advance.",
      icon: "🔥",
      territoryEffect: "damage", // Damages territory productivity temporarily
    },

    "cavalry-charge": {
      id: "cavalry-charge",
      name: "Cavalry Charge",
      type: "intermediate",
      strength: 5,
      description: "A powerful charge that's devastating on open ground.",
      icon: "🐎",
      terrain: ["plains"],
      unitRequirement: ["horseman", "chariot", "knight"], // Requires any of these units
    },

    "testudo-formation": {
      id: "testudo-formation",
      name: "Testudo Formation",
      type: "intermediate",
      strength: 4,
      defensive: true,
      description:
        "Shields arranged to form a protective shell, strong against ranged attacks.",
      icon: "🐢",
      counters: ["archery-volley"],
      unitRequirement: "swordsman",
    },

    "archery-volley": {
      id: "archery-volley",
      name: "Archery Volley",
      type: "intermediate",
      strength: 4,
      description: "Concentrated arrow fire that can devastate exposed troops.",
      icon: "🏹",
      unitRequirement: ["archer", "crossbowman"],
      counters: ["frontal-assault"],
    },

    "elite-guard": {
      id: "elite-guard",
      name: "Elite Guard",
      type: "advanced",
      strength: 5,
      description:
        "Your best soldiers form a special unit that can turn the tide of battle.",
      icon: "👑",
      effect: "heroUnit", // Creates a temporary elite unit
    },

    "hidden-reinforcements": {
      id: "hidden-reinforcements",
      name: "Hidden Reinforcements",
      type: "advanced",
      strength: 6,
      description:
        "Surprise the enemy with concealed reinforcements at a crucial moment.",
      icon: "🎭",
      effect: "surprise", // Bonus in the final round
    },

    "pike-and-shot": {
      id: "pike-and-shot",
      name: "Pike and Shot",
      type: "advanced",
      strength: 5,
      description:
        "Combined arms formation with pikemen protecting musketeers.",
      icon: "⚔️",
      unitRequirement: ["pikeman", "musketman"], // Requires both unit types
      era: "Renaissance",
    },

    "weather-advantage": {
      id: "weather-advantage",
      name: "Weather Advantage",
      type: "intermediate",
      strength: 3,
      description: "Use knowledge of local weather patterns to gain an edge.",
      icon: "🌧️",
      effect: "random", // Random strength bonus 1-5
    },

    "siege-tactics": {
      id: "siege-tactics",
      name: "Siege Tactics",
      type: "intermediate",
      strength: 4,
      description: "Methodical approach to breaking down enemy fortifications.",
      icon: "🏰",
      unitRequirement: ["battering_ram", "catapult"],
    },
  },

  // NEW: Combat modifiers based on unit composition
  combatModifiers: {
    // Flanking bonus (having units behind enemy lines)
    flankingBonus: 0.2, // 20% bonus

    // Combined arms bonus (having mixed unit types)
    combinedArmsBonus: 0.15, // 15% bonus

    // Fortification defense bonus
    fortificationBonus: 0.3, // 30% bonus

    // Experience level bonuses
    experienceBonuses: {
      1: 0, // Level 1: no bonus
      2: 0.1, // Level 2: 10% bonus
      3: 0.2, // Level 3: 20% bonus
      4: 0.35, // Level 4: 35% bonus
      5: 0.5, // Level 5: 50% bonus
    },

    // Unit specialization bonuses (applied when appropriate)
    unitSpecializations: {
      antiCavalry: 3, // +3 strength against cavalry
      fortificationDamage: 2, // Multiplier against fortifications
      formationFighting: 1, // +1 per adjacent friendly unit of same type
      charge: 2, // +2 when attacking
      volleyFire: 3, // +3 when defending
    },
  },

  // NEW: Military doctrines
  militaryDoctrines: {
    current: null, // Currently active doctrine
    available: {
      aggressive: {
        name: "Aggressive Stance",
        description: "Focus on offensive operations with attack bonuses.",
        effects: {
          attackBonus: 0.2, // +20% attack strength
          movementBonus: 1, // +1 movement for all units
          defensePenalty: -0.1, // -10% defense strength
          maintenanceIncrease: 0.1, // +10% maintenance costs
        },
        unlockedCards: ["double-envelopment", "cavalry-charge"],
        unlockedUnits: ["berserker"],
      },

      defensive: {
        name: "Defensive Stance",
        description: "Focus on protecting territory with defensive bonuses.",
        effects: {
          defenseBonus: 0.25, // +25% defense strength
          fortificationBonus: 0.15, // +15% fortification effectiveness
          attackPenalty: -0.1, // -10% attack strength
          movementPenalty: -1, // -1 movement for all units
        },
        unlockedCards: ["testudo-formation", "scorched-earth"],
        unlockedUnits: ["tower-guard"],
      },

      balanced: {
        name: "Balanced Approach",
        description:
          "Balanced military strategy without major bonuses or penalties.",
        effects: {
          experienceGainBonus: 0.2, // +20% faster experience gain
          maintenanceReduction: 0.1, // -10% maintenance costs
        },
        unlockedCards: ["elite-guard", "weather-advantage"],
        unlockedUnits: [],
      },

      guerrilla: {
        name: "Guerrilla Warfare",
        description: "Focus on mobility and terrain advantage.",
        effects: {
          terrainBonus: 0.3, // +30% terrain advantage
          movementBonus: 1, // +1 movement for all units
          strengthPenalty: -0.1, // -10% overall strength
        },
        unlockedCards: ["guerrilla-tactics", "ambush"],
        unlockedUnits: ["ranger"],
      },
    },
  },

  // Initialize player's tactical cards
  initializeTacticalCards: () => {
    set((state) => {
      // Start with basic cards
      const initialCards = {
        "frontal-assault": {
          id: "frontal-assault",
          count: 3,
        },
        "defensive-stance": {
          id: "defensive-stance",
          count: 3,
        },
        "flanking-maneuver": {
          id: "flanking-maneuver",
          count: 2,
        },
        // Add some new basic cards to start with
        "wedge-formation": {
          id: "wedge-formation",
          count: 2,
        },
        "skirmish-line": {
          id: "skirmish-line",
          count: 2,
        },
      };

      return {
        tacticalCards: initialCards,
      };
    });
  },

  // Set the current military doctrine
  setMilitaryDoctrine: (doctrineId) => {
    set((state) => {
      if (!state.militaryDoctrines.available[doctrineId]) {
        console.error(`Doctrine ${doctrineId} not available`);
        return state;
      }

      // Give doctrine-specific cards if not already available
      const updatedCards = { ...state.tacticalCards };
      const doctrine = state.militaryDoctrines.available[doctrineId];

      if (doctrine.unlockedCards) {
        doctrine.unlockedCards.forEach((cardId) => {
          if (!updatedCards[cardId]) {
            updatedCards[cardId] = {
              id: cardId,
              count: 1, // Start with 1 card of this type
            };
          }
        });
      }

      return {
        militaryDoctrines: {
          ...state.militaryDoctrines,
          current: doctrineId,
        },
        tacticalCards: updatedCards,
      };
    });
  },

  // Military unit actions
  trainUnit: (territoryId, unitTypeId, convertWorker, payResources) => {
    const state = get();
    const unitType = state.unitTypes[unitTypeId];

    if (!unitType) return false;

    // Apply doctrine effects to unit cost if applicable
    let modifiedCost = { ...unitType.cost };
    if (state.militaryDoctrines.current) {
      const doctrine =
        state.militaryDoctrines.available[state.militaryDoctrines.current];
      if (doctrine.effects.productionDiscount) {
        modifiedCost.production = Math.floor(
          modifiedCost.production * (1 - doctrine.effects.productionDiscount)
        );
      }
    }

    // Create new unit
    const newUnit = {
      id: generateUniqueId(`unit_${unitTypeId}_`),
      type: unitTypeId,
      strength: unitType.strength,
      health: 100,
      experience: 0,
      level: 1,
      movesLeft: unitType.movementRange,
      position: territoryId,
      specializations: [], // Can gain specializations through combat
    };

    // Convert worker (from worker store)
    const workerConverted = convertWorker(territoryId);
    if (!workerConverted) return false;

    // Pay resources (from resources store)
    const resourcesPaid = payResources(modifiedCost);
    if (!resourcesPaid) {
      // Revert worker conversion if resource payment fails
      // This would need a worker restoration function
      return false;
    }

    // Add unit to territory
    set((state) => {
      const territoryUnits = state.militaryUnits[territoryId] || { units: [] };

      return {
        militaryUnits: {
          ...state.militaryUnits,
          [territoryId]: {
            ...territoryUnits,
            units: [...territoryUnits.units, newUnit],
          },
        },
      };
    });

    return true;
  },

  // Get units in a territory with doctrine bonuses applied
  getUnitsInTerritory: (territoryId) => {
    const state = get();
    const baseUnits = state.militaryUnits[territoryId]?.units || [];

    // If no doctrine, return units as-is
    if (!state.militaryDoctrines.current) return baseUnits;

    // Apply doctrine effects to units
    const doctrine =
      state.militaryDoctrines.available[state.militaryDoctrines.current];

    return baseUnits.map((unit) => {
      const modifiedUnit = { ...unit };

      // Apply doctrine bonuses to unit stats
      if (doctrine.effects.attackBonus && !unit.defending) {
        modifiedUnit.effectiveStrength = Math.floor(
          unit.strength * (1 + doctrine.effects.attackBonus)
        );
      } else if (doctrine.effects.defenseBonus && unit.defending) {
        modifiedUnit.effectiveStrength = Math.floor(
          unit.strength * (1 + doctrine.effects.defenseBonus)
        );
      }

      // Apply movement bonuses
      if (doctrine.effects.movementBonus) {
        modifiedUnit.movementRange =
          unit.movementRange + doctrine.effects.movementBonus;
      }

      return modifiedUnit;
    });
  },

  // Calculate unit maintenance cost with doctrine effects
  calculateMaintenance: () => {
    const state = get();
    const costs = { gold: 0 };

    // Base maintenance calculation
    Object.values(state.militaryUnits).forEach((territory) => {
      territory.units.forEach((unit) => {
        const unitType = state.unitTypes[unit.type];
        if (unitType.maintenanceCost) {
          Object.entries(unitType.maintenanceCost).forEach(
            ([resource, amount]) => {
              costs[resource] = (costs[resource] || 0) + amount;
            }
          );
        }
      });
    });

    // Apply doctrine modifiers
    if (state.militaryDoctrines.current) {
      const doctrine =
        state.militaryDoctrines.available[state.militaryDoctrines.current];

      if (doctrine.effects.maintenanceIncrease) {
        costs.gold = Math.ceil(
          costs.gold * (1 + doctrine.effects.maintenanceIncrease)
        );
      } else if (doctrine.effects.maintenanceReduction) {
        costs.gold = Math.floor(
          costs.gold * (1 - doctrine.effects.maintenanceReduction)
        );
      }
    }

    return costs;
  },

  // ENHANCED: Combat system with improved mechanics
  startCombat: (attackingTerritoryId, defendingTerritoryId, getTerritory) => {
    const state = get();

    // Get attacking units
    const attackingUnits = state.getUnitsInTerritory(attackingTerritoryId);
    if (attackingUnits.length === 0) return false;

    // Get defending units
    const defendingUnits = state.getUnitsInTerritory(defendingTerritoryId);

    // Get territory types for terrain modifiers
    const attackingTerritory = getTerritory(attackingTerritoryId);
    const defendingTerritory = getTerritory(defendingTerritoryId);

    if (!attackingTerritory || !defendingTerritory) return false;

    // Check for special unit abilities that affect combat
    const processedAttackingUnits = processUnitSpecialAbilities(
      attackingUnits,
      defendingUnits,
      attackingTerritory,
      false // Not defending
    );

    const processedDefendingUnits = processUnitSpecialAbilities(
      defendingUnits,
      attackingUnits,
      defendingTerritory,
      true // Defending
    );

    // Reset selected cards
    set({
      selectedCards: {
        player: [],
        opponent: [],
      },
      combat: {
        active: true,
        attackingTerritoryId,
        defendingTerritoryId,
        attackingUnits: processedAttackingUnits,
        defendingUnits: processedDefendingUnits,
        attackingTerritory,
        defendingTerritory,
        currentRound: 1,
        totalRounds: 3,
        result: null,
        battleLog: [
          {
            round: 0,
            message: `Combat initiated between ${
              attackingTerritory.type || "unknown"
            } territory and ${defendingTerritory.type || "unknown"} territory.`,
          },
        ],
        casualties: {
          attacker: 0,
          defender: 0,
        },
        territoryControl: 0, // How much control will be gained on victory
      },
    });

    return true;
  },

  // Progress to the next round of combat with enhanced mechanics
  nextCombatRound: () => {
    let combatActive = true;

    set((state) => {
      if (!state.combat.active) return state;

      const currentRound = state.combat.currentRound;
      const totalRounds = state.combat.totalRounds;

      // If all rounds complete, resolve combat
      if (currentRound >= totalRounds) {
        const outcome = enhancedResolveCombat(state);
        combatActive = false;

        return {
          combat: {
            ...state.combat,
            active: false,
            result: outcome.result,
            battleLog: [
              ...state.combat.battleLog,
              {
                round: "Final",
                message: outcome.message,
              },
            ],
            casualties: outcome.casualties,
            territoryControl: outcome.territoryControl,
          },
        };
      }

      // Otherwise, proceed to next round
      const playerCard = state.selectedCards.player[currentRound - 1];
      const opponentCardId = selectAICardForCombat(
        state,
        playerCard,
        currentRound
      );

      // Resolve this round with enhanced mechanics
      const roundOutcome = enhancedResolveRound(
        state,
        playerCard,
        opponentCardId,
        currentRound
      );

      // Set AI card for next round
      const updatedSelectedCards = { ...state.selectedCards };
      updatedSelectedCards.opponent[currentRound - 1] = opponentCardId;

      // Update casualties from this round
      const updatedCasualties = {
        attacker:
          state.combat.casualties.attacker + roundOutcome.attackerCasualties,
        defender:
          state.combat.casualties.defender + roundOutcome.defenderCasualties,
      };

      return {
        combat: {
          ...state.combat,
          currentRound: currentRound + 1,
          battleLog: [
            ...state.combat.battleLog,
            {
              round: currentRound,
              message: roundOutcome.message,
              playerCard,
              opponentCard: opponentCardId,
              playerScore: roundOutcome.playerScore,
              opponentScore: roundOutcome.opponentScore,
              winner: roundOutcome.winner,
              attackerCasualties: roundOutcome.attackerCasualties,
              defenderCasualties: roundOutcome.defenderCasualties,
            },
          ],
          casualties: updatedCasualties,
        },
        selectedCards: updatedSelectedCards,
      };
    });

    return combatActive;
  },

  // End combat and apply results with territorial control
  endCombat: (updateTerritoryControl) => {
    const state = get();

    if (!state.combat.active && !state.combat.result) return null;

    const outcome = {
      result: state.combat.result,
      attackingTerritoryId: state.combat.attackingTerritoryId,
      defendingTerritoryId: state.combat.defendingTerritoryId,
      battleLog: [...state.combat.battleLog],
      casualties: { ...state.combat.casualties },
      territoryControl: state.combat.territoryControl,
    };

    // Apply combat results to units (damage, experience)
    set((state) => {
      const updatedMilitaryUnits = { ...state.militaryUnits };

      // Update attacking units (apply damage and experience)
      if (updatedMilitaryUnits[state.combat.attackingTerritoryId]) {
        const casualtyRate = outcome.casualties.attacker / 100;

        updatedMilitaryUnits[state.combat.attackingTerritoryId].units =
          updatedMilitaryUnits[state.combat.attackingTerritoryId].units.map(
            (unit) => {
              // Apply damage
              const damageTaken = Math.floor(20 * casualtyRate);
              const newHealth = Math.max(1, unit.health - damageTaken);

              // Calculate experience gain (more for victory)
              const expGain = outcome.result === "victory" ? 15 : 8;
              const newExperience = unit.experience + expGain;

              // Check for level up
              let newLevel = unit.level;
              if (newExperience >= 100) {
                newLevel++;
              }

              return {
                ...unit,
                health: newHealth,
                experience: newExperience % 100, // Reset exp on level up
                level: newLevel,
              };
            }
          );
      }

      // Update defending units if they survived
      if (
        outcome.result !== "victory" &&
        updatedMilitaryUnits[state.combat.defendingTerritoryId]
      ) {
        const casualtyRate = outcome.casualties.defender / 100;

        updatedMilitaryUnits[state.combat.defendingTerritoryId].units =
          updatedMilitaryUnits[state.combat.defendingTerritoryId].units.map(
            (unit) => {
              // Apply damage
              const damageTaken = Math.floor(20 * casualtyRate);
              const newHealth = Math.max(1, unit.health - damageTaken);

              // Calculate experience gain (more for successful defense)
              const expGain = outcome.result === "defeat" ? 15 : 8;
              const newExperience = unit.experience + expGain;

              // Check for level up
              let newLevel = unit.level;
              if (newExperience >= 100) {
                newLevel++;
              }

              return {
                ...unit,
                health: newHealth,
                experience: newExperience % 100,
                level: newLevel,
              };
            }
          );
      }

      return {
        militaryUnits: updatedMilitaryUnits,
      };
    });

    // Update territory control based on outcome
    if (outcome.result === "victory") {
      // If complete conquest (territoryControl >= 100), change ownership
      if (outcome.territoryControl >= 100) {
        updateTerritoryControl(
          state.combat.defendingTerritoryId,
          state.combat.attackingTerritoryId,
          true // Complete conquest
        );
      } else {
        // Partial conquest - update control value
        updateTerritoryControl(
          state.combat.defendingTerritoryId,
          state.combat.attackingTerritoryId,
          false, // Partial conquest
          outcome.territoryControl
        );
      }
    }

    // Reset combat state
    set({
      combat: {
        active: false,
        attackingTerritoryId: null,
        defendingTerritoryId: null,
        attackingUnits: [],
        defendingUnits: [],
        currentRound: 0,
        totalRounds: 3,
        result: null,
        battleLog: [],
        casualties: {
          attacker: 0,
          defender: 0,
        },
        territoryControl: 0,
      },
      selectedCards: {
        player: [],
        opponent: [],
      },
    });

    return outcome;
  },

  // Add a tactical card to player's deck with rarity check
  addTacticalCard: (cardId, count = 1) => {
    set((state) => {
      const cardType = state.tacticalCardTypes[cardId];
      if (!cardType) return state;

      const existingCard = state.tacticalCards[cardId];

      // Limit the number of advanced cards a player can have
      if (cardType.type === "advanced" && !existingCard) {
        // Count existing advanced cards
        const advancedCardCount = Object.entries(state.tacticalCards).filter(
          ([id, _]) => state.tacticalCardTypes[id]?.type === "advanced"
        ).length;

        // Limit to 5 different advanced card types
        if (advancedCardCount >= 5) {
          console.log("Maximum advanced card types reached");
          return state;
        }
      }

      return {
        tacticalCards: {
          ...state.tacticalCards,
          [cardId]: {
            id: cardId,
            count: (existingCard?.count || 0) + count,
          },
        },
      };
    });
  },

  // Enhanced: Get available cards that match current units and terrain
  getContextualCards: (territoryId) => {
    const state = get();

    // Get territory and units
    const territory = state.militaryUnits[territoryId];
    if (!territory) return state.getAvailableCards();

    const availableCards = state.getAvailableCards();

    // Get unit types in this territory
    const unitTypesInTerritory = territory.units.map((unit) => unit.type);

    // Sort cards by contextual relevance
    return availableCards
      .map((card) => {
        let relevance = 0;

        // Check unit requirements
        if (card.unitRequirement) {
          // Single unit requirement
          if (typeof card.unitRequirement === "string") {
            if (unitTypesInTerritory.includes(card.unitRequirement)) {
              relevance += 20;
            } else {
              relevance -= 20; // Penalty if required unit isn't present
            }
          }
          // Array of unit requirements (need at least one)
          else if (Array.isArray(card.unitRequirement)) {
            if (
              card.unitRequirement.some((type) =>
                unitTypesInTerritory.includes(type)
              )
            ) {
              relevance += 20;
            } else {
              relevance -= 20;
            }
          }
        }

        // Check terrain suitability
        if (card.terrain && territory.territory?.type) {
          if (card.terrain.includes(territory.territory.type)) {
            relevance += 15;
          }
        }

        // Unit bonus checks
        if (card.unitBonus) {
          const matchingUnits = Object.keys(card.unitBonus).filter((unitType) =>
            unitTypesInTerritory.includes(unitType)
          );

          if (matchingUnits.length > 0) {
            relevance += 10 * matchingUnits.length;
          }
        }

        return {
          ...card,
          relevance,
        };
      })
      .sort((a, b) => b.relevance - a.relevance);
  },

  // Upgrade a unit to a more advanced type
  upgradeUnit: (unitId, territoryId, payResources) => {
    const state = get();

    // Find the unit
    const territory = state.militaryUnits[territoryId];
    if (!territory) return false;

    const unitIndex = territory.units.findIndex((u) => u.id === unitId);
    if (unitIndex === -1) return false;

    const unit = territory.units[unitIndex];
    const unitType = state.unitTypes[unit.type];

    // Check if the unit can be upgraded
    if (!unitType.upgradeTo) return false;

    const upgradedType = state.unitTypes[unitType.upgradeTo];
    if (!upgradedType) return false;

    // Calculate upgrade cost (typically 50% of the new unit cost)
    const upgradeCost = {
      production: Math.floor(upgradedType.cost.production * 0.5),
    };

    // Pay resources
    const resourcesPaid = payResources(upgradeCost);
    if (!resourcesPaid) return false;

    // Create upgraded unit
    set((state) => {
      const territory = state.militaryUnits[territoryId];
      if (!territory) return state;

      const updatedUnits = [...territory.units];
      // Preserve experience and health when upgrading
      updatedUnits[unitIndex] = {
        ...unit,
        type: unitType.upgradeTo,
        strength: upgradedType.strength,
        movementRange: upgradedType.movementRange,
        // Keep experience, level, and partial health
      };

      return {
        militaryUnits: {
          ...state.militaryUnits,
          [territoryId]: {
            ...territory,
            units: updatedUnits,
          },
        },
      };
    });

    return true;
  },

  // Initialize the military system
  initializeMilitary: () => {
    // Initialize player's tactical cards
    get().initializeTacticalCards();

    // Set default doctrine if desired
    // get().setMilitaryDoctrine("balanced");
  },
}));

// ================ HELPER FUNCTIONS ================

/**
 * Process unit special abilities in combat
 */
function processUnitSpecialAbilities(units, enemyUnits, territory, defending) {
  if (!units || units.length === 0) return units;

  return units.map((unit) => {
    const processedUnit = { ...unit };

    // Apply terrain effects based on unit type
    if (unit.terrainEffectiveness && territory.type) {
      const terrainEffect = unit.terrainEffectiveness[territory.type] || 0;
      processedUnit.terrainBonus = terrainEffect;
    }

    // Apply special abilities
    if (unit.specialAbility) {
      switch (unit.specialAbility) {
        case "antiCavalry":
          // Check if enemy has cavalry units
          const hasCavalry = enemyUnits.some((enemy) =>
            ["horseman", "chariot", "knight"].includes(enemy.type)
          );
          if (hasCavalry) {
            processedUnit.abilityBonus = 3; // +3 vs cavalry
          }
          break;

        case "formationFighting":
          // Check for adjacent friendly units of same type
          // In a real implementation, this would use position data
          // Here we'll just count other units of same type
          const sameTypeCount =
            units.filter((u) => u.type === unit.type).length - 1;
          processedUnit.abilityBonus = sameTypeCount; // +1 per same unit
          break;

        case "charge":
          // Bonus when attacking, not defending
          if (!defending) {
            processedUnit.abilityBonus = 2;
          }
          break;

        case "volleyFire":
          // Bonus when defending, not attacking
          if (defending) {
            processedUnit.abilityBonus = 3;
          }
          break;
      }
    }

    return processedUnit;
  });
}

/**
 * Select best AI card for the current combat situation
 */
function selectAICardForCombat(state, playerCardId, currentRound) {
  // Get available AI cards from tacticalCardTypes
  const availableCardTypes = Object.keys(state.tacticalCardTypes);

  // Get combat information
  const { attackingTerritory, defendingTerritory } = state.combat;

  // Use the AI utility to select the best card
  return selectBestTacticalCard(
    availableCardTypes.map((id) => state.tacticalCardTypes[id]),
    playerCardId,
    attackingTerritory,
    defendingTerritory,
    false, // AI is defending
    "normal" // Normal difficulty
  );
}

/**
 * Enhanced resolve round with more detailed combat factors
 */
function enhancedResolveRound(state, playerCardId, opponentCardId, round) {
  const playerCard = state.tacticalCardTypes[playerCardId];
  const opponentCard = state.tacticalCardTypes[opponentCardId];

  if (!playerCard || !opponentCard) {
    return {
      winner: "opponent",
      message: "Invalid card selection",
      playerScore: 0,
      opponentScore: 1,
      attackerCasualties: 0,
      defenderCasualties: 5,
    };
  }

  // Calculate base scores
  let playerScore = playerCard.strength;
  let opponentScore = opponentCard.strength;

  // Detailed battle log for message construction
  const battleDetails = {
    player: [{ source: "Base card strength", value: playerCard.strength }],
    opponent: [{ source: "Base card strength", value: opponentCard.strength }],
  };

  // Apply counters
  if (playerCard.counters && playerCard.counters.includes(opponentCardId)) {
    playerScore += 2;
    battleDetails.player.push({ source: "Counter bonus", value: 2 });
  }

  if (opponentCard.counters && opponentCard.counters.includes(playerCardId)) {
    opponentScore += 2;
    battleDetails.opponent.push({ source: "Counter bonus", value: 2 });
  }

  // Apply terrain bonuses
  if (playerCard.terrain && state.combat.attackingTerritory) {
    if (playerCard.terrain.includes(state.combat.attackingTerritory.type)) {
      playerScore += 1;
      battleDetails.player.push({
        source: `${state.combat.attackingTerritory.type} terrain bonus`,
        value: 1,
      });
    }
  }

  if (opponentCard.terrain && state.combat.defendingTerritory) {
    if (opponentCard.terrain.includes(state.combat.defendingTerritory.type)) {
      opponentScore += 1;
      battleDetails.opponent.push({
        source: `${state.combat.defendingTerritory.type} terrain bonus`,
        value: 1,
      });
    }
  }

  // Calculate unit strength totals
  const attackerStrengthBase = calculateTotalUnitStrength(
    state.combat.attackingUnits
  );
  const defenderStrengthBase = calculateTotalUnitStrength(
    state.combat.defendingUnits
  );

  battleDetails.player.push({
    source: "Unit strength",
    value: attackerStrengthBase / 5,
  });
  battleDetails.opponent.push({
    source: "Unit strength",
    value: defenderStrengthBase / 5,
  });

  // Apply fortification bonus for defender
  const defenderFortificationBonus = calculateFortificationBonus(
    state.combat.defendingTerritory
  );

  if (defenderFortificationBonus > 0) {
    opponentScore += defenderFortificationBonus;
    battleDetails.opponent.push({
      source: "Fortification bonus",
      value: defenderFortificationBonus,
    });
  }

  // Defense terrain bonus
  const defenseTerrainBonus = getDefenseTerrainBonus(
    state.combat.defendingTerritory
  );
  if (defenseTerrainBonus > 0) {
    opponentScore += defenseTerrainBonus;
    battleDetails.opponent.push({
      source: "Defensive terrain",
      value: defenseTerrainBonus,
    });
  }

  // Special card effects
  if (playerCard.effect) {
    const effectBonus = processCardEffect(
      playerCard.effect,
      round,
      state.combat.totalRounds
    );
    if (effectBonus !== 0) {
      playerScore += effectBonus;
      battleDetails.player.push({
        source: `${playerCard.effect} effect`,
        value: effectBonus,
      });
    }
  }

  if (opponentCard.effect) {
    const effectBonus = processCardEffect(
      opponentCard.effect,
      round,
      state.combat.totalRounds
    );
    if (effectBonus !== 0) {
      opponentScore += effectBonus;
      battleDetails.opponent.push({
        source: `${opponentCard.effect} effect`,
        value: effectBonus,
      });
    }
  }

  // Determine winner
  let winner;
  let message;

  // Calculate casualties (higher score difference = more casualties)
  let attackerCasualties = 0;
  let defenderCasualties = 0;

  if (playerScore > opponentScore) {
    winner = "player";
    const scoreDiff = playerScore - opponentScore;
    defenderCasualties = Math.min(30, 10 + scoreDiff * 5);
    attackerCasualties = Math.max(5, 15 - scoreDiff * 2);

    message =
      `Round ${round}: Player wins with ${playerCard.name} (${playerScore}) vs ${opponentCard.name} (${opponentScore}). ` +
      `Casualties: Player ${attackerCasualties}%, Enemy ${defenderCasualties}%`;
  } else if (opponentScore > playerScore) {
    winner = "opponent";
    const scoreDiff = opponentScore - playerScore;
    attackerCasualties = Math.min(30, 10 + scoreDiff * 5);
    defenderCasualties = Math.max(5, 15 - scoreDiff * 2);

    message =
      `Round ${round}: Enemy wins with ${opponentCard.name} (${opponentScore}) vs ${playerCard.name} (${playerScore}). ` +
      `Casualties: Player ${attackerCasualties}%, Enemy ${defenderCasualties}%`;
  } else {
    winner = "draw";
    attackerCasualties = 10;
    defenderCasualties = 10;

    message =
      `Round ${round}: Draw - Both sides scored ${playerScore}. ` +
      `Casualties: Both sides 10%`;
  }

  // Build detailed battle log if needed
  const detailedMessage =
    message +
    "\n" +
    `Player: ${battleDetails.player
      .map((b) => `${b.source}: +${b.value}`)
      .join(", ")}\n` +
    `Enemy: ${battleDetails.opponent
      .map((b) => `${b.source}: +${b.value}`)
      .join(", ")}`;

  return {
    winner,
    message: detailedMessage,
    playerScore,
    opponentScore,
    attackerCasualties,
    defenderCasualties,
  };
}

/**
 * Enhanced resolve combat to determine the outcome
 */
function enhancedResolveCombat(state) {
  // Count round wins
  let playerWins = 0;
  let opponentWins = 0;
  let totalAttackerCasualties = 0;
  let totalDefenderCasualties = 0;

  state.combat.battleLog.forEach((log) => {
    if (log.winner === "player") playerWins++;
    if (log.winner === "opponent") opponentWins++;

    // Accumulate casualties
    if (log.attackerCasualties)
      totalAttackerCasualties += log.attackerCasualties;
    if (log.defenderCasualties)
      totalDefenderCasualties += log.defenderCasualties;
  });

  // Determine overall winner
  let result;
  let message;
  let territoryControl = 0;

  if (playerWins > opponentWins) {
    result = "victory";

    // Calculate territory control gain (proportional to win margin and casualty difference)
    const winMargin = playerWins - opponentWins;
    const casualtyDifference =
      totalDefenderCasualties - totalAttackerCasualties;

    // Base control gain is 30 for any victory
    territoryControl = 30;

    // Add 20 for each additional win beyond a single-round advantage
    if (winMargin > 1) {
      territoryControl += (winMargin - 1) * 20;
    }

    // Add control based on casualty difference
    if (casualtyDifference > 0) {
      territoryControl += Math.floor(casualtyDifference / 5);
    }

    // Check for complete conquest (over 100)
    if (territoryControl >= 100) {
      message = `Combat Result: Decisive Victory! Your forces have conquered the territory, defeating the enemy completely.`;
    } else {
      message = `Combat Result: Victory! Your forces have gained ${territoryControl}% control over the territory.`;
    }
  } else if (opponentWins > playerWins) {
    result = "defeat";
    message = `Combat Result: Defeat. Enemy forces have successfully defended their territory.`;
  } else {
    result = "draw";
    message = `Combat Result: Stalemate. Neither side gained a clear advantage.`;

    // Even in a draw, you might gain some territory control
    territoryControl = 10;
  }

  // Adjust casualty reporting for realism
  message += ` Casualties: Your Forces ${Math.min(
    100,
    totalAttackerCasualties
  )}%, Enemy Forces ${Math.min(100, totalDefenderCasualties)}%.`;

  return {
    result,
    message,
    casualties: {
      attacker: totalAttackerCasualties,
      defender: totalDefenderCasualties,
    },
    territoryControl,
  };
}

/**
 * Process special card effects based on effect type
 */
function processCardEffect(effect, currentRound, totalRounds) {
  switch (effect) {
    case "initiative":
      return currentRound === 1 ? 3 : 0; // +3 in first round

    case "surprise":
      return currentRound === totalRounds ? 4 : 0; // +4 in final round

    case "random":
      return Math.floor(Math.random() * 5) + 1; // Random 1-5

    case "heroUnit":
      return 3; // Consistent bonus

    default:
      return 0;
  }
}

/**
 * Calculate total unit strength with modifiers
 */
function calculateTotalUnitStrength(units) {
  if (!units || units.length === 0) return 0;

  return units.reduce((total, unit) => {
    let unitStrength = unit.strength;

    // Apply terrain bonus if present
    if (unit.terrainBonus) {
      unitStrength += unit.terrainBonus;
    }

    // Apply ability bonus if present
    if (unit.abilityBonus) {
      unitStrength += unit.abilityBonus;
    }

    // Apply health factor
    unitStrength = (unitStrength * unit.health) / 100;

    // Apply experience level bonus
    const levelBonus = (unit.level - 1) * 0.1; // 10% per level
    unitStrength = unitStrength * (1 + levelBonus);

    return total + unitStrength;
  }, 0);
}

/**
 * Calculate fortification bonus from territory buildings
 */
function calculateFortificationBonus(territory) {
  if (!territory || !territory.buildings) return 0;

  let bonus = 0;

  // Check for defensive buildings
  territory.buildings.forEach((building) => {
    if (building.type === "walls" || building.type === "fort") {
      bonus += building.level || 1;
    }
  });

  return bonus;
}

/**
 * Get defense terrain bonus based on territory type
 */
function getDefenseTerrainBonus(territory) {
  if (!territory || !territory.type) return 0;

  switch (territory.type) {
    case "mountains":
      return 3; // Strong defense bonus
    case "hills":
      return 2; // Good defense bonus
    case "forest":
      return 1; // Slight defense bonus
    default:
      return 0;
  }
}

export default useMilitaryStore;
