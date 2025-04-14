// src/App.jsx
import React, { useEffect, useState, useCallback } from "react";
import {
  ChakraProvider,
  Flex,
  Heading,
  Text,
  Spinner,
  Box,
} from "@chakra-ui/react";
import GameContainer from "./components/game/GameContainer";
import ErrorBoundary from "./components/common/ErrorBoundary";
import { useGameStore } from "./stores/gameStore";
import { useMapStore } from "./stores/mapStore";
import { useResourcesStore } from "./stores/resourcesStore";
import { useTechnologyStore } from "./stores/technologyStore";
import { useWorkersStore } from "./stores/workersStore";
import { theme } from "./theme";

function App() {
  // State for tracking initialization
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState(null);

  // Access stores with individual selectors
  const startGame = useGameStore((state) => state.startGame);
  const gameStarted = useGameStore((state) => state.gameStarted);
  const currentTurn = useGameStore((state) => state.currentTurn);

  const initializeMap = useMapStore((state) => state.initializeMap);

  // Updated to use refactored resources store
  const initializeResources = useResourcesStore(
    (state) => state.initializeResources
  );

  const updateResearchProgress = useTechnologyStore(
    (state) => state.updateResearchProgress
  );
  const currentResearch = useTechnologyStore((state) => state.currentResearch);

  // Add workers store initialization
  const initializeWorkers = useWorkersStore((state) => state.initializeWorkers);

  // Reset function for error boundary
  const handleReset = useCallback(() => {
    setIsInitialized(false);
    setInitError(null);
  }, []);

  // Initialize the game only once on component mount with error handling
  useEffect(() => {
    if (!isInitialized && !initError) {
      try {
        // Initialize resources - updated to use refactored store
        // Pass starting amounts for each resource
        initializeResources({
          food: 50,
          production: 30,
          science: 20,
          gold: 100,
        });

        // Initialize map with territories
        initializeMap();

        // Initialize workers (start with 5 workers)
        initializeWorkers(5);

        // Start the game
        startGame();

        // Set initialization flag
        setIsInitialized(true);
      } catch (error) {
        console.error("Error initializing game:", error);
        setInitError(error);
      }
    }
  }, [
    isInitialized,
    initError,
    initializeMap,
    initializeResources,
    initializeWorkers,
    startGame,
  ]);

  // Update research progress when turn changes with error handling
  useEffect(() => {
    if (currentTurn > 1 && currentResearch) {
      try {
        // Get current science production
        const scienceProduction = 2; // This would come from your resources store
        updateResearchProgress(scienceProduction);
      } catch (error) {
        console.error("Error updating research progress:", error);
      }
    }
  }, [currentTurn, currentResearch, updateResearchProgress]);

  // Render loading indicator or error message during initialization
  const renderInitialScreen = () => {
    if (initError) {
      return (
        <Flex
          direction="column"
          justify="center"
          align="center"
          h="100vh"
          bg="background.main"
          color="text.primary"
        >
          <Heading size="xl" color="status.danger" mb={6} fontFamily="heading">
            Initialization Error
          </Heading>

          <Box maxW="600px" textAlign="center">
            <Text fontSize="lg" color="text.secondary" mb={4}>
              There was an error starting the game. Please try refreshing the
              page.
            </Text>
            <Text fontSize="sm" color="text.secondary">
              Error: {initError.message}
            </Text>
          </Box>
        </Flex>
      );
    }

    return (
      <Flex
        direction="column"
        justify="center"
        align="center"
        h="100vh"
        bg="background.main"
        color="text.primary"
      >
        <Heading size="xl" color="accent.main" mb={6} fontFamily="heading">
          Empire's Legacy
        </Heading>

        <Flex align="center" direction="column">
          <Spinner
            thickness="4px"
            speed="0.8s"
            emptyColor="background.highlight"
            color="accent.main"
            size="xl"
            mb={4}
          />
          <Text fontSize="lg" color="text.secondary">
            Loading game...
          </Text>
        </Flex>
      </Flex>
    );
  };

  return (
    <ChakraProvider theme={theme}>
      <ErrorBoundary onReset={handleReset}>
        <Box className="app" h="100vh" w="100vw">
          {gameStarted ? <GameContainer /> : renderInitialScreen()}
        </Box>
      </ErrorBoundary>
    </ChakraProvider>
  );
}

export default React.memo(App);
