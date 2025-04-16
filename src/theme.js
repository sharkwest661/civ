// src/theme.js
import { extendTheme } from "@chakra-ui/react";

/**
 * Enhanced theme configuration for Empire's Legacy
 * Based on the design specifications in the visualization guidelines
 */
export const theme = extendTheme({
  // Color palette from design document with added hover/active states
  colors: {
    // Primary colors
    background: {
      main: "#1a2634", // Deep Blue-Gray
      panel: "#131e2d", // Darker Blue-Gray
      ui: "#1e2d42", // Medium Blue-Gray
      highlight: "#2a3c53", // Lighter Blue-Gray
      highlightHover: "#354761", // 15% lighter than highlight
      highlightActive: "#233145", // 15% darker than highlight
    },
    accent: {
      main: "#e6c570", // Gold - for important elements, buttons
      hover: "#f0d080", // 15% lighter
      active: "#cca960", // 15% darker
    },
    text: {
      primary: "#e1e1e1", // Off-White
      secondary: "#8a9bbd", // Muted Blue-Gray
    },

    // Resource colors
    resource: {
      food: "#7dce82", // Green
      production: "#d68c45", // Orange
      science: "#5ea8ed", // Blue
      gold: "#e9d16c", // Yellow
      happiness: "#e67670", // Red
      culture: "#a670e6", // Purple
      influence: "#5ea8ed", // Blue
    },

    // Status colors
    status: {
      success: "#7dce82", // Green
      successHover: "#8fddb5", // Lighter
      successActive: "#6ab571", // Darker

      warning: "#e9d16c", // Yellow
      warningHover: "#f0d98a", // Lighter
      warningActive: "#c4ae5a", // Darker

      danger: "#d65959", // Red
      dangerHover: "#e47272", // Lighter
      dangerActive: "#b64c4c", // Darker

      info: "#5ea8ed", // Blue
      infoHover: "#78bcf9", // Lighter
      infoActive: "#4a89c9", // Darker

      special: "#a670e6", // Purple
      specialHover: "#b98cf3", // Lighter
      specialActive: "#8a5cc0", // Darker
    },

    // Civilization colors
    civilization: {
      solarian: "#c17443", // Copper
      celestial: "#43c1be", // Teal
      northern: "#4374c1", // Cold Blue
      desert: "#c1a843", // Warm Gold
      forest: "#6fc143", // Vibrant Green
      island: "#c14358", // Cherry Red
    },

    // Territory colors
    territory: {
      capital: "#873e23", // Amber-Brown
      owned: "#2e4c34", // Forest Green
      explored: "#31394a", // Slate Gray
      unexplored: "#0d1520", // Near Black
      strategic: "#3e2e4c", // Deep Purple
      luxury: "#2e3e4c", // Steel Blue
      danger: "#4c2e2e", // Deep Red
    },
  },

  // Font configurations
  fonts: {
    heading: "Cinzel, serif", // Primary font for headings
    body: "Quicksand, sans-serif", // Interface font for body text
  },

  // Component theme overrides with enhanced variants
  components: {
    Button: {
      baseStyle: {
        borderRadius: "4px", // Consistent border radius
        transition: "all 0.2s ease-out", // Smooth transitions
        fontWeight: "bold",
        _hover: {
          transform: "translateY(-1px)", // Slight lift on hover
        },
        _active: {
          transform: "translateY(1px)", // Press down on click
        },
      },
      variants: {
        primary: {
          bg: "accent.main",
          color: "background.panel",
          _hover: {
            bg: "accent.hover",
          },
          _active: {
            bg: "accent.active",
          },
        },
        secondary: {
          bg: "background.highlight",
          color: "text.primary",
          _hover: {
            bg: "background.highlightHover",
          },
          _active: {
            bg: "background.highlightActive",
          },
        },
        danger: {
          bg: "status.danger",
          color: "text.primary",
          _hover: {
            bg: "status.dangerHover",
          },
          _active: {
            bg: "status.dangerActive",
          },
        },
        success: {
          bg: "status.success",
          color: "text.primary",
          _hover: {
            bg: "status.successHover",
          },
          _active: {
            bg: "status.successActive",
          },
        },
        ghost: {
          bg: "transparent",
          color: "text.secondary",
          _hover: {
            bg: "background.highlight",
            color: "text.primary",
          },
        },
      },
      sizes: {
        sm: {
          fontSize: "sm",
          px: 3,
          py: 1,
        },
        md: {
          fontSize: "md",
          px: 4,
          py: 2,
        },
        lg: {
          fontSize: "lg",
          px: 5,
          py: 3,
        },
      },
      defaultProps: {
        variant: "primary",
        size: "md",
      },
    },

    Heading: {
      baseStyle: {
        color: "accent.main", // Gold color for headers
        fontFamily: "heading",
        fontWeight: "normal", // Cinzel looks better with normal weight
      },
      sizes: {
        xl: { fontSize: ["20px", "24px"] }, // Responsive sizing
        lg: { fontSize: ["18px", "20px"] },
        md: { fontSize: ["16px", "18px"] },
        sm: { fontSize: ["14px", "16px"] },
      },
      defaultProps: {
        size: "md",
      },
    },

    Text: {
      baseStyle: {
        color: "text.secondary",
        fontFamily: "body",
        fontSize: "14px",
      },
      variants: {
        primary: {
          color: "text.primary",
          fontSize: "14px",
        },
        small: {
          fontSize: "12px",
        },
        warning: {
          color: "status.danger",
          fontSize: "14px",
        },
      },
      defaultProps: {
        variant: "primary",
      },
    },

    // Enhanced modal styling
    Modal: {
      baseStyle: {
        overlay: {
          bg: "rgba(0, 0, 0, 0.75)",
        },
        dialog: {
          bg: "background.panel",
          borderRadius: "md",
          borderWidth: "1px",
          borderColor: "background.highlight",
        },
        header: {
          bg: "background.ui",
          borderBottomWidth: "1px",
          borderColor: "background.highlight",
          color: "accent.main",
          py: 3,
        },
        body: {
          py: 4,
        },
        footer: {
          borderTopWidth: "1px",
          borderColor: "background.highlight",
          py: 3,
        },
      },
    },

    // Common card styling
    Card: {
      baseStyle: {
        container: {
          bg: "background.panel",
          borderRadius: "md",
          borderWidth: "1px",
          borderColor: "background.highlight",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
        },
        header: {
          bg: "background.ui",
          borderBottomWidth: "1px",
          borderColor: "background.highlight",
          py: 3,
          px: 4,
        },
        body: {
          py: 4,
          px: 4,
        },
        footer: {
          borderTopWidth: "1px",
          borderColor: "background.highlight",
          py: 3,
          px: 4,
        },
      },
    },

    // Enhanced tooltip styling
    Tooltip: {
      baseStyle: {
        bg: "background.panel",
        color: "text.primary",
        borderColor: "background.highlight",
        borderWidth: "1px",
        borderRadius: "md",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
        fontSize: "sm",
        px: 3,
        py: 2,
      },
    },

    Progress: {
      baseStyle: {
        track: {
          bg: "background.highlight",
          borderRadius: "full",
        },
        filledTrack: {
          transition: "width 0.3s ease-in-out",
        },
      },
      variants: {
        military: {
          filledTrack: {
            bg: "status.danger",
          },
        },
        cultural: {
          filledTrack: {
            bg: "resource.culture",
          },
        },
        wonder: {
          filledTrack: {
            bg: "accent.main",
          },
        },
      },
      defaultProps: {
        size: "sm",
        variant: "military",
      },
    },

    // Victory and defeat screen modals
    Modal: {
      baseStyle: {
        overlay: {
          bg: "rgba(0, 0, 0, 0.75)",
          backdropFilter: "blur(3px)",
        },
        dialog: {
          bg: "background.panel",
          borderRadius: "md",
          boxShadow: "0 0 20px rgba(0, 0, 0, 0.5)",
        },
        header: {
          fontFamily: "heading",
          color: "accent.main",
        },
        body: {
          color: "text.primary",
        },
      },
    },
  },

  // Global style overrides
  styles: {
    global: {
      body: {
        bg: "background.main",
        color: "text.primary",
        fontFamily: "body",
        lineHeight: "tall",
      },
      // Add focus visible styling for accessibility
      "*:focus-visible": {
        outline: "2px solid",
        outlineColor: "accent.main",
        outlineOffset: "2px",
      },
      // Animation styles
      "@keyframes pulse": {
        "0%": {
          opacity: 0.6,
          transform: "scale(0.95)",
        },
        "50%": {
          opacity: 1,
          transform: "scale(1.05)",
        },
        "100%": {
          opacity: 0.6,
          transform: "scale(0.95)",
        },
      },
    },
  },

  // Breakpoints for responsive design
  breakpoints: {
    sm: "30em", // 480px
    md: "48em", // 768px
    lg: "62em", // 992px
    xl: "80em", // 1280px
    "2xl": "96em", // 1536px
  },
});

export default theme;
