import React, { useState, useMemo } from "react";
import HexGrid from "./HexGrid";
import { hexToId } from "../../utils/hexUtils";

/**
 * MapView is the main component for displaying and interacting with the game map
 */
const MapView = ({
  territories = {},
  onTerritorySelect = () => {},
  currentPlayer = {},
}) => {
  // State for tracking the selected hex
  const [selectedHex, setSelectedHex] = useState(null);

  // Handle hex selection
  const handleHexClick = (hex) => {
    setSelectedHex(hex);
    onTerritorySelect(hex);
  };

  // Get the territory information to display
  const getTerritoryInfo = (hex) => {
    const territoryId = hexToId(hex);
    return territories[territoryId] || {};
  };

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
    <div className="map-view" style={{ width: "100%", height: "100%" }}>
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
        <div
          className="territory-info-panel"
          style={{
            position: "absolute",
            bottom: "20px",
            left: "20px",
            background: "#131e2d", // Panel background from design doc
            border: "1px solid #2a3c53", // Border color from design doc
            borderRadius: "4px",
            padding: "10px",
            color: "#e1e1e1", // Text primary from design doc
            maxWidth: "300px",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
          }}
        >
          <h3
            style={{
              color: "#e6c570", // Gold color from design doc
              margin: "0 0 10px 0",
              fontSize: "18px",
            }}
          >
            Territory Information
          </h3>

          <div style={{ fontSize: "14px", color: "#8a9bbd" }}>
            <p>
              Coordinates: ({selectedHex.q}, {selectedHex.r})
            </p>

            {selectedHex.territory.isCapital && (
              <p style={{ color: "#e6c570" }}>Capital Territory</p>
            )}

            {selectedHex.territory.type &&
              selectedHex.territory.type !== "unexplored" && (
                <p>
                  Type:{" "}
                  {selectedHex.territory.type.charAt(0).toUpperCase() +
                    selectedHex.territory.type.slice(1)}
                </p>
              )}

            {selectedHex.territory.resource && (
              <p>Resource: {selectedHex.territory.resource}</p>
            )}

            {selectedHex.territory.buildings &&
              selectedHex.territory.buildings.length > 0 && (
                <div>
                  <p>Buildings:</p>
                  <ul style={{ margin: "5px 0", paddingLeft: "20px" }}>
                    {selectedHex.territory.buildings.map((building, index) => (
                      <li key={index}>
                        {building.name} (Level {building.level})
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            {selectedHex.territory.owner && (
              <p>Owner: {selectedHex.territory.owner}</p>
            )}

            {selectedHex.territory.type === "unexplored" && (
              <p>This territory has not been explored yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MapView;
