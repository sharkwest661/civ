// src/components/common/ComponentTemplate.jsx
import React, { useState, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import { Box, Text, Flex, Button } from "@chakra-ui/react";

/**
 * ComponentTemplate - A standardized template for new React components
 *
 * This serves as a reference for creating new components with consistent patterns:
 * - Arrow function component with explicit prop destructuring
 * - Consistent event handler naming (handle* for internal, on* for props)
 * - Proper use of React hooks (useState, useCallback, useMemo)
 * - Chakra UI for styling and layout
 * - Prop type definitions
 * - React.memo for performance optimization
 *
 * @param {Object} props
 * @param {string} props.title - Component title
 * @param {React.ReactNode} props.children - Child elements
 * @param {Function} props.onAction - Callback when action is triggered
 * @param {boolean} props.isActive - Whether the component is in active state
 * @param {Object} props.data - Data object for the component
 */
const ComponentTemplate = ({
  title,
  children,
  onAction,
  isActive = false,
  data = {},
}) => {
  // State declarations at the top
  const [isExpanded, setIsExpanded] = useState(false);

  // Event handlers with useCallback to prevent unnecessary recreation
  const handleToggleExpand = useCallback(() => {
    setIsExpanded((prevState) => !prevState);
  }, []);

  const handleActionClick = useCallback(() => {
    // Do any local processing here
    if (onAction) {
      onAction(data);
    }
  }, [onAction, data]);

  // Derived/computed values with useMemo to prevent recalculation
  const displayTitle = useMemo(() => {
    return title ? title.toUpperCase() : "UNTITLED";
  }, [title]);

  // Conditional rendering logic
  const renderContent = () => {
    if (!isExpanded) {
      return (
        <Text color="text.secondary" fontSize="sm" noOfLines={2}>
          Click to expand content
        </Text>
      );
    }

    return <Box p={3}>{children}</Box>;
  };

  // Component JSX uses Chakra UI for consistent styling
  return (
    <Box
      bg="background.ui"
      borderRadius="md"
      borderWidth="1px"
      borderColor={isActive ? "accent.main" : "background.highlight"}
      overflow="hidden"
      transition="all 0.2s"
      _hover={{ borderColor: "accent.hover" }}
    >
      <Flex
        justify="space-between"
        align="center"
        bg="background.highlight"
        p={3}
        onClick={handleToggleExpand}
        cursor="pointer"
      >
        <Text fontWeight="bold" color="text.primary">
          {displayTitle}
        </Text>
        <Text fontSize="sm" color="text.secondary">
          {isExpanded ? "▲ Collapse" : "▼ Expand"}
        </Text>
      </Flex>

      {renderContent()}

      <Flex
        justify="flex-end"
        p={3}
        borderTopWidth={isExpanded ? "1px" : "0"}
        borderColor="background.highlight"
      >
        <Button
          size="sm"
          colorScheme={isActive ? "blue" : "gray"}
          onClick={handleActionClick}
        >
          Perform Action
        </Button>
      </Flex>
    </Box>
  );
};

// PropTypes for documentation and validation
ComponentTemplate.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node,
  onAction: PropTypes.func,
  isActive: PropTypes.bool,
  data: PropTypes.object,
};

// Display name for debugging
ComponentTemplate.displayName = "ComponentTemplate";

// Export with React.memo for performance optimization
export default React.memo(ComponentTemplate);
