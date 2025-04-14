// src/components/buildings/BuildingWorkerPanel.jsx
import React, { useCallback } from "react";
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
} from "@chakra-ui/react";
import { UserPlus, UserMinus, AlertTriangle } from "lucide-react";
import SharedButton from "../ui/SharedButton";
import { getWorkerSpecializationInfo } from "../../utils/workerUtils";
import { getBuildingWorkerCapacity } from "../../utils/workerUtils";
import { calculateBuildingProduction } from "../../utils/gameUtils";

/**
 * BuildingWorkerPanel component displays an individual building's worker assignments
 *
 * This is extracted from the larger WorkerAssignmentPanel to improve maintainability
 * and follow the single responsibility principle.
 */
const BuildingWorkerPanel = React.memo(
  ({
    building,
    buildingIndex,
    workers = [],
    workerSpecializations = {},
    recentlyReassigned = {},
    isSelected = false,
    availableWorkerCount = 0,
    onSelect,
    onAssignWorker,
    onUnassignWorker,
    resourceColors,
  }) => {
    // Get maximum worker capacity based on building level
    const capacity = getBuildingWorkerCapacity(building.level || 1);

    // Handle selecting this building
    const handleSelectBuilding = useCallback(() => {
      onSelect(buildingIndex);
    }, [onSelect, buildingIndex]);

    // Handle assigning a worker
    const handleAssignWorker = useCallback(
      (e) => {
        e.stopPropagation();
        onAssignWorker(buildingIndex, building.type);
      },
      [onAssignWorker, buildingIndex, building.type]
    );

    // Handle unassigning a worker
    const handleUnassignWorker = useCallback(
      (e, workerId) => {
        e.stopPropagation();
        onUnassignWorker(buildingIndex, workerId);
      },
      [onUnassignWorker, buildingIndex]
    );

    // Get resource color based on building type
    const getResourceColor = useCallback(
      (type) => {
        return resourceColors[type] || "text.primary";
      },
      [resourceColors]
    );

    return (
      <Box
        bg="background.ui"
        borderRadius="md"
        p={4}
        cursor="pointer"
        borderWidth="1px"
        borderColor={isSelected ? "accent.main" : "transparent"}
        _hover={{ borderColor: "background.highlight" }}
        onClick={handleSelectBuilding}
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
            {workers.length} / {capacity}
          </Text>
        </Flex>

        {/* Worker slots */}
        <Box mb={3}>
          <SimpleGrid columns={2} spacing={2}>
            {Array.from({ length: capacity }).map((_, slotIndex) => {
              const workerId = workers[slotIndex];
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
                            <Box mr={1}>
                              <Icon
                                as={specInfo.icon}
                                boxSize={4}
                                color={specInfo.color}
                              />
                            </Box>
                          </Tooltip>
                        )}
                        <Text fontSize="sm" color="text.primary" noOfLines={1}>
                          Worker
                        </Text>
                      </Flex>
                      <SharedButton
                        size="xs"
                        variant="ghost"
                        colorScheme="red"
                        onClick={(e) => handleUnassignWorker(e, workerId)}
                        aria-label="Remove worker"
                        icon={<Icon as={UserMinus} boxSize={4} />}
                        p={1}
                      />
                    </Flex>
                  ) : (
                    <Flex justify="center" align="center" h="100%">
                      <SharedButton
                        size="xs"
                        variant="ghost"
                        isDisabled={availableWorkerCount <= 0}
                        onClick={handleAssignWorker}
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
            {calculateBuildingProduction(building, workers.length)}
          </Text>
        </Flex>
      </Box>
    );
  }
);

// Add display name for debugging
BuildingWorkerPanel.displayName = "BuildingWorkerPanel";

export default BuildingWorkerPanel;
