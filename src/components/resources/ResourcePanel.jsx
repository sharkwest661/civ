// src/components/resources/ResourcePanel.jsx
import React from "react";
import { Box } from "@chakra-ui/react";
import OptimizedResourceDisplay from "./OptimizedResourceDisplay";

/**
 * ResourcePanel displays the current resources and their production rates
 * Updated to use the optimized resource display for better performance
 */
const ResourcePanel = React.memo(() => {
  // Only show main resources in the top panel
  const mainResources = ["food", "production", "science", "gold", "happiness"];

  return (
    <Box>
      <OptimizedResourceDisplay types={mainResources} />
    </Box>
  );
});

// Add display name for debugging
ResourcePanel.displayName = "ResourcePanel";

export default ResourcePanel;
