// src/stores/workersStore.js - Fixed version
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
 * Fixed to correctly track specializations and worker growth
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

  // Worker specializations - FIXED to ensure consistent mapping
  // Format: { workerId: { type: "diligent", subtype: "farming", bonus: 0.15 } }
  workerSpecializations: {},

  // Recently reassigned workers (with 50% productivity penalty)
  // Format: { workerId: true }
  recentlyReassigned: {},

  // Worker growth trackers
  workerGrowthProgress: 0, // Current progress towards next worker
  workerGrowthThreshold: 20, // Food needed for next worker

  // Worker Actions

  /**
   * Update worker growth progress
   * @param {number} newProgress - New progress value
   * @param {number} newThreshold - New threshold value (optional)
   */
  updateWorkerGrowth: (newProgress, newThreshold = null) => {
    set((state) => ({
      workerGrowthProgress: newProgress,
      workerGrowthThreshold: newThreshold || state.workerGrowthThreshold,
    }));
  },

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
      newWorkerId = `worker_${state.totalWorkerCount + 1}`;
      console.log("Adding new worker with ID:", newWorkerId);

      // Create updated workers lists
      const updatedAvailableWorkers = [
        ...state.availableWorkers,
        { id: newWorkerId },
      ];

      // Check if new worker gets a specialization (50% chance - INCREASED from 25%)
      const updatedSpecializations = { ...state.workerSpecializations };

      // GUARANTEED specialization for better gameplay
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

      console.log(
        "Worker",
        newWorkerId,
        "gets a specialization:",
        updatedSpecializations[newWorkerId]
      );

      // Debug log all specializations
      console.log("All worker specializations:", updatedSpecializations);

      // Calculate new threshold for next worker
      const newThreshold = Math.floor(20 + (state.totalWorkerCount + 1) * 5);

      return {
        totalWorkerCount: state.totalWorkerCount + 1,
        availableWorkers: updatedAvailableWorkers,
        // Update the availableWorkerCount explicitly
        availableWorkerCount: updatedAvailableWorkers.length,
        workerSpecializations: updatedSpecializations,
        // Reset progress toward next worker and set new threshold
        workerGrowthProgress: 0,
        workerGrowthThreshold: newThreshold,
      };
    });

    return newWorkerId;
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

      // GUARANTEED specialization for first worker, 40% chance for others
      if (i === 0 || Math.random() < 0.4) {
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

        console.log(
          "Worker",
          workerId,
          "gets a specialization:",
          specializations[workerId]
        );
      }
    }

    console.log("All worker specializations:", specializations);

    set({
      totalWorkerCount: count,
      availableWorkers: initialWorkers,
      // Set the initial availableWorkerCount correctly
      availableWorkerCount: initialWorkers.length,
      assignedWorkers: {},
      workerSpecializations: specializations,
      recentlyReassigned: {},
      // Initialize worker growth
      workerGrowthProgress: 0,
      workerGrowthThreshold: 20 + count * 5,
    });

    // Debug log the state after setting
    console.log("Worker store state after initialization:", get());
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
