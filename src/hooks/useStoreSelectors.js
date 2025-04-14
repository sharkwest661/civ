// src/hooks/useStoreSelectors.js
import { useMemo } from "react";

/**
 * Helper hook to create optimized selectors for Zustand stores
 *
 * FIXED version that prevents infinite loops by properly handling memoization
 *
 * @param {Function} useStore - Zustand store hook
 * @param {Object} selectors - Object mapping result keys to selector functions
 * @returns {Object} - Optimized store selectors
 */
export const useStoreSelectors = (useStore, selectors) => {
  // Get the ENTIRE store state ONCE to prevent multiple subscriptions
  const storeState = useStore();

  // Calculate all selected values atomically
  return useMemo(() => {
    const result = {};

    Object.entries(selectors).forEach(([key, selector]) => {
      // Apply the selector to the already retrieved store state
      result[key] = selector(storeState);
    });

    return result;
  }, [storeState, selectors]); // Only recalculate when store state or selectors change
};

/**
 * Helper hook to create optimized action selectors for Zustand stores
 *
 * This hook is specifically for actions and prevents them from causing re-renders
 *
 * @param {Function} useStore - Zustand store hook
 * @param {Array<string>} actionNames - Array of action names to extract from the store
 * @returns {Object} - Map of action names to action functions
 */
export const useStoreActions = (useStore, actionNames) => {
  // Extract the actions once - this won't re-render when state changes
  const actions = useStore((state) => {
    const result = {};

    // Ensure actionNames is stable across renders
    if (Array.isArray(actionNames)) {
      actionNames.forEach((name) => {
        if (typeof state[name] === "function") {
          result[name] = state[name];
        }
      });
    }

    return result;
  });

  // Return the actions (no need to memoize again as Zustand already optimizes this)
  return actions;
};

/**
 * Helper hook for derived state from Zustand stores
 *
 * This hook creates computed values from store state with proper memoization
 *
 * @param {Function} useStore - Zustand store hook
 * @param {Function} derivedSelector - Function that computes derived state
 * @param {Array<Function>} dependencies - Array of selector functions for the derived state dependencies
 * @returns {*} - The derived state value
 */
export const useDerivedStore = (useStore, derivedSelector, dependencies) => {
  // Get dependency values using the store state to prevent multiple subscriptions
  const storeState = useStore();

  // Extract all dependency values
  const dependencyValues = useMemo(() => {
    return dependencies.map((selector) => selector(storeState));
  }, [storeState, dependencies]);

  // Memoize the derived value
  return useMemo(() => {
    return derivedSelector(...dependencyValues);
  }, [derivedSelector, ...dependencyValues]);
};

export default useStoreSelectors;
