// src/components/map/SimpleMapView.jsx
import React, { useState, useMemo, useCallback } from "react";
import { Box, Text, Heading, Flex } from "@chakra-ui/react";
import {
  generateHexGrid,
  calculateBoundingBox,
  hexToId,
} from "../../utils/hexUtils";
import { useMapStore } from "../../stores/mapStore";
import SharedPanel from "../ui/SharedPanel";
import HexTile from "./HexTile";

/**
 * SimpleMapView - A simplified map view component that avoids custom hooks
 * to eliminate infinite update loops
 */
const SimpleMapView = ({
  onTerritorySelect = () => {},
  currentPlayer = {},
}) => {
  // Local state
  const [selectedHex, setSelectedHex] = useState(null);
  const [hoveredHex, setHoveredHex] = useState(null);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [zoomLevel, setZoomLevel] = useState(1);

  // Get state directly from the store - no custom hooks
  const territories = useMapStore((state) => state.territories);
  const storeSelectedTerritory = useMapStore(
    (state) => state.selectedTerritory
  );
  const selectTerritory = useMapStore((state) => state.selectTerritory);

  // Create a grid of hexes with a fixed radius
  const hexes = useMemo(() => generateHexGrid(7), []);

  // Calculate the SVG dimensions
  const { minX, minY, width, height } = useMemo(
    () => calculateBoundingBox(hexes, 40),
    [hexes]
  );

  // Calculate SVG viewBox
  const viewBox = useMemo(() => {
    const paddingX = width * 0.1;
    const paddingY = height * 0.1;
    return `${minX - paddingX} ${minY - paddingY} ${width + paddingX * 2} ${
      height + paddingY * 2
    }`;
  }, [minX, minY, width, height]);

  // Handle hex click
  const handleHexClick = useCallback(
    (hex) => {
      setSelectedHex(hex);
      selectTerritory(hex);
      onTerritorySelect(hex);
    },
    [onTerritorySelect, selectTerritory]
  );

  // Handle hex mouse enter
  const handleHexEnter = useCallback((hex) => {
    setHoveredHex(hex);
  }, []);

  // Handle hex mouse leave
  const handleHexLeave = useCallback(() => {
    setHoveredHex(null);
  }, []);

  // Filter territories for player visibility - direct calculation, no hooks
  const visibleTerritories = {};
  Object.entries(territories).forEach(([id, territory]) => {
    if (territory.owner === currentPlayer.id) {
      visibleTerritories[id] = { ...territory, isOwned: true };
    } else if (territory.isExplored) {
      visibleTerritories[id] = { ...territory };
    } else {
      visibleTerritories[id] = { type: "unexplored" };
    }
  });

  return (
    <Box className="map-view" width="100%" height="100%" position="relative">
      <svg
        width="100%"
        height="100%"
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid meet"
      >
        <g
          transform={`translate(${panOffset.x}, ${panOffset.y}) scale(${zoomLevel})`}
        >
          {hexes.map((hex) => {
            const hexId = hexToId(hex);
            const territory = visibleTerritories[hexId] || {};
            const isSelected =
              selectedHex && selectedHex.q === hex.q && selectedHex.r === hex.r;
            const isHovered =
              hoveredHex && hoveredHex.q === hex.q && hoveredHex.r === hex.r;

            return (
              <HexTile
                key={hexId}
                q={hex.q}
                r={hex.r}
                size={40}
                territory={territory}
                selected={isSelected}
                hovered={isHovered}
                onClick={handleHexClick}
                onMouseEnter={handleHexEnter}
                onMouseLeave={handleHexLeave}
              />
            );
          })}
        </g>
      </svg>

      {/* Simple territory info panel */}
      {selectedHex && (
        <Box
          position="absolute"
          bottom="20px"
          left="20px"
          maxW="300px"
          zIndex={10}
        >
          <SharedPanel title="Territory Information" bodyProps={{ p: 3 }}>
            <Flex direction="column" gap={1}>
              <Text fontSize="sm">
                Coordinates: ({selectedHex.q}, {selectedHex.r})
              </Text>

              {selectedHex.territory && (
                <>
                  {selectedHex.territory.type && (
                    <Text fontSize="sm">
                      Type:{" "}
                      {selectedHex.territory.type.charAt(0).toUpperCase() +
                        selectedHex.territory.type.slice(1)}
                    </Text>
                  )}

                  {selectedHex.territory.resource && (
                    <Text fontSize="sm">
                      Resource: {selectedHex.territory.resource}
                    </Text>
                  )}
                </>
              )}
            </Flex>
          </SharedPanel>
        </Box>
      )}
    </Box>
  );
};

export default SimpleMapView;
