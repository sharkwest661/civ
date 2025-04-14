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
} from "../../utils/hexUtils";
import { MAP_CONFIG } from "../../constants/gameConstants";

/**
 * HexGrid component renders the game map as a collection of hexagonal territories
 * Fixed to ensure proper rendering of the hex map
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

    // State for tracking active tooltips
    const [activeTooltips, setActiveTooltips] = useState({});

    // State for pan and zoom functionality
    const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
    const [zoomLevel, setZoomLevel] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const svgRef = useRef(null);

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

    // Add event listeners for pan/zoom
    useEffect(() => {
      const svg = svgRef.current;
      if (!svg) return;

      // Only add wheel listener this way because React doesn't support passive:false
      svg.addEventListener("wheel", handleWheel, { passive: false });
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("mousemove", handleMouseMove);

      return () => {
        svg.removeEventListener("wheel", handleWheel);
        document.removeEventListener("mouseup", handleMouseUp);
        document.removeEventListener("mousemove", handleMouseMove);
      };
    }, [handleWheel, handleMouseUp, handleMouseMove]);

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

        return (
          <HexTile
            key={hexId}
            q={hex.q}
            r={hex.r}
            size={hexSize}
            territory={territory}
            selected={isSelected}
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
        >
          {/* Apply pan and zoom transformations */}
          <g
            transform={`translate(${panOffset.x}, ${panOffset.y}) scale(${zoomLevel})`}
          >
            {/* Render all hexes */}
            {renderHexes()}
          </g>

          {/* Render tooltips on top level */}
          <g className="tooltips-layer">{renderTooltips()}</g>
        </svg>
      </Box>
    );
  }
);

// Add display name for debugging
HexGrid.displayName = "HexGrid";

export default HexGrid;
