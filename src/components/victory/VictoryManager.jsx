// src/components/victory/VictoryManager.jsx
import React, { useEffect, useState } from "react";
import { useVictoryStore } from "../../stores/victoryStore";
import { useMapStore } from "../../stores/mapStore";
import { useResourcesStore } from "../../stores/resourcesStore";
import { useGameStore } from "../../stores/gameStore";
import VictoryScreen from "./VictoryScreen";
import DefeatScreen from "./DefeatScreen";
import { useToast } from "@chakra-ui/react";

/**
 * VictoryManager - Handles checking victory conditions and showing victory/defeat screens
 * This component doesn't render anything visible by itself but manages the game state
 */
const VictoryManager = () => {
  const [showVictory, setShowVictory] = useState(false);
  const [showDefeat, setShowDefeat] = useState(false);

  const toast = useToast();

  // Get relevant state from stores
  const victoryAchieved = useVictoryStore((state) => state.victoryAchieved);
  const defeatState = useVictoryStore((state) => state.defeatState);
  const victoryType = useVictoryStore((state) => state.victoryType);
  const checkForVictory = useVictoryStore((state) => state.checkForVictory);
  const updateMilitaryProgress = useVictoryStore(
    (state) => state.updateMilitaryProgress
  );
  const updateCulturalProgress = useVictoryStore(
    (state) => state.updateCulturalProgress
  );
  const updateWonderProgress = useVictoryStore(
    (state) => state.updateWonderProgress
  );
  const resetVictoryState = useVictoryStore((state) => state.resetVictoryState);

  const territories = useMapStore((state) => state.territories);
  const culture = useResourcesStore((state) => state.culture);
  const currentTurn = useGameStore((state) => state.currentTurn);
  const startGame = useGameStore((state) => state.startGame);

  // Check for victory/defeat conditions on each turn
  useEffect(() => {
    // Skip first turn
    if (currentTurn <= 1) return;

    // Check military victory - count captured capitals
    const aiCapitals = Object.values(territories).filter(
      (t) => t.isCapital && t.owner && t.owner !== "player1"
    );

    const capturedCapitals = Object.values(territories)
      .filter(
        (t) =>
          t.isCapital &&
          t.isOwned &&
          t.owner === "player1" &&
          t.originalOwner !== "player1"
      )
      .map((t) => t.id);

    updateMilitaryProgress(capturedCapitals);

    // Check cultural victory - update influence
    // In a real implementation, this would come from actual culture points
    // For now, use accumulating culture
    updateCulturalProgress(culture?.amount || 0);

    // Check wonder victory - update wonder progress
    // In a real implementation, we would track if the Grand Citadel was built
    // For this demo, consider it built if we have certain building
    const hasGrandCitadel = Object.values(territories).some(
      (t) =>
        t.isOwned &&
        t.owner === "player1" &&
        t.buildings?.some((b) => b.name === "Grand Citadel")
    );

    // If the wonder was built, increment the turns held counter
    let turnsHeld = 0;
    if (hasGrandCitadel) {
      // In a real implementation, we would store this in the wonder progress state
      // For this example, we'll just increment based on the current turn
      turnsHeld = Math.min(5, Math.floor((currentTurn - 20) / 2)); // Example logic
      if (turnsHeld < 0) turnsHeld = 0;
    }

    updateWonderProgress(hasGrandCitadel, turnsHeld);

    // Check for victory
    if (checkForVictory() && !showVictory) {
      setShowVictory(true);

      toast({
        title: `${
          victoryType.charAt(0).toUpperCase() + victoryType.slice(1)
        } Victory!`,
        description: "You have achieved victory!",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    }

    // Check for defeat conditions
    // Example: Capital loss
    const playerHasCapital = Object.values(territories).some(
      (t) =>
        t.isCapital &&
        t.isOwned &&
        t.owner === "player1" &&
        t.originalOwner === "player1"
    );

    if (!defeatState && !playerHasCapital && currentTurn > 5) {
      // Player lost their capital
      useVictoryStore
        .getState()
        .setDefeat(
          "Your capital has been captured by enemy forces. Your empire has fallen."
        );
      setShowDefeat(true);

      toast({
        title: "Defeat",
        description: "Your capital has fallen to enemy forces!",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  }, [
    currentTurn,
    territories,
    culture,
    updateMilitaryProgress,
    updateCulturalProgress,
    updateWonderProgress,
    checkForVictory,
    victoryType,
    defeatState,
    showVictory,
    toast,
  ]);

  // Handle restarting the game after defeat
  const handleRestartGame = () => {
    // Reset game state
    startGame();
    resetVictoryState();
    setShowDefeat(false);
  };

  return (
    <>
      <VictoryScreen
        isOpen={showVictory}
        onClose={() => setShowVictory(false)}
      />

      <DefeatScreen
        isOpen={showDefeat}
        onClose={() => setShowDefeat(false)}
        onRestartGame={handleRestartGame}
      />
    </>
  );
};

export default VictoryManager;
