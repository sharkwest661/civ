// src/components/map/HexTile.jsx
import React, { useMemo, useState, useRef, useCallback } from "react";
import {
  calculateHexPoints,
  pointsToSvgString,
  axialToPixel,
} from "../../utils/hexUtils";
import {
  getTerritoryFillColor,
  getTerritoryStrokeStyle,
} from "../../utils/gameUtils";
import { ariaLabels } from "../../utils/accessibilityUtils";

/**
 * HexTile component represents a single hexagonal territory on the game map
 * Enhanced with accessibility features and proper selection animation
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

    // Get fill color and stroke style using utility functions
    const fillColor = getTerritoryFillColor(territory, selected, hovered);
    const { strokeWidth, stroke } = getTerritoryStrokeStyle(territory);

    // Generate accessible name for territory
    const ariaLabel = ariaLabels.territory(territory, q, r);

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

    // Handle keyboard events for accessibility
    const handleKeyDown = (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onClick({ q, r, territory });
      }
    };

    return (
      <g
        // Accessible attributes
        role="button"
        tabIndex={0}
        aria-label={ariaLabel}
        aria-selected={selected}
        aria-pressed={selected}
        data-q={q}
        data-r={r}
        // Event handlers
        onClick={handleHexClick}
        onMouseEnter={handleHexMouseEnter}
        onMouseLeave={handleHexMouseLeave}
        onKeyDown={handleKeyDown}
        onFocus={handleHexMouseEnter}
        onBlur={handleHexMouseLeave}
        // Styling
        style={{
          cursor: "pointer",
          outline: "none", // We'll handle focus visually with other properties
        }}
        data-testid={`hex-${q}-${r}`}
      >
        {/* Base hex tile */}
        <polygon
          points={points}
          fill={fillColor}
          strokeWidth={selected || hovered ? strokeWidth + 1 : strokeWidth}
          stroke={selected ? "#e6c570" : stroke} // Use accent color for selected territories
          style={{
            transition: "stroke-width 0.2s, stroke 0.2s",
          }}
        />

        {/* Selection indicator - outer glow effect */}
        {selected && (
          <polygon
            points={points}
            fill="none"
            stroke="#e6c570"
            strokeWidth={3}
            style={{
              opacity: 0.6,
              filter: "drop-shadow(0 0 3px #e6c570)",
              animation: "pulse 2s infinite",
            }}
          />
        )}

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
                pointerEvents: "none", // Prevents capturing mouse events from the hex
              }}
              aria-hidden="true" // Hide from screen readers since it's decorative
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
