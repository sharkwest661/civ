import React, { useEffect, useState, useCallback } from "react";
import { ChakraProvider } from "@chakra-ui/react";
import GameContainer from "./components/game/GameContainer";
import { useGameStore } from "./stores/gameStore";
import { useMapStore } from "./stores/mapStore";
import { useResourcesStore } from "./stores/resourcesStore";
import { useTechnologyStore } from "./stores/technologyStore";
import { theme } from "./theme";

function App() {
  // State for tracking initialization
  const [isInitialized, setIsInitialized] = useState(false);

  // Access stores with individual selectors
  const startGame = useGameStore((state) => state.startGame);
  const gameStarted = useGameStore((state) => state.gameStarted);
  const currentTurn = useGameStore((state) => state.currentTurn);

  const initializeMap = useMapStore((state) => state.initializeMap);

  const initializeResources = useResourcesStore(
    (state) => state.initializeResources
  );
  const updateAllResources = useResourcesStore(
    (state) => state.updateAllResources
  );

  const updateResearchProgress = useTechnologyStore(
    (state) => state.updateResearchProgress
  );
  const currentResearch = useTechnologyStore((state) => state.currentResearch);

  // Initialize the game only once on component mount
  useEffect(() => {
    if (!isInitialized) {
      // Initialize resources
      initializeResources({
        food: 50,
        production: 30,
        science: 20,
        gold: 100,
      });

      // Initialize map with territories
      initializeMap();

      // Start the game
      startGame();

      // Set initialization flag
      setIsInitialized(true);
    }
  }, [isInitialized, initializeMap, initializeResources, startGame]);

  // Update research progress when turn changes
  useEffect(() => {
    if (currentTurn > 1 && currentResearch) {
      // Get current science production
      const scienceProduction = 2; // This would come from your resources store
      updateResearchProgress(scienceProduction);
    }
  }, [currentTurn, currentResearch, updateResearchProgress]);

  return (
    <ChakraProvider theme={theme}>
      <div className="app">
        {gameStarted ? (
          <GameContainer />
        ) : (
          // This would be replaced with a proper loading screen or main menu
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100vh",
              background: "#1a2634",
              color: "#e1e1e1",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <h1
                style={{
                  fontSize: "32px",
                  color: "#e6c570",
                  marginBottom: "20px",
                }}
              >
                Empire's Legacy
              </h1>
              <p>Loading game...</p>
            </div>
          </div>
        )}
      </div>
    </ChakraProvider>
  );
}

export default React.memo(App);
