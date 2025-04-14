import React, { useEffect } from "react";
import MapView from "../map/MapView";
import ResourcePanel from "../resources/ResourcePanel";
import TurnControls from "./TurnControls";
import { useGameStore } from "../../stores/gameStore";
import { useMapStore } from "../../stores/mapStore";
import { useResourcesStore } from "../../stores/resourcesStore";

/**
 * GameContainer is the main component that brings together all game elements
 */
const GameContainer = () => {
  // Get state from various stores
  const { currentTurn, currentPhase, currentPlayer, advanceTurn, setPhase } =
    useGameStore((state) => ({
      currentTurn: state.currentTurn,
      currentPhase: state.currentPhase,
      currentPlayer: state.currentPlayer,
      advanceTurn: state.advanceTurn,
      setPhase: state.setPhase,
    }));

  const { territories, selectTerritory, selectedTerritory } = useMapStore(
    (state) => ({
      territories: state.territories,
      selectTerritory: state.selectTerritory,
      selectedTerritory: state.selectedTerritory,
    })
  );

  const { resources } = useResourcesStore((state) => ({
    resources: state.resources,
  }));

  // Handle territory selection
  const handleTerritorySelect = (hex) => {
    selectTerritory(hex);
  };

  // Handle end turn
  const handleEndTurn = () => {
    advanceTurn();
  };

  // Handle phase change
  const handlePhaseChange = (phase) => {
    setPhase(phase);
  };

  // Set page title
  useEffect(() => {
    document.title = "Empire's Legacy";
  }, []);

  return (
    <div
      className="game-container"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100vw",
        background: "#1a2634", // Background color from design doc
        color: "#e1e1e1", // Text color from design doc
      }}
    >
      {/* Top Bar with Resources and Controls */}
      <div
        className="top-bar"
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "10px 20px",
          background: "#131e2d", // Panel color from design doc
          borderBottom: "1px solid #2a3c53",
        }}
      >
        <div className="game-info">
          <h1
            style={{
              color: "#e6c570", // Gold color from design doc
              margin: "0",
              fontSize: "24px",
            }}
          >
            Empire's Legacy
          </h1>
          <div
            style={{
              fontSize: "14px",
              color: "#8a9bbd", // Text secondary from design doc
            }}
          >
            Turn: {currentTurn} | Phase: {currentPhase}
          </div>
        </div>

        <ResourcePanel resources={resources} />
      </div>

      {/* Main Content Area */}
      <div
        className="main-content"
        style={{
          display: "flex",
          flex: 1,
          overflow: "hidden",
        }}
      >
        {/* Main Map Area */}
        <div
          className="map-area"
          style={{
            flex: 1,
            position: "relative",
          }}
        >
          <MapView
            territories={territories}
            onTerritorySelect={handleTerritorySelect}
            currentPlayer={currentPlayer}
          />
        </div>

        {/* Side Panel */}
        <div
          className="side-panel"
          style={{
            width: "300px",
            background: "#131e2d", // Panel color from design doc
            borderLeft: "1px solid #2a3c53",
            padding: "20px",
            overflowY: "auto",
          }}
        >
          <h2
            style={{
              color: "#e6c570", // Gold color from design doc
              margin: "0 0 20px 0",
              fontSize: "20px",
            }}
          >
            Actions
          </h2>

          {/* Action buttons would go here */}
          <div
            className="action-buttons"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <button
              style={{
                background: "#e6c570", // Gold color from design doc
                border: "none",
                borderRadius: "4px",
                padding: "10px 15px",
                color: "#131e2d",
                fontSize: "14px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              Build Structure
            </button>

            <button
              style={{
                background: "#2a3c53", // Secondary button color from design doc
                border: "none",
                borderRadius: "4px",
                padding: "10px 15px",
                color: "#e1e1e1",
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              Assign Workers
            </button>

            <button
              style={{
                background: "#2a3c53", // Secondary button color from design doc
                border: "none",
                borderRadius: "4px",
                padding: "10px 15px",
                color: "#e1e1e1",
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              Research Technology
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Bar with Turn Controls */}
      <div
        className="bottom-bar"
        style={{
          padding: "10px 20px",
          background: "#131e2d", // Panel color from design doc
          borderTop: "1px solid #2a3c53",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div className="phase-controls">
          {/* Phase buttons */}
          <div style={{ display: "flex", gap: "10px" }}>
            {[
              "Assignment",
              "Building",
              "Research",
              "Military",
              "Diplomacy",
            ].map((phase) => (
              <button
                key={phase}
                onClick={() => handlePhaseChange(phase)}
                style={{
                  background:
                    currentPhase === phase ? "#2a3c53" : "transparent",
                  border: "1px solid #2a3c53",
                  borderRadius: "4px",
                  padding: "5px 10px",
                  color: currentPhase === phase ? "#e6c570" : "#8a9bbd",
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                {phase}
              </button>
            ))}
          </div>
        </div>

        <TurnControls onEndTurn={handleEndTurn} />
      </div>
    </div>
  );
};

export default GameContainer;
