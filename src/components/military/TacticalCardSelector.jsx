// src/components/military/TacticalCardSelector.jsx
import React, { useState } from "react";
import {
  Box,
  Heading,
  Text,
  Flex,
  SimpleGrid,
  VStack,
  Badge,
  Icon,
  HStack,
  Tooltip,
} from "@chakra-ui/react";
import {
  Flag,
  ShieldOff,
  Target,
  ArrowRight,
  Zap,
  Shuffle,
  HelpCircle,
} from "lucide-react";
import SharedButton from "../ui/SharedButton";

/**
 * TacticalCardSelector - UI for selecting tactical cards during combat
 */
const TacticalCardSelector = ({
  availableCards = [],
  onSelectCard,
  onCancel,
  roundNumber = 1,
}) => {
  const [selectedCardId, setSelectedCardId] = useState(null);

  // Group cards by type
  const groupedCards = {
    basic: availableCards.filter((card) => card.type === "basic"),
    intermediate: availableCards.filter((card) => card.type === "intermediate"),
    advanced: availableCards.filter((card) => card.type === "advanced"),
  };

  // Get card background color based on type
  const getCardColor = (type) => {
    switch (type) {
      case "basic":
        return "rgba(94, 168, 237, 0.15)"; // Blue
      case "intermediate":
        return "rgba(230, 197, 112, 0.15)"; // Gold
      case "advanced":
        return "rgba(166, 112, 230, 0.15)"; // Purple
      default:
        return "rgba(42, 60, 83, 0.5)"; // Dark blue-gray
    }
  };

  // Get card type display name
  const getCardTypeName = (type) => {
    switch (type) {
      case "basic":
        return "Basic";
      case "intermediate":
        return "Intermediate";
      case "advanced":
        return "Advanced";
      default:
        return type;
    }
  };

  // Get card type icon
  const getCardTypeIcon = (type) => {
    switch (type) {
      case "basic":
        return Flag;
      case "intermediate":
        return Target;
      case "advanced":
        return Zap;
      default:
        return HelpCircle;
    }
  };

  // Get color scheme for type badge
  const getTypeColorScheme = (type) => {
    switch (type) {
      case "basic":
        return "blue";
      case "intermediate":
        return "yellow";
      case "advanced":
        return "purple";
      default:
        return "gray";
    }
  };

  // Render card section for a type
  const renderCardSection = (title, cards, type) => {
    if (cards.length === 0) return null;

    const TypeIcon = getCardTypeIcon(type);

    return (
      <Box mb={4}>
        <Flex align="center" mb={2}>
          <Icon
            as={TypeIcon}
            color={`resource.${
              type === "basic"
                ? "science"
                : type === "intermediate"
                ? "gold"
                : "culture"
            }`}
            mr={2}
          />
          <Heading size="sm" color="text.primary">
            {title}
          </Heading>
          <Badge ml={2} colorScheme={getTypeColorScheme(type)}>
            {cards.length} Available
          </Badge>
        </Flex>

        <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={3}>
          {cards.map((card) => (
            <Box
              key={card.id}
              bg={
                selectedCardId === card.id
                  ? "background.highlight"
                  : getCardColor(card.type)
              }
              p={3}
              borderRadius="md"
              borderWidth="1px"
              borderColor={
                selectedCardId === card.id ? "accent.main" : "transparent"
              }
              cursor="pointer"
              onClick={() => setSelectedCardId(card.id)}
              _hover={{ borderColor: "background.highlight" }}
              h="100%"
              display="flex"
              flexDirection="column"
            >
              <Flex justify="space-between" align="center" mb={2}>
                <Text fontSize="xl">{card.icon || "🃏"}</Text>
                <Badge px={2} colorScheme={card.defensive ? "green" : "red"}>
                  {card.defensive ? "Defensive" : "Offensive"}
                </Badge>
              </Flex>

              <Box>
                <Text fontWeight="semibold" color="text.primary">
                  {card.name}
                </Text>
                <Text fontSize="xs" color="text.secondary" mt={1} mb={2}>
                  {card.description}
                </Text>
              </Box>

              <Flex mt="auto" justify="space-between" align="center">
                <Badge colorScheme="blue" px={2}>
                  Strength {card.strength}
                </Badge>

                <Badge colorScheme="gray" px={2}>
                  {card.count} Card{card.count !== 1 ? "s" : ""}
                </Badge>
              </Flex>

              {/* Special properties */}
              {(card.counters || card.terrain) && (
                <Box mt={2} fontSize="xs">
                  {card.counters && (
                    <Flex align="center" mb={1}>
                      <Icon
                        as={ShieldOff}
                        boxSize={3}
                        mr={1}
                        color="text.secondary"
                      />
                      <Text color="text.secondary">
                        Counters:{" "}
                        {card.counters
                          .map((id) => {
                            const counterName = availableCards.find(
                              (c) => c.id === id
                            )?.name;
                            return counterName || id;
                          })
                          .join(", ")}
                      </Text>
                    </Flex>
                  )}

                  {card.terrain && (
                    <Flex align="center">
                      <Icon
                        as={Target}
                        boxSize={3}
                        mr={1}
                        color="text.secondary"
                      />
                      <Text color="text.secondary">
                        Terrain Bonus:{" "}
                        {card.terrain
                          .map((t) => t.charAt(0).toUpperCase() + t.slice(1))
                          .join(", ")}
                      </Text>
                    </Flex>
                  )}
                </Box>
              )}
            </Box>
          ))}
        </SimpleGrid>
      </Box>
    );
  };

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={4}>
        <Heading size="md" color="accent.main">
          Select Tactical Card - Round {roundNumber}
        </Heading>
        <SharedButton
          variant="ghost"
          size="sm"
          onClick={onCancel}
          aria-label="Cancel selection"
        >
          ✕
        </SharedButton>
      </Flex>

      <Box bg="background.ui" p={3} borderRadius="md" mb={4}>
        <Text color="text.primary">
          Select a tactical card to play for this combat round. Each card has
          different strengths and special properties.
        </Text>

        <HStack mt={2} spacing={4}>
          <Tooltip label="Basic cards provide general bonuses and are good for most situations">
            <Flex>
              <Icon as={Flag} color="resource.science" mr={1} />
              <Text fontSize="sm" color="text.secondary">
                Basic
              </Text>
            </Flex>
          </Tooltip>

          <Tooltip label="Intermediate cards have terrain-specific bonuses">
            <Flex>
              <Icon as={Target} color="resource.gold" mr={1} />
              <Text fontSize="sm" color="text.secondary">
                Intermediate
              </Text>
            </Flex>
          </Tooltip>

          <Tooltip label="Advanced cards counter specific tactics and provide strong bonuses">
            <Flex>
              <Icon as={Zap} color="resource.culture" mr={1} />
              <Text fontSize="sm" color="text.secondary">
                Advanced
              </Text>
            </Flex>
          </Tooltip>
        </HStack>
      </Box>

      {availableCards.length === 0 ? (
        <Box bg="background.ui" p={4} borderRadius="md" textAlign="center">
          <Flex justify="center" mb={3}>
            <Icon as={Shuffle} boxSize={10} color="text.secondary" />
          </Flex>
          <Text color="text.primary" mb={2}>
            No tactical cards available
          </Text>
          <Text color="text.secondary" fontSize="sm">
            Train military advisors or research military technologies to acquire
            tactical cards.
          </Text>
        </Box>
      ) : (
        <>
          {/* Card sections by type */}
          {renderCardSection("Basic Tactics", groupedCards.basic, "basic")}
          {renderCardSection(
            "Intermediate Tactics",
            groupedCards.intermediate,
            "intermediate"
          )}
          {renderCardSection(
            "Advanced Tactics",
            groupedCards.advanced,
            "advanced"
          )}

          {/* Action buttons */}
          <Flex justify="flex-end" gap={3} mt={4}>
            <SharedButton variant="ghost" onClick={onCancel}>
              Cancel
            </SharedButton>
            <SharedButton
              variant="primary"
              leftIcon={<Icon as={ArrowRight} boxSize={4} />}
              onClick={() => {
                if (selectedCardId) onSelectCard(selectedCardId);
              }}
              isDisabled={!selectedCardId}
            >
              Select Card
            </SharedButton>
          </Flex>
        </>
      )}
    </Box>
  );
};

export default React.memo(TacticalCardSelector);
