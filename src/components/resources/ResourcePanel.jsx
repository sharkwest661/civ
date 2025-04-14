import React from "react";

/**
 * ResourcePanel displays the current resources and their production rates
 */
const ResourcePanel = React.memo(({ resources = {} }) => {
  // Resource colors from design document
  const resourceColors = {
    food: "#7dce82", // Green
    production: "#d68c45", // Orange
    science: "#5ea8ed", // Blue
    gold: "#e9d16c", // Yellow
    happiness: "#e67670", // Red
    culture: "#a670e6", // Purple
    influence: "#5ea8ed", // Blue
  };

  // Resource icons (we'll use text for now, but could use actual icons)
  const resourceIcons = {
    food: "🌾",
    production: "⚒️",
    science: "🔬",
    gold: "💰",
    happiness: "😊",
    culture: "🏛️",
    influence: "🤝",
  };

  // Only show main resources in the top panel
  const mainResources = ["food", "production", "science", "gold", "happiness"];

  return (
    <div
      className="resource-panel"
      style={{
        display: "flex",
        gap: "20px",
        alignItems: "center",
      }}
    >
      {mainResources.map((resourceType) => {
        const resource = resources[resourceType] || {
          amount: 0,
          production: 0,
        };
        const color = resourceColors[resourceType];
        const icon = resourceIcons[resourceType];

        return (
          <div
            key={resourceType}
            className="resource-item"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <span style={{ fontSize: "18px" }}>{icon}</span>
            <div>
              <div
                style={{
                  color,
                  fontWeight: "bold",
                  fontSize: "16px",
                }}
              >
                {Math.floor(resource.amount)}
              </div>
              <div
                style={{
                  color: resource.production >= 0 ? "#7dce82" : "#e67670",
                  fontSize: "12px",
                }}
              >
                {resource.production > 0 ? "+" : ""}
                {resource.production}/turn
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
});

// Add display name for debugging
ResourcePanel.displayName = "ResourcePanel";

export default ResourcePanel;
