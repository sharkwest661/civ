// src/components/map/MapView.jsx
import React, { useState, useMemo, useCallback } from "react";
import { Box, Text, Heading, Flex } from "@chakra-ui/react";
import VirtualizedHexGrid from "./VirtualizedHexGrid";
import HexTileWithBuildings from "./HexTileWithBuildings";
import { hexToId } from "../../utils/hexUtils";
import SharedPanel from "../ui/SharedPanel";
import {
  useStoreSelectors,
  useStoreActions,
} from "../../hooks/useStoreSelectors";
import { useMapStore } from "../../stores/mapStore";
import { MAP_CONFIG } from "../../constants/gameConstants";

/**
 * MapView is the main component for displaying and interacting with the game map
 * Updated with fixed virtualization and proper event handling
 */
const MapView = React.memo(
  ({ onTerritorySelect = () => {}, currentPlayer = {} }) => {
    // Get only the required state from the store
    const { territories, selectedTerritory } = useStoreSelectors(useMapStore, {
      territories: (state) => state.territories,
      selectedTerritory: (state) => state.selectedTerritory,
    });

    // Get actions without causing re-renders
    const { selectTerritory } = useStoreActions(useMapStore, [
      "selectTerritory",
    ]);

    // Handle hex selection
    const handleHexClick = useCallback(
      (hex) => {
        if (!hex) return;

        // Update selected hex in the store
        selectTerritory(hex);

        // Notify parent component
        onTerritorySelect(hex);
      },
      [selectTerritory, onTerritorySelect]
    );

    // Function to determine if a territory should be visible to the player
    // Using useMemo to prevent recreation on every render
    const visibleTerritories = useMemo(() => {
      const result = {};

      Object.entries(territories).forEach(([id, territory]) => {
        // Always show owned territories
        if (territory.owner === currentPlayer.id) {
          result[id] = {
            ...territory,
            isOwned: true,
            isCapital: territory.isCapital,
          };
        }
        // Show explored territories
        else if (territory.isExplored && territory.owner === null) {
          result[id] = {
            ...territory,
            isExplored: true,
          };
        }
        // Show other player territories if discovered
        else if (territory.isExplored && territory.owner !== null) {
          result[id] = {
            ...territory,
            isExplored: true,
            isOwned: false,
          };
        }
        // For territories not yet explored, just show as unexplored
        else {
          result[id] = {
            type: "unexplored",
          };
        }
      });

      return result;
    }, [territories, currentPlayer.id]); // Only recalculate when these dependencies change

    // Custom renderer for hex tiles with buildings
    const renderCustomTile = useCallback(
      (
        hex,
        size,
        territory,
        isSelected,
        isHovered,
        zoomLevel,
        onClick,
        onMouseEnter,
        onMouseLeave
      ) => {
        return (
          <HexTileWithBuildings
            q={hex.q}
            r={hex.r}
            size={size}
            territory={territory}
            selected={isSelected}
            hovered={isHovered}
            zoomLevel={zoomLevel}
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
          />
        );
      },
      []
    );

    return (
      <Box
        className="map-view"
        width="100%"
        height="100%"
        position="relative"
        data-testid="map-view"
      >
        <VirtualizedHexGrid
          radius={MAP_CONFIG.DEFAULT_RADIUS} // Radius of the map (in hexes)
          hexSize={MAP_CONFIG.DEFAULT_HEX_SIZE} // Size of each hex
          territories={visibleTerritories}
          onHexClick={handleHexClick}
          selectedHex={selectedTerritory}
          panEnabled={true}
          zoomEnabled={true}
          renderCustomTile={renderCustomTile}
        />

        {/* Territory information panel */}
        {selectedTerritory && (
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
                  Coordinates: ({selectedTerritory.q}, {selectedTerritory.r})
                </Text>

                {selectedTerritory.territory.isCapital && (
                  <Text fontSize="sm" color="accent.main">
                    Capital Territory
                  </Text>
                )}

                {selectedTerritory.territory.type &&
                  selectedTerritory.territory.type !== "unexplored" && (
                    <Text fontSize="sm">
                      Type:{" "}
                      {selectedTerritory.territory.type
                        .charAt(0)
                        .toUpperCase() +
                        selectedTerritory.territory.type.slice(1)}
                    </Text>
                  )}

                {selectedTerritory.territory.resource && (
                  <Text fontSize="sm">
                    Resource: {selectedTerritory.territory.resource}
                  </Text>
                )}

                {selectedTerritory.territory.buildings &&
                  selectedTerritory.territory.buildings.length > 0 && (
                    <Box mt={1}>
                      <Text fontSize="sm" fontWeight="medium" mb={1}>
                        Buildings:
                      </Text>
                      <Box pl={4}>
                        {selectedTerritory.territory.buildings.map(
                          (building, index) => (
                            <Text key={index} fontSize="sm">
                              • {building.name} (Level {building.level || 1})
                            </Text>
                          )
                        )}
                      </Box>
                    </Box>
                  )}

                {selectedTerritory.territory.owner && (
                  <Text fontSize="sm">
                    Owner: {selectedTerritory.territory.owner}
                  </Text>
                )}

                {selectedTerritory.territory.type === "unexplored" && (
                  <Text fontSize="sm" color="text.secondary">
                    This territory has not been explored yet.
                  </Text>
                )}
              </Flex>
            </SharedPanel>
          </Box>
        )}
      </Box>
    );
  }
);

// Add display name for debugging
MapView.displayName = "MapView";

export default MapView;
