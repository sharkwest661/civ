import React, { useMemo } from "react";
import {
  calculateHexPoints,
  pointsToSvgString,
  axialToPixel,
} from "../../utils/hexUtils";

/**
 * HexTile component represents a single hexagonal territory on the game map
 */
const HexTile = ({
  q,
  r,
  size = 40,
  territory = {},
  selected = false,
  hovered = false,
  onClick = () => {},
  onMouseEnter = () => {},
  onMouseLeave = () => {},
}) => {
  // Calculate the points and center for this hexagon
  const { points, center } = useMemo(() => {
    const hexPoints = calculateHexPoints(q, r, size);
    const { x, y } = axialToPixel(q, r, size);
    return {
      points: pointsToSvgString(hexPoints),
      center: { x, y },
    };
  }, [q, r, size]);

  // Determine tile color based on territory type and state
  const getFillColor = () => {
    // Base colors from design document
    const colors = {
      capital: "#873e23", // Amber-Brown
      owned: "#2e4c34", // Forest Green
      explored: "#31394a", // Slate Gray
      unexplored: "#0d1520", // Near Black
      strategic: "#3e2e4c", // Deep Purple
      luxury: "#2e3e4c", // Steel Blue
      danger: "#4c2e2e", // Deep Red
    };

    // Default to unexplored if no territory info
    if (!territory.type) {
      return colors.unexplored;
    }

    // Determine base color from territory type
    let baseColor;
    if (territory.isCapital) {
      baseColor = colors.capital;
    } else if (territory.isOwned) {
      baseColor = colors.owned;
    } else if (territory.isExplored) {
      baseColor = colors.explored;
    } else if (territory.hasStrategicResource) {
      baseColor = colors.strategic;
    } else if (territory.hasLuxuryResource) {
      baseColor = colors.luxury;
    } else if (territory.hasDanger) {
      baseColor = colors.danger;
    } else {
      baseColor = colors.unexplored;
    }

    // Lighten color by 15% if hovered or selected
    if (selected || hovered) {
      // Convert hex to RGB
      const hex = baseColor.replace("#", "");
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);

      // Lighten by 15%
      const lightenFactor = 0.15;
      const newR = Math.min(255, Math.round(r + (255 - r) * lightenFactor));
      const newG = Math.min(255, Math.round(g + (255 - g) * lightenFactor));
      const newB = Math.min(255, Math.round(b + (255 - b) * lightenFactor));

      // Convert back to hex
      return `#${newR.toString(16).padStart(2, "0")}${newG
        .toString(16)
        .padStart(2, "0")}${newB.toString(16).padStart(2, "0")}`;
    }

    return baseColor;
  };

  // Determine stroke color and width based on territory state
  const getStrokeStyle = () => {
    const baseStrokeWidth = territory.isUnderAttack ? 3 : 2;
    const baseStrokeColor = territory.isUnderAttack ? "#ff5555" : "#454545";

    return {
      strokeWidth: baseStrokeWidth,
      stroke: baseStrokeColor,
    };
  };

  const { strokeWidth, stroke } = getStrokeStyle();
  const fillColor = getFillColor();

  // Animation for newly discovered territories
  const getAnimation = () => {
    if (territory.isNewlyDiscovered || territory.isNewlyClaimed) {
      return "pulse 2s ease-in-out";
    }
    return "none";
  };

  return (
    <g
      onClick={() => onClick({ q, r, territory })}
      onMouseEnter={() => onMouseEnter({ q, r, territory })}
      onMouseLeave={() => onMouseLeave({ q, r, territory })}
      style={{ cursor: "pointer" }}
    >
      <polygon
        points={points}
        fill={fillColor}
        strokeWidth={strokeWidth}
        stroke={stroke}
        style={{
          animation: getAnimation(),
          transition: "fill 0.2s ease-out",
        }}
      />

      {/* Render resource icon if the territory has resources */}
      {territory.resource && (
        <foreignObject
          x={center.x - 10}
          y={center.y - 10}
          width={20}
          height={20}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: "100%",
            }}
          >
            {/* Resource icon would go here */}
            {/* For now just indicating with text */}
            <span
              style={{
                fontSize: "12px",
                color: "#fff",
                fontWeight: "bold",
                textShadow: "0 0 3px black",
              }}
            >
              {territory.resource.slice(0, 1).toUpperCase()}
            </span>
          </div>
        </foreignObject>
      )}

      {/* Could add additional indicators for buildings, military units, etc. here */}
    </g>
  );
};

export default React.memo(HexTile);
