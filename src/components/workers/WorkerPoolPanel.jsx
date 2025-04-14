import React, { useState } from "react";
import {
  Box,
  Heading,
  Text,
  Flex,
  SimpleGrid,
  Badge,
  Button,
  Divider,
  Tooltip,
} from "@chakra-ui/react";
import { User, Users } from "lucide-react";
import { useWorkersStore } from "../../stores/workersStore";

/**
 * WorkerPoolPanel component shows all available workers and allows selecting them
 */
const WorkerPoolPanel = ({ onSelectWorker, onClose }) => {
  // Get worker data from workers store
  const availableWorkers = useWorkersStore((state) => state.availableWorkers);
  const workerSpecializations = useWorkersStore(
    (state) => state.workerSpecializations
  );
  const availableWorkerCount = useWorkersStore(
    (state) => state.availableWorkerCount
  );

  // Local state for selected worker
  const [selectedWorkerId, setSelectedWorkerId] = useState(null);

  // Handle worker selection
  const handleSelectWorker = (workerId) => {
    setSelectedWorkerId(workerId);
    if (onSelectWorker) {
      onSelectWorker(workerId);
    }
  };

  // Get specialization info for a worker
  const getSpecializationInfo = (workerId) => {
    const specialization = workerSpecializations[workerId];
    if (!specialization) return null;

    let icon, color, name, description;

    switch (specialization.type) {
      case "diligent":
        icon = "💼";
        color = "#e9d16c"; // Gold
        name = "Diligent";
        description = `+15% ${specialization.subtype} production`;
        break;
      case "strong":
        icon = "💪";
        color = "#d68c45"; // Orange
        name = "Strong";
        description = `+15% ${specialization.subtype} efficiency`;
        break;
      case "clever":
        icon = "🧠";
        color = "#5ea8ed"; // Blue
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

  return (
    <Box p={4}>
      <Flex justify="space-between" align="center" mb={4}>
        <Heading size="md" color="accent.main">
          Available Workers
        </Heading>
        <Button size="sm" variant="ghost" onClick={onClose}>
          ✕
        </Button>
      </Flex>

      <Flex align="center" mb={4}>
        <Users size={18} color="#e1e1e1" />
        <Text ml={2} color="text.primary">
          Available Workers: {availableWorkerCount}
        </Text>
      </Flex>

      {availableWorkerCount === 0 ? (
        <Box bg="background.panel" p={4} borderRadius="md" textAlign="center">
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

          <SimpleGrid columns={1} spacing={2}>
            {availableWorkers.map((worker) => {
              const specialization = getSpecializationInfo(worker.id);

              return (
                <Box
                  key={worker.id}
                  bg={
                    selectedWorkerId === worker.id
                      ? "background.highlight"
                      : "background.panel"
                  }
                  p={3}
                  borderRadius="md"
                  cursor="pointer"
                  onClick={() => handleSelectWorker(worker.id)}
                  borderWidth="1px"
                  borderColor={
                    selectedWorkerId === worker.id
                      ? "accent.main"
                      : "transparent"
                  }
                  _hover={{ borderColor: "background.highlight" }}
                >
                  <Flex justify="space-between" align="center">
                    <Flex align="center">
                      <User size={16} color="#e1e1e1" />
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
                          <Text fontSize="lg" ml={2}>
                            {specialization.icon}
                          </Text>
                        </Tooltip>
                      )}
                    </Flex>

                    {specialization && (
                      <Badge
                        colorScheme={
                          specialization.type === "diligent"
                            ? "yellow"
                            : specialization.type === "strong"
                            ? "orange"
                            : "blue"
                        }
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
          </SimpleGrid>
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
            <Text fontSize="lg" mr={2}>
              💼
            </Text>
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
            <Text fontSize="lg" mr={2}>
              💪
            </Text>
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
            <Text fontSize="lg" mr={2}>
              🧠
            </Text>
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
    </Box>
  );
};

export default React.memo(WorkerPoolPanel);
