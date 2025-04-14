// src/components/map/MapView.jsx
import React, { useState, useMemo, useCallback } from "react";
import { Box, Text, Heading, Flex } from "@chakra-ui/react";
import HexGrid from "./HexGrid";
import { hexToId } from "../../utils/hexUtils";
import SharedPanel from "../ui/SharedPanel";

/**
 * MapView is the main component for displaying and interacting with the game map
 * Fixed to ensure the map renders properly
 */
const MapView = React.memo(
  ({ territories = {}, onTerritorySelect = () => {}, currentPlayer = {} }) => {
    // State for tracking the selected hex
    const [selectedHex, setSelectedHex] = useState(null);

    // Handle hex selection
    const handleHexClick = useCallback(
      (hex) => {
        setSelectedHex(hex);
        onTerritorySelect(hex);
      },
      [onTerritorySelect]
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

    return (
      <Box
        className="map-view"
        width="100%"
        height="100%"
        position="relative"
        data-testid="map-view"
      >
        <HexGrid
          radius={7} // Radius of the map (in hexes)
          hexSize={40} // Size of each hex
          territories={visibleTerritories}
          onHexClick={handleHexClick}
          selectedHex={selectedHex}
          panEnabled={true}
          zoomEnabled={true}
        />

        {/* Territory information panel */}
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

                {selectedHex.territory.isCapital && (
                  <Text fontSize="sm" color="accent.main">
                    Capital Territory
                  </Text>
                )}

                {selectedHex.territory.type &&
                  selectedHex.territory.type !== "unexplored" && (
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

                {selectedHex.territory.buildings &&
                  selectedHex.territory.buildings.length > 0 && (
                    <Box mt={1}>
                      <Text fontSize="sm" fontWeight="medium" mb={1}>
                        Buildings:
                      </Text>
                      <Box pl={4}>
                        {selectedHex.territory.buildings.map(
                          (building, index) => (
                            <Text key={index} fontSize="sm">
                              • {building.name} (Level {building.level || 1})
                            </Text>
                          )
                        )}
                      </Box>
                    </Box>
                  )}

                {selectedHex.territory.owner && (
                  <Text fontSize="sm">
                    Owner: {selectedHex.territory.owner}
                  </Text>
                )}

                {selectedHex.territory.type === "unexplored" && (
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
