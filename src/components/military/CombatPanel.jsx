// src/components/military/CombatPanel.jsx
import React, { useState, useCallback, useEffect } from "react";
import {
  Box,
  Heading,
  Text,
  Flex,
  VStack,
  HStack,
  Badge,
  Divider,
  Icon,
  Progress,
  useToast,
} from "@chakra-ui/react";
import {
  ShieldAlert,
  Sword,
  AlertTriangle,
  Trophy,
  Flag,
  ArrowRight,
  Clock,
  X,
  Check,
} from "lucide-react";
import { useMilitaryStore } from "../../stores/militaryStore";
import SharedButton from "../ui/SharedButton";
import TacticalCardSelector from "./TacticalCardSelector";

/**
 * CombatPanel - Manages the combat process between territories
 */
const CombatPanel = ({ combat = {}, onTerritoryConquest }) => {
  const [isSelectingCard, setIsSelectingCard] = useState(false);
  const toast = useToast();

  // Get combat state from store
  const selectedCards = useMilitaryStore((state) => state.selectedCards);
  const tacticalCardTypes = useMilitaryStore(
    (state) => state.tacticalCardTypes
  );
  const selectCard = useMilitaryStore((state) => state.selectCard);
  const nextCombatRound = useMilitaryStore((state) => state.nextCombatRound);
  const endCombat = useMilitaryStore((state) => state.endCombat);
  const getAvailableCards = useMilitaryStore(
    (state) => state.getAvailableCards
  );
  const useTacticalCard = useMilitaryStore((state) => state.useTacticalCard);

  // Handle selecting a card
  const handleSelectCard = useCallback(
    (cardId) => {
      // Verify we have the card available
      const availableCards = getAvailableCards();
      const card = availableCards.find((card) => card.id === cardId);

      if (!card) {
        toast({
          title: "Card not available",
          description: "You don't have that tactical card available.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      // Use the card from player's deck
      useTacticalCard(cardId);

      // Update selected cards for the current round
      selectCard(cardId, "player");
      setIsSelectingCard(false);

      toast({
        title: "Card selected",
        description: `You've selected the ${card.name} card for this round.`,
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    },
    [selectCard, getAvailableCards, useTacticalCard, toast]
  );

  // Handle proceeding to next round
  const handleNextRound = useCallback(() => {
    // Check if player has selected a card for the current round
    const currentRound = combat.currentRound;
    const hasSelectedCard =
      selectedCards.player[currentRound - 1] !== undefined;

    if (!hasSelectedCard) {
      toast({
        title: "Select a card first",
        description: "You must select a tactical card before proceeding.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Proceed to next round
    const combatActive = nextCombatRound();

    if (!combatActive) {
      // Combat has ended, show outcome
      toast({
        title:
          combat.result === "victory"
            ? "Victory!"
            : combat.result === "defeat"
            ? "Defeat"
            : "Draw",
        description: combat.battleLog[combat.battleLog.length - 1]?.message,
        status:
          combat.result === "victory"
            ? "success"
            : combat.result === "defeat"
            ? "error"
            : "warning",
        duration: 5000,
        isClosable: true,
      });
    }
  }, [combat, selectedCards, nextCombatRound, toast]);

  // Handle ending combat and applying results
  const handleEndCombat = useCallback(() => {
    const outcome = endCombat(onTerritoryConquest);

    if (outcome && outcome.result === "victory") {
      toast({
        title: "Territory Conquered!",
        description:
          "Your forces have successfully conquered the enemy territory.",
        status: "success",
        duration: 4000,
        isClosable: true,
      });
    }
  }, [endCombat, onTerritoryConquest, toast]);

  // If no active combat, show placeholder
  if (!combat.active && !combat.result) {
    return (
      <Box>
        <Heading size="md" mb={4} color="accent.main">
          Combat System
        </Heading>

        <Box bg="background.ui" p={4} borderRadius="md" textAlign="center">
          <Flex justify="center" mb={3}>
            <Icon as={ShieldAlert} boxSize={10} color="text.secondary" />
          </Flex>
          <Text color="text.primary" mb={2}>
            No active combat
          </Text>
          <Text color="text.secondary" fontSize="sm">
            Select a territory with military units and use the Attack tab to
            initiate combat.
          </Text>
        </Box>
      </Box>
    );
  }

  // If showing card selection UI
  if (isSelectingCard) {
    return (
      <TacticalCardSelector
        availableCards={getAvailableCards()}
        onSelectCard={handleSelectCard}
        onCancel={() => setIsSelectingCard(false)}
        roundNumber={combat.currentRound}
      />
    );
  }

  // Render the active combat or combat results
  return (
    <Box>
      <Heading size="md" mb={4} color="accent.main">
        {combat.active
          ? `Combat: Round ${combat.currentRound} of ${combat.totalRounds}`
          : "Combat Results"}
      </Heading>

      {/* Territories involved */}
      <Flex gap={4} mb={4} align="center" justify="center">
        <Box
          bg="background.ui"
          p={3}
          borderRadius="md"
          flex="1"
          textAlign="center"
        >
          <Badge colorScheme="blue" mb={2}>
            Your Forces
          </Badge>
          <Text color="text.primary">
            {combat.attackingTerritory?.type
              ? combat.attackingTerritory.type.charAt(0).toUpperCase() +
                combat.attackingTerritory.type.slice(1)
              : "Unknown"}{" "}
            {combat.attackingTerritory?.isCapital ? "(Capital)" : ""}
          </Text>
          <Text fontSize="sm" color="text.secondary" mt={1}>
            Units: {combat.attackingUnits?.length || 0}
          </Text>
        </Box>

        <Icon as={Sword} boxSize={6} color="accent.main" />

        <Box
          bg="background.ui"
          p={3}
          borderRadius="md"
          flex="1"
          textAlign="center"
        >
          <Badge colorScheme="red" mb={2}>
            Enemy Forces
          </Badge>
          <Text color="text.primary">
            {combat.defendingTerritory?.type
              ? combat.defendingTerritory.type.charAt(0).toUpperCase() +
                combat.defendingTerritory.type.slice(1)
              : "Unknown"}{" "}
            {combat.defendingTerritory?.isCapital ? "(Capital)" : ""}
          </Text>
          <Text fontSize="sm" color="text.secondary" mt={1}>
            Units: {combat.defendingUnits?.length || 0}
          </Text>
        </Box>
      </Flex>

      {/* Combat progress */}
      {combat.active && (
        <Box bg="background.highlight" p={3} borderRadius="md" mb={4}>
          <Flex justify="space-between" align="center" mb={2}>
            <Text fontSize="sm" color="text.secondary">
              Combat Progress:
            </Text>
            <Text fontSize="sm" color="text.primary">
              Round {combat.currentRound} of {combat.totalRounds}
            </Text>
          </Flex>

          <Progress
            value={(combat.currentRound / combat.totalRounds) * 100}
            size="sm"
            colorScheme="blue"
            borderRadius="full"
          />

          {/* Current round action */}
          <Box mt={4}>
            <Text fontSize="sm" fontWeight="medium" color="accent.main" mb={2}>
              Current Round Actions:
            </Text>

            {selectedCards.player[combat.currentRound - 1] ? (
              <Flex
                bg="background.ui"
                p={2}
                borderRadius="md"
                justify="space-between"
                align="center"
              >
                <HStack>
                  <Text>
                    {tacticalCardTypes[
                      selectedCards.player[combat.currentRound - 1]
                    ]?.icon || "🃏"}
                  </Text>
                  <Text fontSize="sm">
                    {tacticalCardTypes[
                      selectedCards.player[combat.currentRound - 1]
                    ]?.name || "Unknown Card"}
                  </Text>
                </HStack>
                <Badge colorScheme="green">
                  <Flex align="center">
                    <Icon as={Check} boxSize={3} mr={1} />
                    Selected
                  </Flex>
                </Badge>
              </Flex>
            ) : (
              <SharedButton
                variant="primary"
                size="sm"
                leftIcon={<Icon as={Flag} boxSize={4} />}
                onClick={() => setIsSelectingCard(true)}
                width="100%"
              >
                Select Tactical Card
              </SharedButton>
            )}

            <SharedButton
              variant="secondary"
              size="sm"
              leftIcon={<Icon as={ArrowRight} boxSize={4} />}
              onClick={handleNextRound}
              width="100%"
              mt={3}
              isDisabled={!selectedCards.player[combat.currentRound - 1]}
            >
              Next Round
            </SharedButton>
          </Box>
        </Box>
      )}

      {/* Battle log */}
      <Box mb={4}>
        <Heading size="sm" mb={3} color="text.primary">
          Battle Log
        </Heading>

        <VStack
          spacing={3}
          align="stretch"
          maxH="300px"
          overflowY="auto"
          bg="background.ui"
          p={3}
          borderRadius="md"
        >
          {combat.battleLog.map((log, index) => (
            <Box key={index}>
              {log.round !== 0 && log.round !== "Final" ? (
                <Box>
                  <Flex justify="space-between" align="center" mb={2}>
                    <Badge colorScheme="blue" px={2}>
                      Round {log.round}
                    </Badge>
                    <Badge
                      colorScheme={
                        log.winner === "player"
                          ? "green"
                          : log.winner === "opponent"
                          ? "red"
                          : "gray"
                      }
                      px={2}
                    >
                      {log.winner === "player"
                        ? "Victory"
                        : log.winner === "opponent"
                        ? "Defeat"
                        : "Draw"}
                    </Badge>
                  </Flex>

                  <Flex gap={4} mb={2}>
                    <Box flex="1">
                      <Text fontSize="sm" color="text.secondary">
                        Your Card:
                      </Text>
                      <Flex
                        bg="background.panel"
                        p={2}
                        borderRadius="md"
                        align="center"
                      >
                        <Text mr={1}>
                          {tacticalCardTypes[log.playerCard]?.icon || "🃏"}
                        </Text>
                        <Text fontSize="sm">
                          {tacticalCardTypes[log.playerCard]?.name || "Unknown"}
                        </Text>
                        <Badge ml="auto" colorScheme="blue">
                          {log.playerScore}
                        </Badge>
                      </Flex>
                    </Box>

                    <Box flex="1">
                      <Text fontSize="sm" color="text.secondary">
                        Enemy Card:
                      </Text>
                      <Flex
                        bg="background.panel"
                        p={2}
                        borderRadius="md"
                        align="center"
                      >
                        <Text mr={1}>
                          {tacticalCardTypes[log.opponentCard]?.icon || "🃏"}
                        </Text>
                        <Text fontSize="sm">
                          {tacticalCardTypes[log.opponentCard]?.name ||
                            "Unknown"}
                        </Text>
                        <Badge ml="auto" colorScheme="red">
                          {log.opponentScore}
                        </Badge>
                      </Flex>
                    </Box>
                  </Flex>
                </Box>
              ) : (
                <Box>
                  <Badge
                    colorScheme={
                      log.round === "Final"
                        ? combat.result === "victory"
                          ? "green"
                          : combat.result === "defeat"
                          ? "red"
                          : "yellow"
                        : "blue"
                    }
                    px={2}
                  >
                    {log.round === "Final" ? "Result" : "Combat Start"}
                  </Badge>
                </Box>
              )}

              <Text fontSize="sm" color="text.secondary" mt={1}>
                {log.message}
              </Text>

              {index < combat.battleLog.length - 1 && <Divider mt={2} />}
            </Box>
          ))}
        </VStack>
      </Box>

      {/* Combat outcome */}
      {!combat.active && combat.result && (
        <Box
          p={4}
          borderRadius="md"
          bg={
            combat.result === "victory"
              ? "status.success"
              : combat.result === "defeat"
              ? "status.danger"
              : "status.warning"
          }
          color="white"
          mb={4}
          textAlign="center"
        >
          <Icon
            as={
              combat.result === "victory"
                ? Trophy
                : combat.result === "defeat"
                ? AlertTriangle
                : Flag
            }
            boxSize={8}
            mb={2}
          />
          <Heading size="md" mb={2}>
            {combat.result === "victory"
              ? "Victory!"
              : combat.result === "defeat"
              ? "Defeat"
              : "Draw"}
          </Heading>
          <Text fontSize="sm">
            {combat.result === "victory"
              ? "Your forces have conquered the enemy territory!"
              : combat.result === "defeat"
              ? "Your forces have been defeated!"
              : "The battle has ended in a stalemate."}
          </Text>

          <SharedButton
            variant="secondary"
            size="md"
            mt={4}
            onClick={handleEndCombat}
          >
            {combat.result === "victory" ? "Claim Territory" : "Acknowledge"}
          </SharedButton>
        </Box>
      )}
    </Box>
  );
};

export default React.memo(CombatPanel);
