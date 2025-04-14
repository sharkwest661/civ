// src/components/map/VirtualizedHexGrid.jsx
import React, {
  useMemo,
  useState,
  useRef,
  useCallback,
  useEffect,
} from "react";
import { Box, Text } from "@chakra-ui/react";
import {
  generateHexGrid,
  calculateBoundingBox,
  axialToPixel,
  pixelToAxial,
  hexToId,
} from "../../utils/hexUtils";
import { MAP_CONFIG } from "../../constants/gameConstants";
import HexTile from "./HexTile";
import HexTooltip from "./HexTooltip";

/**
 * VirtualizedHexGrid component renders only the visible portion of the game map
 * for significant performance improvements over rendering the entire grid
 *
 * Fixed to properly handle selection and ensure each rendered element has a unique key
 */
const VirtualizedHexGrid = React.memo(
  ({
    radius = MAP_CONFIG.DEFAULT_RADIUS,
    hexSize = MAP_CONFIG.DEFAULT_HEX_SIZE,
    territories = {},
    onHexClick = () => {},
    selectedHex = null,
    panEnabled = true,
    zoomEnabled = true,
    renderCustomTile = null,
  }) => {
    // Generate the full grid of hexes (but we'll only render visible ones)
    const allHexes = useMemo(() => generateHexGrid(radius), [radius]);

    // Calculate the SVG dimensions based on hex grid
    const { minX, minY, width, height } = useMemo(
      () => calculateBoundingBox(allHexes, hexSize),
      [allHexes, hexSize]
    );

    // State for tracking the hovered hex
    const [hoveredHex, setHoveredHex] = useState(null);

    // State for tracking mouse position for tooltips
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    // State for pan and zoom functionality
    const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
    const [zoomLevel, setZoomLevel] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [viewportDimensions, setViewportDimensions] = useState({
      width: 0,
      height: 0,
    });

    const svgRef = useRef(null);
    const containerRef = useRef(null);

    // Update viewport dimensions when container size changes
    useEffect(() => {
      if (!containerRef.current) return;

      const updateViewportDimensions = () => {
        if (containerRef.current) {
          const { width, height } =
            containerRef.current.getBoundingClientRect();
          setViewportDimensions({ width, height });
        }
      };

      // Initial update
      updateViewportDimensions();

      // Set up resize observer
      const resizeObserver = new ResizeObserver(updateViewportDimensions);
      resizeObserver.observe(containerRef.current);

      return () => {
        if (containerRef.current) {
          resizeObserver.unobserve(containerRef.current);
        }
      };
    }, []);

    // Track mouse movement across the entire SVG
    const handleMouseMove = useCallback(
      (e) => {
        // Only update mouse position for tooltip if we're not dragging
        if (!isDragging) {
          setMousePosition({ x: e.clientX, y: e.clientY });
        }

        // Handle dragging logic
        if (isDragging && panEnabled) {
          setPanOffset({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y,
          });
        }
      },
      [isDragging, panEnabled, dragStart]
    );

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

        // Calculate zoom center point
        const rect = svgRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Adjust pan offset to zoom toward mouse position
        if (newZoomLevel !== zoomLevel) {
          const zoomRatio = newZoomLevel / zoomLevel;

          // Calculate new pan offset that keeps the point under the mouse in the same relative position
          setPanOffset({
            x: mouseX - (mouseX - panOffset.x) * zoomRatio,
            y: mouseY - (mouseY - panOffset.y) * zoomRatio,
          });

          setZoomLevel(newZoomLevel);
        }
      },
      [zoomEnabled, zoomLevel, panOffset]
    );

    // Handle hex mouse enter
    const handleHexEnter = useCallback((hex) => {
      setHoveredHex(hex);
    }, []);

    // Handle hex mouse leave
    const handleHexLeave = useCallback(() => {
      setHoveredHex(null);
    }, []);

    // Calculate visible hexes based on current viewport, pan, and zoom
    const visibleHexes = useMemo(() => {
      if (!viewportDimensions.width || !viewportDimensions.height) return [];

      // Calculate view boundaries in SVG coordinates
      const viewBox = svgRef.current?.viewBox?.baseVal;
      if (!viewBox) return [];

      // Calculate viewport boundaries in world coordinates
      const scale = 1 / zoomLevel;
      const viewMinX = (viewBox.x - panOffset.x) * scale;
      const viewMinY = (viewBox.y - panOffset.y) * scale;
      const viewMaxX = viewMinX + viewBox.width * scale;
      const viewMaxY = viewMinY + viewBox.height * scale;

      // Add padding to prevent pop-in during panning (render slightly more than visible)
      const paddingX = (viewMaxX - viewMinX) * 0.5;
      const paddingY = (viewMaxY - viewMinY) * 0.5;

      // Filter hexes to only include those in the visible area (with padding)
      return allHexes.filter((hex) => {
        const { x, y } = axialToPixel(hex.q, hex.r, hexSize);
        return (
          x >= viewMinX - paddingX &&
          x <= viewMaxX + paddingX &&
          y >= viewMinY - paddingY &&
          y <= viewMaxY + paddingY
        );
      });
    }, [allHexes, hexSize, panOffset, zoomLevel, viewportDimensions]);

    // Determine the SVG viewBox
    const viewBox = useMemo(() => {
      // Add some padding around the grid
      const paddingX = width * 0.1;
      const paddingY = height * 0.1;

      return `${minX - paddingX} ${minY - paddingY} ${width + paddingX * 2} ${
        height + paddingY * 2
      }`;
    }, [minX, minY, width, height]);

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

    // Render visible hexes
    const renderHexes = useCallback(() => {
      return visibleHexes.map((hex) => {
        const hexId = hexToId(hex);
        const territory = territories[hexId] || {};
        const isSelected = selectedHex
          ? selectedHex.q === hex.q && selectedHex.r === hex.r
          : false;
        const isHovered = hoveredHex
          ? hoveredHex.q === hex.q && hoveredHex.r === hex.r
          : false;

        // Use custom tile renderer if provided
        if (renderCustomTile) {
          // Important fix: Add a key prop to the custom rendered tile
          return (
            <React.Fragment key={hexId}>
              {renderCustomTile(
                hex,
                hexSize,
                territory,
                isSelected,
                isHovered,
                zoomLevel,
                // Important fix: Pass the click handler to the custom tile renderer
                onHexClick,
                handleHexEnter,
                handleHexLeave
              )}
            </React.Fragment>
          );
        }

        // Otherwise, render standard hex tile
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
          />
        );
      });
    }, [
      visibleHexes,
      territories,
      hexSize,
      selectedHex,
      hoveredHex,
      onHexClick,
      handleHexEnter,
      handleHexLeave,
      renderCustomTile,
      zoomLevel,
    ]);

    // Development count of visible hexes (for performance monitoring)
    useEffect(() => {
      if (process.env.NODE_ENV === "development") {
        console.log(
          `Rendering ${visibleHexes.length} of ${
            allHexes.length
          } hexes (${Math.round(
            (visibleHexes.length / allHexes.length) * 100
          )}%)`
        );
      }
    }, [visibleHexes.length, allHexes.length]);

    return (
      <Box
        ref={containerRef}
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
            {/* Render only visible hexes */}
            {renderHexes()}
          </g>
        </svg>

        {/* Specialized hex tooltip that follows cursor */}
        {hoveredHex && (
          <HexTooltip
            isVisible={!!hoveredHex}
            territory={
              hoveredHex ? territories[hexToId(hoveredHex)] || {} : null
            }
            mousePosition={mousePosition}
            q={hoveredHex?.q}
            r={hoveredHex?.r}
            delay={100}
          />
        )}

        {/* Debug info */}
        {process.env.NODE_ENV === "development" && (
          <Box
            position="absolute"
            top="10px"
            left="10px"
            bg="rgba(0,0,0,0.7)"
            color="white"
            p={2}
            borderRadius="md"
            fontSize="xs"
            pointerEvents="none"
          >
            <Text>
              Hexes: {visibleHexes.length} / {allHexes.length}
            </Text>
            <Text>Zoom: {zoomLevel.toFixed(2)}x</Text>
            {hoveredHex && (
              <Text>
                Hover: ({hoveredHex.q}, {hoveredHex.r})
              </Text>
            )}
            {selectedHex && (
              <Text>
                Selected: ({selectedHex.q}, {selectedHex.r})
              </Text>
            )}
          </Box>
        )}
      </Box>
    );
  }
);

// Add display name for debugging
VirtualizedHexGrid.displayName = "VirtualizedHexGrid";

export default VirtualizedHexGrid;
