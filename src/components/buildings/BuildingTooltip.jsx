import React from "react";
import { Box, Text, Divider, Flex, VStack } from "@chakra-ui/react";

/**
 * BuildingTooltipContent - Displays detailed information about a building
 *
 * @param {Object} building - The building data
 */
const BuildingTooltipContent = ({ building }) => {
  // Early return if no building data
  if (!building) return null;

  // Map resource types to colors
  const resourceColors = {
    food: "#7dce82",
    production: "#d68c45",
    science: "#5ea8ed",
    gold: "#e9d16c",
    happiness: "#e67670",
    culture: "#a670e6",
    influence: "#5ea8ed",
  };

  // Calculate production efficiency
  const getEfficiencyText = (level) => {
    switch (level) {
      case 1:
        return "Base production";
      case 2:
        return "1.5× productivity";
      case 3:
        return "2× productivity";
      default:
        return "Base production";
    }
  };

  return (
    <Box p={2}>
      <Text fontWeight="bold" fontSize="md" mb={1}>
        {building.name}
      </Text>

      <Text fontSize="sm" color="text.secondary" mb={2}>
        {building.description}
      </Text>

      <Divider mb={2} />

      {/* Building stats */}
      <VStack align="flex-start" spacing={1} mb={2}>
        <Flex justify="space-between" width="100%">
          <Text fontSize="xs">Level:</Text>
          <Text fontSize="xs" fontWeight="medium">
            {building.level || 1}
            {building.level && (
              <Text as="span" fontSize="xs" color="text.secondary">
                {" "}
                ({getEfficiencyText(building.level)})
              </Text>
            )}
          </Text>
        </Flex>

        <Flex justify="space-between" width="100%">
          <Text fontSize="xs">Worker Slots:</Text>
          <Text fontSize="xs" fontWeight="medium">
            {building.level ? building.level + 1 : 2}
          </Text>
        </Flex>

        {building.resourceProduction && (
          <Flex justify="space-between" width="100%">
            <Text fontSize="xs">Produces:</Text>
            <Text
              fontSize="xs"
              fontWeight="medium"
              color={
                resourceColors[building.resourceProduction.type] ||
                "text.primary"
              }
            >
              {building.resourceProduction.amount}{" "}
              {building.resourceProduction.type}/turn per worker
            </Text>
          </Flex>
        )}
      </VStack>

      {/* Territory requirements */}
      {building.requirements && building.requirements.territoryTypes && (
        <>
          <Text fontSize="xs" fontWeight="medium" mb={1}>
            Can be built on:
          </Text>
          <Text fontSize="xs" color="text.secondary">
            {building.requirements.territoryTypes
              .map((type) => type.charAt(0).toUpperCase() + type.slice(1))
              .join(", ")}
          </Text>
        </>
      )}

      {/* Construction cost */}
      {building.productionCost && (
        <Flex justify="flex-end" mt={2}>
          <Text fontSize="xs" color="resource.production" fontWeight="bold">
            Cost: {building.productionCost} ⚒️
          </Text>
        </Flex>
      )}
    </Box>
  );
};

export default React.memo(BuildingTooltipContent);
