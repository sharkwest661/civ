# Empire's Legacy - Code Review and Best Practices

## Executive Summary

This document outlines key issues identified in the Empire's Legacy codebase and provides recommendations for improvement. The analysis reveals inconsistencies in styling approaches, state management concerns, component organization issues, performance bottlenecks, and several anti-patterns that could impact maintainability and scalability. By addressing these issues, we can establish a more consistent, performant, and maintainable codebase.

## 1. Styling Inconsistencies

### Problem

The codebase mixes multiple styling approaches, primarily:

- Raw inline styles defined in component render methods
- Chakra UI component styling
- CSS variables defined in index.css
- Theme object in theme.js

These inconsistencies create maintenance challenges and lead to duplicated style definitions.

### Examples

**Inconsistent Button Styling:**

```jsx
// Raw inline styles (TurnControls.jsx)
<button
  onClick={onEndTurn}
  style={{
    background: "#e6c570",
    border: "none",
    borderRadius: "4px",
    padding: "10px 20px",
    color: "#131e2d",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  }}
>
  <span>End Turn</span>
  <span style={{ fontSize: "20px" }}>➔</span>
</button>

// Chakra UI approach (WorkerAssignmentPanel.jsx)
<Button
  size="sm"
  ml={3}
  colorScheme="blue"
  onClick={openAllWorkers}
  isDisabled={availableWorkerCount <= 0}
>
  View Workers
</Button>
```

**Color Definitions in Multiple Places:**

```jsx
// In component (HexTile.jsx)
const colors = {
  capital: "#873e23", // Amber-Brown
  owned: "#2e4c34", // Forest Green
  explored: "#31394a", // Slate Gray
  // ...
};

// In theme.js
colors: {
  // Territory colors
  territory: {
    capital: "#873e23", // Amber-Brown
    owned: "#2e4c34", // Forest Green
    explored: "#31394a", // Slate Gray
    // ...
  },
}

// In CSS variables (index.css)
:root {
  /* Primary colors */
  --color-background-main: #1a2634;
  --color-background-panel: #131e2d;
  // ...
}
```

### Recommendation

Standardize on Chakra UI for all component styling:

1. **Use Chakra UI components** for all UI elements (Button, Box, Flex, etc.)
2. **Leverage the theme system** to define colors, spacing, and typography once
3. **Apply consistent style props** rather than inline style objects
4. **Remove duplicate style definitions** from various files

```jsx
// Recommended approach
import { Button, Icon } from "@chakra-ui/react";
import { ArrowRight } from "lucide-react";

<Button
  onClick={onEndTurn}
  bg="accent.main"
  color="background.panel"
  borderRadius="md"
  px={5}
  py={2.5}
  fontWeight="bold"
  display="flex"
  alignItems="center"
  gap={2}
>
  <span>End Turn</span>
  <Icon as={ArrowRight} boxSize={5} />
</Button>;
```

## 2. State Management Issues

### Problem

While using Zustand for state management is a good choice, there are implementation concerns:

- Deeply nested state objects make updates error-prone
- Inconsistent selector usage across components
- Some functions recreate objects unnecessarily
- Complex update logic in some stores

### Examples

**Deeply Nested State:**

```javascript
// resourcesStore.js
export const useResourcesStore = create((set, get) => ({
  resources: {
    food: {
      amount: 50,
      production: 5,
      storage: 200,
    },
    // ... more nested resources
  },

  // Update that could lead to mistakes
  updateResource: (resourceType, amount) => {
    set((state) => {
      // Make sure the resource exists
      if (!state.resources[resourceType]) return state;

      // Calculate new amount, respecting storage limits
      const resource = state.resources[resourceType];
      const newAmount = Math.max(
        0,
        Math.min(resource.amount + amount, resource.storage)
      );

      return {
        resources: {
          ...state.resources,
          [resourceType]: {
            ...resource,
            amount: newAmount,
          },
        },
      };
    });
  },
}));
```

**Inconsistent Selector Usage:**

```jsx
// Bad: Selecting the entire resources object
const resources = useResourcesStore((state) => state.resources);

// Good: Selecting only what's needed
const foodAmount = useResourcesStore((state) => state.resources.food.amount);
const updateResource = useResourcesStore((state) => state.updateResource);
```

### Recommendation

1. **Flatten state structures** where possible
2. **Use more granular selectors** to prevent unnecessary re-renders
3. **Implement proper memoization** for derived data
4. **Simplify update logic** with helper functions

