// src/components/game/GameContainer.jsx
import React, { useState, useCallback } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Icon,
} from "@chakra-ui/react";
import {
  Award,
  Users,
  Building,
  FlaskConical,
  Sword,
  // MessageCircle, // Removed import
} from "lucide-react";

import MapView from "../map/MapView";
import ResourcePanel from "../resources/ResourcePanel";
import TurnControls from "./TurnControls";
import BuildingPanel from "../buildings/BuildingPanel";
import TechnologyTree from "../technology/TechnologyTree";
import WorkerAssignmentPanel from "../workers/WorkerAssignmentPanel";
import MilitaryPanel from "../military/MilitaryPanel";
import { useGameStore } from "../../stores/gameStore";
import { useMapStore } from "../../stores/mapStore";
import { ScreenReaderAnnouncer } from "../accessibility/AccessibilityComponents";
import VictoryProgressPanel from "../victory/VictoryProgressPanel";
import VictoryManager from "../victory/VictoryManager";
import SharedButton from "../ui/SharedButton";

/**
 * GameContainer is the main component that brings together all game elements
 * Enhanced with accessibility features and military panel integration
 */
const GameContainer = () => {
  // Component state
  const [activeSidePanel, setActiveSidePanel] = useState(null); // null, "building", "tech", "military", "workers"

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

  // Handle territory selection - memoize with useCallback
  const handleTerritorySelect = useCallback(
    (hex) => {
      selectTerritory(hex);

      // Announce territory selection for screen readers
      if (hex && hex.territory) {
        const territoryType = hex.territory.type
          ? hex.territory.type.charAt(0).toUpperCase() +
            hex.territory.type.slice(1)
          : "Unknown";

        const announcement = `Selected territory at coordinates ${hex.q}, ${
          hex.r
        }. 
                             Type: ${territoryType}. 
                             ${hex.territory.isOwned ? "Owned territory." : ""}
                             ${
                               hex.territory.isCapital
                                 ? "Capital territory."
                                 : ""
                             }
                             ${
                               hex.territory.resource
                                 ? "Contains " +
                                   hex.territory.resource +
                                   " resource."
                                 : ""
                             }`;

        // Add visually hidden announcement for screen readers
        const announcer = document.getElementById("territory-announcer");
        if (announcer) {
          announcer.textContent = announcement;
        }
      }
    },
    [selectTerritory]
  );

  // Handle end turn - memoize with useCallback
  const handleEndTurn = useCallback(() => {
    // Advance to the next turn
    advanceTurn();

    // Announce turn change for screen readers
    const announcer = document.getElementById("turn-announcer");
    if (announcer) {
      announcer.textContent = `Advanced to turn ${currentTurn + 1}`;
    }
  }, [advanceTurn, currentTurn]);

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
          setActiveSidePanel("military"); // Set the military panel as active
          break;
        default:
          setActiveSidePanel(null);
      }

      // Announce phase change for screen readers
      const announcer = document.getElementById("phase-announcer");
      if (announcer) {
        announcer.textContent = `Changed to ${phase} phase`;
      }
    },
    [setPhase]
  );

  // Updated toggleSidePanel function for GameContainer.jsx

  const toggleSidePanel = useCallback(
    (panel) => {
      // Determine if we're opening a new panel
      const isOpening = activeSidePanel !== panel;

      // Update active panel state
      setActiveSidePanel((prev) => (prev === panel ? null : panel));

      // If opening a panel, update the game phase to match
      if (isOpening && panel) {
        // Map from panel names to phase names
        const panelToPhaseMap = {
          workers: "Assignment",
          building: "Building",
          tech: "Research",
          military: "Military",
        };

        // Update the game phase
        if (panelToPhaseMap[panel]) {
          setPhase(panelToPhaseMap[panel]);
        }
      }

      // Announce panel toggle for screen readers
      const announcer = document.getElementById("panel-announcer");
      if (announcer) {
        const action = activeSidePanel === panel ? "Closed" : "Opened";
        const panelName =
          panel === "workers"
            ? "Worker Assignment"
            : panel === "building"
            ? "Building"
            : panel === "tech"
            ? "Technology"
            : panel === "military"
            ? "Military"
            : "";

        announcer.textContent = `${action} ${panelName} panel`;
      }
    },
    [activeSidePanel, setPhase]
  );

  // Get phase button variant based on current phase
  const getPhaseButtonVariant = useCallback(
    (phase) => {
      return currentPhase === phase ? "primary" : "secondary";
    },
    [currentPhase]
  );

  // Get phase icon based on phase name
  const getPhaseIcon = useCallback((phase) => {
    switch (phase) {
      case "Assignment":
        return Users;
      case "Building":
        return Building;
      case "Research":
        return FlaskConical;
      case "Military":
        return Sword;
      default:
        return null;
    }
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
        // Render the MilitaryPanel component
        return <MilitaryPanel onClose={() => setActiveSidePanel(null)} />;

      case "victory":
        return (
          <VictoryProgressPanel onClose={() => setActiveSidePanel(null)} />
        );

      default:
        return (
          <Box p={4}>
            <Heading size="md" color="accent.main" mb={5} as="h2">
              Actions
            </Heading>

            <VStack spacing={3} align="stretch" mb={6}>
              <SharedButton
                onClick={() => toggleSidePanel("workers")}
                variant="primary"
                leftIcon={<Icon as={Users} boxSize={5} />}
                ariaLabel="Open worker assignment panel"
              >
                Assign Workers
              </SharedButton>

              <SharedButton
                onClick={() => toggleSidePanel("building")}
                variant="secondary"
                leftIcon={<Icon as={Building} boxSize={5} />}
                ariaLabel="Open building construction panel"
              >
                Build Structure
              </SharedButton>

              <SharedButton
                onClick={() => toggleSidePanel("tech")}
                variant="secondary"
                leftIcon={<Icon as={FlaskConical} boxSize={5} />}
                ariaLabel="Open technology research panel"
              >
                Research Technology
              </SharedButton>

              <SharedButton
                onClick={() => toggleSidePanel("military")}
                variant="secondary"
                leftIcon={<Icon as={Sword} boxSize={5} />}
                ariaLabel="Open military operations panel"
              >
                Military Operations
              </SharedButton>

              <SharedButton
                onClick={() => toggleSidePanel("victory")}
                variant="secondary"
                leftIcon={<Icon as={Award} boxSize={5} />}
                ariaLabel="Open victory progress panel"
              >
                Victory Progress
              </SharedButton>
            </VStack>

            {selectedTerritory && (
              <Box mt={4}>
                <Box bg="background.ui" p={3} borderRadius="md">
                  <VStack align="stretch" spacing={1}>
                    <Text fontSize="sm">
                      Coordinates: ({selectedTerritory.q}, {selectedTerritory.r}
                      )
                    </Text>

                    {selectedTerritory.territory && (
                      <>
                        {selectedTerritory.territory.type && (
                          <Text fontSize="sm">
                            Type:{" "}
                            {selectedTerritory.territory.type
                              .charAt(0)
                              .toUpperCase() +
                              selectedTerritory.territory.type.slice(1)}
                          </Text>
                        )}

                        {selectedTerritory.territory.resource && (
                          <Text fontSize="sm">
                            Resource: {selectedTerritory.territory.resource}
                          </Text>
                        )}
                      </>
                    )}
                  </VStack>
                </Box>
              </Box>
            )}
          </Box>
        );
    }
  };

  return (
    <Flex
      direction="column"
      height="100vh"
      width="100vw"
      bg="background.main"
      color="text.primary"
      data-testid="game-container"
      overflow="hidden" // Important to prevent scrollbars
    >
      {/* Top Bar with Resources and Controls */}
      <Flex
        as="header"
        justify="space-between"
        p={3}
        bg="background.panel"
        borderBottomWidth="1px"
        borderColor="background.highlight"
        aria-label="Game header"
      >
        <Box>
          <Heading size="md" color="accent.main" mb={1} as="h1">
            Empire's Legacy
          </Heading>
          <Text fontSize="sm" color="text.secondary">
            Turn: {currentTurn} | Phase: {currentPhase}
          </Text>
        </Box>

        <ResourcePanel />
      </Flex>

      {/* Main Content Area */}
      <Flex flex="1" overflow="hidden">
        {/* Main Map Area */}
        <Box
          as="section"
          flex="1"
          position="relative"
          overflow="hidden"
          data-testid="map-container"
          aria-label="Game map section"
          id="map-section"
        >
          <MapView
            territories={territories}
            onTerritorySelect={handleTerritorySelect}
            currentPlayer={currentPlayer}
          />
        </Box>

        {/* Side Panel */}
        <Box
          as="aside"
          w="550px"
          bg="background.panel"
          borderLeftWidth="1px"
          borderColor="background.highlight"
          overflowY="auto"
          position="relative"
          aria-label={
            activeSidePanel ? `${activeSidePanel} panel` : "Game controls panel"
          }
          role="complementary"
        >
          {renderSidePanel()}
        </Box>
      </Flex>

      {/* Bottom Bar with Turn Controls */}
      <Flex
        as="footer"
        p={3}
        bg="background.panel"
        borderTopWidth="1px"
        borderColor="background.highlight"
        justify="space-between"
        align="center"
        aria-label="Game controls"
      >
        <Flex gap={2}>
          {/* Phase buttons */}
          {["Assignment", "Building", "Research", "Military"].map((phase) => {
            const PhaseIcon = getPhaseIcon(phase);
            return (
              <SharedButton
                key={phase}
                onClick={() => handlePhaseChange(phase)}
                variant={getPhaseButtonVariant(phase)}
                size="sm"
                leftIcon={PhaseIcon && <PhaseIcon size={16} />}
                ariaLabel={`Change to ${phase} phase${
                  currentPhase === phase ? " (current phase)" : ""
                }`}
                aria-pressed={currentPhase === phase}
              >
                {phase}
              </SharedButton>
            );
          })}
        </Flex>

        <TurnControls
          onEndTurn={handleEndTurn}
          onOpenResearch={() => handlePhaseChange("Research")}
        />
      </Flex>

      <VictoryManager />

      {/* Screen reader announcement regions */}
      <div
        aria-live="polite"
        id="territory-announcer"
        style={{
          position: "absolute",
          width: "1px",
          height: "1px",
          padding: 0,
          margin: "-1px",
          overflow: "hidden",
          clip: "rect(0, 0, 0, 0)",
          whiteSpace: "nowrap",
          borderWidth: 0,
        }}
      ></div>
      <div
        aria-live="polite"
        id="turn-announcer"
        style={{
          position: "absolute",
          width: "1px",
          height: "1px",
          padding: 0,
          margin: "-1px",
          overflow: "hidden",
          clip: "rect(0, 0, 0, 0)",
          whiteSpace: "nowrap",
          borderWidth: 0,
        }}
      ></div>
      <div
        aria-live="polite"
        id="phase-announcer"
        style={{
          position: "absolute",
          width: "1px",
          height: "1px",
          padding: 0,
          margin: "-1px",
          overflow: "hidden",
          clip: "rect(0, 0, 0, 0)",
          whiteSpace: "nowrap",
          borderWidth: 0,
        }}
      ></div>
      <div
        aria-live="polite"
        id="panel-announcer"
        style={{
          position: "absolute",
          width: "1px",
          height: "1px",
          padding: 0,
          margin: "-1px",
          overflow: "hidden",
          clip: "rect(0, 0, 0, 0)",
          whiteSpace: "nowrap",
          borderWidth: 0,
        }}
      ></div>
    </Flex>
  );
};

export default React.memo(GameContainer);
