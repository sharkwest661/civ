// src/stores/workersStore.js
import { create } from "zustand";
import { WORKER_SPECIALIZATIONS } from "../constants/gameConstants";

/**
 * Workers Store
 *
 * Manages the game workers including:
 * - Available workers
 * - Assigned workers
 * - Worker specializations
 * - Worker productivity
 *
 * Fixed to correctly track available worker count
 */
export const useWorkersStore = create((set, get) => ({
  // Total worker count
  totalWorkerCount: 5,

  // Available workers array (workers not assigned to buildings)
  availableWorkers: [], // Format: [{ id: "worker_1" }]

  // Explicit count of available workers as a state value (not a getter)
  availableWorkerCount: 0,

  // Assigned workers by territory and building
  // Format: { territoryId: { buildingIndex: ["worker_1", "worker_2"] } }
  assignedWorkers: {},

  // Worker specializations
  // Format: { workerId: { type: "diligent", subtype: "farming", bonus: 0.15 } }
  workerSpecializations: {},

  // Recently reassigned workers (with 50% productivity penalty)
  // Format: { workerId: true }
  recentlyReassigned: {},

  // Worker Actions

  /**
   * Assign a worker to a building
   * @param {string} territoryId - The territory ID
   * @param {number} buildingIndex - The building index
   * @param {string} workerId - The worker ID (optional, will use first available if not provided)
   * @returns {boolean} Success status
   */
  assignWorker: (territoryId, buildingIndex, workerId) => {
    if (!territoryId || buildingIndex === undefined) return false;

    set((state) => {
      // Check if we have available workers
      if (state.availableWorkers.length === 0) return state;

      // If no specific worker ID provided, use the first available worker
      const workerToAssign =
        workerId ||
        (state.availableWorkers.length > 0
          ? state.availableWorkers[0].id
          : null);

      // If still no worker to assign, return the current state
      if (!workerToAssign) return state;

      // Get current worker assignments for this territory or create empty object
      const territoryWorkers = state.assignedWorkers[territoryId] || {};

      // Get current workers for this building or create empty array
      const buildingWorkers = territoryWorkers[buildingIndex] || [];

      // Check if building already has this worker
      if (buildingWorkers.includes(workerToAssign)) {
        return state;
      }

      // Create updated lists
      const updatedBuildingWorkers = [...buildingWorkers, workerToAssign];

      const updatedTerritoryWorkers = {
        ...territoryWorkers,
        [buildingIndex]: updatedBuildingWorkers,
      };

      const updatedAssignedWorkers = {
        ...state.assignedWorkers,
        [territoryId]: updatedTerritoryWorkers,
      };

      // Remove the worker from available workers
      const updatedAvailableWorkers = state.availableWorkers.filter(
        (worker) => worker.id !== workerToAssign
      );

      return {
        assignedWorkers: updatedAssignedWorkers,
        availableWorkers: updatedAvailableWorkers,
        // Update the availableWorkerCount explicitly
        availableWorkerCount: updatedAvailableWorkers.length,
      };
    });

    return true;
  },

  /**
   * Unassign a worker from a building
   * @param {string} territoryId - The territory ID
   * @param {number} buildingIndex - The building index
   * @param {string} workerId - The worker ID
   * @returns {boolean} Success status
   */
  unassignWorker: (territoryId, buildingIndex, workerId) => {
    if (!territoryId || buildingIndex === undefined || !workerId) return false;

    set((state) => {
      // Check if territory and building exist in assignments
      if (
        !state.assignedWorkers[territoryId] ||
        !state.assignedWorkers[territoryId][buildingIndex]
      ) {
        return state;
      }

      // Get current workers for the building
      const currentWorkers = state.assignedWorkers[territoryId][buildingIndex];

      // Check if the worker is assigned to this building
      if (!currentWorkers.includes(workerId)) {
        return state;
      }

      // Remove worker from assigned workers
      const updatedBuildingWorkers = currentWorkers.filter(
        (id) => id !== workerId
      );

      // Create new territory workers object
      const updatedTerritoryWorkers = { ...state.assignedWorkers[territoryId] };

      // If no workers left in building, remove the building entry
      if (updatedBuildingWorkers.length === 0) {
        delete updatedTerritoryWorkers[buildingIndex];
      } else {
        updatedTerritoryWorkers[buildingIndex] = updatedBuildingWorkers;
      }

      // Create new assigned workers object
      const updatedAssignedWorkers = { ...state.assignedWorkers };

      // If no buildings left in territory, remove the territory entry
      if (Object.keys(updatedTerritoryWorkers).length === 0) {
        delete updatedAssignedWorkers[territoryId];
      } else {
        updatedAssignedWorkers[territoryId] = updatedTerritoryWorkers;
      }

      // Mark worker as recently reassigned (50% productivity penalty)
      const updatedRecentlyReassigned = {
        ...state.recentlyReassigned,
        [workerId]: true,
      };

      // Add worker back to available workers
      const updatedAvailableWorkers = [
        ...state.availableWorkers,
        { id: workerId },
      ];

      return {
        assignedWorkers: updatedAssignedWorkers,
        availableWorkers: updatedAvailableWorkers,
        // Update the availableWorkerCount explicitly
        availableWorkerCount: updatedAvailableWorkers.length,
        recentlyReassigned: updatedRecentlyReassigned,
      };
    });

    return true;
  },

  /**
   * Clear recently reassigned workers (call at end of turn)
   */
  clearRecentlyReassigned: () => {
    set({ recentlyReassigned: {} });
  },

  /**
   * Add a new worker (from population growth)
   * @returns {string} New worker ID
   */
  addWorker: () => {
    let newWorkerId = "";

    set((state) => {
      // Generate unique ID based on timestamp and random number
      newWorkerId = `worker_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

      // Create updated workers lists
      const updatedAvailableWorkers = [
        ...state.availableWorkers,
        { id: newWorkerId },
      ];

      // Check if new worker gets a specialization (25% chance)
      const updatedSpecializations = { ...state.workerSpecializations };

      if (Math.random() < 0.25) {
        // Select specialization type
        const specializationTypes = Object.keys(WORKER_SPECIALIZATIONS);
        const selectedType =
          specializationTypes[
            Math.floor(Math.random() * specializationTypes.length)
          ];

        // Select specialization subtype
        const subtypes = WORKER_SPECIALIZATIONS[selectedType].subtypes;
        const selectedSubtype =
          subtypes[Math.floor(Math.random() * subtypes.length)];

        // Add specialization to worker
        updatedSpecializations[newWorkerId] = {
          type: selectedType,
          subtype: selectedSubtype,
          bonus: 0.15, // 15% bonus
        };
      }

      return {
        totalWorkerCount: state.totalWorkerCount + 1,
        availableWorkers: updatedAvailableWorkers,
        // Update the availableWorkerCount explicitly
        availableWorkerCount: updatedAvailableWorkers.length,
        workerSpecializations: updatedSpecializations,
      };
    });

    return newWorkerId;
  },

  /**
   * Calculate resource production for workers in a building
   * @param {string} territoryId - The territory ID
   * @param {number} buildingIndex - The building index
   * @param {string} buildingType - The building type
   * @param {number} buildingLevel - The building level
   * @returns {Object} Production data { type, amount }
   */
  calculateBuildingProduction: (
    territoryId,
    buildingIndex,
    buildingType,
    buildingLevel = 1
  ) => {
    const state = get();

    // Get workers assigned to this building
    const workers = state.assignedWorkers[territoryId]?.[buildingIndex] || [];
    if (workers.length === 0) return { type: null, amount: 0 };

    // Base production values per worker
    const baseProductionValues = {
      farm: { type: "food", amount: 5 },
      mine: { type: "production", amount: 5 },
      library: { type: "science", amount: 5 },
      market: { type: "gold", amount: 5 },
    };

    // Get base production for this building type
    const baseProduction = baseProductionValues[buildingType] || {
      type: "food",
      amount: 0,
    };

    // Calculate building level multiplier
    const levelMultiplier =
      buildingLevel === 1 ? 1 : buildingLevel === 2 ? 1.5 : 2;

    // Calculate production for each worker
    let totalProduction = 0;

    workers.forEach((workerId) => {
      // Base production per worker
      let workerProduction = baseProduction.amount;

      // Apply specialization bonus if applicable
      const specialization = state.workerSpecializations[workerId];
      if (specialization) {
        // Map building types to worker specializations
        const resourceMapping = {
          farm: "farming",
          mine: "production",
          library: "science",
          market: "gold",
        };

        const buildingResource = resourceMapping[buildingType];

        // Apply bonus if worker specialization matches building resource
        if (
          specialization.type === "diligent" &&
          specialization.subtype === buildingResource
        ) {
          workerProduction *= 1 + specialization.bonus;
        }
      }

      // Apply penalty for recently reassigned workers
      if (state.recentlyReassigned[workerId]) {
        workerProduction *= 0.5;
      }

      // Add to total
      totalProduction += workerProduction;
    });

    // Apply building level multiplier
    totalProduction *= levelMultiplier;

    return {
      type: baseProduction.type,
      amount: totalProduction,
    };
  },

  /**
   * Get all building production values
   * @param {Object} territories - Map of territories
   * @returns {Object} Map of resource types to production amounts
   */
  getAllBuildingProduction: (territories) => {
    const state = get();
    const production = {};

    // Go through all assigned workers
    Object.entries(state.assignedWorkers).forEach(
      ([territoryId, buildings]) => {
        const territory = territories[territoryId] || {};

        Object.entries(buildings).forEach(([buildingIndex, workers]) => {
          const buildingIndex_num = parseInt(buildingIndex, 10);

          if (territory.buildings && territory.buildings[buildingIndex_num]) {
            const building = territory.buildings[buildingIndex_num];

            // Calculate production for this building
            const buildingProduction = state.calculateBuildingProduction(
              territoryId,
              buildingIndex,
              building.type,
              building.level || 1
            );

            // Add to total
            if (buildingProduction.type) {
              if (!production[buildingProduction.type]) {
                production[buildingProduction.type] = 0;
              }
              production[buildingProduction.type] += buildingProduction.amount;
            }
          }
        });
      }
    );

    return production;
  },

  /**
   * Initialize workers (typically called at game start)
   * @param {number} count - Number of workers to initialize
   */
  initializeWorkers: (count = 5) => {
    // Create initial workers with unique IDs and possible specializations
    const initialWorkers = [];
    const specializations = {};

    for (let i = 0; i < count; i++) {
      const workerId = `worker_${i + 1}`;
      initialWorkers.push({ id: workerId });

      // Give some initial workers specializations (25% chance)
      if (Math.random() < 0.25) {
        // Select specialization type randomly
        const specializationTypes = Object.keys(WORKER_SPECIALIZATIONS);
        const selectedTypeKey =
          specializationTypes[
            Math.floor(Math.random() * specializationTypes.length)
          ];

        const selectedType = WORKER_SPECIALIZATIONS[selectedTypeKey];

        // Select subtype randomly
        const selectedSubtype =
          selectedType.subtypes[
            Math.floor(Math.random() * selectedType.subtypes.length)
          ];

        specializations[workerId] = {
          type: selectedTypeKey,
          subtype: selectedSubtype,
          bonus: 0.15, // 15% bonus
        };
      }
    }

    set({
      totalWorkerCount: count,
      availableWorkers: initialWorkers,
      // Set the initial availableWorkerCount correctly
      availableWorkerCount: initialWorkers.length,
      assignedWorkers: {},
      workerSpecializations: specializations,
      recentlyReassigned: {},
    });
  },

  /**
   * Get workers by specialization
   * @param {string} specializationType - Type of specialization to filter by
   * @param {string} [subtype] - Optional subtype to further filter by
   * @returns {Array} Matching workers
   */
  getWorkersBySpecialization: (specializationType, subtype = null) => {
    const state = get();

    return Object.entries(state.workerSpecializations)
      .filter(([_, spec]) => {
        // Match by type
        if (spec.type !== specializationType) return false;

        // If subtype is specified, match by that too
        if (subtype !== null && spec.subtype !== subtype) return false;

        return true;
      })
      .map(([workerId]) => {
        // Check if worker is available or assigned
        const isAvailable = state.availableWorkers.some(
          (w) => w.id === workerId
        );

        // Find where the worker is assigned if not available
        let assignment = null;

        if (!isAvailable) {
          Object.entries(state.assignedWorkers).forEach(
            ([territoryId, buildings]) => {
              Object.entries(buildings).forEach(([buildingIndex, workers]) => {
                if (workers.includes(workerId)) {
                  assignment = { territoryId, buildingIndex };
                }
              });
            }
          );
        }

        return {
          id: workerId,
          specialization: state.workerSpecializations[workerId],
          isAvailable,
          assignment,
        };
      });
  },
}));

export default useWorkersStore;
