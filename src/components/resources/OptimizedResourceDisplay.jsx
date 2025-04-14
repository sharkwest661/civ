// src/components/resources/OptimizedResourceDisplay.jsx
import React, { useMemo } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { useStoreSelectors } from "../../hooks/useStoreSelectors";
import { useResourcesStore } from "../../stores/resourcesStore";
import OptimizedTooltip from "../ui/OptimizedTooltip";
import { RESOURCE_DISPLAY } from "../../constants/gameConstants";

/**
 * Single resource item display with optimized rendering
 * Only re-renders when its specific resource changes
 */
const ResourceItem = React.memo(({ type, resourceData = {} }) => {
  // Get configuration for this resource type
  const config = RESOURCE_DISPLAY[type] || {
    icon: "❓",
    color: "text.primary",
    name: "Unknown",
    description: "Unknown resource type",
  };

  // Safely extract values with defaults
  const { amount = 0, production = 0, storage = Infinity } = resourceData;

  // Format displayed amount
  const displayAmount = useMemo(() => {
    return Math.floor(amount);
  }, [amount]);

  // Format production value with sign
  const displayProduction = useMemo(() => {
    const sign = production > 0 ? "+" : "";
    return `${sign}${production}/turn`;
  }, [production]);

  // Determine production value color
  const productionColor = useMemo(() => {
    return production >= 0 ? "status.success" : "status.danger";
  }, [production]);

  // Generate tooltip content
  const tooltipContent = useMemo(() => {
    return (
      <Box p={2}>
        <Text fontWeight="bold" mb={1}>
          {config.name}
        </Text>
        <Text fontSize="sm">{config.description}</Text>
        <Text fontSize="sm" mt={2}>
          Current: {displayAmount}
          {storage !== Infinity && ` / ${storage}`}
        </Text>
        <Text fontSize="sm" color={productionColor}>
          Per turn: {displayProduction}
        </Text>
      </Box>
    );
  }, [config, displayAmount, displayProduction, productionColor, storage]);

  return (
    <OptimizedTooltip label={tooltipContent} placement="bottom" delay={400}>
      <Flex alignItems="center" gap="5px">
        <Text fontSize="18px">{config.icon}</Text>
        <Box>
          <Text color={config.color} fontWeight="bold" fontSize="16px">
            {displayAmount}
          </Text>
          <Text color={productionColor} fontSize="12px">
            {displayProduction}
          </Text>
        </Box>
      </Flex>
    </OptimizedTooltip>
  );
});

/**
 * OptimizedResourceDisplay component
 *
 * Performance optimizations:
 * 1. Uses individual selectors for each resource
 * 2. Avoids unnecessary re-renders with memoization
 * 3. Only renders components when their data changes
 * 4. Uses optimized tooltip system
 */
const OptimizedResourceDisplay = ({
  types = ["food", "production", "science", "gold", "happiness"],
}) => {
  // Get individual resources directly from store
  // This is more efficient than getting the entire resources object
  const resources = useStoreSelectors(useResourcesStore, {
    food: (state) => state.food,
    production: (state) => state.production,
    science: (state) => state.science,
    gold: (state) => state.gold,
    happiness: (state) => state.happiness,
    culture: (state) => state.culture,
    influence: (state) => state.influence,
  });

  // Filter to only the requested types
  const filteredTypes = useMemo(() => {
    return types.filter((type) => resources[type]);
  }, [types, resources]);

  return (
    <Flex gap="20px" alignItems="center">
      {filteredTypes.map((type) => (
        <ResourceItem key={type} type={type} resourceData={resources[type]} />
      ))}
    </Flex>
  );
};

// Add display names for debugging
ResourceItem.displayName = "ResourceItem";
OptimizedResourceDisplay.displayName = "OptimizedResourceDisplay";

export default React.memo(OptimizedResourceDisplay);
