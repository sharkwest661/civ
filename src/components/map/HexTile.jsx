// src/components/map/HexTile.jsx
import React, { useMemo, useState, useRef, useCallback } from "react";
import {
  calculateHexPoints,
  pointsToSvgString,
  axialToPixel,
} from "../../utils/hexUtils";
import { TERRITORY_COLORS, ANIMATION } from "../../constants/gameConstants";

/**
 * HexTile component represents a single hexagonal territory on the game map
 * Fixed to ensure proper rendering
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
    registerTooltip = () => {},
    unregisterTooltip = () => {},
  }) => {
    // State for tooltip
    const [showTooltip, setShowTooltip] = useState(false);
    const tooltipTimerRef = useRef(null);

    // Calculate the points and center for this hexagon - memoized
    const { points, center } = useMemo(() => {
      const hexPoints = calculateHexPoints(q, r, size);
      const { x, y } = axialToPixel(q, r, size);
      return {
        points: pointsToSvgString(hexPoints),
        center: { x, y },
      };
    }, [q, r, size]);

    // Determine fill color based on territory type and state
    const getFillColor = () => {
      // Simply return a default color for debugging
      const defaultColor = "#31394a"; // Slate Gray

      // Default to unexplored if no territory info
      if (!territory.type) {
        return TERRITORY_COLORS.UNEXPLORED;
      }

      // Determine base color from territory type
      let baseColor;
      if (territory.isCapital) {
        baseColor = TERRITORY_COLORS.CAPITAL;
      } else if (territory.isOwned) {
        baseColor = TERRITORY_COLORS.OWNED;
      } else if (territory.isExplored) {
        baseColor = TERRITORY_COLORS.EXPLORED;
      } else if (territory.hasStrategicResource) {
        baseColor = TERRITORY_COLORS.STRATEGIC;
      } else if (territory.hasLuxuryResource) {
        baseColor = TERRITORY_COLORS.LUXURY;
      } else if (territory.hasDanger) {
        baseColor = TERRITORY_COLORS.DANGER;
      } else {
        baseColor = TERRITORY_COLORS.UNEXPLORED;
      }

      // Lighten color by 15% if hovered or selected
      if (selected || hovered) {
        // Convert hex to RGB
        const hex = baseColor.replace("#", "");
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);

        // Lighten by 15%
        const lightenFactor = 0.15;
        const newR = Math.min(255, Math.round(r + (255 - r) * lightenFactor));
        const newG = Math.min(255, Math.round(g + (255 - g) * lightenFactor));
        const newB = Math.min(255, Math.round(b + (255 - b) * lightenFactor));

        // Convert back to hex
        return `#${newR.toString(16).padStart(2, "0")}${newG
          .toString(16)
          .padStart(2, "0")}${newB.toString(16).padStart(2, "0")}`;
      }

      return baseColor;
    };

    // Determine stroke color and width based on territory state
    const getStrokeStyle = () => {
      const baseStrokeWidth = territory.isUnderAttack ? 3 : 2;
      const baseStrokeColor = territory.isUnderAttack ? "#ff5555" : "#454545";

      return {
        strokeWidth: baseStrokeWidth,
        stroke: baseStrokeColor,
      };
    };

    // Performance-optimized tooltip handling
    const handleHexMouseEnter = () => {
      // Call the original handler
      onMouseEnter({ q, r, territory });

      // Clear any existing timer
      if (tooltipTimerRef.current) {
        clearTimeout(tooltipTimerRef.current);
      }

      // Set a new timer to show tooltip after delay
      tooltipTimerRef.current = setTimeout(() => {
        setShowTooltip(true);

        const tooltipId = `tooltip-${q}-${r}`;
        registerTooltip(tooltipId, { q, r, center, territory });
      }, 800);
    };

    const handleHexMouseLeave = () => {
      // Call the original handler
      onMouseLeave({ q, r, territory });

      // Clear any existing timer
      if (tooltipTimerRef.current) {
        clearTimeout(tooltipTimerRef.current);
        tooltipTimerRef.current = null;
      }

      // Hide tooltip
      setShowTooltip(false);

      const tooltipId = `tooltip-${q}-${r}`;
      unregisterTooltip(tooltipId);
    };

    // Handle click event
    const handleHexClick = () => {
      onClick({ q, r, territory });
    };

    const { strokeWidth, stroke } = getStrokeStyle();
    const fillColor = getFillColor();

    return (
      <g
        onClick={handleHexClick}
        onMouseEnter={handleHexMouseEnter}
        onMouseLeave={handleHexMouseLeave}
        style={{ cursor: "pointer" }}
        data-testid={`hex-${q}-${r}`}
      >
        <polygon
          points={points}
          fill={fillColor}
          strokeWidth={strokeWidth}
          stroke={stroke}
        />

        {/* Render resource icon if the territory has resources */}
        {territory.resource && territory.isExplored && (
          <foreignObject
            x={center.x - 10}
            y={center.y - 10}
            width={20}
            height={20}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                height: "100%",
              }}
            >
              <span
                style={{
                  fontSize: "12px",
                  color: "#fff",
                  fontWeight: "bold",
                  textShadow: "0 0 3px black",
                }}
              >
                {territory.resource.slice(0, 1).toUpperCase()}
              </span>
            </div>
          </foreignObject>
        )}
      </g>
    );
  }
);

// Add display name for debugging
HexTile.displayName = "HexTile";

export default HexTile;
