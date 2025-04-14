import React from "react";

/**
 * TurnControls component provides controls for ending the current turn
 */
const TurnControls = ({ onEndTurn = () => {} }) => {
  return (
    <div className="turn-controls">
      <button
        onClick={onEndTurn}
        style={{
          background: "#e6c570", // Gold color from design doc
          border: "none",
          borderRadius: "4px",
          padding: "10px 20px",
          color: "#131e2d",
          fontSize: "16px",
          fontWeight: "bold",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <span>End Turn</span>
        <span style={{ fontSize: "20px" }}>➔</span>
      </button>
    </div>
  );
};

export default TurnControls;
