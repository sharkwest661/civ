// src/components/map/HexGrid.jsx
import React, {
  useMemo,
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { Box } from "@chakra-ui/react";
import HexTile from "./HexTile";
import {
  generateHexGrid,
  calculateBoundingBox,
  hexToId,
  getNeighbors, // Make sure this is in hexUtils.js or add it
} from "../../utils/hexUtils";
import { MAP_CONFIG } from "../../constants/gameConstants";

/**
 * HexGrid component renders the game map as a collection of hexagonal territories
 * Enhanced with keyboard navigation support
 */
const HexGrid = React.memo(
  ({
    radius = MAP_CONFIG.DEFAULT_RADIUS,
    hexSize = MAP_CONFIG.DEFAULT_HEX_SIZE,
    territories = {},
    onHexClick = () => {},
    selectedHex = null,
    panEnabled = true,
    zoomEnabled = true,
  }) => {
    // Generate the grid of hexes
    const hexes = useMemo(() => generateHexGrid(radius), [radius]);

    // Calculate the SVG dimensions based on hex grid
    const { minX, minY, width, height } = useMemo(
      () => calculateBoundingBox(hexes, hexSize),
      [hexes, hexSize]
    );

    // State for tracking the hovered hex
    const [hoveredHex, setHoveredHex] = useState(null);

    // State for tracking the currently focused hex for keyboard navigation
    const [focusedHex, setFocusedHex] = useState(
      selectedHex || (hexes.length > 0 ? hexes[0] : null)
    );

    // State for tracking active tooltips
    const [activeTooltips, setActiveTooltips] = useState({});

    // State for pan and zoom functionality
    const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
    const [zoomLevel, setZoomLevel] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const svgRef = useRef(null);
    const gridRef = useRef(null);

    // Update focused hex when selected hex changes
    useEffect(() => {
      if (selectedHex) {
        setFocusedHex(selectedHex);
      }
    }, [selectedHex]);

    // Handle mouse down for panning
    const handleMouseDown = useCallback(
      (e) => {
        if (!panEnabled || e.button !== 0) return; // Only handle left mouse button

        setIsDragging(true);
        setDragStart({
          x: e.clientX - panOffset.x,
          y: e.clientY - panOffset.y,
        });

        // Change cursor style
        if (svgRef.current) {
          svgRef.current.style.cursor = "grabbing";
        }

        e.preventDefault(); // Prevent text selection while dragging
      },
      [panEnabled, panOffset]
    );

    // Handle mouse move for panning
    const handleMouseMove = useCallback(
      (e) => {
        if (!isDragging || !panEnabled) return;

        setPanOffset({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        });
      },
      [isDragging, panEnabled, dragStart]
    );

    // Handle mouse up to end panning
    const handleMouseUp = useCallback(() => {
      setIsDragging(false);

      // Reset cursor style
      if (svgRef.current) {
        svgRef.current.style.cursor = "grab";
      }
    }, []);

    // Handle wheel event for zooming
    const handleWheel = useCallback(
      (e) => {
        if (!zoomEnabled) return;

        e.preventDefault();

        // Calculate zoom direction
        const delta =
          e.deltaY < 0 ? MAP_CONFIG.ZOOM_STEP : -MAP_CONFIG.ZOOM_STEP;

        // Calculate new zoom level with limits
        const newZoomLevel = Math.max(
          MAP_CONFIG.MIN_ZOOM,
          Math.min(MAP_CONFIG.MAX_ZOOM, zoomLevel + delta)
        );

        setZoomLevel(newZoomLevel);
      },
      [zoomEnabled, zoomLevel]
    );

    // Register a tooltip
    const registerTooltip = useCallback((tooltipId, tooltipData) => {
      setActiveTooltips((prev) => ({
        ...prev,
        [tooltipId]: tooltipData,
      }));
    }, []);

    // Unregister a tooltip
    const unregisterTooltip = useCallback((tooltipId) => {
      setActiveTooltips((prev) => {
        const newTooltips = { ...prev };
        delete newTooltips[tooltipId];
        return newTooltips;
      });
    }, []);

    // Handle keyboard navigation
    const handleKeyDown = useCallback(
      (e) => {
        if (!focusedHex) return;

        const { q, r } = focusedHex;
        let newQ = q;
        let newR = r;

        // Hex grid keyboard navigation
        // This uses the axial coordinate system for hex grids
        switch (e.key) {
          // For even-q offset grid (adjust if using a different offset)
          case "ArrowRight":
            newQ += 1;
            break;
          case "ArrowLeft":
            newQ -= 1;
            break;
          case "ArrowUp":
            if (q % 2 === 0) {
              newR -= 1;
            } else {
              newR -= 1;
              newQ += 0; // No change in q
            }
            break;
          case "ArrowDown":
            if (q % 2 === 0) {
              newR += 1;
            } else {
              newR += 1;
              newQ += 0; // No change in q
            }
            break;
          case "Enter":
          case " ":
            e.preventDefault();
            if (focusedHex) {
              onHexClick({
                q: focusedHex.q,
                r: focusedHex.r,
                territory: territories[hexToId(focusedHex)] || {},
              });
            }
            break;
          default:
            return; // Exit if not handling this key
        }

        // Find if the new coordinates match a valid hex
        const targetHexId = `${newQ},${newR}`;
        const hexExists = hexes.some((hex) => hexToId(hex) === targetHexId);

        if (hexExists) {
          e.preventDefault(); // Prevent default only if we're handling this
          const newHex = { q: newQ, r: newR };
          setFocusedHex(newHex);

          // Programmatically focus the element
          const hexElement = document.querySelector(
            `[data-q="${newQ}"][data-r="${newR}"]`
          );
          if (hexElement) {
            hexElement.focus();
          }
        }
      },
      [focusedHex, hexes, onHexClick, territories]
    );

    // Add event listeners for pan/zoom and keyboard navigation
    useEffect(() => {
      const svg = svgRef.current;
      if (!svg) return;

      // Only add wheel listener this way because React doesn't support passive:false
      svg.addEventListener("wheel", handleWheel, { passive: false });
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("mousemove", handleMouseMove);

      // Add keyboard navigation to the SVG element
      svg.addEventListener("keydown", handleKeyDown);

      return () => {
        svg.removeEventListener("wheel", handleWheel);
        document.removeEventListener("mouseup", handleMouseUp);
        document.removeEventListener("mousemove", handleMouseMove);
        svg.removeEventListener("keydown", handleKeyDown);
      };
    }, [handleWheel, handleMouseUp, handleMouseMove, handleKeyDown]);

    // Handle hex mouse enter
    const handleHexEnter = useCallback((hex) => {
      setHoveredHex(hex);
    }, []);

    // Handle hex mouse leave
    const handleHexLeave = useCallback(() => {
      setHoveredHex(null);
    }, []);

    // Determine the SVG viewBox
    const viewBox = useMemo(() => {
      // Add some padding around the grid
      const paddingX = width * 0.1;
      const paddingY = height * 0.1;

      return `${minX - paddingX} ${minY - paddingY} ${width + paddingX * 2} ${
        height + paddingY * 2
      }`;
    }, [minX, minY, width, height]);

    // Render tooltips
    const renderTooltips = useCallback(() => {
      return Object.values(activeTooltips).map((tooltipData) => {
        const { q, r, center, territory } = tooltipData;

        if (!territory.isExplored) return null;

        const tooltipWidth = 200;
        const tooltipHeight = territory.resource ? 120 : 90;
        const tooltipX = center.x - tooltipWidth / 2;
        const tooltipY = center.y - tooltipHeight - 15; // Position above the hex

        return (
          <foreignObject
            key={`tooltip-${q}-${r}`}
            x={tooltipX}
            y={tooltipY}
            width={tooltipWidth}
            height={tooltipHeight}
            style={{ pointerEvents: "none" }}
          >
            <div
              style={{
                backgroundColor: "#131e2d",
                border: "1px solid #2a3c53",
                borderRadius: "4px",
                padding: "8px",
                color: "#e1e1e1",
                fontSize: "15px",
                pointerEvents: "none",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                zIndex: 100, // Ensure the tooltip has a high z-index
              }}
              role="tooltip"
              id={`tooltip-${q}-${r}`}
            >
              <div style={{ fontWeight: "bold", marginBottom: "4px" }}>
                Coordinates: ({q}, {r})
              </div>
              {territory.isCapital && (
                <div style={{ color: "#e6c570", marginBottom: "4px" }}>
                  Capital
                </div>
              )}
              {territory.type && territory.type !== "unexplored" && (
                <div style={{ marginBottom: "4px" }}>
                  Type:{" "}
                  {territory.type.charAt(0).toUpperCase() +
                    territory.type.slice(1)}
                </div>
              )}
              {territory.resource && (
                <div style={{ marginBottom: "4px" }}>
                  Resource: {territory.resource}
                </div>
              )}
              {territory.isOwned && (
                <div style={{ color: "#7dce82" }}>Owned Territory</div>
              )}
            </div>
          </foreignObject>
        );
      });
    }, [activeTooltips]);

    // Render all hexes without virtualization for now
    const renderHexes = useCallback(() => {
      return hexes.map((hex) => {
        const hexId = hexToId(hex);
        const territory = territories[hexId] || {};
        const isSelected = selectedHex
          ? selectedHex.q === hex.q && selectedHex.r === hex.r
          : false;
        const isHovered = hoveredHex
          ? hoveredHex.q === hex.q && hoveredHex.r === hex.r
          : false;
        const isFocused = focusedHex
          ? focusedHex.q === hex.q && focusedHex.r === hex.r
          : false;

        return (
          <HexTile
            key={hexId}
            q={hex.q}
            r={hex.r}
            size={hexSize}
            territory={territory}
            selected={isSelected || isFocused}
            hovered={isHovered}
            onClick={onHexClick}
            onMouseEnter={handleHexEnter}
            onMouseLeave={handleHexLeave}
            registerTooltip={registerTooltip}
            unregisterTooltip={unregisterTooltip}
          />
        );
      });
    }, [
      hexes,
      territories,
      hexSize,
      selectedHex,
      hoveredHex,
      focusedHex,
      onHexClick,
      handleHexEnter,
      handleHexLeave,
      registerTooltip,
      unregisterTooltip,
    ]);

    return (
      <Box
        className="hex-grid-container"
        width="100%"
        height="100%"
        overflow="hidden"
        position="relative"
        data-testid="hex-grid"
      >
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          viewBox={viewBox}
          preserveAspectRatio="xMidYMid meet"
          onMouseDown={handleMouseDown}
          style={{
            cursor: isDragging ? "grabbing" : "grab",
            touchAction: "none", // Disable browser gestures
          }}
          data-testid="hex-grid-svg"
          aria-label="Game map"
          role="application"
          aria-roledescription="Hexagonal grid map"
          tabIndex="0" // Make SVG focusable
          aria-activedescendant={
            focusedHex ? `hex-${focusedHex.q}-${focusedHex.r}` : undefined
          }
        >
          {/* Apply pan and zoom transformations */}
          <g
            ref={gridRef}
            transform={`translate(${panOffset.x}, ${panOffset.y}) scale(${zoomLevel})`}
            role="grid"
            aria-label="Map grid"
          >
            {/* Render all hexes */}
            {renderHexes()}
          </g>

          {/* Render tooltips on top level */}
          <g className="tooltips-layer" aria-hidden="true">
            {renderTooltips()}
          </g>

          {/* Descriptive title for screen readers */}
          <title>Empire's Legacy Game Map</title>
          <desc>
            Hexagonal map grid showing territories, resources, and buildings in
            Empire's Legacy strategy game.
          </desc>
        </svg>

        {/* Skip link target */}
        <div
          id="map-controls"
          style={{ position: "absolute", top: "-9999px" }}
          tabIndex="-1"
        >
          <p className="sr-only">
            Use arrow keys to navigate the map. Press Enter or Space to select a
            territory.
          </p>
        </div>
      </Box>
    );
  }
);

// Add display name for debugging
HexGrid.displayName = "HexGrid";

export default HexGrid;
