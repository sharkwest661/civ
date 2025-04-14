// src/components/resources/ResourcePanel.jsx
import React, { useMemo } from "react";
import { Box, Flex } from "@chakra-ui/react";
import { useResourcesStore } from "../../stores/resourcesStore";
import ResourceDisplay from "./ResourceDisplay";

/**
 * ResourcePanel displays the current resources and their production rates
 * Updated to work with refactored resources store
 */
const ResourcePanel = React.memo(() => {
  // Use individual selectors for each resource to prevent unnecessary renders
  const food = useResourcesStore((state) => state.food);
  const production = useResourcesStore((state) => state.production);
  const science = useResourcesStore((state) => state.science);
  const gold = useResourcesStore((state) => state.gold);
  const happiness = useResourcesStore((state) => state.happiness);

  // Create a resources object in the format expected by ResourceDisplay
  const resources = useMemo(
    () => ({
      food,
      production,
      science,
      gold,
      happiness,
    }),
    [food, production, science, gold, happiness]
  );

  // Only show main resources in the top panel
  const mainResources = ["food", "production", "science", "gold", "happiness"];

  return (
    <Box>
      <ResourceDisplay resources={resources} types={mainResources} />
    </Box>
  );
});

// Add display name for debugging
ResourcePanel.displayName = "ResourcePanel";

export default ResourcePanel;
