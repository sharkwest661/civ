import { extendTheme } from "@chakra-ui/react";

/**
 * Theme configuration for Empire's Legacy
 * Based on the design specifications in the visualization guidelines
 */
export const theme = extendTheme({
  // Color palette from design document
  colors: {
    // Primary colors
    background: {
      main: "#1a2634", // Deep Blue-Gray
      panel: "#131e2d", // Darker Blue-Gray
      ui: "#1e2d42", // Medium Blue-Gray
      highlight: "#2a3c53", // Lighter Blue-Gray
    },
    accent: {
      main: "#e6c570", // Gold - for important elements, buttons
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
      special: "#a670e6", // Purple
    },

    // Status colors
    status: {
      success: "#7dce82", // Green
      warning: "#e9d16c", // Yellow
      danger: "#d65959", // Red
      info: "#5ea8ed", // Blue
      special: "#a670e6", // Purple
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

  // Component theme overrides
  components: {
    Button: {
      baseStyle: {
        borderRadius: "4px", // Consistent border radius
        transition: "all 0.2s ease-out", // Smooth transitions
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
          fontWeight: "bold",
          _hover: {
            bg: "#f0d080", // 15% lighter than base color
          },
          _active: {
            bg: "#cca960", // 15% darker than base color
          },
        },
        secondary: {
          bg: "background.highlight",
          color: "text.primary",
          _hover: {
            bg: "#354761", // 15% lighter than base color
          },
          _active: {
            bg: "#233145", // 15% darker than base color
          },
        },
        danger: {
          bg: "status.danger",
          color: "text.primary",
          _hover: {
            bg: "#e47272", // 15% lighter than base color
          },
          _active: {
            bg: "#b64c4c", // 15% darker than base color
          },
        },
      },
    },

    Heading: {
      baseStyle: {
        color: "accent.main", // Gold color for headers
        fontFamily: "heading",
        fontWeight: "normal", // Cinzel looks better with normal weight
      },
      sizes: {
        xl: { fontSize: "24px" },
        lg: { fontSize: "20px" },
        md: { fontSize: "18px" },
        sm: { fontSize: "16px" },
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
    },

    Card: {
      baseStyle: {
        container: {
          bg: "background.panel",
          borderRadius: "4px",
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

    Progress: {
      baseStyle: {
        track: {
          bg: "background.highlight",
          borderRadius: "full",
        },
        filledTrack: {
          bg: "status.info",
          borderRadius: "full",
          transition: "width 0.3s ease-in-out",
        },
      },
      variants: {
        food: { filledTrack: { bg: "resource.food" } },
        production: { filledTrack: { bg: "resource.production" } },
        science: { filledTrack: { bg: "resource.science" } },
        gold: { filledTrack: { bg: "resource.gold" } },
        happiness: { filledTrack: { bg: "resource.happiness" } },
      },
      sizes: {
        sm: {
          track: { h: "8px" },
          filledTrack: { h: "8px" },
        },
        md: {
          track: { h: "16px" },
          filledTrack: { h: "16px" },
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
      // Add web fonts
      "@font-face": [
        {
          fontFamily: "Cinzel",
          src: "url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;700&display=swap')",
          fontWeight: "normal",
          fontStyle: "normal",
        },
        {
          fontFamily: "Quicksand",
          src: "url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;700&display=swap')",
          fontWeight: "normal",
          fontStyle: "normal",
        },
      ],
    },
  },
});

export default theme;
