// src/components/technology/TechnologyTree.jsx
import React, { useMemo, useCallback } from "react";
import {
  Box,
  Heading,
  Text,
  Flex,
  VStack,
  Grid,
  GridItem,
  Badge,
  Progress,
  Divider,
  Icon,
  useToast,
} from "@chakra-ui/react";
import { FlaskConical, Check, Beaker, History } from "lucide-react";
import { useTechnologyStore } from "../../stores/technologyStore";
import SharedButton from "../ui/SharedButton";
import TechnologyTooltip from "./TechnologyTooltip";

/**
 * TechnologyTree component for visualizing and managing technology research
 * Refactored to use Chakra UI components
 */
const TechnologyTree = React.memo(({ onClose }) => {
  const toast = useToast();

  // Get technology data from the store with individual selectors
  const technologies = useTechnologyStore((state) => state.technologies);
  const currentResearch = useTechnologyStore((state) => state.currentResearch);
  const startResearch = useTechnologyStore((state) => state.startResearch);
  const cancelResearch = useTechnologyStore((state) => state.cancelResearch);

  // Group technologies by era - memoized to prevent recalculation on every render
  const techByEra = useMemo(() => {
    const result = {};

    Object.values(technologies).forEach((tech) => {
      if (!result[tech.era]) {
        result[tech.era] = [];
      }
      result[tech.era].push(tech);
    });

    // Sort eras in a logical progression
    const sortedResult = {};
    const eraOrder = [
      "Primitive",
      "Ancient",
      "Classical",
      "Medieval",
      "Renaissance",
    ];

    eraOrder.forEach((era) => {
      if (result[era]) {
        sortedResult[era] = result[era];
      }
    });

    return sortedResult;
  }, [technologies]);

  // Check if a technology can be researched
  const canResearch = useCallback(
    (tech) => {
      if (tech.researched) return false;
      if (currentResearch) return false;

      // Check if all requirements are met
      return tech.requirements.every(
        (reqId) => technologies[reqId]?.researched
      );
    },
    [technologies, currentResearch]
  );

  // Handle clicking on a technology
  const handleTechClick = useCallback(
    (tech) => {
      if (!canResearch(tech)) {
        // Show why research can't be started
        if (tech.researched) {
          toast({
            title: "Already Researched",
            description: `${tech.name} has already been researched.`,
            status: "info",
            duration: 3000,
            isClosable: true,
          });
        } else if (currentResearch) {
          toast({
            title: "Research in Progress",
            description: "You're already researching another technology.",
            status: "warning",
            duration: 3000,
            isClosable: true,
          });
        } else {
          toast({
            title: "Requirements Not Met",
            description: "You need to research the prerequisites first.",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        }
        return;
      }

      // Start researching this tech
      startResearch(tech.id);

      toast({
        title: "Research Started",
        description: `Started researching ${tech.name}.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    },
    [canResearch, currentResearch, startResearch, technologies, toast]
  );

  // Handle canceling research
  const handleCancelResearch = useCallback(() => {
    cancelResearch();

    toast({
      title: "Research Canceled",
      description: "Current research has been canceled.",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  }, [cancelResearch, toast]);

  // Get color for era label
  const getEraColor = useCallback((era) => {
    switch (era) {
      case "Primitive":
        return "resource.food"; // Green
      case "Ancient":
        return "resource.production"; // Orange
      case "Classical":
        return "resource.science"; // Blue
      case "Medieval":
        return "resource.happiness"; // Red
      case "Renaissance":
        return "resource.gold"; // Yellow
      default:
        return "text.primary";
    }
  }, []);

  // Get color for technology type
  const getTechColor = useCallback(
    (tech) => {
      if (tech.researched) {
        return "status.success"; // Completed research
      }

      if (tech.id === currentResearch) {
        return "resource.science"; // Active research
      }

      if (canResearch(tech)) {
        return "text.primary"; // Available to research
      }

      return "text.secondary"; // Unavailable
    },
    [canResearch, currentResearch]
  );

  return (
    <Box p={5} maxH="80vh" overflowY="auto">
      <Flex justify="space-between" align="center" mb={5}>
        <Heading size="lg" color="accent.main">
          Technology Tree
        </Heading>
        <SharedButton
          variant="ghost"
          size="sm"
          onClick={onClose}
          aria-label="Close panel"
        >
          ✕
        </SharedButton>
      </Flex>

      {/* Current research display */}
      <Box bg="background.ui" p={4} borderRadius="md" mb={5}>
        <Heading size="md" color="text.primary" mb={3}>
          Current Research
        </Heading>

        {currentResearch ? (
          <VStack align="stretch" spacing={2}>
            <Flex justify="space-between" align="center">
              <Flex align="center">
                <Icon as={FlaskConical} color="resource.science" mr={2} />
                <Text color="resource.science" fontWeight="bold">
                  {technologies[currentResearch].name}
                </Text>
              </Flex>

              <SharedButton
                variant="ghost"
                size="sm"
                colorScheme="red"
                onClick={handleCancelResearch}
              >
                Cancel
              </SharedButton>
            </Flex>

            <Text fontSize="sm" color="text.secondary">
              {technologies[currentResearch].description}
            </Text>

            <Flex justify="space-between" align="center" mt={1}>
              <Text fontSize="sm" color="text.secondary">
                Progress:
              </Text>
              <Text fontSize="sm" color="resource.science">
                {technologies[currentResearch].progress} /{" "}
                {technologies[currentResearch].cost}
                <Icon as={Beaker} boxSize={4} ml={1} />
              </Text>
            </Flex>

            <Progress
              value={
                (technologies[currentResearch].progress /
                  technologies[currentResearch].cost) *
                100
              }
              colorScheme="blue"
              size="sm"
              borderRadius="full"
              mt={1}
            />
          </VStack>
        ) : (
          <Text color="text.secondary">
            No technology currently being researched. Select a technology below
            to begin research.
          </Text>
        )}
      </Box>

      {/* Technology tree by era */}
      {Object.entries(techByEra).map(([era, techs]) => (
        <Box key={era} mb={8}>
          <Flex
            align="center"
            mb={3}
            pb={1}
            borderBottomWidth="1px"
            borderColor="background.highlight"
          >
            <Box
              bg={`${getEraColor(era)}20`}
              color={getEraColor(era)}
              px={2}
              py={0.5}
              borderRadius="md"
              fontSize="sm"
              fontWeight="bold"
              mr={2}
            >
              {era}
            </Box>
            <Heading size="md" color="accent.main">
              Era
            </Heading>
          </Flex>

          <Grid templateColumns="repeat(auto-fill, minmax(230px, 1fr))" gap={4}>
            {techs.map((tech) => {
              const isResearchable = canResearch(tech);
              const isResearched = tech.researched;
              const isCurrentlyResearching = currentResearch === tech.id;
              const textColor = getTechColor(tech);

              return (
                <GridItem key={tech.id}>
                  <Box
                    bg={
                      isResearched
                        ? "background.ui"
                        : isCurrentlyResearching
                        ? "background.highlight"
                        : "background.ui"
                    }
                    borderWidth="1px"
                    borderColor={
                      isResearched
                        ? "status.success"
                        : isCurrentlyResearching
                        ? "resource.science"
                        : isResearchable
                        ? "background.highlight"
                        : "transparent"
                    }
                    borderRadius="md"
                    p={3}
                    cursor={isResearchable ? "pointer" : "default"}
                    onClick={() => handleTechClick(tech)}
                    _hover={
                      isResearchable ? { borderColor: "accent.main" } : {}
                    }
                    opacity={
                      isResearchable || isResearched || isCurrentlyResearching
                        ? 1
                        : 0.7
                    }
                    transition="all 0.2s"
                  >
                    <Flex justify="space-between" align="center" mb={2}>
                      <Text fontWeight="bold" color={textColor}>
                        {tech.name}
                      </Text>

                      {isResearched && (
                        <Icon as={Check} color="status.success" boxSize={5} />
                      )}

                      {isCurrentlyResearching && (
                        <Icon
                          as={History}
                          color="resource.science"
                          boxSize={5}
                        />
                      )}
                    </Flex>

                    <Text
                      fontSize="xs"
                      color="text.secondary"
                      mb={2}
                      noOfLines={2}
                    >
                      {tech.description}
                    </Text>

                    {/* Requirements */}
                    {tech.requirements.length > 0 && (
                      <VStack align="start" spacing={1} mb={2}>
                        <Text fontSize="xs" color="text.secondary">
                          Requirements:
                        </Text>

                        {tech.requirements.map((reqId) => {
                          const reqTech = technologies[reqId];
                          const isReqResearched = reqTech?.researched;

                          return (
                            <Flex
                              key={reqId}
                              align="center"
                              fontSize="xs"
                              color={
                                isReqResearched
                                  ? "status.success"
                                  : "status.danger"
                              }
                            >
                              <Box
                                w="2px"
                                h="2px"
                                borderRadius="full"
                                bg={
                                  isReqResearched
                                    ? "status.success"
                                    : "status.danger"
                                }
                                mr={1}
                              />
                              {reqTech?.name || reqId}
                              {isReqResearched && (
                                <Icon as={Check} boxSize={3} ml={1} />
                              )}
                            </Flex>
                          );
                        })}
                      </VStack>
                    )}

                    {/* Research cost */}
                    {!isResearched && (
                      <Flex justify="flex-end" align="center" mt={2}>
                        <Text
                          fontSize="xs"
                          color="resource.science"
                          fontWeight="medium"
                        >
                          {tech.cost} <Icon as={Beaker} boxSize={3} ml={0.5} />
                        </Text>
                      </Flex>
                    )}

                    {/* Research progress indicator */}
                    {tech.progress > 0 && !isResearched && (
                      <Progress
                        value={(tech.progress / tech.cost) * 100}
                        size="xs"
                        colorScheme="blue"
                        mt={2}
                      />
                    )}
                  </Box>
                </GridItem>
              );
            })}
          </Grid>
        </Box>
      ))}
    </Box>
  );
});

// Add display name for debugging
TechnologyTree.displayName = "TechnologyTree";

export default TechnologyTree;
