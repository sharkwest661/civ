// src/components/ui/SharedPanel.jsx
import React from "react";
import { Box, Flex, Heading, IconButton } from "@chakra-ui/react";
import { X } from "lucide-react";

/**
 * Standardized panel component for consistent UI panels across the application
 *
 * @param {Object} props
 * @param {string} props.title - Panel title
 * @param {React.ReactNode} props.children - Panel content
 * @param {Function} props.onClose - Close handler
 * @param {Object} props.headerProps - Additional props for header
 * @param {Object} props.bodyProps - Additional props for body
 * @param {Object} props.rest - Additional props for the container
 */
const SharedPanel = ({
  title,
  children,
  onClose,
  headerProps = {},
  bodyProps = {},
  ...rest
}) => {
  return (
    <Box
      bg="background.panel"
      borderRadius="md"
      borderWidth="1px"
      borderColor="background.highlight"
      overflow="hidden"
      position="relative"
      {...rest}
    >
      {/* Panel Header */}
      <Flex
        justify="space-between"
        align="center"
        bg="background.ui"
        p={4}
        borderBottomWidth="1px"
        borderColor="background.highlight"
        {...headerProps}
      >
        <Heading size="md" color="accent.main">
          {title}
        </Heading>
        {onClose && (
          <IconButton
            icon={<X size={18} />}
            aria-label="Close panel"
            onClick={onClose}
            variant="ghost"
            size="sm"
          />
        )}
      </Flex>

      {/* Panel Body */}
      <Box p={4} {...bodyProps}>
        {children}
      </Box>
    </Box>
  );
};

export default React.memo(SharedPanel);