```javascript
// Flatter state structure example
export const useResourcesStore = create((set, get) => ({
  // Flatter structure
  food: { amount: 50, production: 5, storage: 200 },
  production: { amount: 30, production: 3, storage: 200 },
  science: { amount: 20, production: 2, storage: Infinity },
  // ...

  // Simpler update function
  updateResource: (resourceType, amount) => {
    set((state) => {
      if (!state[resourceType]) return state;

      const resource = state[resourceType];
      const newAmount = Math.max(
        0,
        Math.min(resource.amount + amount, resource.storage)
      );

      return {
        [resourceType]: {
          ...resource,
          amount: newAmount,
        },
      };
    });
  },
}));
```

## 3. Component Structure and Organization

### Problem

The codebase shows inconsistent component patterns:

- Inconsistent component declaration styles
- Mixed prop handling approaches
- Very large components with too many responsibilities
- Duplicated logic across components
- Inconsistent naming conventions

### Examples

**Inconsistent Component Declarations:**

```jsx
// Function declaration style
function App() {
  // ...
}

// Arrow function style
const TurnControls = ({ onEndTurn = () => {} }) => {
  // ...
};
```

**Inconsistent Prop Handling:**

```jsx
// Direct props object
const ComponentA = (props) => {
  const { propA, propB } = props;
  // ...
};

// Destructured props
const ComponentB = ({ propA, propB }) => {
  // ...
};
```

**Large Components:**

TechnologyTree.jsx and WorkerAssignmentPanel.jsx are over 300 lines with multiple responsibilities.

**Inconsistent Event Handler Naming:**

```jsx
// Different naming patterns for callbacks
const handleHexClick = (hex) => {
  /* ... */
};
const onDismiss = (id) => {
  /* ... */
};
```

### Recommendation

1. **Standardize component patterns**:

   - Use arrow function components consistently
   - Destructure props in function parameters
   - Apply React.memo consistently

2. **Break down large components** into smaller, focused ones:

   - Extract reusable parts to separate components
   - Limit components to ~150 lines maximum
   - Follow single responsibility principle

3. **Implement consistent naming**:
   - Use `handle*` prefix for internal event handlers
   - Use `on*` prefix for callback props
   - Follow consistent casing (camelCase for functions, PascalCase for components)

```jsx
// Recommended component structure
import React from "react";
import { Box, Button, Text } from "@chakra-ui/react";

const ResourceItem = React.memo(
  ({ resource, amount, production, icon, color, onSelect }) => {
    const handleClick = () => {
      onSelect(resource);
    };

    return (
      <Box onClick={handleClick} p={2} borderRadius="md" bg="background.ui">
        <Text color={color} fontWeight="bold">
          {icon} {amount}
        </Text>
        <Text fontSize="sm" color={production >= 0 ? "success" : "danger"}>
          {production > 0 ? "+" : ""}
          {production}/turn
        </Text>
      </Box>
    );
  }
);

ResourceItem.displayName = "ResourceItem";

export default ResourceItem;
```

## 4. Performance Concerns

### Problem

Several performance issues exist in the codebase:

- Recreating objects on each render
- Inefficient tooltip implementation
- Missing memoization for expensive calculations
- Heavy SVG manipulation without virtualization
- Redundant rerenders due to prop changes

### Examples

**Object Recreation:**

```jsx
// New objects created on every render (MapView.jsx)
<HexTile
  key={hexId}
  q={hex.q}
  r={hex.r}
  size={hexSize}
  territory={territory}
  selected={isSelected}
  hovered={isHovered}
  // New function created every render
  onClick={() => onTerritorySelect(hex)}
  onMouseEnter={() => setHoveredHex(hex)}
  onMouseLeave={() => setHoveredHex(null)}
/>
```

**Inefficient Tooltips:**

```jsx
// Recreating all tooltips on each render
const renderTooltips = () => {
  return Object.values(activeTooltips).map((tooltipData) => {
    // ... creates new tooltip JSX on each render
  });
};
```

**Missing Memoization:**

```jsx
// Expensive calculation without memoization
const techByEra = useMemo(() => {
  // ... expensive grouping operation
}, [technologies]); // Good - has memoization

// But other similar functions don't use memoization:
const getFillColor = () => {
  // ... expensive color calculation
};
```

### Recommendation

1. **Properly memoize components** with React.memo
2. **Use useCallback for event handlers** passed to child components
3. **Implement virtualization** for large grids and lists
4. **Memoize expensive calculations** with useMemo
5. **Optimize SVG rendering** using techniques like:
   - Only rendering visible elements
   - Using requestAnimationFrame for animations
   - Reducing SVG complexity at zoomed-out levels

