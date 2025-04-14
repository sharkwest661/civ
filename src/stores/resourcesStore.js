import { create } from "zustand";

/**
 * Resources Store
 *
 * Manages the game resources including:
 * - Basic resources (food, production, science, gold, etc.)
 * - Resource production and consumption
 * - Special resources (luxury, strategic, etc.)
 */
export const useResourcesStore = create((set, get) => ({
  // Basic resources
  resources: {
    food: {
      amount: 50,
      production: 5,
      storage: 200,
    },
    production: {
      amount: 30,
      production: 3,
      storage: 200,
    },
    science: {
      amount: 20,
      production: 2,
      storage: Infinity,
    },
    gold: {
      amount: 100,
      production: 2,
      storage: Infinity,
    },
    happiness: {
      amount: 80, // Represents percentage (0-100)
      production: 0, // Net happiness change per turn
      storage: 100,
    },
    culture: {
      amount: 0,
      production: 1,
      storage: Infinity,
    },
    influence: {
      amount: 0,
      production: 0.5,
      storage: Infinity,
    },
  },

  // Special resources
  specialResources: {
    strategic: {}, // iron, horses, etc.
    luxury: {}, // gems, silk, etc.
    rare: {}, // marble, gold, etc.
  },

  // Resource actions
  updateResource: (resourceType, amount) => {
    set((state) => {
      // Make sure the resource exists
      if (!state.resources[resourceType]) return state;

      // Calculate new amount, respecting storage limits
      const resource = state.resources[resourceType];
      const newAmount = Math.max(
        0,
        Math.min(resource.amount + amount, resource.storage)
      );

      return {
        resources: {
          ...state.resources,
          [resourceType]: {
            ...resource,
            amount: newAmount,
          },
        },
      };
    });
  },

  setResourceProduction: (resourceType, production) => {
    set((state) => {
      // Make sure the resource exists
      if (!state.resources[resourceType]) return state;

      return {
        resources: {
          ...state.resources,
          [resourceType]: {
            ...state.resources[resourceType],
            production,
          },
        },
      };
    });
  },

  // Update all resources based on production rates
  updateAllResources: () => {
    const resources = get().resources;

    Object.entries(resources).forEach(([resourceType, resource]) => {
      const production = resource.production;
      if (production !== 0) {
        get().updateResource(resourceType, production);
      }
    });
  },

  // Special resource actions
  addSpecialResource: (category, resourceType, amount = 1) => {
    set((state) => {
      const categoryResources = state.specialResources[category] || {};
      const currentAmount = categoryResources[resourceType] || 0;

      return {
        specialResources: {
          ...state.specialResources,
          [category]: {
            ...categoryResources,
            [resourceType]: currentAmount + amount,
          },
        },
      };
    });
  },

  useSpecialResource: (category, resourceType, amount = 1) => {
    set((state) => {
      const categoryResources = state.specialResources[category] || {};
      const currentAmount = categoryResources[resourceType] || 0;

      // Cannot use more than available
      if (currentAmount < amount) return state;

      return {
        specialResources: {
          ...state.specialResources,
          [category]: {
            ...categoryResources,
            [resourceType]: currentAmount - amount,
          },
        },
      };
    });
  },

  // Resource initialization
  initializeResources: (startingResources = {}) => {
    set((state) => {
      const newResources = { ...state.resources };

      // Update resource amounts with provided values
      Object.entries(startingResources).forEach(([resourceType, amount]) => {
        if (newResources[resourceType]) {
          newResources[resourceType] = {
            ...newResources[resourceType],
            amount,
          };
        }
      });

      return { resources: newResources };
    });
  },
}));

export default useResourcesStore;
