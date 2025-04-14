// src/components/workers/WorkerAssignmentPanel.jsx
import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Box,
  Heading,
  Text,
  Flex,
  Divider,
  SimpleGrid,
  Badge,
  Tooltip,
  Icon,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { Users, UserPlus, UserMinus, AlertTriangle } from "lucide-react";
import { useWorkersStore } from "../../stores/workersStore";
import { useMapStore } from "../../stores/mapStore";
import { hexToId } from "../../utils/hexUtils";
import SharedButton from "../ui/SharedButton";
import WorkerSelectionModal from "./WorkerSelectionModal";
import {
  BUILDING_SLOT_LIMITS,
  RESOURCE_DISPLAY,
} from "../../constants/gameConstants";
import {
  getWorkerSpecializationInfo,
  getBuildingCapacity,
  calculateBuildingProduction,
} from "../../utils/gameUtils";

/**
 * WorkerAssignmentPanel component for assigning workers to buildings
 * Fixed to address modal issues by using a dedicated modal component
 */
const WorkerAssignmentPanel = ({ onClose }) => {
  // Use Chakra's useDisclosure for modal control
  const { isOpen, onOpen, onClose: closeModal } = useDisclosure();

  // Get territory data from map store with individual selectors
  const territories = useMapStore((state) => state.territories);
  const selectedTerritory = useMapStore((state) => state.selectedTerritory);

  // Get worker data from workers store with individual selectors
  const availableWorkerCount = useWorkersStore(
    (state) => state.availableWorkerCount
  );
  const assignedWorkers = useWorkersStore((state) => state.assignedWorkers);
  const workerSpecializations = useWorkersStore(
    (state) => state.workerSpecializations
  );
  const recentlyReassigned = useWorkersStore(
    (state) => state.recentlyReassigned
  );
  const assignWorker = useWorkersStore((state) => state.assignWorker);
  const unassignWorker = useWorkersStore((state) => state.unassignWorker);

  // Local UI state
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [buildingForWorker, setBuildingForWorker] = useState(null);

  // Calculate current territory ID
  const territoryId = selectedTerritory ? hexToId(selectedTerritory) : null;
  const territory = territoryId ? territories[territoryId] : null;

  // Reset building selection when territory changes
  useEffect(() => {
    setSelectedBuilding(null);
    setBuildingForWorker(null);
  }, [territoryId]);

  // Get assigned workers for this territory
  const territoryWorkers = useMemo(() => {
    if (!territoryId || !assignedWorkers[territoryId]) return {};
    return assignedWorkers[territoryId];
  }, [territoryId, assignedWorkers]);

  // Handle opening the worker pool - fixed to address modal issue
  const openWorkerPool = useCallback(
    (buildingIndex) => {
      console.log(
        "Opening worker pool for building:",
        buildingIndex,
        "in territory:",
        territoryId
      );
      setBuildingForWorker(buildingIndex);
      onOpen();
    },
    [onOpen]
  );

  // Handle viewing all workers
  const openAllWorkers = useCallback(() => {
    console.log("Opening worker pool for all workers");
    setBuildingForWorker(null);
    onOpen();
  }, [onOpen]);

  // Handle worker selection from the pool - fixed to use territoryId properly
  const handleWorkerSelected = useCallback(
    (workerId) => {
      console.log(
        "Worker selected:",
        workerId,
        "for building:",
        buildingForWorker,
        "in territory:",
        territoryId
      );
      if (buildingForWorker !== null && workerId && territoryId) {
        assignWorker(territoryId, buildingForWorker, workerId);
      }
    },
    [assignWorker, buildingForWorker, territoryId]
  );

  // Handle assigning a worker to a building
  const handleAssignWorker = useCallback(
    (buildingIndex, buildingType) => {
      if (availableWorkerCount <= 0) return;

      // Set building index and building type before opening modal
      setBuildingForWorker(buildingIndex);
      onOpen();
    },
    [availableWorkerCount, onOpen]
  );

  // Handle unassigning a worker from a building
  const handleUnassignWorker = useCallback(
    (buildingIndex, workerId) => {
      if (territoryId) {
        unassignWorker(territoryId, buildingIndex, workerId);
      }
    },
    [territoryId, unassignWorker]
  );

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
              onClick={openAllWorkers}
              isDisabled={availableWorkerCount <= 0}
            >
              View Workers
            </SharedButton>
          </Flex>
        </Flex>
      </Box>
    );
  }, [availableWorkerCount, openAllWorkers]);

  // Render a UI for each building
  const renderBuilding = useCallback(
    (building, index) => {
      // Get assigned workers for this building
      const buildingWorkers = territoryWorkers[index] || [];
      const capacity = getBuildingCapacity(building.level || 1);

      return (
        <Box
          key={`building-${index}`}
          bg="background.ui"
          borderRadius="md"
          p={4}
          cursor="pointer"
          borderWidth="1px"
          borderColor={
            selectedBuilding === index ? "accent.main" : "transparent"
          }
          _hover={{ borderColor: "background.highlight" }}
          onClick={() => setSelectedBuilding(index)}
        >
          <Flex justify="space-between" align="center" mb={2}>
            <Heading size="sm" color="text.primary">
              {building.name}
            </Heading>
            <Badge
              bg={getResourceColor(building.type)}
              color="text.primary"
              px={2}
              py={0.5}
              borderRadius="md"
            >
              Level {building.level || 1}
            </Badge>
          </Flex>

          <Divider mb={3} />

          <Flex justify="space-between" mb={2}>
            <Text fontSize="sm" color="text.secondary">
              Workers:
            </Text>
            <Text fontSize="sm" color="text.primary">
              {buildingWorkers.length} / {capacity}
            </Text>
          </Flex>

          {/* Worker slots */}
          <Box mb={3}>
            <SimpleGrid columns={2} spacing={2}>
              {Array.from({ length: capacity }).map((_, slotIndex) => {
                const workerId = buildingWorkers[slotIndex];
                const specialization = workerId
                  ? workerSpecializations[workerId]
                  : null;
                const specInfo = getWorkerSpecializationInfo(specialization);
                const isReassigned = workerId && recentlyReassigned[workerId];

                return (
                  <Box
                    key={`slot-${slotIndex}`}
                    bg={workerId ? "background.highlight" : "background.panel"}
                    p={2}
                    borderRadius="md"
                    position="relative"
                  >
                    {workerId ? (
                      <Flex justify="space-between" align="center">
                        <Flex align="center">
                          {specInfo && specInfo.icon && (
                            <Tooltip label={specInfo.tooltip} placement="top">
                              <Text fontSize="lg" mr={1}>
                                {specInfo.icon}
                              </Text>
                            </Tooltip>
                          )}
                          <Text
                            fontSize="sm"
                            color="text.primary"
                            noOfLines={1}
                          >
                            Worker
                          </Text>
                        </Flex>
                        <SharedButton
                          size="xs"
                          variant="ghost"
                          colorScheme="red"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUnassignWorker(index, workerId);
                          }}
                          leftIcon={<Icon as={UserMinus} boxSize={4} />}
                          p={1}
                        />
                      </Flex>
                    ) : (
                      <Flex justify="center" align="center" h="100%">
                        <SharedButton
                          size="xs"
                          variant="ghost"
                          isDisabled={availableWorkerCount <= 0}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAssignWorker(index, building.type);
                          }}
                          leftIcon={<Icon as={UserPlus} boxSize={4} />}
                          p={1}
                        >
                          Assign
                        </SharedButton>
                      </Flex>
                    )}

                    {/* Reassigned indicator */}
                    {isReassigned && (
                      <Tooltip
                        label="Recently reassigned: 50% productivity penalty"
                        placement="top"
                      >
                        <Box position="absolute" top="-8px" right="-8px">
                          <Icon
                            as={AlertTriangle}
                            boxSize={4}
                            color="status.danger"
                          />
                        </Box>
                      </Tooltip>
                    )}
                  </Box>
                );
              })}
            </SimpleGrid>
          </Box>

          <Divider mb={3} />

          <Flex justify="space-between" align="center">
            <Text fontSize="sm" color="text.secondary">
              Production:
            </Text>
            <Text fontSize="sm" color={getResourceColor(building.type)}>
              {calculateBuildingProduction(building, buildingWorkers.length)}
            </Text>
          </Flex>
        </Box>
      );
    },
    [
      availableWorkerCount,
      handleAssignWorker,
      handleUnassignWorker,
      recentlyReassigned,
      selectedBuilding,
      territoryWorkers,
      workerSpecializations,
    ]
  );

  // Get resource color based on building type
  const getResourceColor = useCallback((type) => {
    const resourceMap = {
      farm: RESOURCE_DISPLAY.food.color,
      mine: RESOURCE_DISPLAY.production.color,
      library: RESOURCE_DISPLAY.science.color,
      market: RESOURCE_DISPLAY.gold.color,
    };

    return resourceMap[type] || "text.primary";
  }, []);

  // Get building slot limit based on territory type
  const getSlotLimit = useCallback((territory) => {
    if (!territory) return 0;
    if (territory.isCapital) return BUILDING_SLOT_LIMITS.CAPITAL;
    if (territory.resource) return BUILDING_SLOT_LIMITS.RESOURCE;
    return BUILDING_SLOT_LIMITS.DEFAULT;
  }, []);

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
            {getSlotLimit(territory)}
          </Text>
        </VStack>
      </Box>

      <SimpleGrid columns={1} spacing={4} mb={4}>
        {territory.buildings.map((building, index) =>
          renderBuilding(building, index)
        )}
      </SimpleGrid>

      <Box p={3} bg="background.ui" borderRadius="md">
        <Text fontSize="sm" fontWeight="medium" color="accent.main" mb={2}>
          Worker Types:
        </Text>
        <SimpleGrid columns={3} spacing={2}>
          <Flex align="center">
            <Text fontSize="lg" mr={1}>
              💼
            </Text>
            <Text fontSize="xs" color="text.secondary">
              Diligent
            </Text>
          </Flex>
          <Flex align="center">
            <Text fontSize="lg" mr={1}>
              💪
            </Text>
            <Text fontSize="xs" color="text.secondary">
              Strong
            </Text>
          </Flex>
          <Flex align="center">
            <Text fontSize="lg" mr={1}>
              🧠
            </Text>
            <Text fontSize="xs" color="text.secondary">
              Clever
            </Text>
          </Flex>
        </SimpleGrid>
      </Box>

      {/* Worker Selection Modal */}
      {isOpen && (
        <WorkerSelectionModal
          isOpen={isOpen}
          onClose={closeModal}
          onSelectWorker={handleWorkerSelected}
          buildingIndex={buildingForWorker}
          buildingType={
            buildingForWorker !== null &&
            territory.buildings?.[buildingForWorker]
              ? territory.buildings[buildingForWorker].type
              : null
          }
        />
      )}
    </Box>
  );
};

export default React.memo(WorkerAssignmentPanel);
