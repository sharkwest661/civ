// src/components/technology/TechnologyCard.jsx
import React, { useMemo, useCallback } from "react";
import {
  Box,
  Text,
  Flex,
  Badge,
  VStack,
  Icon,
  Progress,
  Tooltip,
} from "@chakra-ui/react";
import { Check, History, Beaker } from "lucide-react";

/**
 * TechnologyCard component displays a single technology in the technology tree
 *
 * This is extracted from the larger TechnologyTree component to improve maintainability
 * and follow the single responsibility principle.
 */
const TechnologyCard = React.memo(
  ({
    tech,
    isResearchable,
    isCurrentlyResearching,
    allTechnologies,
    onSelectTechnology,
  }) => {
    // Calculate the text color based on technology status
    const textColor = useMemo(() => {
      if (tech.researched) {
        return "status.success"; // Completed research
      }

      if (isCurrentlyResearching) {
        return "resource.science"; // Active research
      }

      if (isResearchable) {
        return "text.primary"; // Available to research
      }

      return "text.secondary"; // Unavailable
    }, [tech.researched, isCurrentlyResearching, isResearchable]);

    // Get era color for badges
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

    // Handle click on the technology card
    const handleClick = useCallback(() => {
      if (isResearchable) {
        onSelectTechnology(tech);
      }
    }, [isResearchable, onSelectTechnology, tech]);

    return (
      <Box
        bg={
          tech.researched
            ? "background.ui"
            : isCurrentlyResearching
            ? "background.highlight"
            : "background.ui"
        }
        borderWidth="1px"
        borderColor={
          tech.researched
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
        onClick={handleClick}
        _hover={isResearchable ? { borderColor: "accent.main" } : {}}
        opacity={
          isResearchable || tech.researched || isCurrentlyResearching ? 1 : 0.7
        }
        transition="all 0.2s"
      >
        <Flex justify="space-between" align="center" mb={2}>
          <Text fontWeight="bold" color={textColor}>
            {tech.name}
          </Text>

          {tech.researched && (
            <Icon as={Check} color="status.success" boxSize={5} />
          )}

          {isCurrentlyResearching && (
            <Icon as={History} color="resource.science" boxSize={5} />
          )}
        </Flex>

        <Text fontSize="xs" color="text.secondary" mb={2} noOfLines={2}>
          {tech.description}
        </Text>

        {/* Era and branch badges */}
        <Flex gap={2} mb={2}>
          <Badge
            px={1}
            fontSize="xs"
            colorScheme="gray"
            variant="subtle"
            bg={`${getEraColor(tech.era)}30`}
            color={getEraColor(tech.era)}
          >
            {tech.era} Era
          </Badge>

          <Badge
            px={1}
            fontSize="xs"
            colorScheme="gray"
            variant="subtle"
            bg="background.highlight"
          >
            {tech.branch}
          </Badge>
        </Flex>

        {/* Requirements */}
        {tech.requirements.length > 0 && (
          <VStack align="start" spacing={1} mb={2}>
            <Text fontSize="xs" color="text.secondary">
              Requirements:
            </Text>

            {tech.requirements.map((reqId) => {
              const reqTech = allTechnologies[reqId];
              const isReqResearched = reqTech?.researched;

              return (
                <Flex
                  key={reqId}
                  align="center"
                  fontSize="xs"
                  color={isReqResearched ? "status.success" : "status.danger"}
                >
                  <Box
                    w="2px"
                    h="2px"
                    borderRadius="full"
                    bg={isReqResearched ? "status.success" : "status.danger"}
                    mr={1}
                  />
                  {reqTech?.name || reqId}
                  {isReqResearched && <Icon as={Check} boxSize={3} ml={1} />}
                </Flex>
              );
            })}
          </VStack>
        )}

        {/* Research cost */}
        {!tech.researched && (
          <Flex justify="flex-end" align="center" mt={2}>
            <Text fontSize="xs" color="resource.science" fontWeight="medium">
              {tech.cost} <Icon as={Beaker} boxSize={3} ml={0.5} />
            </Text>
          </Flex>
        )}

        {/* Research progress indicator */}
        {tech.progress > 0 && !tech.researched && (
          <Tooltip
            label={`${tech.progress} / ${tech.cost} (${Math.round(
              (tech.progress / tech.cost) * 100
            )}%)`}
            placement="top"
          >
            <Progress
              value={(tech.progress / tech.cost) * 100}
              size="xs"
              colorScheme="blue"
              mt={2}
            />
          </Tooltip>
        )}
      </Box>
    );
  }
);

// Add display name for debugging
TechnologyCard.displayName = "TechnologyCard";

export default TechnologyCard;
