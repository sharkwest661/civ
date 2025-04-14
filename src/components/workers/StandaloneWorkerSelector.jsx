import React, { useState, useEffect } from "react";
import { useWorkersStore } from "../../stores/workersStore";

/**
 * StandaloneWorkerSelector - A direct DOM-based worker selection component
 * This bypasses the Chakra UI modal system entirely
 */
const StandaloneWorkerSelector = ({ onSelectWorker, onClose }) => {
  // Get worker data from workers store
  const availableWorkers = useWorkersStore((state) => state.availableWorkers);
  const workerSpecializations = useWorkersStore(
    (state) => state.workerSpecializations
  );

  // Local state for selected worker
  const [selectedWorkerId, setSelectedWorkerId] = useState(null);

  // Get specialization info
  const getSpecializationInfo = (workerId) => {
    const specialization = workerSpecializations[workerId];
    if (!specialization) return null;

    switch (specialization.type) {
      case "diligent":
        return {
          icon: "💼",
          name: "Diligent",
          subtype: specialization.subtype,
          description: `+15% ${specialization.subtype} production`,
        };
      case "strong":
        return {
          icon: "💪",
          name: "Strong",
          subtype: specialization.subtype,
          description: `+15% ${specialization.subtype} efficiency`,
        };
      case "clever":
        return {
          icon: "🧠",
          name: "Clever",
          subtype: specialization.subtype,
          description: `+15% ${specialization.subtype} output`,
        };
      default:
        return null;
    }
  };

  // Format subtype name
  const formatSubtype = (subtype) => {
    return subtype.charAt(0).toUpperCase() + subtype.slice(1);
  };

  // Handle worker selection
  const handleSelectWorker = (workerId) => {
    if (onSelectWorker) {
      onSelectWorker(workerId);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0,0,0,0.75)",
        zIndex: 9999,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          backgroundColor: "#131e2d",
          borderRadius: "8px",
          width: "90%",
          maxWidth: "500px",
          maxHeight: "80vh",
          overflow: "auto",
          boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
          border: "1px solid #2a3c53",
        }}
      >
        <div
          style={{
            padding: "20px",
            borderBottom: "1px solid #2a3c53",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2
            style={{
              color: "#e6c570",
              margin: 0,
              fontSize: "1.2rem",
            }}
          >
            Select a Worker
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "#8a9bbd",
              fontSize: "1.5rem",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: "20px" }}>
          {availableWorkers.length === 0 ? (
            <p style={{ color: "#8a9bbd", textAlign: "center" }}>
              No available workers.
            </p>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              {availableWorkers.map((worker) => {
                const specialization = getSpecializationInfo(worker.id);
                const isSelected = selectedWorkerId === worker.id;

                return (
                  <div
                    key={worker.id}
                    onClick={() => setSelectedWorkerId(worker.id)}
                    style={{
                      backgroundColor: isSelected ? "#2a3c53" : "#1a2634",
                      borderRadius: "4px",
                      padding: "12px",
                      cursor: "pointer",
                      border: isSelected
                        ? "1px solid #e6c570"
                        : "1px solid transparent",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <span style={{ fontSize: "0.9rem", color: "#e1e1e1" }}>
                          Worker
                        </span>
                        {specialization && (
                          <span
                            style={{ marginLeft: "8px", fontSize: "1.2rem" }}
                          >
                            {specialization.icon}
                          </span>
                        )}
                      </div>

                      {specialization && (
                        <span
                          style={{
                            backgroundColor:
                              specialization.name === "Diligent"
                                ? "#e9d16c30"
                                : specialization.name === "Strong"
                                ? "#d68c4530"
                                : "#5ea8ed30",
                            color:
                              specialization.name === "Diligent"
                                ? "#e9d16c"
                                : specialization.name === "Strong"
                                ? "#d68c45"
                                : "#5ea8ed",
                            padding: "2px 8px",
                            borderRadius: "4px",
                            fontSize: "0.8rem",
                          }}
                        >
                          {formatSubtype(specialization.subtype)}
                        </span>
                      )}
                    </div>

                    {specialization && (
                      <p
                        style={{
                          fontSize: "0.8rem",
                          margin: "8px 0 0 0",
                          color: "#8a9bbd",
                        }}
                      >
                        {specialization.description}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div
            style={{
              marginTop: "20px",
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
            }}
          >
            <button
              onClick={onClose}
              style={{
                backgroundColor: "transparent",
                border: "1px solid #2a3c53",
                padding: "8px 16px",
                borderRadius: "4px",
                color: "#8a9bbd",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => handleSelectWorker(selectedWorkerId)}
              disabled={!selectedWorkerId}
              style={{
                backgroundColor: selectedWorkerId ? "#e6c570" : "#2a3c53",
                border: "none",
                padding: "8px 16px",
                borderRadius: "4px",
                color: selectedWorkerId ? "#131e2d" : "#8a9bbd",
                cursor: selectedWorkerId ? "pointer" : "not-allowed",
                opacity: selectedWorkerId ? 1 : 0.7,
              }}
            >
              Assign Worker
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StandaloneWorkerSelector;