```jsx
// Optimized component with proper memoization
const MapView = React.memo(
  ({ territories, onTerritorySelect, currentPlayer }) => {
    // ... state declarations

    // Memoized callbacks
    const handleHexClick = useCallback(
      (hex) => {
        onTerritorySelect(hex);
      },
      [onTerritorySelect]
    );

    const handleHexEnter = useCallback((hex) => {
      setHoveredHex(hex);
    }, []);

    const handleHexLeave = useCallback(() => {
      setHoveredHex(null);
    }, []);

    // Render with memoized callbacks
    return (
      <HexTile
        key={hexId}
        q={hex.q}
        r={hex.r}
        size={hexSize}
        territory={territory}
        selected={isSelected}
        hovered={isHovered}
        onClick={handleHexClick}
        onMouseEnter={handleHexEnter}
        onMouseLeave={handleHexLeave}
      />
    );
  }
);

MapView.displayName = "MapView";
```

## 5. Code Duplication

### Problem

Logic is frequently duplicated across components:

- Color calculation logic appears in multiple components
- Specialization type detection is duplicated
- Territory type handling is duplicated
- Resource information logic is repeated

### Examples

**Duplicated Color Logic:**

```jsx
// In HexTile.jsx
const getFillColor = () => {
  const colors = {
    capital: "#873e23",
    owned: "#2e4c34",
    // ...
  };
  // ... color selection logic
};

// Similar logic in MapView.jsx and elsewhere
```

**Duplicated Specialization Logic:**

```jsx
// In WorkerAssignmentPanel.jsx
const getSpecializationInfo = (specialization) => {
  if (!specialization) return { icon: null, color: "gray.400" };

  switch (specialization.type) {
    case "diligent":
      return {
        icon: "💼",
        color: "#e9d16c",
        tooltip: `Diligent Worker: +15% ${specialization.subtype} production`,
      };
    // ... more cases
  }
};

// Almost identical function in WorkerPoolPanel.jsx
```

### Recommendation

1. **Extract common logic** into utility functions
2. **Create shared UI components** for repeated patterns
3. **Centralize game constants** like colors, bonuses, etc.
4. **Implement proper type definitions** to ensure consistency

```jsx
// utils/workerUtils.js
export const getSpecializationInfo = (specialization) => {
  if (!specialization) return { icon: null, color: "gray.400" };

  switch (specialization.type) {
    case "diligent":
      return {
        icon: "💼",
        color: "resource.gold",
        tooltip: `Diligent Worker: +15% ${specialization.subtype} production`,
      };
    case "strong":
      return {
        icon: "💪",
        color: "resource.production",
        tooltip: `Strong Worker: +15% ${specialization.subtype} efficiency`,
      };
    // ... more cases
  }
};

// Usage in components
import { getSpecializationInfo } from "../../utils/workerUtils";
// Then just call the function
```

## 6. Anti-patterns and Technical Debt

### Problem

Several concerning practices exist:

- Direct DOM manipulation instead of React patterns
- Timeouts in state management
- Magic strings and numbers
- Props drilling across components
- Missing error boundaries
- Multiple implementations for the same functionality

### Examples

**DOM Manipulation:**

```javascript
// Direct DOM event listeners in HexGrid.jsx
useEffect(() => {
  const svg = svgRef.current;
  if (!svg) return;

  svg.addEventListener("wheel", handleWheel, { passive: false });
  document.addEventListener("mouseup", handleMouseUp);
  document.addEventListener("mousemove", handleMouseMove);

  return () => {
    svg.removeEventListener("wheel", handleWheel);
    document.removeEventListener("mouseup", handleMouseUp);
    document.removeEventListener("mousemove", handleMouseMove);
  };
}, [handleWheel, handleMouseUp, handleMouseMove]);
```

**Timeouts in State Management:**

```javascript
// In mapStore.js
exploreTerritoryId: (hexId) => {
  set((state) => ({
    territories: {
      ...state.territories,
      [hexId]: {
        ...state.territories[hexId],
        isExplored: true,
        isNewlyDiscovered: true,
      },
    },
  }));

  // State changes outside of the store's set method
  setTimeout(() => {
    set((state) => ({
      territories: {
        ...state.territories,
        [hexId]: {
          ...state.territories[hexId],
          isNewlyDiscovered: false,
        },
      },
    }));
  }, 3000);
},
```

**Magic Numbers:**

```jsx
// No constants for these values
const tooltipWidth = 200;
const tooltipHeight = territory.resource ? 120 : 90;
const tooltipX = center.x - tooltipWidth / 2;
const tooltipY = center.y - tooltipHeight - 15; // Position above the hex
```

