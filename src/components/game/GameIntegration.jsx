// src/components/game/GameIntegration.jsx
import React, { useEffect, useRef } from "react";
import { useToast } from "@chakra-ui/react";
import { useGameStore } from "../../stores/gameStore";
import { useResourcesStore } from "../../stores/resourcesStore";
import { useMilitaryStore } from "../../stores/militaryStore";
import { useWorkersStore } from "../../stores/workersStore"; // Added workers store
import { generateUniqueId } from "../../utils/gameUtils";

/**
 * GameIntegration - Integrates systems with game flow
 * Added worker growth system and fixed specialization issues
 */
const GameIntegration = () => {
  const toast = useToast();

  // Ref to track processed turns to prevent duplicate processing
  const processedTurnRef = useRef(0);

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
  const updateAllResources = useResourcesStore(
    (state) => state.updateAllResources
  );
  const food = useResourcesStore((state) => state.food);
  const gold = useResourcesStore((state) => state.gold);

  // Worker state
  const addWorker = useWorkersStore((state) => state.addWorker);
  const totalWorkerCount = useWorkersStore((state) => state.totalWorkerCount);

  // Initialize military system when game starts
  useEffect(() => {
    if (gameStarted) {
      initializeMilitary();
    }
  }, [gameStarted, initializeMilitary]);

  // Handle turn changes - separated from other effects
  useEffect(() => {
    // Skip first turn and already processed turns
    if (currentTurn <= 1 || processedTurnRef.current >= currentTurn) return;

    // Mark this turn as processed to prevent infinite loops
    processedTurnRef.current = currentTurn;

    // Process turn logic
    const processTurn = async () => {
      try {
        console.log("Processing turn", currentTurn);

        // Update all resources based on their production rates
        updateAllResources();

        // Handle worker growth based on food production
        // Only process if we have positive food production
        if (food && food.production > 0) {
          // Calculate food needed for a new worker (increases with worker count)
          // Base cost: 20 food, increases by 5 for each worker
          const foodNeededForWorker = 20 + totalWorkerCount * 5;

          // Food accumulation over several turns (simulate stored progress)
          // In a real implementation, this would be stored in workerStore state
          // For demonstration, we'll just use current food production

          // Create a worker if we have at least the needed food
          if (food.amount >= foodNeededForWorker) {
            // Create a new worker
            const newWorkerId = addWorker();

            // Use food for the worker
            updateResource("food", -foodNeededForWorker);

            // Notify player
            toast({
              title: "Population Growth",
              description: `A new worker has joined your empire! ${
                newWorkerId ? `(ID: ${newWorkerId})` : ""
              }`,
              status: "success",
              duration: 5000,
              isClosable: true,
            });

            console.log("New worker created with ID:", newWorkerId);
          }
        }

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

        // Every 3 turns, add a new tactical card
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
            const cardIndex = Math.floor(
              Math.random() * intermediateCards.length
            );
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
      } catch (error) {
        console.error("Error processing turn:", error);
      }
    };

    // Execute turn processing logic
    processTurn();
  }, [
    currentTurn,
    updateAllResources,
    food,
    addWorker,
    totalWorkerCount,
    updateResource,
    resetUnitMovement,
    calculateMaintenance,
    gold,
    addTacticalCard,
    toast,
  ]);

  // Handle phase changes - kept separate
  useEffect(() => {
    if (currentPhase === "Military") {
      // Optional: Could trigger notifications or special actions when entering Military phase
    }
  }, [currentPhase]);

  // This component doesn't render anything visual
  return null;
};

export default GameIntegration;
