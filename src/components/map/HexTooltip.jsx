// src/components/map/HexTooltip.jsx
import React, { useState, useCallback, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

/**
 * HexTooltip - A specialized tooltip implementation for hex tiles
 *
 * This tooltip component is specifically designed for the hex grid:
 * 1. Follows cursor movement across hexes
 * 2. Shows immediately on hover (with optional small delay)
 * 3. Positioned near the cursor for better usability
 * 4. Stays within viewport bounds
 */
const HexTooltip = ({
  isVisible,
  territory,
  mousePosition,
  q,
  r,
  delay = 50,
}) => {
  // State for controlling local visibility
  const [showTooltip, setShowTooltip] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  // Refs
  const tooltipRef = useRef(null);
  const showTimerRef = useRef(null);

  // Get or create portal container
  const getPortalContainer = () => {
    let container = document.getElementById("hex-tooltip-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "hex-tooltip-container";
      container.style.position = "fixed";
      container.style.top = "0";
      container.style.left = "0";
      container.style.pointerEvents = "none";
      container.style.zIndex = "10000";
      document.body.appendChild(container);
    }
    return container;
  };

  // Calculate tooltip position based on mouse position
  const updatePosition = useCallback(() => {
    if (!mousePosition) return;

    // Start with mouse position
    let x = mousePosition.x + 20; // Offset from cursor
    let y = mousePosition.y + 10;

    // Adjust position if tooltip would go off screen
    if (tooltipRef.current) {
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Keep tooltip within horizontal bounds
      if (x + tooltipRect.width > viewportWidth - 10) {
        x = mousePosition.x - tooltipRect.width - 10;
      }

      // Keep tooltip within vertical bounds
      if (y + tooltipRect.height > viewportHeight - 10) {
        y = viewportHeight - tooltipRect.height - 10;
      }
    }

    setPosition({ x, y });
  }, [mousePosition]);

  // Show tooltip after delay
  useEffect(() => {
    // Clear any existing timer
    if (showTimerRef.current) {
      clearTimeout(showTimerRef.current);
      showTimerRef.current = null;
    }

    if (isVisible) {
      // Set timer for showing tooltip
      showTimerRef.current = setTimeout(() => {
        setShowTooltip(true);
        updatePosition();
      }, delay);
    } else {
      // Hide tooltip immediately
      setShowTooltip(false);
    }

    // Cleanup
    return () => {
      if (showTimerRef.current) {
        clearTimeout(showTimerRef.current);
      }
    };
  }, [isVisible, delay, updatePosition]);

  // Update position when mouse moves
  useEffect(() => {
    if (showTooltip) {
      updatePosition();
    }
  }, [mousePosition, showTooltip, updatePosition]);

  // Don't render if not visible or no territory
  if (!showTooltip || !territory) return null;

  // Generate tooltip content based on territory
  const renderTooltipContent = () => {
    // For unexplored territory, show minimal info
    if (!territory.isExplored) {
      return (
        <div>
          <div style={{ fontWeight: "bold", marginBottom: "4px" }}>
            Unexplored Territory
          </div>
          <div style={{ fontSize: "12px" }}>
            Coordinates: ({q}, {r})
          </div>
        </div>
      );
    }

    return (
      <div>
        <div style={{ fontWeight: "bold", marginBottom: "4px" }}>
          Coordinates: ({q}, {r})
        </div>

        {territory.isCapital && (
          <div style={{ color: "#e6c570", marginBottom: "4px" }}>
            Capital Territory
          </div>
        )}

        {territory.type && territory.type !== "unexplored" && (
          <div style={{ marginBottom: "4px" }}>
            Type:{" "}
            {territory.type.charAt(0).toUpperCase() + territory.type.slice(1)}
          </div>
        )}

        {territory.resource && (
          <div style={{ marginBottom: "4px" }}>
            Resource: {territory.resource}
          </div>
        )}

        {territory.buildings && territory.buildings.length > 0 && (
          <div style={{ marginBottom: "4px" }}>
            Buildings: {territory.buildings.length}
          </div>
        )}

        {territory.isOwned && (
          <div style={{ color: "#7dce82" }}>Owned Territory</div>
        )}
      </div>
    );
  };

  // Portal the tooltip into the container
  return createPortal(
    <div
      ref={tooltipRef}
      style={{
        position: "fixed",
        left: `${position.x}px`,
        top: `${position.y}px`,
        backgroundColor: "#131e2d",
        color: "#e1e1e1",
        border: "1px solid #2a3c53",
        borderRadius: "4px",
        padding: "8px 12px",
        fontSize: "14px",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
        maxWidth: "250px",
        pointerEvents: "none",
        zIndex: 10000,
      }}
    >
      {renderTooltipContent()}
    </div>,
    getPortalContainer()
  );
};

export default React.memo(HexTooltip);
