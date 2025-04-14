import React from "react";
import {
  Box,
  Text,
  Divider,
  Flex,
  VStack,
  UnorderedList,
  ListItem,
} from "@chakra-ui/react";

/**
 * TechnologyTooltip - Displays detailed information about a technology
 *
 * @param {Object} props
 * @param {Object} props.tech - The technology data
 * @param {Object} props.allTechnologies - All technologies for looking up requirements
 */
const TechnologyTooltip = ({ tech, allTechnologies }) => {
  if (!tech) return null;

  // Get era color
  const getEraColor = (era) => {
    switch (era) {
      case "Primitive":
        return "#7dce82";
      case "Ancient":
        return "#d68c45";
      case "Classical":
        return "#5ea8ed";
      case "Medieval":
        return "#a670e6";
      case "Renaissance":
        return "#e9d16c";
      default:
        return "#e1e1e1";
    }
  };

  // Get branch color
  const getBranchColor = (branch) => {
    switch (branch) {
      case "Military":
        return "#e67670";
      case "Economic":
        return "#e9d16c";
      case "Science":
        return "#5ea8ed";
      case "Cultural":
        return "#a670e6";
      default:
        return "#e1e1e1";
    }
  };

  return (
    <Box p={3} width="300px">
      <Text fontWeight="bold" fontSize="md">
        {tech.name}
      </Text>

      <Flex gap={2} mt={1} mb={2}>
        <Text fontSize="xs" color={getEraColor(tech.era)} fontWeight="medium">
          {tech.era} Era
        </Text>
        <Text
          fontSize="xs"
          color={getBranchColor(tech.branch)}
          fontWeight="medium"
        >
          {tech.branch} Branch
        </Text>
      </Flex>

      <Text fontSize="sm" color="text.secondary" mb={3}>
        {tech.description}
      </Text>

      <Divider mb={3} />

      {/* Research progress */}
      {!tech.researched && (
        <VStack align="flex-start" spacing={1} mb={3}>
          <Flex justify="space-between" width="100%">
            <Text fontSize="xs" fontWeight="medium">
              Research Progress:
            </Text>
            <Text fontSize="xs">
              {tech.progress} / {tech.cost} 🔬
            </Text>
          </Flex>

          <Box
            width="100%"
            height="4px"
            bg="#2a3c53"
            borderRadius="full"
            overflow="hidden"
          >
            <Box
              height="100%"
              width={`${(tech.progress / tech.cost) * 100}%`}
              bg="#5ea8ed"
              borderRadius="full"
            />
          </Box>
        </VStack>
      )}

      {/* Requirements */}
      {tech.requirements.length > 0 && (
        <Box mb={3}>
          <Text fontSize="xs" fontWeight="medium" mb={1}>
            Required Technologies:
          </Text>
          <UnorderedList pl={4} spacing={1}>
            {tech.requirements.map((reqId) => {
              const reqTech = allTechnologies[reqId];
              const isResearched = reqTech?.researched;

              return (
                <ListItem
                  key={reqId}
                  fontSize="xs"
                  color={isResearched ? "#7dce82" : "#d65959"}
                >
                  {reqTech?.name || reqId} {isResearched && "✓"}
                </ListItem>
              );
            })}
          </UnorderedList>
        </Box>
      )}

      {/* Effects */}
      <Box>
        <Text fontSize="xs" fontWeight="medium" mb={1}>
          Effects:
        </Text>
        <UnorderedList pl={4} spacing={1}>
          {tech.effects.map((effect, index) => (
            <ListItem key={index} fontSize="xs" color="text.primary">
              {effect}
            </ListItem>
          ))}
        </UnorderedList>
      </Box>
    </Box>
  );
};

export default React.memo(TechnologyTooltip);
