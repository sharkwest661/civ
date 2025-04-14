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

  // Turn management
  advanceTurn: () => {
    const currentTurn = get().currentTurn;
    set({
      currentTurn: currentTurn + 1,
      currentPhase: "Assignment", // Reset to first phase on new turn
    });

    // This would be where we trigger AI turns, resource updates, etc.
    // We'll implement this later
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
