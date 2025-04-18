// src/components/workers/WorkerSelectionModal.jsx - Fixed specialization display
import React, { useState, useCallback, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Box,
  Text,
  VStack,
  HStack,
  Flex,
  Badge,
  Icon,
  Divider,
  Tooltip,
} from "@chakra-ui/react";
import { User, Users, Brain, Briefcase, Award, Dumbbell } from "lucide-react";

import { useWorkersStore } from "../../stores/workersStore";
import SharedButton from "../ui/SharedButton";
import {
  getWorkerSpecializationInfo,
  formatSubtype,
  isWorkerIdealForBuilding,
} from "../../utils/gameUtils";

/**
 * WorkerSelectionModal component
 *
 * A standalone modal specifically for selecting workers to assign to buildings.
 * Fixed to properly display worker specializations.
 */
const WorkerSelectionModal = ({
  isOpen,
  onClose,
  onSelectWorker,
  buildingIndex,
  buildingType,
}) => {
  // Get worker data using individual selectors
  const availableWorkers = useWorkersStore((state) => state.availableWorkers);
  const workerSpecializations = useWorkersStore(
    (state) => state.workerSpecializations
  );
  const availableWorkerCount = useWorkersStore(
    (state) => state.availableWorkerCount
  );

  // State for selected worker
  const [selectedWorkerId, setSelectedWorkerId] = useState(null);

  // Debug logging to help diagnose specialization issues
  useEffect(() => {
    if (isOpen) {
      console.log("Worker specializations in modal:", workerSpecializations);
      console.log("Available workers:", availableWorkers);

      // Check each worker's specialization
      availableWorkers.forEach((worker) => {
        const spec = workerSpecializations[worker.id];
        console.log(`Worker ${worker.id} specialization:`, spec);
      });
    }
  }, [isOpen, availableWorkers, workerSpecializations]);

  // Helper to get icon for a specialization type
  const getSpecializationIcon = (type) => {
    switch (type) {
      case "diligent":
        return Briefcase;
      case "strong":
        return Dumbbell;
      case "clever":
        return Brain;
      default:
        return User;
    }
  };

  // Handler for selecting worker
  const handleSelectWorker = useCallback((workerId) => {
    setSelectedWorkerId(workerId);
  }, []);

  // Handler for confirming selection
  const handleConfirmSelection = useCallback(() => {
    if (selectedWorkerId && onSelectWorker) {
      onSelectWorker(selectedWorkerId);
      onClose();
    }
  }, [selectedWorkerId, onSelectWorker, onClose]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      size="lg"
      closeOnOverlayClick={false}
    >
      <ModalOverlay bg="rgba(0,0,0,0.75)" />
      <ModalContent
        bg="background.panel"
        borderColor="background.highlight"
        borderWidth="1px"
        color="text.primary"
      >
        <ModalHeader borderBottomWidth="1px" borderColor="background.highlight">
          Select Worker for Assignment
          <ModalCloseButton />
        </ModalHeader>

        <ModalBody p={4}>
          <Flex align="center" mb={4}>
            <Icon as={Users} mr={2} />
            <Text>Available Workers: {availableWorkerCount}</Text>
          </Flex>

          {availableWorkerCount === 0 ? (
            <Box p={4} bg="background.ui" borderRadius="md" textAlign="center">
              <Text>No available workers.</Text>
              <Text fontSize="sm" color="text.secondary" mt={2}>
                Unassign workers from other buildings or wait for population
                growth.
              </Text>
            </Box>
          ) : (
            <VStack
              spacing={2}
              align="stretch"
              maxH="300px"
              overflowY="auto"
              pr={2}
            >
              {availableWorkers.map((worker) => {
                // Direct debugging of this specific worker's specialization
                const directSpec = workerSpecializations[worker.id];
                console.log(`Rendering worker ${worker.id}:`, directSpec);

                // Use utility function with fallback to direct access if it fails
                let specInfo = getWorkerSpecializationInfo(directSpec);

                // Fallback direct approach if utility function fails
                if (!specInfo && directSpec) {
                  const iconComponent = getSpecializationIcon(directSpec.type);
                  specInfo = {
                    icon: iconComponent || User,
                    color:
                      directSpec.type === "diligent"
                        ? "resource.gold"
                        : directSpec.type === "strong"
                        ? "resource.production"
                        : directSpec.type === "clever"
                        ? "resource.science"
                        : "text.primary",
                    name:
                      directSpec.type.charAt(0).toUpperCase() +
                      directSpec.type.slice(1),
                    subtype: directSpec.subtype,
                    description: `+${directSpec.bonus * 100}% ${
                      directSpec.subtype
                    } bonus`,
                  };
                  console.log("Created fallback specInfo:", specInfo);
                }

                const isSelected = selectedWorkerId === worker.id;
                const isIdeal = isWorkerIdealForBuilding(
                  worker.id,
                  workerSpecializations,
                  buildingType
                );

                return (
                  <Box
                    key={worker.id}
                    bg={isSelected ? "background.highlight" : "background.ui"}
                    p={3}
                    borderRadius="md"
                    borderWidth="1px"
                    borderColor={
                      isSelected
                        ? "accent.main"
                        : isIdeal
                        ? "status.success"
                        : "transparent"
                    }
                    cursor="pointer"
                    onClick={() => handleSelectWorker(worker.id)}
                    _hover={{
                      borderColor: isSelected
                        ? "accent.main"
                        : "background.highlight",
                    }}
                    position="relative"
                  >
                    {isIdeal && (
                      <Tooltip
                        label="Ideal worker for this building type"
                        placement="top"
                      >
                        <Box position="absolute" top="-8px" right="-8px">
                          <Icon as={Award} color="status.success" boxSize={5} />
                        </Box>
                      </Tooltip>
                    )}

                    <Flex justify="space-between" align="center">
                      <Flex align="center">
                        <Icon
                          as={specInfo?.icon || User}
                          color={specInfo?.color || "text.primary"}
                          mr={2}
                        />
                        <Text fontWeight="medium">
                          {specInfo ? `${specInfo.name} Worker` : "Worker"}
                        </Text>
                      </Flex>

                      {specInfo && (
                        <Badge
                          bg={`${specInfo.color}30`}
                          color={specInfo.color}
                          borderRadius="md"
                          px={2}
                          py={0.5}
                        >
                          {formatSubtype(specInfo.subtype)}
                        </Badge>
                      )}
                    </Flex>

                    {specInfo && (
                      <Text fontSize="xs" color="text.secondary" mt={1}>
                        {specInfo.description}
                      </Text>
                    )}

                    {/* Debug indicator */}
                    {!specInfo && directSpec && (
                      <Text fontSize="xs" color="status.warning" mt={1}>
                        {directSpec.type} - {directSpec.subtype} (Raw data
                        available)
                      </Text>
                    )}
                  </Box>
                );
              })}
            </VStack>
          )}

          {/* Legend section */}
          <Divider my={4} />

          <Box>
            <Text fontSize="sm" fontWeight="medium" mb={2}>
              Worker Specializations:
            </Text>

            <Flex gap={4} flexWrap="wrap">
              <HStack>
                <Icon as={Briefcase} color="resource.gold" />
                <Text fontSize="sm">Diligent</Text>
              </HStack>

              <HStack>
                <Icon as={Dumbbell} color="resource.production" />
                <Text fontSize="sm">Strong</Text>
              </HStack>

              <HStack>
                <Icon as={Brain} color="resource.science" />
                <Text fontSize="sm">Clever</Text>
              </HStack>
            </Flex>
          </Box>
        </ModalBody>

        <ModalFooter borderTopWidth="1px" borderColor="background.highlight">
          <Flex justify="flex-end" gap={3}>
            <SharedButton variant="ghost" onClick={onClose}>
              Cancel
            </SharedButton>
            <SharedButton
              variant="primary"
              onClick={handleConfirmSelection}
              isDisabled={!selectedWorkerId}
            >
              Assign Worker
            </SharedButton>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default React.memo(WorkerSelectionModal);
