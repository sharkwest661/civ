// src/components/map/HexTile.jsx
import React, { useMemo, useCallback } from "react";
import {
  calculateHexPoints,
  pointsToSvgString,
  axialToPixel,
} from "../../utils/hexUtils";
import {
  getTerritoryColor,
  getTerritoryStrokeStyle,
} from "../../utils/territoryUtils";

/**
 * HexTile component represents a single hexagonal territory on the game map
 * Updated to work with the new tooltip and selection system
 */
const HexTile = React.memo(
  ({
    q,
    r,
    size = 40,
    territory = {},
    selected = false,
    hovered = false,
    onClick = () => {},
    onMouseEnter = () => {},
    onMouseLeave = () => {},
  }) => {
    // Calculate the points and center for this hexagon - memoized
    const { points, center } = useMemo(() => {
      const hexPoints = calculateHexPoints(q, r, size);
      const { x, y } = axialToPixel(q, r, size);
      return {
        points: pointsToSvgString(hexPoints),
        center: { x, y },
      };
    }, [q, r, size]);

    // Get the fill color for this territory
    const fillColor = useMemo(() => {
      return getTerritoryColor(territory, selected, hovered);
    }, [territory, selected, hovered]);

    // Get the stroke style for this territory
    const { strokeWidth, stroke } = useMemo(() => {
      return getTerritoryStrokeStyle(territory);
    }, [territory]);

    // Create a hex object for event handlers
    const hexObj = useMemo(() => ({ q, r, territory }), [q, r, territory]);

    // Handle click
    const handleClick = useCallback(
      (e) => {
        e.stopPropagation(); // Prevent the SVG from handling the click
        onClick(hexObj);
      },
      [onClick, hexObj]
    );

    // Handle mouse enter
    const handleMouseEnter = useCallback(() => {
      onMouseEnter(hexObj);
    }, [onMouseEnter, hexObj]);

    // Handle mouse leave
    const handleMouseLeave = useCallback(() => {
      onMouseLeave();
    }, [onMouseLeave]);

    // Get animation for newly discovered territories
    const animation = useMemo(() => {
      if (territory.isNewlyDiscovered || territory.isNewlyClaimed) {
        return "pulse 2s infinite";
      }
      return undefined;
    }, [territory]);

    return (
      <g>
        <polygon
          points={points}
          fill={fillColor}
          strokeWidth={strokeWidth}
          stroke={stroke}
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={{
            cursor: "pointer",
            animation,
          }}
          data-testid={`hex-${q}-${r}`}
        />

        {/* Render resource icon if the territory has resources and is explored */}
        {territory.resource && territory.isExplored && (
          <text
            x={center.x}
            y={center.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={size * 0.3}
            fill="#ffffff"
            fontWeight="bold"
            style={{
              textShadow: "0 0 3px black",
              pointerEvents: "none", // Ensure the text doesn't interfere with clicks
            }}
          >
            {territory.resource.slice(0, 1).toUpperCase()}
          </text>
        )}
      </g>
    );
  }
);

// Add display name for debugging
HexTile.displayName = "HexTile";

export default HexTile;
