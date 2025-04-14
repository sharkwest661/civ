// src/components/technology/TechnologyTree.jsx
import React, { useMemo, useCallback } from "react";
import {
  Box,
  Heading,
  Text,
  Flex,
  VStack,
  Divider,
  Icon,
  useToast,
} from "@chakra-ui/react";
import { FlaskConical, Check, Beaker, History } from "lucide-react";
import { useTechnologyStore } from "../../stores/technologyStore";
import SharedButton from "../ui/SharedButton";
import TechnologyCard from "./TechnologyCard";
import VirtualizedList from "../common/VirtualizedList";
import {
  useStoreSelectors,
  useStoreActions,
} from "../../hooks/useStoreSelectors";
import OptimizedTooltip from "../ui/OptimizedTooltip";

/**
 * TechnologyTree component for visualizing and managing technology research
 * Updated with virtualization and other performance optimizations
 */
const TechnologyTree = React.memo(({ onClose }) => {
  const toast = useToast();

  // Get only the required state using individual selectors for better performance
  const { technologies, currentResearch } = useStoreSelectors(
    useTechnologyStore,
    {
      technologies: (state) => state.technologies,
      currentResearch: (state) => state.currentResearch,
    }
  );

  // Get actions in a way that doesn't cause re-renders
  const { startResearch, cancelResearch } = useStoreActions(
    useTechnologyStore,
    ["startResearch", "cancelResearch"]
  );

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
    [canResearch, currentResearch, startResearch, toast]
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

  // Render the current research section
  const renderCurrentResearch = useCallback(() => {
    if (!currentResearch) {
      return (
        <Text color="text.secondary">
          No technology currently being researched. Select a technology below to
          begin research.
        </Text>
      );
    }

    const tech = technologies[currentResearch];

    return (
      <VStack align="stretch" spacing={2}>
        <Flex justify="space-between" align="center">
          <Flex align="center">
            <Icon as={FlaskConical} color="resource.science" mr={2} />
            <Text color="resource.science" fontWeight="bold">
              {tech.name}
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
          {tech.description}
        </Text>

        <Flex justify="space-between" align="center" mt={1}>
          <Text fontSize="sm" color="text.secondary">
            Progress:
          </Text>
          <Text fontSize="sm" color="resource.science">
            {tech.progress} / {tech.cost}
            <Icon as={Beaker} boxSize={4} ml={1} />
          </Text>
        </Flex>

        <Box
          bg="background.highlight"
          h="8px"
          borderRadius="full"
          overflow="hidden"
          mt={1}
        >
          <Box
            bg="resource.science"
            h="100%"
            w={`${(tech.progress / tech.cost) * 100}%`}
            borderRadius="full"
          />
        </Box>
      </VStack>
    );
  }, [currentResearch, technologies, handleCancelResearch]);

  // Render a technology era section with virtualized list
  const renderTechEra = useCallback(
    (era, techs) => {
      return (
        <Box key={era} mb={8}>
          <Flex
            align="center"
            mb={3}
            pb={1}
            borderBottomWidth="1px"
            borderColor="background.highlight"
          >
            <OptimizedTooltip label={`Technologies from the ${era} Era`}>
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
            </OptimizedTooltip>
            <Heading size="md" color="accent.main">
              Era
            </Heading>
          </Flex>

          {/* Use VirtualizedList for better performance with many technologies */}
          <VirtualizedList
            items={techs}
            height="auto"
            maxHeight="500px"
            itemHeight={120} // Approximate height of each tech card
            overscan={1}
            renderItem={(tech) => (
              <Box p={1} key={tech.id}>
                <TechnologyCard
                  tech={tech}
                  isResearchable={canResearch(tech)}
                  isCurrentlyResearching={currentResearch === tech.id}
                  allTechnologies={technologies}
                  onSelectTechnology={handleTechClick}
                />
              </Box>
            )}
          />
        </Box>
      );
    },
    [technologies, currentResearch, canResearch, handleTechClick]
  );

  // Helper function to get color for era
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

        {renderCurrentResearch()}
      </Box>

      {/* Technology tree by era - each era renders technologies in a virtualized list */}
      {Object.entries(techByEra).map(([era, techs]) =>
        renderTechEra(era, techs)
      )}
    </Box>
  );
});

// Add display name for debugging
TechnologyTree.displayName = "TechnologyTree";

export default TechnologyTree;
