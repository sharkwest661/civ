// src/components/map/HexTileWithBuildings.jsx
import React, { useMemo, useCallback } from "react";
import HexTile from "./HexTile";
import OptimizedBuildingVisualizer from "../buildings/OptimizedBuildingVisualizer";
import { hexToId } from "../../utils/hexUtils";

/**
 * HexTileWithBuildings - Composite component that renders both a hex tile and its buildings
 *
 * Fixed to properly handle click events and ensure it works correctly with VirtualizedHexGrid
 */
const HexTileWithBuildings = React.memo(
  ({
    q,
    r,
    size,
    territory,
    selected = false,
    hovered = false,
    zoomLevel = 1,
    onClick,
    onMouseEnter,
    onMouseLeave,
  }) => {
    // Generate a unique ID for this hex
    const hexId = useMemo(() => `hex-${q},${r}`, [q, r]);

    // Create a hex object for click handling
    const hexObj = useMemo(() => ({ q, r, territory }), [q, r, territory]);

    // Handle click with the proper hex object
    const handleClick = useCallback(() => {
      if (onClick) onClick(hexObj);
    }, [onClick, hexObj]);

    // Handle mouse enter
    const handleMouseEnter = useCallback(() => {
      if (onMouseEnter) onMouseEnter(hexObj);
    }, [onMouseEnter, hexObj]);

    // Handle mouse leave
    const handleMouseLeave = useCallback(() => {
      if (onMouseLeave) onMouseLeave();
    }, [onMouseLeave]);

    return (
      <g id={hexId}>
        {/* Render the base hex tile */}
        <HexTile
          q={q}
          r={r}
          size={size}
          territory={territory}
          selected={selected}
          hovered={hovered}
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        />

        {/* Only render buildings if the territory is explored */}
        {territory && territory.isExplored && (
          <OptimizedBuildingVisualizer
            territory={territory}
            q={q}
            r={r}
            hexSize={size}
            zoomLevel={zoomLevel}
          />
        )}
      </g>
    );
  }
);

// Add display name for debugging
HexTileWithBuildings.displayName = "HexTileWithBuildings";

export default HexTileWithBuildings;
