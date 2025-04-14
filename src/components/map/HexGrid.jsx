import React, {
  useMemo,
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
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
      if (!panEnabled) return;

      setIsDragging(true);
      setDragStart({
        x: e.clientX - panOffset.x,
        y: e.clientY - panOffset.y,
      });
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
  }, []);

  // Handle wheel event for zooming
  const handleWheel = useCallback(
    (e) => {
      if (!zoomEnabled) return;

      e.preventDefault();

      // Calculate new zoom level (min: 0.5, max: 2)
      const delta = e.deltaY < 0 ? 0.1 : -0.1;
      const newZoomLevel = Math.max(0.5, Math.min(2, zoomLevel + delta));

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

    svg.addEventListener("wheel", handleWheel, { passive: false });
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      svg.removeEventListener("wheel", handleWheel);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [handleWheel, handleMouseUp, handleMouseMove]);

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
  const renderTooltips = () => {
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
  };

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
                registerTooltip={registerTooltip}
                unregisterTooltip={unregisterTooltip}
              />
            );
          })}
        </g>

        {/* Render tooltips on top level */}
        <g className="tooltips-layer">{renderTooltips()}</g>
      </svg>
    </div>
  );
};

export default React.memo(HexGrid);
