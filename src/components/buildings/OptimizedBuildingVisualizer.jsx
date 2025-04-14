// src/components/buildings/OptimizedBuildingVisualizer.jsx
import React, { useMemo } from "react";
import { Box } from "@chakra-ui/react";
import { axialToPixel } from "../../utils/hexUtils";
import OptimizedTooltip from "../ui/OptimizedTooltip";

/**
 * OptimizedBuildingVisualizer component for efficiently rendering buildings on the map
 *
 * This component provides several performance optimizations:
 * 1. Uses lightweight SVG elements instead of complex DOM structures
 * 2. Implements optimized rendering based on zoom level (LOD)
 * 3. Only renders buildings that are in view (via parent's virtualization)
 * 4. Uses memoization to prevent re-renders for unchanged data
 * 5. Batches SVG updates to minimize DOM operations
 *
 * @param {Object} props
 * @param {Object} props.territory - Territory data
 * @param {number} props.q - Q coordinate in axial coordinate system
 * @param {number} props.r - R coordinate in axial coordinate system
 * @param {number} props.hexSize - Size of hex (affects building placement)
 * @param {number} props.zoomLevel - Current zoom level (for LOD rendering)
 */
const OptimizedBuildingVisualizer = React.memo(
  ({ territory, q, r, hexSize, zoomLevel = 1 }) => {
    // Only render if territory has buildings and is owned
    if (
      !territory ||
      !territory.buildings ||
      !territory.buildings.length ||
      !territory.isOwned
    ) {
      return null;
    }

    // Calculate hex center for positioning buildings
    const center = useMemo(() => {
      return axialToPixel(q, r, hexSize);
    }, [q, r, hexSize]);

    // Determine building rendering detail based on zoom level
    const renderingDetail = useMemo(() => {
      // High detail when zoomed in, low detail when zoomed out
      if (zoomLevel >= 1.2) return "high";
      if (zoomLevel >= 0.8) return "medium";
      return "low";
    }, [zoomLevel]);

    // Generate building colors based on type
    const getBuildingColor = (type) => {
      switch (type) {
        case "farm":
          return "#7dce82"; // Green
        case "mine":
          return "#d68c45"; // Orange
        case "library":
          return "#5ea8ed"; // Blue
        case "market":
          return "#e9d16c"; // Yellow
        case "center":
          return "#e6c570"; // Gold
        default:
          return "#8a9bbd"; // Gray
      }
    };

    // Generate building icons based on type and detail level
    const renderBuildings = () => {
      // Calculate building spacing
      const buildingCount = territory.buildings.length;
      const maxBuildings = renderingDetail === "low" ? 1 : 3;
      const displayedBuildings = Math.min(buildingCount, maxBuildings);

      // If very zoomed out, just show a single indicator
      if (renderingDetail === "low") {
        return (
          <OptimizedTooltip
            label={`${buildingCount} building${
              buildingCount !== 1 ? "s" : ""
            } (${territory.buildings.map((b) => b.name).join(", ")})`}
            delay={300}
          >
            <circle
              cx={center.x}
              cy={center.y}
              r={hexSize * 0.15}
              fill="#e1e1e1"
              strokeWidth={1}
              stroke="#2a3c53"
            />
          </OptimizedTooltip>
        );
      }

      // Medium and high detail - position buildings strategically
      return territory.buildings
        .slice(0, displayedBuildings)
        .map((building, index) => {
          // Position in a grid pattern
          const offset =
            (index - (displayedBuildings - 1) / 2) * (hexSize * 0.35);
          const x = center.x + offset;
          const y = center.y;
          const buildingColor = getBuildingColor(building.type);

          // Generate tooltip content
          const tooltipContent = (
            <Box p={2}>
              <Box fontWeight="bold" mb={1}>
                {building.name}
              </Box>
              <Box fontSize="sm">Level: {building.level || 1}</Box>
              {building.workers && (
                <Box fontSize="sm">Workers: {building.workers.length}</Box>
              )}
            </Box>
          );

          // Determine building icon to render based on detail level
          return (
            <OptimizedTooltip
              key={`building-${index}`}
              label={tooltipContent}
              delay={300}
            >
              <g>
                {/* Building shape based on type */}
                {building.type === "farm" && (
                  <rect
                    x={x - hexSize * 0.12}
                    y={y - hexSize * 0.12}
                    width={hexSize * 0.24}
                    height={hexSize * 0.24}
                    fill={buildingColor}
                    strokeWidth={1}
                    stroke="#2a3c53"
                    rx={1}
                  />
                )}

                {building.type === "mine" && (
                  <polygon
                    points={`
                  ${x},${y - hexSize * 0.15}
                  ${x - hexSize * 0.13},${y + hexSize * 0.07}
                  ${x + hexSize * 0.13},${y + hexSize * 0.07}
                `}
                    fill={buildingColor}
                    strokeWidth={1}
                    stroke="#2a3c53"
                  />
                )}

                {building.type === "library" && (
                  <rect
                    x={x - hexSize * 0.12}
                    y={y - hexSize * 0.15}
                    width={hexSize * 0.24}
                    height={hexSize * 0.3}
                    fill={buildingColor}
                    strokeWidth={1}
                    stroke="#2a3c53"
                    rx={hexSize * 0.04}
                  />
                )}

                {building.type === "market" && (
                  <circle
                    cx={x}
                    cy={y}
                    r={hexSize * 0.13}
                    fill={buildingColor}
                    strokeWidth={1}
                    stroke="#2a3c53"
                  />
                )}

                {building.type === "center" && (
                  <polygon
                    points={`
                  ${x},${y - hexSize * 0.15}
                  ${x - hexSize * 0.15},${y}
                  ${x},${y + hexSize * 0.15}
                  ${x + hexSize * 0.15},${y}
                `}
                    fill={buildingColor}
                    strokeWidth={1}
                    stroke="#2a3c53"
                  />
                )}

                {/* Default shape for other building types */}
                {!["farm", "mine", "library", "market", "center"].includes(
                  building.type
                ) && (
                  <rect
                    x={x - hexSize * 0.12}
                    y={y - hexSize * 0.12}
                    width={hexSize * 0.24}
                    height={hexSize * 0.24}
                    fill={buildingColor}
                    strokeWidth={1}
                    stroke="#2a3c53"
                  />
                )}

                {/* Building level indicator (high detail only) */}
                {renderingDetail === "high" && building.level > 1 && (
                  <text
                    x={x}
                    y={y + hexSize * 0.05}
                    fontSize={hexSize * 0.14}
                    fill="#ffffff"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontWeight="bold"
                  >
                    {building.level}
                  </text>
                )}
              </g>
            </OptimizedTooltip>
          );
        });
    };

    return <g className="building-visualizer">{renderBuildings()}</g>;
  }
);

// Add display name for debugging
OptimizedBuildingVisualizer.displayName = "OptimizedBuildingVisualizer";

export default OptimizedBuildingVisualizer;
