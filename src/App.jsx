import React, { useEffect } from "react";
import { ChakraProvider } from "@chakra-ui/react";
import GameContainer from "./components/game/GameContainer";
import { useGameStore } from "./stores/gameStore";
import { useMapStore } from "./stores/mapStore";
import { useResourcesStore } from "./stores/resourcesStore";
import { theme } from "./theme";

function App() {
  // Access stores
  const { startGame, gameStarted } = useGameStore((state) => ({
    startGame: state.startGame,
    gameStarted: state.gameStarted,
  }));

  const { initializeMap } = useMapStore((state) => ({
    initializeMap: state.initializeMap,
  }));

  const { initializeResources } = useResourcesStore((state) => ({
    initializeResources: state.initializeResources,
  }));

  // Initialize the game on component mount
  useEffect(() => {
    // Initialize map with territories
    initializeMap();

    // Initialize resources
    initializeResources({
      food: 50,
      production: 30,
      science: 20,
      gold: 100,
    });

    // Start the game
    startGame();
  }, []);

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

export default App;
