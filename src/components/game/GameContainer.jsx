import React, { useEffect, useState, useCallback } from "react";
import MapView from "../map/MapView";
import ResourcePanel from "../resources/ResourcePanel";
import TurnControls from "./TurnControls";
import BuildingPanel from "../buildings/BuildingPanel";
import TechnologyTree from "../technology/TechnologyTree";
import WorkerAssignmentPanel from "../workers/WorkerAssignmentPanel";
import { useGameStore } from "../../stores/gameStore";
import { useMapStore } from "../../stores/mapStore";
import { useResourcesStore } from "../../stores/resourcesStore";
import { useWorkersStore } from "../../stores/workersStore";

/**
 * GameContainer is the main component that brings together all game elements
 */
const GameContainer = () => {
  // Component state
  const [activeSidePanel, setActiveSidePanel] = useState(null); // null, "building", "tech", "military", "diplomacy", "workers"

  // IMPORTANT: Use individual selectors for each piece of state to prevent unnecessary re-renders
  // Game store selectors
  const currentTurn = useGameStore((state) => state.currentTurn);
  const currentPhase = useGameStore((state) => state.currentPhase);
  const currentPlayer = useGameStore((state) => state.currentPlayer);
  const advanceTurn = useGameStore((state) => state.advanceTurn);
  const setPhase = useGameStore((state) => state.setPhase);

  // Map store selectors
  const territories = useMapStore((state) => state.territories);
  const selectedTerritory = useMapStore((state) => state.selectedTerritory);
  const selectTerritory = useMapStore((state) => state.selectTerritory);

  // Resources store selectors
  const resources = useResourcesStore((state) => state.resources);
  const updateAllResources = useResourcesStore(
    (state) => state.updateAllResources
  );
  const setResourceProduction = useResourcesStore(
    (state) => state.setResourceProduction
  );

  // Workers store selectors
  const clearRecentlyReassigned = useWorkersStore(
    (state) => state.clearRecentlyReassigned
  );
  const getAllBuildingProduction = useWorkersStore(
    (state) => state.getAllBuildingProduction
  );

  // Handle territory selection - memoize with useCallback
  const handleTerritorySelect = useCallback(
    (hex) => {
      selectTerritory(hex);
    },
    [selectTerritory]
  );

  // Handle end turn - memoize with useCallback
  const handleEndTurn = useCallback(() => {
    // Calculate production from workers
    const workerProduction = getAllBuildingProduction(territories);

    // Update resource production rates
    Object.entries(workerProduction).forEach(([resourceType, amount]) => {
      setResourceProduction(resourceType, amount);
    });

    // Update all resources based on production
    updateAllResources();

    // Clear recently reassigned workers penalty
    clearRecentlyReassigned();

    // Advance to the next turn
    advanceTurn();
  }, [
    updateAllResources,
    advanceTurn,
    clearRecentlyReassigned,
    getAllBuildingProduction,
    territories,
    setResourceProduction,
  ]);

  // Handle phase change - memoize with useCallback
  const handlePhaseChange = useCallback(
    (phase) => {
      setPhase(phase);

      // Set the appropriate side panel based on the phase
      switch (phase) {
        case "Assignment":
          setActiveSidePanel("workers");
          break;
        case "Building":
          setActiveSidePanel("building");
          break;
        case "Research":
          setActiveSidePanel("tech");
          break;
        case "Military":
          setActiveSidePanel("military");
          break;
        case "Diplomacy":
          setActiveSidePanel("diplomacy");
          break;
        default:
          setActiveSidePanel(null);
      }
    },
    [setPhase]
  );

  // Toggle side panel - memoize with useCallback
  const toggleSidePanel = useCallback((panel) => {
    setActiveSidePanel((prev) => (prev === panel ? null : panel));
  }, []);

  // Set page title
  useEffect(() => {
    document.title = "Empire's Legacy";
  }, []);

  // Render the appropriate side panel
  const renderSidePanel = () => {
    switch (activeSidePanel) {
      case "workers":
        return (
          <WorkerAssignmentPanel onClose={() => setActiveSidePanel(null)} />
        );

      case "building":
        return (
          <BuildingPanel
            selectedTerritory={selectedTerritory}
            onClose={() => setActiveSidePanel(null)}
          />
        );

      case "tech":
        return <TechnologyTree onClose={() => setActiveSidePanel(null)} />;

      case "military":
        return (
          <div className="panel-placeholder" style={{ padding: "20px" }}>
            <h3 style={{ color: "#e6c570", marginBottom: "15px" }}>
              Military Panel
            </h3>
            <p style={{ color: "#8a9bbd" }}>
              Military panel would be implemented here.
            </p>
            <button
              style={{
                background: "transparent",
                border: "none",
                color: "#8a9bbd",
                cursor: "pointer",
                position: "absolute",
                top: "15px",
                right: "15px",
                fontSize: "20px",
              }}
              onClick={() => setActiveSidePanel(null)}
            >
              ×
            </button>
          </div>
        );

      case "diplomacy":
        return (
          <div className="panel-placeholder" style={{ padding: "20px" }}>
            <h3 style={{ color: "#e6c570", marginBottom: "15px" }}>
              Diplomacy Panel
            </h3>
            <p style={{ color: "#8a9bbd" }}>
              Diplomacy panel would be implemented here.
            </p>
            <button
              style={{
                background: "transparent",
                border: "none",
                color: "#8a9bbd",
                cursor: "pointer",
                position: "absolute",
                top: "15px",
                right: "15px",
                fontSize: "20px",
              }}
              onClick={() => setActiveSidePanel(null)}
            >
              ×
            </button>
          </div>
        );

      default:
        return (
          <div
            className="side-panel-default"
            style={{
              padding: "20px",
            }}
          >
            <h3
              style={{
                color: "#e6c570",
                margin: "0 0 20px 0",
                fontSize: "20px",
              }}
            >
              Actions
            </h3>

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
                  background: "#e6c570",
                  border: "none",
                  borderRadius: "4px",
                  padding: "10px 15px",
                  color: "#131e2d",
                  fontSize: "14px",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
                onClick={() => toggleSidePanel("workers")}
              >
                Assign Workers
              </button>

              <button
                style={{
                  background: "#2a3c53",
                  border: "none",
                  borderRadius: "4px",
                  padding: "10px 15px",
                  color: "#e1e1e1",
                  fontSize: "14px",
                  cursor: "pointer",
                }}
                onClick={() => toggleSidePanel("building")}
              >
                Build Structure
              </button>

              <button
                style={{
                  background: "#2a3c53",
                  border: "none",
                  borderRadius: "4px",
                  padding: "10px 15px",
                  color: "#e1e1e1",
                  fontSize: "14px",
                  cursor: "pointer",
                }}
                onClick={() => toggleSidePanel("tech")}
              >
                Research Technology
              </button>

              <button
                style={{
                  background: "#2a3c53",
                  border: "none",
                  borderRadius: "4px",
                  padding: "10px 15px",
                  color: "#e1e1e1",
                  fontSize: "14px",
                  cursor: "pointer",
                }}
                onClick={() => toggleSidePanel("military")}
              >
                Military Operations
              </button>

              <button
                style={{
                  background: "#2a3c53",
                  border: "none",
                  borderRadius: "4px",
                  padding: "10px 15px",
                  color: "#e1e1e1",
                  fontSize: "14px",
                  cursor: "pointer",
                }}
                onClick={() => toggleSidePanel("diplomacy")}
              >
                Diplomacy
              </button>
            </div>

            {selectedTerritory && (
              <div
                style={{
                  marginTop: "30px",
                  padding: "15px",
                  background: "#1a2634",
                  borderRadius: "4px",
                  border: "1px solid #2a3c53",
                }}
              >
                <h4 style={{ color: "#e1e1e1", margin: "0 0 10px 0" }}>
                  Selected Territory
                </h4>
                <p style={{ color: "#8a9bbd", margin: "5px 0" }}>
                  Coordinates: ({selectedTerritory.q}, {selectedTerritory.r})
                </p>
                {selectedTerritory.territory && (
                  <>
                    {selectedTerritory.territory.type && (
                      <p style={{ color: "#8a9bbd", margin: "5px 0" }}>
                        Type:{" "}
                        {selectedTerritory.territory.type
                          .charAt(0)
                          .toUpperCase() +
                          selectedTerritory.territory.type.slice(1)}
                      </p>
                    )}
                    {selectedTerritory.territory.resource && (
                      <p style={{ color: "#8a9bbd", margin: "5px 0" }}>
                        Resource: {selectedTerritory.territory.resource}
                      </p>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        );
    }
  };

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
            width: "550px",
            background: "#131e2d", // Panel color from design doc
            borderLeft: "1px solid #2a3c53",
            padding: "0",
            overflowY: "auto",
            position: "relative",
          }}
        >
          {renderSidePanel()}
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

export default React.memo(GameContainer); // Memoize to prevent unnecessary re-renders
