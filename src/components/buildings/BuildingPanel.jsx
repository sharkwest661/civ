import React, { useState, useMemo } from "react";
import { useMapStore } from "../../stores/mapStore";
import { useResourcesStore } from "../../stores/resourcesStore";

/**
 * BuildingPanel component for managing building construction and upgrades
 */
const BuildingPanel = React.memo(({ selectedTerritory, onClose }) => {
  const [selectedBuildingType, setSelectedBuildingType] = useState(null);

  // Get territory information from mapStore with individual selectors
  const territories = useMapStore((state) => state.territories);
  const addBuilding = useMapStore((state) => state.addBuilding);
  const upgradeBuilding = useMapStore((state) => state.upgradeBuilding);

  // Get resources from resourcesStore with individual selectors
  const resources = useResourcesStore((state) => state.resources);
  const updateResource = useResourcesStore((state) => state.updateResource);

  // Building types and their costs - memoized to prevent recreating on every render
  const buildingTypes = useMemo(
    () => [
      {
        id: "farm",
        name: "Farm",
        description: "Produces food",
        productionCost: 20,
        resourceProduction: { type: "food", amount: 5 },
        requirements: { territoryTypes: ["plains", "hills"] },
      },
      {
        id: "mine",
        name: "Mine",
        description: "Produces production points",
        productionCost: 30,
        resourceProduction: { type: "production", amount: 5 },
        requirements: { territoryTypes: ["hills", "mountains"] },
      },
      {
        id: "library",
        name: "Library",
        description: "Produces science points",
        productionCost: 40,
        resourceProduction: { type: "science", amount: 5 },
        requirements: { territoryTypes: ["plains", "forest"] },
      },
      {
        id: "market",
        name: "Market",
        description: "Produces gold",
        productionCost: 30,
        resourceProduction: { type: "gold", amount: 5 },
        requirements: { territoryTypes: ["plains", "forest", "hills"] },
      },
    ],
    []
  );

  // Check if we have a valid selected territory
  if (!selectedTerritory) {
    return (
      <div className="building-panel-empty">
        <p style={{ color: "#8a9bbd", textAlign: "center", padding: "20px" }}>
          Select a territory to build or upgrade structures.
        </p>
      </div>
    );
  }

  // Get territory ID from selected hex
  const territoryId = `${selectedTerritory.q},${selectedTerritory.r}`;
  const territory = territories[territoryId] || {};

  // Check if a building can be constructed in this territory
  const canBuildInTerritory = (building) => {
    if (!territory.type) return false;
    if (!territory.isOwned) return false;

    // Check if territory type is suitable
    return building.requirements.territoryTypes.includes(territory.type);
  };

  // Check if we have enough resources to build
  const canAffordBuilding = (building) => {
    return resources.production.amount >= building.productionCost;
  };

  // Handle building construction
  const handleBuild = (buildingType) => {
    // Check if we can afford it
    if (!canAffordBuilding(buildingType)) return;

    // Create the new building
    const newBuilding = {
      id: buildingType.id,
      name: buildingType.name,
      type: buildingType.id,
      level: 1,
      workers: [],
    };

    // Add the building to the territory
    addBuilding(territoryId, newBuilding);

    // Deduct the resources
    updateResource("production", -buildingType.productionCost);

    // Close the panel
    onClose();
  };

  // Handle building upgrade
  const handleUpgrade = (buildingIndex, currentLevel) => {
    // Calculate upgrade cost (increases with level)
    const upgradeCost = 20 * currentLevel;

    // Check if we can afford it
    if (resources.production.amount < upgradeCost) return;

    // Upgrade the building
    upgradeBuilding(territoryId, buildingIndex, currentLevel + 1);

    // Deduct the resources
    updateResource("production", -upgradeCost);
  };

  // Render the list of existing buildings in the territory
  const renderExistingBuildings = () => {
    if (!territory.buildings || territory.buildings.length === 0) {
      return (
        <p style={{ color: "#8a9bbd", marginBottom: "20px" }}>
          No buildings in this territory.
        </p>
      );
    }

    return (
      <div>
        <h4 style={{ color: "#e1e1e1", margin: "10px 0" }}>
          Existing Buildings
        </h4>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {territory.buildings.map((building, index) => (
            <div
              key={index}
              style={{
                background: "#1e2d42",
                padding: "10px",
                borderRadius: "4px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <p style={{ color: "#e1e1e1" }}>{building.name}</p>
                <p style={{ color: "#8a9bbd", fontSize: "12px" }}>
                  Level: {building.level}
                </p>
              </div>
              {building.level < 3 && (
                <button
                  style={{
                    background: "#2a3c53",
                    color: "#e1e1e1",
                    border: "none",
                    borderRadius: "4px",
                    padding: "5px 10px",
                    cursor: "pointer",
                  }}
                  onClick={() => handleUpgrade(index, building.level)}
                  disabled={resources.production.amount < 20 * building.level}
                >
                  Upgrade ({20 * building.level}
                  <span style={{ marginLeft: "5px" }}>⚒️</span>)
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render the list of available buildings to construct
  const renderAvailableBuildings = () => {
    return (
      <div>
        <h4 style={{ color: "#e1e1e1", margin: "10px 0" }}>
          Construct New Building
        </h4>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {buildingTypes.map((building) => {
            const canBuild =
              canBuildInTerritory(building) && canAffordBuilding(building);

            return (
              <div
                key={building.id}
                style={{
                  background: "#1e2d42",
                  padding: "10px",
                  borderRadius: "4px",
                  opacity: canBuild ? 1 : 0.5,
                  cursor: canBuild ? "pointer" : "not-allowed",
                }}
                onClick={() => canBuild && handleBuild(building)}
              >
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <p style={{ color: "#e1e1e1" }}>{building.name}</p>
                  <p style={{ color: "#e9d16c" }}>
                    {building.productionCost} <span>⚒️</span>
                  </p>
                </div>
                <p style={{ color: "#8a9bbd", fontSize: "12px" }}>
                  {building.description}
                </p>
                {!canBuildInTerritory(building) && (
                  <p style={{ color: "#d65959", fontSize: "12px" }}>
                    Cannot build in this territory type
                  </p>
                )}
                {canBuildInTerritory(building) &&
                  !canAffordBuilding(building) && (
                    <p style={{ color: "#d65959", fontSize: "12px" }}>
                      Not enough production points
                    </p>
                  )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div
      className="building-panel"
      style={{
        padding: "15px",
        background: "#131e2d",
        borderRadius: "4px",
        border: "1px solid #2a3c53",
        maxHeight: "500px",
        overflowY: "auto",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "15px",
        }}
      >
        <h3 style={{ color: "#e6c570", margin: 0 }}>Building Management</h3>
        <button
          style={{
            background: "transparent",
            border: "none",
            color: "#8a9bbd",
            cursor: "pointer",
            fontSize: "18px",
          }}
          onClick={onClose}
        >
          ×
        </button>
      </div>

      <div
        style={{
          background: "#1a2634",
          padding: "10px",
          borderRadius: "4px",
          marginBottom: "15px",
        }}
      >
        <p style={{ color: "#e1e1e1" }}>
          Selected Territory: ({selectedTerritory.q}, {selectedTerritory.r})
        </p>
        <p style={{ color: "#8a9bbd" }}>
          Type:{" "}
          {territory.type
            ? territory.type.charAt(0).toUpperCase() + territory.type.slice(1)
            : "Unknown"}
        </p>
        {territory.resource && (
          <p style={{ color: "#8a9bbd" }}>Resource: {territory.resource}</p>
        )}
      </div>

      {/* Existing buildings section */}
      {renderExistingBuildings()}

      {/* New building section */}
      {territory.isOwned && renderAvailableBuildings()}
    </div>
  );
});

// Add display name for debugging
BuildingPanel.displayName = "BuildingPanel";

export default BuildingPanel;
