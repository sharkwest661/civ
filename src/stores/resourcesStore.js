// src/stores/resourcesStore.js
import { create } from "zustand";
import { RESOURCE_TYPES } from "../constants/gameConstants";

/**
 * Resources Store
 *
 * Manages the game resources with a flattened state structure and improved update patterns
 */
export const useResourcesStore = create((set, get) => ({
  // Flattened resource structure - each resource has its own top-level entry
  // Food resource
  food: {
    amount: 50,
    production: 5,
    storage: 200,
  },

  // Production resource
  production: {
    amount: 30,
    production: 3,
    storage: 200,
  },

  // Science resource
  science: {
    amount: 20,
    production: 2,
    storage: Infinity,
  },

  // Gold resource
  gold: {
    amount: 100,
    production: 2,
    storage: Infinity,
  },

  // Happiness resource (percentage-based)
  happiness: {
    amount: 80, // Represents percentage (0-100)
    production: 0, // Net happiness change per turn
    storage: 100,
  },

  // Culture resource
  culture: {
    amount: 0,
    production: 1,
    storage: Infinity,
  },

  // Removed influence resource

  // Special Resources with flattened structure
  strategicResources: {}, // iron, horses, etc.
  luxuryResources: {}, // gems, silk, etc.
  rareResources: {}, // marble, gold, etc.

  // Update a resource amount with proper state update pattern
  updateResource: (resourceType, amount) => {
    set((state) => {
      // Make sure the resource exists
      if (!state[resourceType]) return state;

      const resource = state[resourceType];

      // Calculate new amount, respecting storage limits
      const newAmount = Math.max(
        0,
        Math.min(resource.amount + amount, resource.storage)
      );

      // Return a new state object with only the updated resource
      return {
        [resourceType]: {
          ...resource,
          amount: newAmount,
        },
      };
    });
  },

  // Set resource production rate
  setResourceProduction: (resourceType, production) => {
    set((state) => {
      // Make sure the resource exists
      if (!state[resourceType]) return state;

      // Return a new state object with only the updated resource
      return {
        [resourceType]: {
          ...state[resourceType],
          production,
        },
      };
    });
  },

  // Bulk update of resource production rates
  setResourceProductionRates: (productionRates) => {
    set((state) => {
      const updates = {};

      // Process each resource in the production rates object
      Object.entries(productionRates).forEach(([resourceType, production]) => {
        if (state[resourceType]) {
          updates[resourceType] = {
            ...state[resourceType],
            production,
          };
        }
      });

      return updates;
    });
  },

  // Update all resources based on their production rates
  updateAllResources: () => {
    const state = get();

    // Create a batch update for all resources
    const updates = {};

    // Calculate updates for each resource
    Object.keys(state).forEach((key) => {
      // Skip special resources and non-resource properties
      if (
        key === "strategicResources" ||
        key === "luxuryResources" ||
        key === "rareResources" ||
        typeof state[key] !== "object" ||
        typeof state[key].amount !== "number" ||
        typeof state[key].production !== "number"
      ) {
        return;
      }

      const resource = state[key];
      const production = resource.production;

      // Skip if no production
      if (production === 0) return;

      // Calculate new amount with storage limits
      const newAmount = Math.max(
        0,
        Math.min(resource.amount + production, resource.storage)
      );

      // Add to updates if changed
      if (newAmount !== resource.amount) {
        updates[key] = {
          ...resource,
          amount: newAmount,
        };
      }
    });

    // Apply all updates at once if there are any
    if (Object.keys(updates).length > 0) {
      set(updates);
    }
  },

  // Add a special resource
  addSpecialResource: (category, resourceType, amount = 1) => {
    set((state) => {
      // Map category to state property
      const categoryMap = {
        strategic: "strategicResources",
        luxury: "luxuryResources",
        rare: "rareResources",
      };

      const stateKey = categoryMap[category];
      if (!stateKey) return state; // Invalid category

      const resources = state[stateKey];
      const currentAmount = resources[resourceType] || 0;

      return {
        [stateKey]: {
          ...resources,
          [resourceType]: currentAmount + amount,
        },
      };
    });
  },

  // Use a special resource
  useSpecialResource: (category, resourceType, amount = 1) => {
    set((state) => {
      // Map category to state property
      const categoryMap = {
        strategic: "strategicResources",
        luxury: "luxuryResources",
        rare: "rareResources",
      };

      const stateKey = categoryMap[category];
      if (!stateKey) return state; // Invalid category

      const resources = state[stateKey];
      const currentAmount = resources[resourceType] || 0;

      // Cannot use more than available
      if (currentAmount < amount) return state;

      return {
        [stateKey]: {
          ...resources,
          [resourceType]: currentAmount - amount,
        },
      };
    });
  },

  // Get total resource amounts (memoization would be implemented at component level)
  getTotalResources: () => {
    const state = get();

    return {
      food: state.food.amount,
      production: state.production.amount,
      science: state.science.amount,
      gold: state.gold.amount,
      happiness: state.happiness.amount,
      culture: state.culture.amount,
      // Removed influence
    };
  },

  // Get production rates (memoization would be implemented at component level)
  getProductionRates: () => {
    const state = get();

    return {
      food: state.food.production,
      production: state.production.production,
      science: state.science.production,
      gold: state.gold.production,
      happiness: state.happiness.production,
      culture: state.culture.production,
      // Removed influence
    };
  },

  // Initialize resources with custom starting values
  initializeResources: (startingResources = {}) => {
    set((state) => {
      const updates = {};

      // Update each resource with provided values
      Object.entries(startingResources).forEach(([resourceType, amount]) => {
        if (state[resourceType]) {
          updates[resourceType] = {
            ...state[resourceType],
            amount,
          };
        }
      });

      return updates;
    });
  },
}));

export default useResourcesStore;
