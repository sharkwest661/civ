// src/components/resources/ResourceDisplay.jsx
import React from "react";
import { Box, Flex, Text, Tooltip } from "@chakra-ui/react";
import { RESOURCE_DISPLAY } from "../../constants/gameConstants";
import { ariaLabels } from "../../utils/accessibilityUtils";

/**
 * Single resource display component showing resource amount and production
 * Enhanced with accessibility features
 *
 * @param {Object} props
 * @param {string} props.type - Resource type (food, production, etc.)
 * @param {Object} props.resource - Resource object with amount, production, storage
 */
const ResourceItem = React.memo(({ type, resource }) => {
  // Handle missing resource gracefully
  if (!resource) {
    return null;
  }

  // Get config for this resource type
  const config = RESOURCE_DISPLAY[type] || {
    icon: "❓",
    color: "text.primary",
    name: "Unknown",
    description: "Unknown resource type",
  };

  // Destructure resource properties with defaults
  const { amount = 0, production = 0, storage = Infinity } = resource;

  // Generate accessible label
  const a11yLabel = ariaLabels.resource(type, resource);

  // Generate tooltip content
  const tooltipContent = (
    <Box p={2}>
      <Text fontWeight="bold" mb={1}>
        {config.name}
      </Text>
      <Text fontSize="sm">{config.description}</Text>
      <Text fontSize="sm" mt={2}>
        Current: {Math.floor(amount)}
        {storage !== Infinity && ` / ${storage}`}
      </Text>
      <Text
        fontSize="sm"
        color={production >= 0 ? "status.success" : "status.danger"}
      >
        Per turn: {production > 0 ? "+" : ""}
        {production}
      </Text>
    </Box>
  );

  return (
    <Tooltip
      label={tooltipContent}
      placement="bottom"
      openDelay={800}
      hasArrow
      bg="background.panel"
      color="text.primary"
      borderColor="background.highlight"
      borderWidth="1px"
      borderRadius="md"
      px={3}
      py={2}
      aria-label={`${config.name} details`}
    >
      <Flex
        alignItems="center"
        gap="5px"
        aria-label={a11yLabel}
        role="status"
        tabIndex={0} // Make it focusable
        position="relative"
        _focus={{
          outline: "none",
          boxShadow: "0 0 0 2px var(--color-accent-main)",
          borderRadius: "md",
        }}
      >
        <Text fontSize="18px" aria-hidden="true">
          {config.icon}
        </Text>
        <Box>
          <Text
            color={config.color}
            fontWeight="bold"
            fontSize="16px"
            aria-live="polite" // Announces changes
          >
            {Math.floor(amount)}
          </Text>
          <Text
            color={production >= 0 ? "status.success" : "status.danger"}
            fontSize="12px"
            aria-live="polite"
          >
            {production > 0 ? "+" : ""}
            {production}/turn
          </Text>
        </Box>

        {/* Screen reader only context */}
        <span
          className="sr-only"
          style={{
            position: "absolute",
            width: "1px",
            height: "1px",
            padding: 0,
            margin: "-1px",
            overflow: "hidden",
            clip: "rect(0, 0, 0, 0)",
            whiteSpace: "nowrap",
            borderWidth: 0,
          }}
        >
          {config.description}. Current amount: {Math.floor(amount)}.
          {storage !== Infinity && ` Maximum capacity: ${storage}.`}
          Production rate:{" "}
          {production > 0
            ? `gaining ${production}`
            : production < 0
            ? `losing ${Math.abs(production)}`
            : "stable"}{" "}
          per turn.
        </span>
      </Flex>
    </Tooltip>
  );
});

/**
 * Resource panel displaying multiple resources
 * Enhanced with accessibility features
 *
 * @param {Object} props
 * @param {Object} props.resources - Resources object mapping type to resource data
 * @param {Array} props.types - Resource types to display (defaults to primary resources)
 */
const ResourceDisplay = ({
  resources = {},
  types = ["food", "production", "science", "gold", "happiness"],
}) => {
  return (
    <Flex
      gap="20px"
      alignItems="center"
      role="region"
      aria-label="Resource Status"
      borderRadius="md"
      p={2}
    >
      {types.map((type) => {
        if (!resources[type]) return null;

        return (
          <ResourceItem key={type} type={type} resource={resources[type]} />
        );
      })}
    </Flex>
  );
};

// Add display names for debugging
ResourceItem.displayName = "ResourceItem";
ResourceDisplay.displayName = "ResourceDisplay";

export default React.memo(ResourceDisplay);
