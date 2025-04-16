// src/App.jsx - Fixed infinite update cycle
import React, { useEffect, useState, useCallback, useRef } from "react";
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
import GameIntegration from "./components/game/GameIntegration";
import { useGameStore } from "./stores/gameStore";
import { useMapStore } from "./stores/mapStore";
import { useResourcesStore } from "./stores/resourcesStore";
import { useTechnologyStore } from "./stores/technologyStore";
import { useWorkersStore } from "./stores/workersStore";
import { useMilitaryStore } from "./stores/militaryStore";
import { theme } from "./theme";
import { SkipToMainContent } from "./components/accessibility/AccessibilityComponents";

function App() {
  // State for tracking initialization
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState(null);

  // Use a ref to track if we've processed a turn change already
  const processedTurnRef = useRef({});

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

  // Add military store initialization
  const initializeMilitary = useMilitaryStore(
    (state) => state.initializeMilitary
  );

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

        // Initialize military system
        initializeMilitary();

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
    initializeMilitary,
    startGame,
  ]);

  // Update research progress when turn changes with error handling
  // Fixed to prevent infinite update loops
  useEffect(() => {
    // Skip if we've already processed this turn or if there's no research
    if (
      currentTurn <= 1 ||
      !currentResearch ||
      processedTurnRef.current[currentTurn]
    ) {
      return;
    }

    // Mark that we've processed this turn
    processedTurnRef.current[currentTurn] = true;

    try {
      // Get current science production - fixed hardcoded value
      const scienceProduction = 2;
      updateResearchProgress(scienceProduction);
    } catch (error) {
      console.error("Error updating research progress:", error);
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
          role="alert"
          aria-live="assertive"
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
        role="status"
        aria-live="polite"
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
        {/* Skip to main content link */}
        <SkipToMainContent />

        <Box className="app" h="100vh" w="100vw">
          {gameStarted ? (
            <Box
              as="main"
              id="main-content"
              h="100%"
              w="100%"
              aria-label="Empire's Legacy Game"
            >
              {/* Game Integration component for handling game systems */}
              <GameIntegration />

              <GameContainer />
            </Box>
          ) : (
            renderInitialScreen()
          )}
        </Box>
      </ErrorBoundary>
    </ChakraProvider>
  );
}

export default React.memo(App);
