// src/components/ui/SharedButton.jsx
import React from "react";
import { Button as ChakraButton } from "@chakra-ui/react";

/**
 * Standardized button component that implements the game's design system
 *
 * @param {Object} props
 * @param {'primary' | 'secondary' | 'danger' | 'ghost'} props.variant - Button variant
 * @param {'sm' | 'md' | 'lg'} props.size - Button size
 * @param {React.ReactNode} props.children - Button content
 * @param {Function} props.onClick - Click handler
 * @param {boolean} props.isDisabled - Disabled state
 * @param {Object} props.rest - Any additional props passed to Chakra Button
 */
const SharedButton = ({
  variant = "primary",
  size = "md",
  children,
  onClick,
  isDisabled = false,
  ...rest
}) => {
  // Define variant styles based on our design system
  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return {
          bg: "accent.main",
          color: "background.panel",
          _hover: { bg: "accent.hover" },
          _active: { bg: "accent.active" },
        };
      case "secondary":
        return {
          bg: "background.highlight",
          color: "text.primary",
          _hover: { bg: "background.highlightHover" },
          _active: { bg: "background.highlightActive" },
        };
      case "danger":
        return {
          bg: "status.danger",
          color: "text.primary",
          _hover: { bg: "status.dangerHover" },
          _active: { bg: "status.dangerActive" },
        };
      case "ghost":
        return {
          bg: "transparent",
          color: "text.secondary",
          _hover: { bg: "background.highlight", color: "text.primary" },
        };
      default:
        return {
          bg: "accent.main",
          color: "background.panel",
        };
    }
  };

  // Define sizes
  const getSizeStyles = () => {
    switch (size) {
      case "sm":
        return {
          px: 3,
          py: 1,
          fontSize: "sm",
        };
      case "lg":
        return {
          px: 6,
          py: 3,
          fontSize: "lg",
        };
      case "md":
      default:
        return {
          px: 4,
          py: 2,
          fontSize: "md",
        };
    }
  };

  return (
    <ChakraButton
      fontWeight="bold"
      borderRadius="md"
      border="none"
      transition="all 0.2s ease-out"
      cursor={isDisabled ? "not-allowed" : "pointer"}
      opacity={isDisabled ? 0.6 : 1}
      onClick={!isDisabled ? onClick : undefined}
      {...getVariantStyles()}
      {...getSizeStyles()}
      {...rest}
    >
      {children}
    </ChakraButton>
  );
};

export default React.memo(SharedButton);
