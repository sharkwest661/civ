import { create } from "zustand";

/**
 * Workers Store
 *
 * Manages the game workers including:
 * - Available workers
 * - Assigned workers
 * - Worker specializations
 * - Worker productivity
 */
export const useWorkersStore = create((set, get) => ({
  // Total workers
  totalWorkers: 5,

  // Unassigned available workers (count)
  availableWorkerCount: 5,

  // Unassigned available workers (array of worker objects with ids)
  availableWorkers: [], // Format: [{ id: "worker_1", specialization: {...} }]

  // Assigned workers by territory and building
  assignedWorkers: {}, // Format: { territoryId: { buildingIndex: [worker1, worker2, ...] } }

  // Worker specializations
  workerSpecializations: {}, // Format: { workerId: { type: "diligent", subtype: "farming", bonus: 0.15 } }

  // Recently reassigned workers (with 50% productivity penalty)
  recentlyReassigned: {}, // Format: { workerId: true }

  // Worker Actions

  // Assign a worker to a building
  assignWorker: (territoryId, buildingIndex, workerId) => {
    set((state) => {
      // Check if we have available workers
      if (state.availableWorkerCount <= 0) return state;

      // If no specific worker ID provided, use the first available worker
      const workerToAssign =
        workerId ||
        (state.availableWorkers.length > 0
          ? state.availableWorkers[0].id
          : null);

      // If still no worker to assign, return the current state
      if (!workerToAssign) return state;

      // Update assigned workers
      const currentAssigned = state.assignedWorkers[territoryId] || {};
      const currentBuildingWorkers = currentAssigned[buildingIndex] || [];

      // Check if building has capacity for more workers
      // This would need to check the building level from mapStore
      // For now, we'll assume a simple limit of 4 (max level building)
      if (currentBuildingWorkers.length >= 4) return state;

      // Update assigned workers
      const updatedAssigned = {
        ...state.assignedWorkers,
        [territoryId]: {
          ...currentAssigned,
          [buildingIndex]: [...currentBuildingWorkers, workerToAssign],
        },
      };

      // Remove the worker from available workers
      const updatedAvailableWorkers = state.availableWorkers.filter(
        (worker) => worker.id !== workerToAssign
      );

      return {
        availableWorkerCount: state.availableWorkerCount - 1,
        availableWorkers: updatedAvailableWorkers,
        assignedWorkers: updatedAssigned,
      };
    });
  },

  // Unassign a worker from a building
  unassignWorker: (territoryId, buildingIndex, workerId) => {
    set((state) => {
      // Check if the territory and building exist
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

      // Update the state
      const updatedAssigned = { ...state.assignedWorkers };

      if (updatedBuildingWorkers.length === 0) {
        // Remove the building entry if no workers left
        delete updatedAssigned[territoryId][buildingIndex];

        // Remove the territory entry if no buildings left
        if (Object.keys(updatedAssigned[territoryId]).length === 0) {
          delete updatedAssigned[territoryId];
        }
      } else {
        // Update with remaining workers
        updatedAssigned[territoryId] = {
          ...updatedAssigned[territoryId],
          [buildingIndex]: updatedBuildingWorkers,
        };
      }

      // Mark worker as recently reassigned
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
        availableWorkerCount: state.availableWorkerCount + 1,
        availableWorkers: updatedAvailableWorkers,
        assignedWorkers: updatedAssigned,
        recentlyReassigned: updatedRecentlyReassigned,
      };
    });
  },

  // Clear recently reassigned workers (call at end of turn)
  clearRecentlyReassigned: () => {
    set({ recentlyReassigned: {} });
  },

  // Add a new worker (from population growth)
  addWorker: () => {
    set((state) => {
      const newWorkerId = `worker_${Date.now()}_${Math.floor(
        Math.random() * 1000
      )}`;

      // Check if new worker gets a specialization (25% chance)
      const updatedSpecializations = { ...state.workerSpecializations };

      if (Math.random() < 0.25) {
        // Select specialization type
        const types = [
          { type: "diligent", subtypes: ["farming", "production", "gold"] },
          {
            type: "strong",
            subtypes: ["military", "exploration", "construction"],
          },
          { type: "clever", subtypes: ["science", "espionage", "diplomacy"] },
        ];

        const selectedType = types[Math.floor(Math.random() * types.length)];
        const selectedSubtype =
          selectedType.subtypes[
            Math.floor(Math.random() * selectedType.subtypes.length)
          ];

        updatedSpecializations[newWorkerId] = {
          type: selectedType.type,
          subtype: selectedSubtype,
          bonus: 0.15, // 15% bonus
        };
      }

      return {
        totalWorkers: state.totalWorkers + 1,
        availableWorkerCount: state.availableWorkerCount + 1,
        availableWorkers: [...state.availableWorkers, { id: newWorkerId }],
        workerSpecializations: updatedSpecializations,
      };
    });
  },

  // Calculate resource production for workers in a building
  calculateBuildingProduction: (
    territoryId,
    buildingIndex,
    buildingType,
    buildingLevel = 1
  ) => {
    const state = get();

    // Get workers assigned to this building
    const workers = state.assignedWorkers[territoryId]?.[buildingIndex] || [];
    if (workers.length === 0) return 0;

    // Base production values per worker (would normally come from a config/data file)
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
        const resourceMapping = {
          farm: "farming",
          mine: "production",
          library: "science",
          market: "gold",
        };

        const buildingResource = resourceMapping[buildingType];

        // Apply bonus if worker specialization matches building resource
        if (specialization.subtype === buildingResource) {
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

  // Get all building production values
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

  // Initialize workers (typically called at game start)
  initializeWorkers: (count = 5) => {
    // Create initial workers with unique IDs and possible specializations
    const initialWorkers = [];
    const specializations = {};

    for (let i = 0; i < count; i++) {
      const workerId = `worker_${i + 1}`;
      initialWorkers.push({ id: workerId });

      // Give some initial workers specializations (25% chance)
      if (Math.random() < 0.25) {
        // Select specialization type
        const types = [
          { type: "diligent", subtypes: ["farming", "production", "gold"] },
          {
            type: "strong",
            subtypes: ["military", "exploration", "construction"],
          },
          { type: "clever", subtypes: ["science", "espionage", "diplomacy"] },
        ];

        const selectedType = types[Math.floor(Math.random() * types.length)];
        const selectedSubtype =
          selectedType.subtypes[
            Math.floor(Math.random() * selectedType.subtypes.length)
          ];

        specializations[workerId] = {
          type: selectedType.type,
          subtype: selectedSubtype,
          bonus: 0.15, // 15% bonus
        };
      }
    }

    set({
      totalWorkers: count,
      availableWorkerCount: count,
      availableWorkers: initialWorkers,
      assignedWorkers: {},
      workerSpecializations: specializations,
      recentlyReassigned: {},
    });
  },
}));

export default useWorkersStore;
