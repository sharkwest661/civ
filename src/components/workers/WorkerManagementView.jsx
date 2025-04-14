// src/components/workers/WorkerManagementView.jsx
import React, { useState, useCallback, useMemo } from "react";
import {
  Box,
  Heading,
  Text,
  Flex,
  SimpleGrid,
  VStack,
  Icon,
  useDisclosure,
} from "@chakra-ui/react";
import { Users } from "lucide-react";

// Import custom hooks and utility functions
import {
  useStoreSelectors,
  useStoreActions,
} from "../../hooks/useStoreSelectors";
import { useMapStore } from "../../stores/mapStore";
import { useWorkersStore } from "../../stores/workersStore";
import { getTerritoryBuildingSlotLimit } from "../../utils/territoryUtils";
import { RESOURCE_DISPLAY } from "../../constants/gameConstants";
import { hexToId } from "../../utils/hexUtils";

// Import components
import SharedButton from "../ui/SharedButton";
import WorkerSelectionModal from "./WorkerSelectionModal";
import BuildingWorkerPanel from "../buildings/BuildingWorkerPanel";

/**
 * WorkerManagementView - An optimized and refactored version of the worker assignment panel
 *
 * This component demonstrates:
 * 1. Breaking large components into smaller focused ones
 * 2. Using custom hooks for optimized store access
 * 3. Consistent naming and event handler patterns
 * 4. Proper use of memoization with useCallback and useMemo
 */
