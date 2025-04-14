import React, { useState, useMemo, useEffect } from "react";
import {
  Box,
  Heading,
  Text,
  Flex,
  Button,
  Divider,
  SimpleGrid,
  Badge,
  Tooltip,
  Modal,
  ModalOverlay,
  ModalContent,
  useDisclosure,
} from "@chakra-ui/react";
import { Users, UserPlus, UserMinus, AlertCircle } from "lucide-react";
import { useWorkersStore } from "../../stores/workersStore";
import { useMapStore } from "../../stores/mapStore";
import { useResourcesStore } from "../../stores/resourcesStore";
import { hexToId } from "../../utils/hexUtils";
import WorkerPoolPanel from "./WorkerPoolPanel";

/**
 * WorkerAssignmentPanel component for assigning workers to buildings
 */
const WorkerAssignmentPanel = ({ onClose }) => {
  // Use Chakra's useDisclosure for better modal control
  const { isOpen, onOpen, onClose: closeModal } = useDisclosure();

  // Get territory data from map store
  const territories = useMapStore((state) => state.territories);
  const selectedTerritory = useMapStore((state) => state.selectedTerritory);

  // Get worker data from workers store
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

  // Handle opening the worker pool
  const openWorkerPool = (buildingIndex) => {
    console.log("Opening worker pool for building:", buildingIndex);
    setBuildingForWorker(buildingIndex);
    onOpen(); // Use Chakra's disclosure hook
  };

  // Handle viewing all workers
  const openAllWorkers = () => {
    console.log("Opening worker pool for all workers");
    setBuildingForWorker(null);
    onOpen(); // Use Chakra's disclosure hook
  };

  // Handle worker selection from the pool
  const handleWorkerSelected = (workerId) => {
    console.log(
      "Worker selected:",
      workerId,
      "for building:",
      buildingForWorker
    );
    if (buildingForWorker !== null && workerId) {
      assignWorker(territoryId, buildingForWorker, workerId);
      closeModal();
      setBuildingForWorker(null);
    }
  };

  // Get specialization icon and color
  const getSpecializationInfo = (specialization) => {
    if (!specialization) return { icon: null, color: "gray.400" };

    switch (specialization.type) {
      case "diligent":
        return {
          icon: "💼",
          color: "#e9d16c", // Gold
          tooltip: `Diligent Worker: +15% ${specialization.subtype} production`,
        };
      case "strong":
        return {
          icon: "💪",
          color: "#d68c45", // Orange
          tooltip: `Strong Worker: +15% ${specialization.subtype} efficiency`,
        };
      case "clever":
        return {
          icon: "🧠",
          color: "#5ea8ed", // Blue
          tooltip: `Clever Worker: +15% ${specialization.subtype} output`,
        };
      default:
        return { icon: null, color: "gray.400" };
    }
  };

  // Handle assigning a worker to a building
  const handleAssignWorker = (buildingIndex) => {
    if (availableWorkerCount <= 0) return;
    // Instead of directly assigning, open the worker pool to select a worker
    openWorkerPool(buildingIndex);
  };

  // Handle unassigning a worker from a building
  const handleUnassignWorker = (buildingIndex, workerId) => {
    unassignWorker(territoryId, buildingIndex, workerId);
  };

  // Get building capacity (based on level)
  const getBuildingCapacity = (building) => {
    const level = building.level || 1;
    return level + 1; // Level 1: 2 slots, Level 2: 3 slots, Level 3: 4 slots
  };

  // Get building slot limit based on territory type
  const getSlotLimit = (territory) => {
    if (!territory) return 0;
    if (territory.isCapital) return 2;
    if (territory.resource) return 2;
    return 1;
  };

  // Render the available workers section
  const renderAvailableWorkers = () => {
    return (
      <Box bg="background.panel" p={4} borderRadius="md" mb={4}>
        <Flex align="center" justify="space-between">
          <Flex align="center">
            <Users size={20} color="#e1e1e1" />
            <Heading size="sm" ml={2} color="text.primary">
              Available Workers
            </Heading>
          </Flex>
          <Flex align="center">
            <Text fontSize="lg" fontWeight="bold" color="accent.main">
              {availableWorkerCount}
            </Text>
            <Button
              size="sm"
              ml={3}
              colorScheme="blue"
              onClick={openAllWorkers}
              isDisabled={availableWorkerCount <= 0}
            >
              View Workers
            </Button>
          </Flex>
        </Flex>
      </Box>
    );
  };

  // Render a UI for each building
  const renderBuilding = (building, index) => {
    // Get assigned workers for this building
    const buildingWorkers = territoryWorkers[index] || [];
    const capacity = getBuildingCapacity(building);

    return (
      <Box
        key={`building-${index}`}
        bg="background.ui"
        borderRadius="md"
        p={4}
        cursor="pointer"
        borderWidth="1px"
        borderColor={selectedBuilding === index ? "accent.main" : "transparent"}
        _hover={{ borderColor: "background.highlight" }}
        onClick={() => setSelectedBuilding(index)}
      >
        <Flex justify="space-between" align="center" mb={2}>
          <Heading size="sm" color="text.primary">
            {building.name}
          </Heading>
          <Badge colorScheme={getBuildingColorScheme(building.type)} px={2}>
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
              const specInfo = getSpecializationInfo(specialization);
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
                        {specInfo.icon && (
                          <Tooltip label={specInfo.tooltip} placement="top">
                            <Text fontSize="lg" mr={1}>
                              {specInfo.icon}
                            </Text>
                          </Tooltip>
                        )}
                        <Text fontSize="sm" color="text.primary" noOfLines={1}>
                          Worker
                        </Text>
                      </Flex>
                      <Button
                        size="xs"
                        variant="ghost"
                        colorScheme="red"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnassignWorker(index, workerId);
                        }}
                      >
                        <UserMinus size={16} />
                      </Button>
                    </Flex>
                  ) : (
                    <Flex justify="center" align="center" h="100%">
                      <Button
                        size="xs"
                        variant="ghost"
                        isDisabled={availableWorkerCount <= 0}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAssignWorker(index);
                        }}
                      >
                        <UserPlus size={16} />
                      </Button>
                    </Flex>
                  )}

                  {/* Reassigned indicator */}
                  {isReassigned && (
                    <Tooltip
                      label="Recently reassigned: 50% productivity penalty"
                      placement="top"
                    >
                      <Box position="absolute" top="-8px" right="-8px">
                        <AlertCircle size={16} color="#d65959" />
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
            {getBuildingProduction(building, buildingWorkers.length)}
          </Text>
        </Flex>
      </Box>
    );
  };

  // Determine building color scheme based on type
  const getBuildingColorScheme = (type) => {
    switch (type) {
      case "farm":
        return "green";
      case "mine":
        return "orange";
      case "library":
        return "blue";
      case "market":
        return "yellow";
      default:
        return "gray";
    }
  };

  // Get resource color based on building type
  const getResourceColor = (type) => {
    switch (type) {
      case "farm":
        return "#7dce82"; // Green
      case "mine":
        return "#d68c45"; // Orange
      case "library":
        return "#5ea8ed"; // Blue
      case "market":
        return "#e9d16c"; // Yellow
      default:
        return "text.primary";
    }
  };

  // Calculate building production
  const getBuildingProduction = (building, workerCount) => {
    if (workerCount === 0) return "0";

    // Base production values
    const baseValues = {
      farm: { resource: "food", icon: "🌾" },
      mine: { resource: "production", icon: "⚒️" },
      library: { resource: "science", icon: "🔬" },
      market: { resource: "gold", icon: "💰" },
    };

    const baseInfo = baseValues[building.type] || { resource: "?", icon: "" };
    const level = building.level || 1;
    const levelMultiplier = level === 1 ? 1 : level === 2 ? 1.5 : 2;

    // Very simple calculation - would be replaced by the actual worker production calculation
    const baseProduction = 5 * workerCount * levelMultiplier;

    return `${Math.round(baseProduction)} ${baseInfo.icon}`;
  };

  // If no territory is selected or it has no buildings
  if (!territory || !territory.buildings || territory.buildings.length === 0) {
    return (
      <Box p={4}>
        <Flex justify="space-between" align="center" mb={4}>
          <Heading size="md" color="accent.main">
            Worker Assignment
          </Heading>
          <Button size="sm" variant="ghost" onClick={onClose}>
            ✕
          </Button>
        </Flex>

        {renderAvailableWorkers()}

        <Box bg="background.panel" p={4} borderRadius="md" textAlign="center">
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
        <Button size="sm" variant="ghost" onClick={onClose}>
          ✕
        </Button>
      </Flex>

      {renderAvailableWorkers()}

      <Box bg="background.ui" p={3} borderRadius="md" mb={4}>
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
      </Box>

      <SimpleGrid columns={1} spacing={4}>
        {territory.buildings.map((building, index) =>
          renderBuilding(building, index)
        )}
      </SimpleGrid>

      <Box mt={4} p={3} bg="background.ui" borderRadius="md">
        <Flex align="center" mb={2}>
          <Text fontSize="sm" fontWeight="medium" color="accent.main">
            Worker Types:
          </Text>
        </Flex>
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

      {/* Worker Pool Modal - Using ReactDOM.createPortal under the hood */}
      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        size="md"
        motionPreset="scale"
        isCentered
      >
        <ModalOverlay />
        <ModalContent bg="background.panel" maxW="500px">
          <WorkerPoolPanel
            onSelectWorker={handleWorkerSelected}
            onClose={closeModal}
          />
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default React.memo(WorkerAssignmentPanel);
