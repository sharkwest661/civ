// src/stores/gameStore.js - Fixed to prevent state update loops
import { create } from "zustand";

/**
 * Game Store
 *
 * Manages the core game state including:
 * - Current turn
 * - Current game phase
 * - Current player
 * - Game settings
 */
export const useGameStore = create((set, get) => ({
  // Game state
  currentTurn: 1,
  currentPhase: "Assignment", // Assignment, Building, Research, Military, Diplomacy
  gameStarted: false,
  gamePaused: false,
  gameEnded: false,
  turnProcessing: false, // NEW - Flag to prevent multiple turn processing

  // Player state
  currentPlayer: {
    id: "player1",
    name: "Player",
    civilization: "solarian", // solarian, celestial, northern, desert, forest, island
    color: "#c17443", // Solarian color from design doc
    isHuman: true,
  },

  // AI players
  aiPlayers: [
    {
      id: "ai1",
      name: "Celestial Dynasty",
      civilization: "celestial",
      color: "#43c1be", // Celestial color from design doc
      difficulty: "normal",
      isHuman: false,
    },
    {
      id: "ai2",
      name: "Northern Clans",
      civilization: "northern",
      color: "#4374c1", // Northern color from design doc
      difficulty: "normal",
      isHuman: false,
    },
  ],

  // Game settings
  settings: {
    mapSize: "medium", // small, medium, large
    gameDifficulty: "normal", // easy, normal, hard
    gameSpeed: "normal", // slow, normal, fast
    victoryConditions: {
      military: true,
      cultural: true,
      diplomatic: true,
      wonder: true,
    },
  },

  // Game actions
  startGame: () => set({ gameStarted: true }),
  pauseGame: () => set({ gamePaused: true }),
  resumeGame: () => set({ gamePaused: false }),
  endGame: () => set({ gameEnded: true }),

  // Turn management - FIXED to prevent infinite loops
  advanceTurn: () => {
    // Get current state
    const { currentTurn, turnProcessing } = get();

    // Don't process if we're already processing a turn change
    if (turnProcessing) return;

    // Set the processing flag to true
    set({ turnProcessing: true });

    // Update the turn counter and reset phase
    set({
      currentTurn: currentTurn + 1,
      currentPhase: "Assignment", // Reset to first phase on new turn
    });

    // After a slight delay, reset the processing flag
    // This prevents multiple rapid turn advancements
    setTimeout(() => {
      set({ turnProcessing: false });
    }, 100);
  },

  // Phase management
  setPhase: (phase) => set({ currentPhase: phase }),

  // Player management
  setCurrentPlayer: (player) => set({ currentPlayer: player }),

  // Settings management
  updateSettings: (newSettings) => {
    set((state) => ({
      settings: {
        ...state.settings,
        ...newSettings,
      },
    }));
  },
}));

export default useGameStore;
