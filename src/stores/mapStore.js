import { create } from "zustand";
import { generateHexGrid, hexToId } from "../utils/hexUtils";

/**
 * Map Store
 *
 * Manages the game map state including:
 * - Territory data
 * - Territory ownership
 * - Resource distribution
 * - Building placement
 */
export const useMapStore = create((set, get) => ({
  // Map configuration
  mapRadius: 7, // How large the map is

  // List of all territories by hex ID
  territories: {},

  // Currently selected territory
  selectedTerritory: null,

  // Territory management
  selectTerritory: (hex) => set({ selectedTerritory: hex }),

  // Territory creation/modification
  setTerritoryType: (hexId, type) => {
    set((state) => ({
      territories: {
        ...state.territories,
        [hexId]: {
          ...state.territories[hexId],
          type,
        },
      },
    }));
  },

  setTerritoryOwner: (hexId, ownerId) => {
    set((state) => ({
      territories: {
        ...state.territories,
        [hexId]: {
          ...state.territories[hexId],
          owner: ownerId,
          isOwned: true,
          isExplored: true,
        },
      },
    }));
  },

  setTerritoryResource: (hexId, resource) => {
    set((state) => ({
      territories: {
        ...state.territories,
        [hexId]: {
          ...state.territories[hexId],
          resource,
        },
      },
    }));
  },

  exploreTerritoryId: (hexId) => {
    set((state) => ({
      territories: {
        ...state.territories,
        [hexId]: {
          ...state.territories[hexId],
          isExplored: true,
          isNewlyDiscovered: true,
        },
      },
    }));

    // Clear the newly discovered flag after a short delay
    setTimeout(() => {
      set((state) => ({
        territories: {
          ...state.territories,
          [hexId]: {
            ...state.territories[hexId],
            isNewlyDiscovered: false,
          },
        },
      }));
    }, 3000);
  },

  // Building management
  addBuilding: (hexId, building) => {
    set((state) => {
      const territory = state.territories[hexId] || {};
      const buildings = territory.buildings || [];

      // Get slot limit based on territory type
      let slotLimit = 1; // Default for regular territories

      if (territory.isCapital) {
        slotLimit = 2; // Capital gets 2 slots
      } else if (territory.resource) {
        slotLimit = 2; // Resource-rich territories get 2 slots
      }

      // Check if we've reached the slot limit
      if (buildings.length >= slotLimit) {
        return state; // Can't add more buildings
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

  upgradeBuilding: (hexId, buildingIndex, newLevel) => {
    set((state) => {
      const territory = state.territories[hexId] || {};
      const buildings = [...(territory.buildings || [])];

      if (buildings[buildingIndex]) {
        buildings[buildingIndex] = {
          ...buildings[buildingIndex],
          level: newLevel,
        };
      }

      return {
        territories: {
          ...state.territories,
          [hexId]: {
            ...territory,
            buildings,
          },
        },
      };
    });
  },

  // Initialize map with territory types
  initializeMap: () => {
    const hexes = generateHexGrid(get().mapRadius);
    const territories = {};

    // Territory types with weights
    const territoryTypes = [
      { type: "plains", weight: 3 }, // Most common
      { type: "forest", weight: 2 },
      { type: "hills", weight: 2 },
      { type: "mountains", weight: 1 },
      { type: "desert", weight: 1 },
      { type: "swamp", weight: 1 },
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
          type: "plains",
          isCapital: true,
          isOwned: true,
          owner: "player1",
          isExplored: true,
          resource: "wheat", // Start with some food
          buildings: [
            {
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
      if (distance === 1) {
        // First ring is always visible and owned
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

        // Only determine resources when explored
        // Just stub the structure for now
      }
    });

    set({ territories });
  },
}));

export default useMapStore;