const WorkerManagementView = ({ onClose }) => {
  // Territory selectors
  const { selectedTerritory, territories } = useStoreSelectors(useMapStore, {
    selectedTerritory: (state) => state.selectedTerritory,
    territories: (state) => state.territories,
  });

  // Worker selectors - only select what's needed
  const {
    availableWorkerCount,
    assignedWorkers,
    workerSpecializations,
    recentlyReassigned,
  } = useStoreSelectors(useWorkersStore, {
    availableWorkerCount: (state) => state.availableWorkerCount,
    assignedWorkers: (state) => state.assignedWorkers,
    workerSpecializations: (state) => state.workerSpecializations,
    recentlyReassigned: (state) => state.recentlyReassigned,
  });

  // Worker actions - don't re-render when these change
  const { assignWorker, unassignWorker } = useStoreActions(useWorkersStore, [
    "assignWorker",
    "unassignWorker",
  ]);

  // Local state for UI
  const [selectedBuildingIndex, setSelectedBuildingIndex] = useState(null);
  const [buildingForWorkerAssignment, setBuildingForWorkerAssignment] =
    useState(null);

  // Modal disclosure
  const { isOpen, onOpen, onClose: closeModal } = useDisclosure();

  // Calculate territory ID based on selected territory
  const territoryId = useMemo(
    () => (selectedTerritory ? hexToId(selectedTerritory) : null),
    [selectedTerritory]
  );

  // Get the selected territory data
  const territory = useMemo(
    () => (territoryId ? territories[territoryId] : null),
    [territoryId, territories]
  );

  // Get assigned workers for this territory
  const territoryWorkers = useMemo(
    () =>
      territoryId && assignedWorkers[territoryId]
        ? assignedWorkers[territoryId]
        : {},
    [territoryId, assignedWorkers]
  );

  // Resource colors for building types
  const resourceColors = useMemo(
    () => ({
      farm: RESOURCE_DISPLAY.food.color,
      mine: RESOURCE_DISPLAY.production.color,
      library: RESOURCE_DISPLAY.science.color,
      market: RESOURCE_DISPLAY.gold.color,
    }),
    []
  );

  // Handler to open worker selection modal
  const handleOpenWorkerSelection = useCallback(
    (buildingIndex) => {
      setBuildingForWorkerAssignment(buildingIndex);
      onOpen();
    },
    [onOpen]
  );

  // Handler for when a worker is selected from the modal
  const handleWorkerSelected = useCallback(
    (workerId) => {
      if (workerId && territoryId && buildingForWorkerAssignment !== null) {
        assignWorker(territoryId, buildingForWorkerAssignment, workerId);
        closeModal();
      }
    },
    [assignWorker, buildingForWorkerAssignment, closeModal, territoryId]
  );

  // Handler for unassigning a worker
  const handleUnassignWorker = useCallback(
    (buildingIndex, workerId) => {
      if (territoryId) {
        unassignWorker(territoryId, buildingIndex, workerId);
      }
    },
    [unassignWorker, territoryId]
  );

  // Handler for selecting a building
  const handleSelectBuilding = useCallback((buildingIndex) => {
    setSelectedBuildingIndex(buildingIndex);
  }, []);

  // Render the available workers section
  const renderAvailableWorkers = useCallback(() => {
    return (
      <Box bg="background.ui" p={4} borderRadius="md" mb={4}>
        <Flex align="center" justify="space-between">
          <Flex align="center">
            <Icon as={Users} boxSize={5} color="text.primary" mr={2} />
            <Heading size="sm" color="text.primary">
              Available Workers
            </Heading>
          </Flex>
          <Flex align="center">
            <Text fontSize="lg" fontWeight="bold" color="accent.main">
              {availableWorkerCount}
            </Text>
            <SharedButton
              size="sm"
              ml={3}
              variant="secondary"
              onClick={onOpen}
              isDisabled={availableWorkerCount <= 0}
            >
              View Workers
            </SharedButton>
          </Flex>
        </Flex>
      </Box>
    );
  }, [availableWorkerCount, onOpen]);

  // If no territory is selected or it has no buildings
  if (!territory || !territory.buildings || territory.buildings.length === 0) {
    return (
      <Box p={4}>
        <Flex justify="space-between" align="center" mb={4}>
          <Heading size="md" color="accent.main">
            Worker Assignment
          </Heading>
          <SharedButton size="sm" variant="ghost" onClick={onClose}>
            ✕
          </SharedButton>
        </Flex>

        {renderAvailableWorkers()}

        <Box bg="background.ui" p={4} borderRadius="md" textAlign="center">
          <Text color="text.secondary">
            {!territory
              ? "Select a territory to assign workers."
              : "This territory has no buildings to assign workers to."}
          </Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Flex justify="space-between" align="center" mb={4}>
        <Heading size="md" color="accent.main">
          Worker Assignment
        </Heading>
        <SharedButton size="sm" variant="ghost" onClick={onClose}>
          ✕
        </SharedButton>
      </Flex>

      {renderAvailableWorkers()}

      <Box bg="background.ui" p={3} borderRadius="md" mb={4}>
        <VStack align="stretch" spacing={1}>
          <Text fontSize="sm" color="text.primary">
            Territory:{" "}
            {territory.type
              ? territory.type.charAt(0).toUpperCase() + territory.type.slice(1)
              : "Unknown"}
            {territory.isCapital ? " (Capital)" : ""}
          </Text>

          {territory.resource && (
            <Text fontSize="sm" color="text.secondary">
              Resource: {territory.resource}
            </Text>
          )}

          <Text fontSize="sm" color="text.secondary" mt={1}>
            Building Slots: {territory.buildings?.length || 0}/
            {getTerritoryBuildingSlotLimit(territory)}
          </Text>
        </VStack>
      </Box>

      <SimpleGrid columns={1} spacing={4} mb={4}>
        {territory.buildings.map((building, index) => (
          <BuildingWorkerPanel
            key={`building-${index}`}
            building={building}
            buildingIndex={index}
            workers={territoryWorkers[index] || []}
            workerSpecializations={workerSpecializations}
            recentlyReassigned={recentlyReassigned}
            isSelected={selectedBuildingIndex === index}
            availableWorkerCount={availableWorkerCount}
            onSelect={handleSelectBuilding}
            onAssignWorker={handleOpenWorkerSelection}
            onUnassignWorker={handleUnassignWorker}
            resourceColors={resourceColors}
          />
        ))}
      </SimpleGrid>

      {/* Worker Selection Modal */}
      {isOpen && (
        <WorkerSelectionModal
          isOpen={isOpen}
          onClose={closeModal}
          onSelectWorker={handleWorkerSelected}
          buildingIndex={buildingForWorkerAssignment}
          buildingType={
            buildingForWorkerAssignment !== null &&
            territory.buildings?.[buildingForWorkerAssignment]
              ? territory.buildings[buildingForWorkerAssignment].type
              : null
          }
        />
      )}
    </Box>
  );
};

export default React.memo(WorkerManagementView);
