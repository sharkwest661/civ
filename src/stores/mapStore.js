// src/stores/mapStore.js
import { create } from "zustand";
import { generateHexGrid, hexToId } from "../utils/hexUtils";
import {
  TERRITORY_TYPES,
  BUILDING_SLOT_LIMITS,
} from "../constants/gameConstants";

/**
 * Map Store
 *
 * Manages the game map state including:
 * - Territory data
 * - Territory ownership
 * - Resource distribution
 * - Building placement
 *
 * Refactored with improved action patterns and territory management
 */
export const useMapStore = create((set, get) => ({
  // Map configuration
  mapRadius: 7, // How large the map is

  // List of all territories by hex ID
  territories: {},

  // Currently selected territory
  selectedTerritory: null,

  // Recently discovered territories (for animations)
  recentlyDiscoveredTerritories: [],

  // Territory actions

  /**
   * Select a territory
   * @param {Object} hex - The hex object with q,r coordinates and territory data
   */
  selectTerritory: (hex) => {
    if (!hex) {
      set({ selectedTerritory: null });
      return;
    }

    set({ selectedTerritory: hex });
  },

  /**
   * Update a territory's type
   * @param {string} hexId - The territory ID (q,r coordinates)
   * @param {string} type - The new territory type
   */
  setTerritoryType: (hexId, type) => {
    if (!hexId || !type) return;

    set((state) => {
      // Skip if territory doesn't exist or already has this type
      if (!state.territories[hexId] || state.territories[hexId].type === type) {
        return state;
      }

      return {
        territories: {
          ...state.territories,
          [hexId]: {
            ...state.territories[hexId],
            type,
          },
        },
      };
    });
  },

  /**
   * Set the owner of a territory
   * @param {string} hexId - The territory ID
   * @param {string} ownerId - The ID of the owner (player or AI)
   */
  setTerritoryOwner: (hexId, ownerId) => {
    if (!hexId) return;

    set((state) => {
      const territory = state.territories[hexId];
      if (!territory) return state;

      // Skip if already owned by this owner
      if (territory.owner === ownerId) return state;

      const updatedTerritory = {
        ...territory,
        owner: ownerId,
        isOwned: ownerId !== null,
        isExplored: true,
        isNewlyClaimed: ownerId !== null && territory.owner !== ownerId,
      };

      return {
        territories: {
          ...state.territories,
          [hexId]: updatedTerritory,
        },
      };
    });

    // Clear the newly claimed flag after a delay
    if (ownerId !== null) {
      setTimeout(() => {
        set((state) => {
          const territory = state.territories[hexId];
          if (!territory || !territory.isNewlyClaimed) return state;

          return {
            territories: {
              ...state.territories,
              [hexId]: {
                ...territory,
                isNewlyClaimed: false,
              },
            },
          };
        });
      }, 3000);
    }
  },

  /**
   * Set a resource for a territory
   * @param {string} hexId - The territory ID
   * @param {string} resource - The resource type
   */
  setTerritoryResource: (hexId, resource) => {
    if (!hexId) return;

    set((state) => {
      const territory = state.territories[hexId];
      if (!territory) return state;

      return {
        territories: {
          ...state.territories,
          [hexId]: {
            ...territory,
            resource,
          },
        },
      };
    });
  },

  /**
   * Mark a territory as explored
   * @param {string} hexId - The territory ID
   */
  exploreTerritoryId: (hexId) => {
    if (!hexId) return;

    set((state) => {
      const territory = state.territories[hexId];
      if (!territory || territory.isExplored) return state;

      // Add to recently discovered territories
      const newDiscoveredTerritories = [
        ...state.recentlyDiscoveredTerritories,
        hexId,
      ];

      return {
        territories: {
          ...state.territories,
          [hexId]: {
            ...territory,
            isExplored: true,
            isNewlyDiscovered: true,
          },
        },
        recentlyDiscoveredTerritories: newDiscoveredTerritories,
      };
    });

    // Clear the newly discovered flag after a delay
    setTimeout(() => {
      set((state) => {
        const territory = state.territories[hexId];
        if (!territory || !territory.isNewlyDiscovered) return state;

        // Remove from recently discovered territories
        const newDiscoveredTerritories =
          state.recentlyDiscoveredTerritories.filter((id) => id !== hexId);

        return {
          territories: {
            ...state.territories,
            [hexId]: {
              ...territory,
              isNewlyDiscovered: false,
            },
          },
          recentlyDiscoveredTerritories: newDiscoveredTerritories,
        };
      });
    }, 3000);
  },

  /**
   * Add a building to a territory
   * @param {string} hexId - The territory ID
   * @param {Object} building - The building to add
   */
  addBuilding: (hexId, building) => {
    if (!hexId || !building) return;

    set((state) => {
      const territory = state.territories[hexId];
      if (!territory) return state;

      // Get current buildings or empty array
      const buildings = territory.buildings || [];

      // Calculate slot limit based on territory type
      let slotLimit = BUILDING_SLOT_LIMITS.DEFAULT;

      if (territory.isCapital) {
        slotLimit = BUILDING_SLOT_LIMITS.CAPITAL;
      } else if (territory.resource) {
        slotLimit = BUILDING_SLOT_LIMITS.RESOURCE;
      }

      // Skip if we've reached the slot limit
      if (buildings.length >= slotLimit) {
        return state;
      }

      return {
        territories: {
          ...state.territories,
          [hexId]: {
            ...territory,
            buildings: [...buildings, building],
          },
        },
      };
    });
  },

  /**
   * Upgrade a building in a territory
   * @param {string} hexId - The territory ID
   * @param {number} buildingIndex - The index of the building to upgrade
   * @param {number} newLevel - The new level for the building
   */
  upgradeBuilding: (hexId, buildingIndex, newLevel) => {
    if (!hexId || buildingIndex === undefined || !newLevel) return;

    set((state) => {
      const territory = state.territories[hexId];
      if (!territory) return state;

      const buildings = territory.buildings || [];

      // Skip if building doesn't exist
      if (!buildings[buildingIndex]) return state;

      // Create new buildings array with updated building
      const updatedBuildings = [...buildings];
      updatedBuildings[buildingIndex] = {
        ...updatedBuildings[buildingIndex],
        level: newLevel,
      };

      return {
        territories: {
          ...state.territories,
          [hexId]: {
            ...territory,
            buildings: updatedBuildings,
          },
        },
      };
    });
  },

  /**
   * Remove a building from a territory
   * @param {string} hexId - The territory ID
   * @param {number} buildingIndex - The index of the building to remove
   */
  removeBuilding: (hexId, buildingIndex) => {
    if (!hexId || buildingIndex === undefined) return;

    set((state) => {
      const territory = state.territories[hexId];
      if (!territory) return state;

      const buildings = territory.buildings || [];

      // Skip if building doesn't exist
      if (!buildings[buildingIndex]) return state;

      // Create new buildings array without the removed building
      const updatedBuildings = buildings.filter(
        (_, index) => index !== buildingIndex
      );

      return {
        territories: {
          ...state.territories,
          [hexId]: {
            ...territory,
            buildings: updatedBuildings,
          },
        },
      };
    });
  },

  /**
   * Set a territory under attack
   * @param {string} hexId - The territory ID
   * @param {boolean} isUnderAttack - Whether the territory is under attack
   */
  setTerritoryUnderAttack: (hexId, isUnderAttack) => {
    if (!hexId) return;

    set((state) => {
      const territory = state.territories[hexId];
      if (!territory) return state;

      return {
        territories: {
          ...state.territories,
          [hexId]: {
            ...territory,
            isUnderAttack,
          },
        },
      };
    });
  },

  // Query methods (selectors)

  /**
   * Get all owned territories for a player
   * @param {string} playerId - The player ID
   * @returns {Object} Map of owned territories
   */
  getOwnedTerritories: (playerId) => {
    const { territories } = get();

    return Object.entries(territories)
      .filter(([_, territory]) => territory.owner === playerId)
      .reduce((result, [id, territory]) => {
        result[id] = territory;
        return result;
      }, {});
  },

  /**
   * Get the capital territory for a player
   * @param {string} playerId - The player ID
   * @returns {Object|null} The capital territory or null
   */
  getCapitalTerritory: (playerId) => {
    const { territories } = get();

    const capitalId = Object.entries(territories).find(
      ([_, territory]) => territory.owner === playerId && territory.isCapital
    )?.[0];

    return capitalId ? { id: capitalId, ...territories[capitalId] } : null;
  },

  // Initialization

  /**
   * Initialize the map with territory types and basic resources
   */
  initializeMap: () => {
    const hexes = generateHexGrid(get().mapRadius);
    const territories = {};

    // Territory types with weights
    const territoryTypes = [
      { type: TERRITORY_TYPES.PLAINS, weight: 3 }, // Most common
      { type: TERRITORY_TYPES.FOREST, weight: 2 },
      { type: TERRITORY_TYPES.HILLS, weight: 2 },
      { type: TERRITORY_TYPES.MOUNTAINS, weight: 1 },
      { type: TERRITORY_TYPES.DESERT, weight: 1 },
      { type: TERRITORY_TYPES.SWAMP, weight: 1 },
    ];

    // Flatten weights into an array for random selection
    const flattenedTypes = [];
    territoryTypes.forEach((typeObj) => {
      for (let i = 0; i < typeObj.weight; i++) {
        flattenedTypes.push(typeObj.type);
      }
    });

    // Resource types with rarity
    const resourceTypes = {
      common: ["wheat", "wood", "stone", "fish"],
      uncommon: ["iron", "horses", "copper", "fruit"],
      rare: ["gold", "gems", "silk", "spices"],
    };

    // Distribute territory types
    hexes.forEach((hex) => {
      const hexId = hexToId(hex);

      // Skip the center hex for capital
      if (hex.q === 0 && hex.r === 0) {
        territories[hexId] = {
          type: TERRITORY_TYPES.PLAINS,
          isCapital: true,
          isOwned: true,
          owner: "player1",
          isExplored: true,
          resource: "wheat", // Start with some food
          buildings: [
            {
              id: "center",
              name: "Town Center",
              type: "center",
              level: 1,
            },
          ],
        };
        return;
      }

      // For hexes adjacent to capital
      const distance = Math.max(
        Math.abs(hex.q),
        Math.abs(hex.r),
        Math.abs(-hex.q - hex.r)
      );

      // First ring is always visible and owned
      if (distance === 1) {
        const randomType =
          flattenedTypes[Math.floor(Math.random() * flattenedTypes.length)];

        territories[hexId] = {
          type: randomType,
          isOwned: true,
          owner: "player1",
          isExplored: true,
        };

        // 50% chance of having a resource
        if (Math.random() < 0.5) {
          const commonResources = resourceTypes.common;
          const randomResource =
            commonResources[Math.floor(Math.random() * commonResources.length)];
          territories[hexId].resource = randomResource;
        }
      }
      // Second ring is explored but not owned
      else if (distance === 2) {
        const randomType =
          flattenedTypes[Math.floor(Math.random() * flattenedTypes.length)];

        territories[hexId] = {
          type: randomType,
          isOwned: false,
          owner: null,
          isExplored: true,
        };

        // 40% chance of having a resource
        if (Math.random() < 0.4) {
          // 80% common, 20% uncommon
          const resourcePool =
            Math.random() < 0.8 ? resourceTypes.common : resourceTypes.uncommon;

          const randomResource =
            resourcePool[Math.floor(Math.random() * resourcePool.length)];
          territories[hexId].resource = randomResource;
        }
      }
      // All other hexes are unexplored
      else {
        const randomType =
          flattenedTypes[Math.floor(Math.random() * flattenedTypes.length)];

        territories[hexId] = {
          type: randomType,
          isOwned: false,
          owner: null,
          isExplored: false,
        };
      }
    });

    set({ territories, recentlyDiscoveredTerritories: [] });
  },
}));

export default useMapStore;
