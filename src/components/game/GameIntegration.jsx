// src/components/game/GameIntegration.jsx
import React, { useEffect } from "react";
import { useToast } from "@chakra-ui/react";
import { useGameStore } from "../../stores/gameStore";
import { useResourcesStore } from "../../stores/resourcesStore";
import { useMilitaryStore } from "../../stores/militaryStore";
import { generateUniqueId } from "../../utils/gameUtils";

/**
 * GameIntegration - Integrates military system with the main game flow
 *
 * This component doesn't render anything visually but handles the integration
 * of military systems with the game turn flow and resource management.
 */
const GameIntegration = () => {
  const toast = useToast();

  // Game state
  const currentTurn = useGameStore((state) => state.currentTurn);
  const currentPhase = useGameStore((state) => state.currentPhase);
  const gameStarted = useGameStore((state) => state.gameStarted);

  // Military state
  const initializeMilitary = useMilitaryStore(
    (state) => state.initializeMilitary
  );
  const resetUnitMovement = useMilitaryStore(
    (state) => state.resetUnitMovement
  );
  const calculateMaintenance = useMilitaryStore(
    (state) => state.calculateMaintenance
  );
  const addTacticalCard = useMilitaryStore((state) => state.addTacticalCard);

  // Resource state
  const updateResource = useResourcesStore((state) => state.updateResource);
  const gold = useResourcesStore((state) => state.gold);

  // Initialize military system when game starts
  useEffect(() => {
    if (gameStarted) {
      initializeMilitary();
    }
  }, [gameStarted, initializeMilitary]);

  // Handle turn changes - process military maintenance and movement resets
  useEffect(() => {
    if (currentTurn <= 1) return;

    // Reset movement points for all units
    resetUnitMovement();

    // Calculate maintenance costs
    const maintenanceCosts = calculateMaintenance();

    // Pay maintenance from gold reserves
    if (maintenanceCosts.gold > 0) {
      updateResource("gold", -maintenanceCosts.gold);

      // Show warning if gold is running low
      if ((gold?.amount || 0) < maintenanceCosts.gold * 2) {
        toast({
          title: "Low Gold Reserves",
          description: `Military maintenance costs ${maintenanceCosts.gold} gold per turn. Your treasury is running low.`,
          status: "warning",
          duration: 5000,
          isClosable: true,
        });
      }
    }

    // Every 3 turns, add a new tactical card (simulates advisor/training)
    if (currentTurn % 3 === 0) {
      // 60% chance of basic card, 30% chance of intermediate, 10% chance of advanced
      const random = Math.random();
      if (random < 0.6) {
        // Basic card
        const basicCards = [
          "frontal-assault",
          "defensive-stance",
          "flanking-maneuver",
        ];
        const cardIndex = Math.floor(Math.random() * basicCards.length);
        addTacticalCard(basicCards[cardIndex]);
      } else if (random < 0.9) {
        // Intermediate card
        const intermediateCards = ["ambush", "high-ground", "shield-wall"];
        const cardIndex = Math.floor(Math.random() * intermediateCards.length);
        addTacticalCard(intermediateCards[cardIndex]);
      } else {
        // Advanced card
        const advancedCards = [
          "pincer-movement",
          "feigned-retreat",
          "night-attack",
        ];
        const cardIndex = Math.floor(Math.random() * advancedCards.length);
        addTacticalCard(advancedCards[cardIndex]);
      }

      toast({
        title: "New Tactical Card",
        description:
          "Your military advisors have developed a new tactical card.",
        status: "info",
        duration: 4000,
        isClosable: true,
      });
    }
  }, [
    currentTurn,
    resetUnitMovement,
    calculateMaintenance,
    updateResource,
    gold,
    addTacticalCard,
    toast,
  ]);

  // Handle phase changes
  useEffect(() => {
    if (currentPhase === "Military") {
      // Optional: Could trigger notifications or special actions when entering Military phase
    }
  }, [currentPhase]);

  // This component doesn't render anything visual
  return null;
};

export default GameIntegration;
