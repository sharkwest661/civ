// src/components/workers/WorkerPoolPanel.jsx
import React, { useState } from "react";
import {
  Box,
  Text,
  Flex,
  SimpleGrid,
  Badge,
  Divider,
  Tooltip,
  VStack,
  Heading,
  Icon,
} from "@chakra-ui/react";
import { User, Users, Brain, Briefcase, CheckCircle } from "lucide-react";
import { useWorkersStore } from "../../stores/workersStore";
import SharedButton from "../ui/SharedButton";

/**
 * WorkerPoolPanel component shows all available workers and allows selecting them
 * Updated to use our Chakra UI components and fix modal issues
 */
const WorkerPoolPanel = ({ onSelectWorker, onClose }) => {
  // Get worker data from workers store using individual selectors
  const availableWorkers = useWorkersStore((state) => state.availableWorkers);
  const workerSpecializations = useWorkersStore(
    (state) => state.workerSpecializations
  );
  const availableWorkerCount = useWorkersStore(
    (state) => state.availableWorkerCount
  );

  // Local state for selected worker
  const [selectedWorkerId, setSelectedWorkerId] = useState(null);

  // Get specialization info for a worker
  const getSpecializationInfo = (workerId) => {
    const specialization = workerSpecializations[workerId];
    if (!specialization) return null;

    let icon, color, name, description;

    switch (specialization.type) {
      case "diligent":
        icon = Briefcase;
        color = "resource.gold"; // Gold
        name = "Diligent";
        description = `+15% ${specialization.subtype} production`;
        break;
      case "strong":
        icon = User;
        color = "resource.production"; // Orange
        name = "Strong";
        description = `+15% ${specialization.subtype} efficiency`;
        break;
      case "clever":
        icon = Brain;
        color = "resource.science"; // Blue
        name = "Clever";
        description = `+15% ${specialization.subtype} output`;
        break;
      default:
        return null;
    }

    return { icon, color, name, description, subtype: specialization.subtype };
  };

  // Get subtype display name
  const getSubtypeName = (subtype) => {
    return subtype.charAt(0).toUpperCase() + subtype.slice(1);
  };

  // Handle selecting a worker
  const handleWorkerSelect = (workerId) => {
    setSelectedWorkerId(workerId);
  };

  // Handle confirming worker selection
  const handleConfirmSelection = () => {
    if (selectedWorkerId && onSelectWorker) {
      onSelectWorker(selectedWorkerId);
    }
  };

  return (
    <Box p={4}>
      <Flex justify="space-between" align="center" mb={4}>
        <Heading size="md" color="accent.main">
          Available Workers
        </Heading>
      </Flex>

      <Flex align="center" mb={4}>
        <Icon as={Users} boxSize={5} color="text.primary" mr={2} />
        <Text color="text.primary">
          Available Workers: {availableWorkerCount}
        </Text>
      </Flex>

      {availableWorkerCount === 0 ? (
        <Box bg="background.ui" p={4} borderRadius="md" textAlign="center">
          <Text color="text.secondary">No available workers.</Text>
          <Text color="text.secondary" fontSize="sm" mt={2}>
            Unassign workers from buildings or wait for population growth.
          </Text>
        </Box>
      ) : (
        <>
          <Text fontSize="sm" color="text.secondary" mb={2}>
            Select a worker to assign:
          </Text>

          <VStack
            spacing={2}
            align="stretch"
            mb={4}
            maxH="300px"
            overflowY="auto"
          >
            {availableWorkers.map((worker) => {
              const specialization = getSpecializationInfo(worker.id);
              const isSelected = selectedWorkerId === worker.id;

              return (
                <Box
                  key={worker.id}
                  bg={isSelected ? "background.highlight" : "background.ui"}
                  p={3}
                  borderRadius="md"
                  cursor="pointer"
                  onClick={() => handleWorkerSelect(worker.id)}
                  borderWidth="1px"
                  borderColor={isSelected ? "accent.main" : "transparent"}
                  _hover={{ borderColor: "background.highlight" }}
                  transition="all 0.2s"
                >
                  <Flex justify="space-between" align="center">
                    <Flex align="center">
                      <Icon as={User} boxSize={4} color="text.primary" />
                      <Text ml={2} color="text.primary">
                        Worker
                      </Text>

                      {specialization && (
                        <Tooltip
                          label={`${specialization.name} (${getSubtypeName(
                            specialization.subtype
                          )}): ${specialization.description}`}
                          placement="top"
                        >
                          <Box ml={2}>
                            <Icon
                              as={specialization.icon}
                              boxSize={5}
                              color={specialization.color}
                            />
                          </Box>
                        </Tooltip>
                      )}
                    </Flex>

                    {specialization && (
                      <Badge
                        bg={`${specialization.color}30`}
                        color={specialization.color}
                        px={2}
                        py={0.5}
                        borderRadius="md"
                        ml={2}
                      >
                        {getSubtypeName(specialization.subtype)}
                      </Badge>
                    )}
                  </Flex>

                  {specialization && (
                    <Text fontSize="xs" color="text.secondary" mt={1}>
                      {specialization.description}
                    </Text>
                  )}
                </Box>
              );
            })}
          </VStack>
        </>
      )}

      {/* Worker specialization legend */}
      <Box mt={6}>
        <Divider mb={3} />
        <Heading size="xs" mb={2} color="text.primary">
          Worker Specializations:
        </Heading>

        <SimpleGrid columns={3} spacing={2}>
          <Flex align="center">
            <Icon as={Briefcase} boxSize={5} color="resource.gold" mr={2} />
            <Box>
              <Text fontSize="sm" color="text.primary">
                Diligent
              </Text>
              <Text fontSize="xs" color="text.secondary">
                Resource Production
              </Text>
            </Box>
          </Flex>

          <Flex align="center">
            <Icon as={User} boxSize={5} color="resource.production" mr={2} />
            <Box>
              <Text fontSize="sm" color="text.primary">
                Strong
              </Text>
              <Text fontSize="xs" color="text.secondary">
                Physical Tasks
              </Text>
            </Box>
          </Flex>

          <Flex align="center">
            <Icon as={Brain} boxSize={5} color="resource.science" mr={2} />
            <Box>
              <Text fontSize="sm" color="text.primary">
                Clever
              </Text>
              <Text fontSize="xs" color="text.secondary">
                Knowledge Tasks
              </Text>
            </Box>
          </Flex>
        </SimpleGrid>
      </Box>

      {/* Footer buttons */}
      <Flex justify="flex-end" mt={6} gap={3}>
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
    </Box>
  );
};

export default React.memo(WorkerPoolPanel);