**Multiple Implementations:**

Both WorkerPoolPanel.jsx and StandaloneWorkerSelector.jsx implement worker selection UI.

### Recommendation

1. **Replace DOM manipulation** with React patterns:

   - Use React event handlers
   - Create custom hooks for complex interactions
   - Keep DOM refs to a minimum

2. **Clean up state management**:

   - Move timeouts to effects in components
   - Create proper animation states instead of timeouts
   - Implement proper action dispatching patterns

3. **Define constants** for magic numbers and strings:

   - Resource types
   - UI dimensions
   - Animation durations
   - Game mechanics values

4. **Implement context** for prop drilling issues

5. **Standardize on one implementation** for common features:
   - Consolidate worker selection UI
   - Standardize modal/panel patterns
   - Create reusable UI components

```jsx
// Constants file
export const RESOURCE_TYPES = {
  FOOD: "food",
  PRODUCTION: "production",
  SCIENCE: "science",
  GOLD: "gold",
  HAPPINESS: "happiness",
  CULTURE: "culture",
  INFLUENCE: "influence",
};

export const UI = {
  TOOLTIP: {
    WIDTH: 200,
    HEIGHT_BASE: 90,
    HEIGHT_WITH_RESOURCE: 120,
    OFFSET_Y: 15,
  },
};

// React-friendly wheel event handling
const MapView = () => {
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    // handle zoom
  }, []);

  return (
    <div onWheel={handleWheel} role="application" aria-label="Game map">
      {/* Map content */}
    </div>
  );
};
```

## 7. Accessibility Issues

### Problem

The UI has limited accessibility support:

- Missing keyboard navigation
- Limited ARIA attributes
- Color contrast issues
- No focus indicators
- Interactive elements lack proper roles

### Recommendation

1. **Implement keyboard navigation**:

   - Add key handlers for map navigation
   - Ensure all interactive elements can be accessed via keyboard
   - Implement proper focus management

2. **Add ARIA attributes**:

   - Proper roles for custom components
   - Accessible labels for interactive elements
   - State descriptions (expanded, selected, etc.)

3. **Improve color contrast**:

   - Ensure all text meets WCAG AA standards
   - Add alternative visual indicators besides color
   - Test with color blindness simulators

4. **Implement focus indicators**:
   - Visible focus styles for all interactive elements
   - Skip navigation links for keyboard users
   - Logical tab order

```jsx
// Example of accessible hex tile
<g
  role="button"
  tabIndex={0}
  aria-label={`Territory at ${q},${r}${
    territory.type ? `, ${territory.type}` : ""
  }`}
  aria-selected={selected}
  onKeyDown={(e) => {
    if (e.key === "Enter" || e.key === " ") {
      onClick({ q, r, territory });
    }
  }}
  onClick={() => onClick({ q, r, territory })}
  onFocus={() => handleHexEnter({ q, r, territory })}
  onBlur={() => handleHexLeave({ q, r, territory })}
  style={{ cursor: "pointer" }}
>
  {/* Hex content */}
</g>
```

## 8. Code Organization and Project Structure

### Problem

While the general structure is good, some issues exist:

- Inconsistent file naming
- Some utility functions in component files
- Missing tests
- Lack of centralized game configuration

### Recommendation

1. **Standardize file naming**:

   - PascalCase for components
   - camelCase for utilities and hooks
   - Create an explicit project structure guide

2. **Extract utility functions** from components into dedicated files

3. **Centralize game configuration** into dedicated config files:

   - Building types
   - Resource types
   - Technology trees
   - Worker specializations

4. **Implement testing** for:
   - Critical game logic
   - UI components
   - Store functionality

## Implementation Priority

1. **High Priority**:

   - Standardize on Chakra UI for styling
   - Extract duplicated logic into utility functions
   - Fix state management concerns
   - Address performance bottlenecks in map rendering

2. **Medium Priority**:

   - Break down large components
   - Implement accessibility improvements
   - Clean up technical debt and anti-patterns
   - Create centralized config files

3. **Lower Priority**:
   - Add testing infrastructure
   - Standardize file naming
   - Optimize SVG rendering
   - Implement advanced features

## Conclusion

Empire's Legacy has a solid foundation and architectural approach, but needs consistency in implementation and several technical improvements. By addressing these issues systematically, we can improve code quality, performance, and maintainability while making the game more accessible to all players.

The most impactful changes will be standardizing the UI component system, addressing state management concerns, and extracting duplicated logic into reusable utilities. These changes will set the stage for more advanced features and optimizations in the future.
