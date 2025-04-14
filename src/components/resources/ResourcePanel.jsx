import React from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import GameTooltip from "./GameTooltip";

/**
 * Resource tooltips with detailed descriptions
 */
const resourceDescriptions = {
  food: "Food is used to grow your population. Each new worker requires increasing amounts of food.",
  production:
    "Production points are used to construct buildings and military units.",
  science:
    "Science advances your technologies, unlocking new abilities and buildings.",
  gold: "Gold funds special actions, maintenance costs, and can be used for trade.",
  happiness:
    "Happiness affects worker productivity and population growth. Keep your empire happy!",
  culture:
    "Culture expands your territory and provides influence over other civilizations.",
  influence:
    "Influence is used for diplomatic actions and agreements with other civilizations.",
};

/**
 * ResourcePanel displays the current resources and their production rates
 */
const ResourcePanel = React.memo(({ resources = {} }) => {
  // Resource colors from design document
  const resourceColors = {
    food: "#7dce82", // Green
    production: "#d68c45", // Orange
    science: "#5ea8ed", // Blue
    gold: "#e9d16c", // Yellow
    happiness: "#e67670", // Red
    culture: "#a670e6", // Purple
    influence: "#5ea8ed", // Blue
  };

  // Resource icons (we'll use text for now, but could use actual icons)
  const resourceIcons = {
    food: "🌾",
    production: "⚒️",
    science: "🔬",
    gold: "💰",
    happiness: "😊",
    culture: "🏛️",
    influence: "🤝",
  };

  // Only show main resources in the top panel
  const mainResources = ["food", "production", "science", "gold", "happiness"];

  // Generate tooltip content for a resource
  const getResourceTooltip = (resourceType) => {
    const resource = resources[resourceType] || {
      amount: 0,
      production: 0,
      storage: Infinity,
    };
    const description = resourceDescriptions[resourceType] || "";

    const storageInfo =
      resource.storage !== Infinity
        ? `\nStorage capacity: ${resource.storage}`
        : "";

    return (
      <>
        <Text fontWeight="bold" mb={1}>
          {resourceType.charAt(0).toUpperCase() + resourceType.slice(1)}
        </Text>
        <Text fontSize="sm">{description}</Text>
        <Text fontSize="sm" mt={2}>
          Current: {Math.floor(resource.amount)}
          {storageInfo}
        </Text>
        <Text
          fontSize="sm"
          color={resource.production >= 0 ? "#7dce82" : "#e67670"}
        >
          Per turn: {resource.production > 0 ? "+" : ""}
          {resource.production}
        </Text>
      </>
    );
  };

  return (
    <Flex gap="20px" alignItems="center">
      {mainResources.map((resourceType) => {
        const resource = resources[resourceType] || {
          amount: 0,
          production: 0,
        };
        const color = resourceColors[resourceType];
        const icon = resourceIcons[resourceType];

        return (
          <GameTooltip
            key={resourceType}
            label={getResourceTooltip(resourceType)}
            delay={800}
            tooltipProps={{
              placement: "bottom",
              width: "220px",
              padding: "10px",
            }}
          >
            <Flex alignItems="center" gap="5px">
              <Text fontSize="18px">{icon}</Text>
              <Box>
                <Text color={color} fontWeight="bold" fontSize="16px">
                  {Math.floor(resource.amount)}
                </Text>
                <Text
                  color={resource.production >= 0 ? "#7dce82" : "#e67670"}
                  fontSize="12px"
                >
                  {resource.production > 0 ? "+" : ""}
                  {resource.production}/turn
                </Text>
              </Box>
            </Flex>
          </GameTooltip>
        );
      })}
    </Flex>
  );
});

// Add display name for debugging
ResourcePanel.displayName = "ResourcePanel";

export default ResourcePanel;
