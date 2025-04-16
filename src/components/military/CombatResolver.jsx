// src/components/military/CombatResolver.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Text,
  Flex,
  VStack,
  HStack,
  Progress,
  Badge,
  Divider,
  Button,
  Grid,
  GridItem,
  Icon,
  useToast,
} from "@chakra-ui/react";
import {
  Sword,
  Shield,
  Target,
  Flag,
  Clock,
  User,
  ChevronRight,
  BarChart2,
  Map,
  Heart,
  Award,
  Zap,
} from "lucide-react";
import { useMilitaryStore } from "../../stores/enhancedMilitaryStore";
import { useMapStore } from "../../stores/mapStore";
import SharedButton from "../ui/SharedButton";
import UnitCard from "./UnitCard";

/**
 * CombatResolver - Displays and manages an active combat encounter
 *
 * The component handles:
 * - Combat visualization
 * - Round progression
 * - Card selection
 * - Battle outcome presentation
 */
const CombatResolver = ({ onClose }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [battlePhase, setBattlePhase] = useState("preparation"); // preparation, execution, results
  const [battleAnimation, setBattleAnimation] = useState(null);
  const toast = useToast();

  // Get combat data from store with individual selectors
  const combat = useMilitaryStore((state) => state.combat);
  const selectedCards = useMilitaryStore((state) => state.selectedCards);
  const tacticalCardTypes = useMilitaryStore(
    (state) => state.tacticalCardTypes
  );
  const getAvailableCards = useMilitaryStore(
    (state) => state.getAvailableCards
  );
  const selectCard = useMilitaryStore((state) => state.selectCard);
  const nextCombatRound = useMilitaryStore((state) => state.nextCombatRound);
  const endCombat = useMilitaryStore((state) => state.endCombat);
  const useTacticalCard = useMilitaryStore((state) => state.useTacticalCard);

  // Get territory data from map store
  const territories = useMapStore((state) => state.territories);
  const setTerritoryControl = useMapStore((state) => state.setTerritoryControl);

  // Get available cards for the current round
  const availableCards = getAvailableCards();

  // Effect to handle animation states during battle
  useEffect(() => {
    if (battlePhase === "execution") {
      // Simulate battle animation with timing
      const timer1 = setTimeout(() => {
        setBattleAnimation("cards");
      }, 500);

      const timer2 = setTimeout(() => {
        setBattleAnimation("clash");
      }, 2000);

      const timer3 = setTimeout(() => {
        setBattleAnimation("result");
        setBattlePhase("results");
      }, 3500);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [battlePhase]);

  // Handle selecting a card
  const handleSelectCard = (cardId) => {
    setSelectedCardId(cardId);
  };

  // Handle confirming card selection
  const handleConfirmCardSelection = () => {
    if (!selectedCardId) {
      toast({
        title: "Select a card",
        description: "You must select a tactical card for this round.",
        status: "warning",
        duration: 2000,
      });
      return;
    }

    // Use the card from player's deck
    useTacticalCard(selectedCardId);

    // Update selected cards for the current round
    selectCard(selectedCardId, "player");

    // Proceed to execution phase
    setBattlePhase("execution");
    setSelectedCardId(null);
  };

  // Handle proceeding to next round
  const handleNextRound = () => {
    // Reset states for next round
    setBattlePhase("preparation");
    setBattleAnimation(null);

    // Proceed to next round in the store
    const combatActive = nextCombatRound();

    if (!combatActive) {
      // Combat has ended
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
  };

  // Handle end of combat
  const handleEndCombat = () => {
    // Update territory ownership based on combat result
    const outcome = endCombat(
      (defendingTerritoryId, attackingTerritoryId, complete, controlValue) => {
        if (complete) {
          // Full conquest - change ownership
          setTerritoryOwner(defendingTerritoryId, "player1");
        } else {
          // Partial conquest - update control value
          setTerritoryControl(defendingTerritoryId, controlValue);
        }
      }
    );

    // Close the combat view
    onClose();
  };

  // If no active combat or combat finished
  if (!combat.active && !combat.result) {
    return (
      <Box p={4} textAlign="center">
        <Heading size="md" mb={6} color="accent.main">
          Combat System
        </Heading>
        <Text color="text.secondary" mb={4}>
          No active combat. Use the Attack tab to initiate combat.
        </Text>
        <SharedButton onClick={onClose}>Close</SharedButton>
      </Box>
    );
  }

  // If combat is over, show the results screen
  if (!combat.active && combat.result) {
    // Calculate territory control visual percentage
    const controlPercentage = Math.min(100, combat.territoryControl);

    return (
      <Box p={4}>
        <Heading size="md" mb={4} color="accent.main">
          Combat Results
        </Heading>

        {/* Victory/Defeat Banner */}
        <Box
          p={4}
          bg={
            combat.result === "victory"
              ? "rgba(125, 206, 130, 0.2)"
              : combat.result === "defeat"
              ? "rgba(214, 89, 89, 0.2)"
              : "rgba(230, 197, 112, 0.2)"
          }
          borderRadius="md"
          borderLeftWidth="4px"
          borderColor={
            combat.result === "victory"
              ? "status.success"
              : combat.result === "defeat"
              ? "status.danger"
              : "status.warning"
          }
          mb={4}
        >
          <Heading
            size="md"
            mb={2}
            color={
              combat.result === "victory"
                ? "status.success"
                : combat.result === "defeat"
                ? "status.danger"
                : "status.warning"
            }
          >
            {combat.result === "victory"
              ? "Victory!"
              : combat.result === "defeat"
              ? "Defeat"
              : "Draw"}
          </Heading>

          <Text color="text.primary">
            {
              combat.battleLog[combat.battleLog.length - 1]?.message.split(
                "."
              )[0]
            }
            .
          </Text>
        </Box>

        {/* Battle Statistics */}
        <Box bg="background.ui" p={4} borderRadius="md" mb={4}>
          <Heading size="sm" mb={3} color="text.primary">
            Battle Summary
          </Heading>

          <Grid templateColumns="1fr 1fr" gap={4}>
            <GridItem>
              <Flex direction="column">
                <Text fontSize="sm" color="text.secondary" mb={1}>
                  Your Casualties:
                </Text>
                <Flex align="center">
                  <Progress
                    value={Math.min(100, combat.casualties.attacker)}
                    size="sm"
                    colorScheme="red"
                    borderRadius="full"
                    flex="1"
                    mr={2}
                  />
                  <Badge colorScheme="red">
                    {Math.min(100, combat.casualties.attacker)}%
                  </Badge>
                </Flex>
              </Flex>
            </GridItem>

            <GridItem>
              <Flex direction="column">
                <Text fontSize="sm" color="text.secondary" mb={1}>
                  Enemy Casualties:
                </Text>
                <Flex align="center">
                  <Progress
                    value={Math.min(100, combat.casualties.defender)}
                    size="sm"
                    colorScheme="red"
                    borderRadius="full"
                    flex="1"
                    mr={2}
                  />
                  <Badge colorScheme="red">
                    {Math.min(100, combat.casualties.defender)}%
                  </Badge>
                </Flex>
              </Flex>
            </GridItem>
          </Grid>

          <Divider my={3} />

          {/* Rounds Summary */}
          <Text fontSize="sm" fontWeight="medium" color="text.primary" mb={2}>
            Rounds:
          </Text>
          <HStack spacing={2} mb={3}>
            {combat.battleLog
              .filter((log) => log.round !== 0 && log.round !== "Final")
              .map((log, index) => (
                <Badge
                  key={index}
                  colorScheme={
                    log.winner === "player"
                      ? "green"
                      : log.winner === "opponent"
                      ? "red"
                      : "gray"
                  }
                  px={2}
                  py={1}
                >
                  {log.round}
                </Badge>
              ))}
          </HStack>

          {/* Territory Control (only for victory) */}
          {combat.result === "victory" && (
            <>
              <Text fontSize="sm" color="text.secondary" mb={1}>
                Territory Control Gained:
              </Text>
              <Flex align="center" mb={1}>
                <Progress
                  value={controlPercentage}
                  size="sm"
                  colorScheme="blue"
                  borderRadius="full"
                  flex="1"
                  mr={2}
                />
                <Badge colorScheme="blue">{controlPercentage}%</Badge>
              </Flex>

              <Text fontSize="xs" color="text.secondary" mt={2}>
                {controlPercentage >= 100
                  ? "Full control established - territory conquered!"
                  : `Partial control gained. Future successful attacks will increase control.`}
              </Text>
            </>
          )}
        </Box>

        {/* Battle Log */}
        <Flex justify="center" mb={4}>
          <SharedButton
            variant="secondary"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? "Hide Details" : "Show Battle Details"}
          </SharedButton>
        </Flex>

        {showDetails && (
          <Box
            bg="background.ui"
            p={3}
            borderRadius="md"
            mb={4}
            maxH="200px"
            overflowY="auto"
          >
            <Heading size="xs" mb={2} color="text.primary">
              Battle Log
            </Heading>
            <VStack align="stretch" spacing={2}>
              {combat.battleLog.map((log, index) => (
                <Box key={index} fontSize="xs">
                  <Text fontWeight="medium" color="text.primary">
                    {log.round === 0
                      ? "Start"
                      : log.round === "Final"
                      ? "Final"
                      : `Round ${log.round}`}
                  </Text>
                  <Text color="text.secondary">{log.message}</Text>
                  {index < combat.battleLog.length - 1 && <Divider my={1} />}
                </Box>
              ))}
            </VStack>
          </Box>
        )}

        {/* Close Button */}
        <Flex justify="center">
          <SharedButton onClick={handleEndCombat}>End Combat</SharedButton>
        </Flex>
      </Box>
    );
  }

  // ACTIVE COMBAT RENDERING

  // Preparation phase (card selection)
  if (battlePhase === "preparation") {
    return (
      <Box p={4}>
        <Heading size="md" mb={2} color="accent.main">
          Combat - Round {combat.currentRound}
        </Heading>

        {/* Combat Progress */}
        <Flex align="center" justify="space-between" mb={4}>
          <HStack spacing={1}>
            {Array.from({ length: combat.totalRounds }).map((_, index) => (
              <Box
                key={index}
                w="20px"
                h="6px"
                borderRadius="full"
                bg={
                  index + 1 < combat.currentRound
                    ? "accent.main"
                    : index + 1 === combat.currentRound
                    ? "accent.hover"
                    : "background.highlight"
                }
              />
            ))}
          </HStack>
          <Badge colorScheme="blue">
            Round {combat.currentRound}/{combat.totalRounds}
          </Badge>
        </Flex>

        {/* Combat Forces Overview */}
        <Flex gap={4} mb={4}>
          <Box flex="1" bg="background.ui" p={2} borderRadius="md">
            <Flex justify="space-between" align="center" mb={1}>
              <Badge colorScheme="blue">Your Forces</Badge>
              <Text fontSize="sm" color="text.primary">
                {combat.attackingUnits.length}{" "}
                {combat.attackingUnits.length === 1 ? "Unit" : "Units"}
              </Text>
            </Flex>
            <Text fontSize="xs" color="text.secondary" noOfLines={1}>
              From: {combat.attackingTerritory?.type || "Unknown"}
            </Text>
          </Box>

          <Icon as={Sword} color="accent.main" />

          <Box flex="1" bg="background.ui" p={2} borderRadius="md">
            <Flex justify="space-between" align="center" mb={1}>
              <Badge colorScheme="red">Enemy Forces</Badge>
              <Text fontSize="sm" color="text.primary">
                {combat.defendingUnits.length}{" "}
                {combat.defendingUnits.length === 1 ? "Unit" : "Units"}
              </Text>
            </Flex>
            <Text fontSize="xs" color="text.secondary" noOfLines={1}>
              At: {combat.defendingTerritory?.type || "Unknown"}
            </Text>
          </Box>
        </Flex>

        {/* Card Selection */}
        <Heading size="sm" mb={2} color="text.primary">
          Select Tactical Card
        </Heading>

        {availableCards.length === 0 ? (
          <Box
            bg="background.ui"
            p={4}
            borderRadius="md"
            textAlign="center"
            mb={4}
          >
            <Text color="text.secondary">No tactical cards available.</Text>
          </Box>
        ) : (
          <Box mb={4}>
            <Grid
              templateColumns="repeat(2, 1fr)"
              gap={2}
              maxH="300px"
              overflowY="auto"
              mb={3}
            >
              {availableCards.map((card) => (
                <GridItem key={card.id}>
                  <Box
                    bg={
                      selectedCardId === card.id
                        ? "background.highlight"
                        : "background.ui"
                    }
                    p={2}
                    borderRadius="md"
                    borderWidth="1px"
                    borderColor={
                      selectedCardId === card.id ? "accent.main" : "transparent"
                    }
                    cursor="pointer"
                    onClick={() => handleSelectCard(card.id)}
                    _hover={{
                      borderColor:
                        selectedCardId !== card.id
                          ? "background.highlight"
                          : "",
                    }}
                  >
                    <Flex justify="space-between" align="center" mb={1}>
                      <HStack>
                        <Text fontSize="lg">{card.icon}</Text>
                        <Text fontSize="sm" fontWeight="medium">
                          {card.name}
                        </Text>
                      </HStack>
                      <Badge
                        colorScheme={
                          card.type === "basic"
                            ? "blue"
                            : card.type === "intermediate"
                            ? "yellow"
                            : "purple"
                        }
                        fontSize="xs"
                      >
                        {card.type}
                      </Badge>
                    </Flex>

                    <Flex justify="space-between" align="center">
                      <Text fontSize="xs" color="text.secondary" noOfLines={1}>
                        {card.description}
                      </Text>
                      <Badge colorScheme="green">+{card.strength}</Badge>
                    </Flex>

                    {card.counters && (
                      <Text fontSize="xs" color="status.success" mt={1}>
                        Counters:{" "}
                        {card.counters
                          .map(
                            (counterId) =>
                              tacticalCardTypes[counterId]?.name || counterId
                          )
                          .join(", ")}
                      </Text>
                    )}

                    {card.terrain && (
                      <Text fontSize="xs" color="resource.science" mt={1}>
                        Best in: {card.terrain.join(", ")}
                      </Text>
                    )}
                  </Box>
                </GridItem>
              ))}
            </Grid>

            <SharedButton
              size="md"
              width="100%"
              onClick={handleConfirmCardSelection}
              isDisabled={!selectedCardId}
            >
              Confirm Selection
            </SharedButton>
          </Box>
        )}

        {/* Current Units */}
        <Box>
          <Flex justify="space-between" align="center" mb={2}>
            <Heading size="sm" color="text.primary">
              Your Units
            </Heading>
            <SharedButton
              variant="ghost"
              size="xs"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? "Hide Details" : "Show Units"}
            </SharedButton>
          </Flex>

          {showDetails && (
            <Box
              bg="background.ui"
              p={2}
              borderRadius="md"
              maxH="200px"
              overflowY="auto"
            >
              <Grid templateColumns="repeat(2, 1fr)" gap={2}>
                {combat.attackingUnits.map((unit, index) => (
                  <GridItem key={index}>
                    <UnitCard unit={unit} isCompact={true} />
                  </GridItem>
                ))}
              </Grid>
            </Box>
          )}
        </Box>
      </Box>
    );
  }

  // Execution/Results phase (battle animation and round outcome)
  return (
    <Box p={4}>
      <Heading size="md" mb={2} color="accent.main">
        Combat - Round {combat.currentRound}
      </Heading>

      {/* Battle Animation Area */}
      <Box
        bg="background.panel"
        p={4}
        borderRadius="md"
        mb={4}
        minH="200px"
        position="relative"
        overflow="hidden"
      >
        {/* Terrain Background */}
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          opacity="0.1"
          backgroundImage={`url(/assets/terrain_${
            combat.defendingTerritory?.type || "plains"
          }.svg)`}
          backgroundSize="cover"
        />

        {/* Animation Content */}
        {battleAnimation === "cards" && (
          <Flex justify="space-between" align="center" h="100%">
            <Box
              bg="background.ui"
              p={3}
              borderRadius="md"
              borderLeftWidth="4px"
              borderColor="accent.main"
              transform="translateX(20px)"
              animation="slideInLeft 0.5s forwards"
            >
              <Text fontSize="xl">
                {tacticalCardTypes[
                  selectedCards.player[combat.currentRound - 1]
                ]?.icon || "🃏"}
              </Text>
              <Text fontWeight="bold">
                {tacticalCardTypes[
                  selectedCards.player[combat.currentRound - 1]
                ]?.name || "Your Card"}
              </Text>
            </Box>

            <Icon as={Sword} size={30} color="accent.main" />

            <Box
              bg="background.ui"
              p={3}
              borderRadius="md"
              borderRightWidth="4px"
              borderColor="status.danger"
              transform="translateX(-20px)"
              animation="slideInRight 0.5s forwards"
            >
              <Text fontSize="xl">
                {tacticalCardTypes[
                  selectedCards.opponent[combat.currentRound - 1]
                ]?.icon || "🃏"}
              </Text>
              <Text fontWeight="bold">
                {tacticalCardTypes[
                  selectedCards.opponent[combat.currentRound - 1]
                ]?.name || "Enemy Card"}
              </Text>
            </Box>
          </Flex>
        )}

        {battleAnimation === "clash" && (
          <Flex
            direction="column"
            justify="center"
            align="center"
            h="100%"
            animation="pulse 0.5s infinite"
          >
            <Icon as={Zap} size={50} color="status.warning" />
            <Text fontSize="xl" fontWeight="bold" color="status.warning">
              Battle in Progress!
            </Text>
          </Flex>
        )}

        {battleAnimation === "result" && (
          <Flex direction="column" justify="center" align="center" h="100%">
            {combat.battleLog
              .filter((log) => log.round === combat.currentRound)
              .map((log, index) => (
                <Box key={index} textAlign="center">
                  <Heading
                    size="md"
                    mb={3}
                    color={
                      log.winner === "player"
                        ? "status.success"
                        : log.winner === "opponent"
                        ? "status.danger"
                        : "status.warning"
                    }
                  >
                    {log.winner === "player"
                      ? "Victory"
                      : log.winner === "opponent"
                      ? "Defeat"
                      : "Draw"}
                  </Heading>

                  <Text mb={3}>{log.message.split(". ")[0]}</Text>

                  <HStack justify="center" spacing={8}>
                    <VStack>
                      <Badge colorScheme="blue">Your Score</Badge>
                      <Text fontSize="2xl" fontWeight="bold">
                        {log.playerScore}
                      </Text>
                    </VStack>

                    <VStack>
                      <Badge colorScheme="red">Enemy Score</Badge>
                      <Text fontSize="2xl" fontWeight="bold">
                        {log.opponentScore}
                      </Text>
                    </VStack>
                  </HStack>
                </Box>
              ))}
          </Flex>
        )}
      </Box>

      {/* Next Round / View Result Button */}
      {battlePhase === "results" && (
        <Box textAlign="center">
          <SharedButton
            size="md"
            onClick={handleNextRound}
            leftIcon={<Icon as={ChevronRight} />}
          >
            {combat.currentRound < combat.totalRounds
              ? "Next Round"
              : "View Final Results"}
          </SharedButton>
        </Box>
      )}

      {/* Combat Info */}
      {battlePhase === "results" && (
        <Box mt={4}>
          <Divider mb={3} />
          <Flex justify="space-between" align="center">
            <Text fontSize="sm" color="text.secondary">
              Casualty Report:
            </Text>
            <HStack>
              <Text fontSize="sm" color="text.secondary">
                Your:{" "}
              </Text>
              <Badge colorScheme="red">
                {combat.battleLog.find(
                  (log) => log.round === combat.currentRound
                )?.attackerCasualties || 0}
                %
              </Badge>
              <Text fontSize="sm" color="text.secondary">
                Enemy:{" "}
              </Text>
              <Badge colorScheme="red">
                {combat.battleLog.find(
                  (log) => log.round === combat.currentRound
                )?.defenderCasualties || 0}
                %
              </Badge>
            </HStack>
          </Flex>
        </Box>
      )}

      {/* Battle Details (collapsible) */}
      {battlePhase === "results" && (
        <Box mt={3}>
          <SharedButton
            variant="ghost"
            size="xs"
            width="100%"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? "Hide Details" : "Show Round Details"}
          </SharedButton>

          {showDetails && (
            <Box
              bg="background.ui"
              p={2}
              borderRadius="md"
              mt={2}
              fontSize="xs"
            >
              {combat.battleLog
                .filter((log) => log.round === combat.currentRound)
                .map((log, index) => (
                  <Box key={index}>
                    <Text color="text.secondary" whiteSpace="pre-line">
                      {log.message.split("\n").slice(1).join("\n")}
                    </Text>
                  </Box>
                ))}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default CombatResolver;

// Add this to your CSS
`
@keyframes slideInLeft {
  from { transform: translateX(-50px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes slideInRight {
  from { transform: translateX(50px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}
`;
