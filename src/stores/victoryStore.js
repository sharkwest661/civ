// src/stores/victoryStore.js
import { create } from "zustand";

/**
 * Victory Store
 *
 * Manages the game victory conditions including:
 * - Military victory (capture all capitals)
 * - Cultural victory (achieve cultural influence threshold)
 * - Wonder victory (build and maintain Grand Citadel)
 */
export const useVictoryStore = create((set, get) => ({
  // Victory progress
  militaryProgress: {
    capturedCapitals: [], // Array of captured capital IDs
    totalCapitals: 2, // Total AI capitals to capture
    percentComplete: 0, // Calculated percentage
  },

  culturalProgress: {
    currentInfluence: 0,
    targetInfluence: 500, // Threshold for cultural victory
    percentComplete: 0,
  },

  wonderProgress: {
    grandCitadelBuilt: false,
    turnsHeld: 0,
    requiredTurns: 5,
    percentComplete: 0,
  },

  // Victory state
  victoryAchieved: false,
  victoryType: null, // 'military', 'cultural', 'wonder'
  defeatState: false,
  defeatReason: null,

  // Methods to update progress
  updateMilitaryProgress: (capturedCapitals) => {
    set((state) => {
      const totalCapitals = state.militaryProgress.totalCapitals;
      const percentComplete = (capturedCapitals.length / totalCapitals) * 100;

      return {
        militaryProgress: {
          ...state.militaryProgress,
          capturedCapitals,
          percentComplete,
        },
        victoryAchieved: capturedCapitals.length >= totalCapitals,
        victoryType:
          capturedCapitals.length >= totalCapitals
            ? "military"
            : state.victoryType,
      };
    });
  },

  updateCulturalProgress: (currentInfluence) => {
    set((state) => {
      const targetInfluence = state.culturalProgress.targetInfluence;
      const percentComplete = Math.min(
        100,
        (currentInfluence / targetInfluence) * 100
      );

      return {
        culturalProgress: {
          ...state.culturalProgress,
          currentInfluence,
          percentComplete,
        },
        victoryAchieved: currentInfluence >= targetInfluence,
        victoryType:
          currentInfluence >= targetInfluence ? "cultural" : state.victoryType,
      };
    });
  },

  updateWonderProgress: (grandCitadelBuilt, turnsHeld) => {
    set((state) => {
      const requiredTurns = state.wonderProgress.requiredTurns;
      const percentComplete = Math.min(100, (turnsHeld / requiredTurns) * 100);
      const wonderComplete = grandCitadelBuilt && turnsHeld >= requiredTurns;

      return {
        wonderProgress: {
          ...state.wonderProgress,
          grandCitadelBuilt,
          turnsHeld,
          percentComplete,
        },
        victoryAchieved: wonderComplete,
        victoryType: wonderComplete ? "wonder" : state.victoryType,
      };
    });
  },

  // Method to set defeat state
  setDefeat: (reason) => {
    set({
      defeatState: true,
      defeatReason: reason,
    });
  },

  // Method to reset victory/defeat state
  resetVictoryState: () => {
    set({
      victoryAchieved: false,
      victoryType: null,
      defeatState: false,
      defeatReason: null,
      militaryProgress: {
        ...get().militaryProgress,
        capturedCapitals: [],
        percentComplete: 0,
      },
      culturalProgress: {
        ...get().culturalProgress,
        currentInfluence: 0,
        percentComplete: 0,
      },
      wonderProgress: {
        ...get().wonderProgress,
        grandCitadelBuilt: false,
        turnsHeld: 0,
        percentComplete: 0,
      },
    });
  },

  // Utility method to check for victory
  checkForVictory: () => {
    const state = get();

    // Military victory check
    if (
      state.militaryProgress.capturedCapitals.length >=
      state.militaryProgress.totalCapitals
    ) {
      set({ victoryAchieved: true, victoryType: "military" });
      return true;
    }

    // Cultural victory check
    if (
      state.culturalProgress.currentInfluence >=
      state.culturalProgress.targetInfluence
    ) {
      set({ victoryAchieved: true, victoryType: "cultural" });
      return true;
    }

    // Wonder victory check
    if (
      state.wonderProgress.grandCitadelBuilt &&
      state.wonderProgress.turnsHeld >= state.wonderProgress.requiredTurns
    ) {
      set({ victoryAchieved: true, victoryType: "wonder" });
      return true;
    }

    return false;
  },
}));

export default useVictoryStore;
