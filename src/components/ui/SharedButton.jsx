// src/components/ui/SharedButton.jsx
import React from "react";
import { Button as ChakraButton } from "@chakra-ui/react";
import { getAccessibleTextColor } from "../../utils/accessibilityUtils";

/**
 * Standardized button component that implements the game's design system
 * Enhanced with accessibility features
 *
 * @param {Object} props
 * @param {'primary' | 'secondary' | 'danger' | 'ghost'} props.variant - Button variant
 * @param {'sm' | 'md' | 'lg'} props.size - Button size
 * @param {React.ReactNode} props.children - Button content
 * @param {Function} props.onClick - Click handler
 * @param {boolean} props.isDisabled - Disabled state
 * @param {string} props.ariaLabel - Accessible label (optional)
 * @param {Object} props.rest - Any additional props passed to Chakra Button
 */
const SharedButton = ({
  variant = "primary",
  size = "md",
  children,
  onClick,
  isDisabled = false,
  ariaLabel,
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
          _focus: {
            boxShadow: "0 0 0 3px rgba(230, 197, 112, 0.6)",
            outline: "none",
          },
        };
      case "secondary":
        return {
          bg: "background.highlight",
          color: "text.primary",
          _hover: { bg: "background.highlightHover" },
          _active: { bg: "background.highlightActive" },
          _focus: {
            boxShadow: "0 0 0 3px rgba(42, 60, 83, 0.6)",
            outline: "none",
          },
        };
      case "danger":
        return {
          bg: "status.danger",
          color: "text.primary",
          _hover: { bg: "status.dangerHover" },
          _active: { bg: "status.dangerActive" },
          _focus: {
            boxShadow: "0 0 0 3px rgba(214, 89, 89, 0.6)",
            outline: "none",
          },
        };
      case "ghost":
        return {
          bg: "transparent",
          color: "text.secondary",
          _hover: { bg: "background.highlight", color: "text.primary" },
          _focus: {
            boxShadow: "0 0 0 3px rgba(42, 60, 83, 0.4)",
            outline: "none",
          },
        };
      default:
        return {
          bg: "accent.main",
          color: "background.panel",
          _focus: {
            boxShadow: "0 0 0 3px rgba(230, 197, 112, 0.6)",
            outline: "none",
          },
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

  // Define accessibility props including contrast check
  const getA11yProps = () => {
    const props = {};

    // Add aria-label if provided
    if (ariaLabel) {
      props["aria-label"] = ariaLabel;
    }

    // Ensure disabled buttons communicate their state
    if (isDisabled) {
      props["aria-disabled"] = true;
    }

    return props;
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
      // Ensure focus visibility even when using mouse
      _focusVisible={{
        boxShadow: "0 0 0 3px rgba(230, 197, 112, 0.6)",
        outline: "none",
      }}
      {...getVariantStyles()}
      {...getSizeStyles()}
      {...getA11yProps()}
      {...rest}
    >
      {children}
    </ChakraButton>
  );
};

export default React.memo(SharedButton);
