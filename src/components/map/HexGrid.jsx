import React, { useMemo, useState, useRef, useEffect } from "react";
import HexTile from "./HexTile";
import {
  generateHexGrid,
  calculateBoundingBox,
  hexToId,
} from "../../utils/hexUtils";

/**
 * HexGrid component renders the game map as a collection of hexagonal territories
 */
const HexGrid = ({
  radius = 5,
  hexSize = 40,
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

  // State for pan and zoom functionality
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const svgRef = useRef(null);

  // Handle mouse down for panning
  const handleMouseDown = (e) => {
    if (!panEnabled) return;

    setIsDragging(true);
    setDragStart({
      x: e.clientX - panOffset.x,
      y: e.clientY - panOffset.y,
    });
  };

  // Handle mouse move for panning
  const handleMouseMove = (e) => {
    if (!isDragging || !panEnabled) return;

    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  // Handle mouse up to end panning
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle wheel event for zooming
  const handleWheel = (e) => {
    if (!zoomEnabled) return;

    e.preventDefault();

    // Calculate new zoom level (min: 0.5, max: 2)
    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    const newZoomLevel = Math.max(0.5, Math.min(2, zoomLevel + delta));

    setZoomLevel(newZoomLevel);
  };

  // Add event listeners for pan/zoom
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
  }, [isDragging, dragStart, panOffset, zoomLevel]);

  // Determine the SVG viewBox
  const viewBox = useMemo(() => {
    // Add some padding around the grid
    const paddingX = width * 0.1;
    const paddingY = height * 0.1;

    return `${minX - paddingX} ${minY - paddingY} ${width + paddingX * 2} ${
      height + paddingY * 2
    }`;
  }, [minX, minY, width, height]);

  return (
    <div
      className="hex-grid-container"
      style={{ width: "100%", height: "100%", overflow: "hidden" }}
    >
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid meet"
        onMouseDown={handleMouseDown}
        style={{ cursor: isDragging ? "grabbing" : "grab" }}
      >
        {/* Apply pan and zoom transformations */}
        <g
          transform={`translate(${panOffset.x}, ${panOffset.y}) scale(${zoomLevel})`}
        >
          {/* Render each hex in the grid */}
          {hexes.map((hex) => {
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
                onMouseEnter={() => setHoveredHex(hex)}
                onMouseLeave={() => setHoveredHex(null)}
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
};

export default HexGrid;
