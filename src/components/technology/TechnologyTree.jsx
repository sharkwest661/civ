import React, { useMemo } from "react";
import { useTechnologyStore } from "../../stores/technologyStore";

/**
 * TechnologyTree component for visualizing and managing technology research
 */
const TechnologyTree = React.memo(({ onClose }) => {
  // Get technology data from the store
  const technologies = useTechnologyStore((state) => state.technologies);
  const currentResearch = useTechnologyStore((state) => state.currentResearch);
  const startResearch = useTechnologyStore((state) => state.startResearch);
  const cancelResearch = useTechnologyStore((state) => state.cancelResearch);

  // Group technologies by era - memoized to prevent recalculation on every render
  const techByEra = useMemo(() => {
    const result = {};

    Object.values(technologies).forEach((tech) => {
      if (!result[tech.era]) {
        result[tech.era] = [];
      }
      result[tech.era].push(tech);
    });

    // Sort eras in a logical progression
    const sortedResult = {};
    const eraOrder = [
      "Primitive",
      "Ancient",
      "Classical",
      "Medieval",
      "Renaissance",
    ];

    eraOrder.forEach((era) => {
      if (result[era]) {
        sortedResult[era] = result[era];
      }
    });

    return sortedResult;
  }, [technologies]);

  // Function to check if a technology can be researched
  const canResearch = (tech) => {
    if (tech.researched) return false;

    // Check if all requirements are researched
    return tech.requirements.every((reqId) => technologies[reqId]?.researched);
  };

  // Handle clicking on a technology
  const handleTechClick = (tech) => {
    if (!canResearch(tech)) return;

    // Start researching this tech
    startResearch(tech.id);
  };

  // Handle canceling research
  const handleCancelResearch = () => {
    cancelResearch();
  };

  return (
    <div
      className="technology-tree"
      style={{
        padding: "20px",
        background: "#131e2d",
        borderRadius: "4px",
        border: "1px solid #2a3c53",
        maxHeight: "80vh",
        overflowY: "auto",
        width: "800px",
        maxWidth: "90vw",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h3 style={{ color: "#e6c570", margin: 0, fontSize: "24px" }}>
          Technology Tree
        </h3>
        <button
          style={{
            background: "transparent",
            border: "none",
            color: "#8a9bbd",
            cursor: "pointer",
            fontSize: "24px",
          }}
          onClick={onClose}
        >
          ×
        </button>
      </div>

      {/* Current research display */}
      <div
        style={{
          background: "#1a2634",
          padding: "15px",
          borderRadius: "4px",
          marginBottom: "20px",
        }}
      >
        <h4 style={{ color: "#e1e1e1", margin: "0 0 10px 0" }}>
          Current Research
        </h4>
        {currentResearch ? (
          <div style={{ marginBottom: "10px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <p style={{ color: "#5ea8ed", margin: "0 0 5px 0" }}>
                {technologies[currentResearch].name}
              </p>
              <button
                style={{
                  background: "#2a3c53",
                  border: "none",
                  borderRadius: "4px",
                  padding: "5px 10px",
                  color: "#e1e1e1",
                  fontSize: "12px",
                  cursor: "pointer",
                }}
                onClick={handleCancelResearch}
              >
                Cancel
              </button>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <p style={{ color: "#8a9bbd", margin: "0 0 5px 0" }}>
                {technologies[currentResearch].description}
              </p>
              <p style={{ color: "#8a9bbd", margin: 0 }}>
                {technologies[currentResearch].progress}/
                {technologies[currentResearch].cost}{" "}
                <span style={{ color: "#5ea8ed" }}>🔬</span>
              </p>
            </div>
            <div
              style={{
                width: "100%",
                height: "8px",
                background: "#2a3c53",
                borderRadius: "4px",
                overflow: "hidden",
                marginTop: "5px",
              }}
            >
              <div
                style={{
                  width: `${
                    (technologies[currentResearch].progress /
                      technologies[currentResearch].cost) *
                    100
                  }%`,
                  height: "100%",
                  background: "#5ea8ed",
                  borderRadius: "4px",
                }}
              ></div>
            </div>
          </div>
        ) : (
          <p style={{ color: "#8a9bbd" }}>No active research</p>
        )}
      </div>

      {/* Technology tree by era */}
      {Object.entries(techByEra).map(([era, techs]) => (
        <div key={era} style={{ marginBottom: "30px" }}>
          <h4
            style={{
              color: "#e6c570",
              margin: "0 0 15px 0",
              padding: "5px 0",
              borderBottom: "1px solid #2a3c53",
            }}
          >
            {era} Era
          </h4>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "15px" }}>
            {techs.map((tech) => {
              const researchable = canResearch(tech);
              const isResearched = tech.researched;
              const isCurrentlyResearching = currentResearch === tech.id;

              return (
                <div
                  key={tech.id}
                  style={{
                    width: "230px",
                    padding: "15px",
                    background: isResearched
                      ? "#2e4c34"
                      : isCurrentlyResearching
                      ? "#3e2e4c"
                      : researchable
                      ? "#1e2d42"
                      : "#31394a",
                    borderRadius: "4px",
                    opacity:
                      researchable || isResearched || isCurrentlyResearching
                        ? 1
                        : 0.7,
                    cursor:
                      researchable && !isCurrentlyResearching
                        ? "pointer"
                        : "default",
                    border: isCurrentlyResearching
                      ? "1px solid #5ea8ed"
                      : "1px solid transparent",
                  }}
                  onClick={() => handleTechClick(tech)}
                >
                  <h5
                    style={{
                      color: isResearched
                        ? "#7dce82"
                        : isCurrentlyResearching
                        ? "#5ea8ed"
                        : "#e1e1e1",
                      margin: "0 0 10px 0",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    {tech.name}
                    {isResearched && <span>✓</span>}
                    {isCurrentlyResearching && <span>🔬</span>}
                  </h5>

                  <p
                    style={{
                      color: "#8a9bbd",
                      fontSize: "12px",
                      margin: "0 0 10px 0",
                    }}
                  >
                    {tech.description}
                  </p>

                  {tech.requirements.length > 0 && (
                    <div style={{ margin: "10px 0" }}>
                      <p
                        style={{
                          color: "#8a9bbd",
                          fontSize: "11px",
                          margin: "0 0 5px 0",
                        }}
                      >
                        Requirements:
                      </p>
                      <ul
                        style={{
                          margin: 0,
                          padding: "0 0 0 15px",
                          fontSize: "11px",
                          color: "#8a9bbd",
                        }}
                      >
                        {tech.requirements.map((reqId) => {
                          const reqTech = technologies[reqId];
                          const isReqResearched = reqTech?.researched;

                          return (
                            <li
                              key={reqId}
                              style={{
                                color: isReqResearched ? "#7dce82" : "#d65959",
                              }}
                            >
                              {reqTech?.name || reqId}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}

                  <div style={{ margin: "10px 0 0 0" }}>
                    <p
                      style={{
                        color: "#8a9bbd",
                        fontSize: "11px",
                        margin: "0 0 5px 0",
                      }}
                    >
                      Effects:
                    </p>
                    <ul
                      style={{
                        margin: 0,
                        padding: "0 0 0 15px",
                        fontSize: "11px",
                        color: "#e1e1e1",
                      }}
                    >
                      {tech.effects.map((effect, index) => (
                        <li key={index}>{effect}</li>
                      ))}
                    </ul>
                  </div>

                  {!isResearched && (
                    <div
                      style={{
                        marginTop: "10px",
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "center",
                        gap: "5px",
                      }}
                    >
                      <span style={{ color: "#5ea8ed", fontSize: "14px" }}>
                        🔬
                      </span>
                      <span style={{ color: "#e1e1e1" }}>{tech.cost}</span>
                    </div>
                  )}

                  {tech.progress > 0 && !isResearched && (
                    <div
                      style={{
                        width: "100%",
                        height: "4px",
                        background: "#2a3c53",
                        borderRadius: "2px",
                        overflow: "hidden",
                        marginTop: "10px",
                      }}
                    >
                      <div
                        style={{
                          width: `${(tech.progress / tech.cost) * 100}%`,
                          height: "100%",
                          background: "#5ea8ed",
                          borderRadius: "2px",
                        }}
                      ></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
});

// Add display name for debugging
TechnologyTree.displayName = "TechnologyTree";

export default TechnologyTree;
