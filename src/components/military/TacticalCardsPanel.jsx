// src/components/military/TacticalCardsPanel.jsx
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
  Divider,
  useToast,
} from "@chakra-ui/react";
import {
  Flag,
  ShieldOff,
  Target,
  Zap,
  Info,
  HelpCircle,
  Trash,
  Plus,
} from "lucide-react";
import { useMilitaryStore } from "../../stores/militaryStore";
import SharedButton from "../ui/SharedButton";

/**
 * TacticalCardsPanel - Management interface for tactical cards
 */
const TacticalCardsPanel = ({ onClose }) => {
  const [selectedType, setSelectedType] = useState(null);
  const toast = useToast();

  // Get tactical card data from store
  const tacticalCards = useMilitaryStore((state) => state.tacticalCards);
  const tacticalCardTypes = useMilitaryStore(
    (state) => state.tacticalCardTypes
  );
  const addTacticalCard = useMilitaryStore((state) => state.addTacticalCard);

  // Get cards grouped by type
  const groupedCards = {
    basic: Object.entries(tacticalCards)
      .filter(([id]) => tacticalCardTypes[id]?.type === "basic")
      .map(([id, card]) => ({
        ...tacticalCardTypes[id],
        count: card.count,
        id,
      })),
    intermediate: Object.entries(tacticalCards)
      .filter(([id]) => tacticalCardTypes[id]?.type === "intermediate")
      .map(([id, card]) => ({
        ...tacticalCardTypes[id],
        count: card.count,
        id,
      })),
    advanced: Object.entries(tacticalCards)
      .filter(([id]) => tacticalCardTypes[id]?.type === "advanced")
      .map(([id, card]) => ({
        ...tacticalCardTypes[id],
        count: card.count,
        id,
      })),
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

  // Get card type display name and icon
  const getCardTypeInfo = (type) => {
    switch (type) {
      case "basic":
        return {
          name: "Basic Tactics",
          icon: Flag,
          color: "resource.science",
          description:
            "General-purpose tactics suitable for most combat situations.",
        };
      case "intermediate":
        return {
          name: "Intermediate Tactics",
          icon: Target,
          color: "resource.gold",
          description: "Specialized tactics that leverage terrain advantages.",
        };
      case "advanced":
        return {
          name: "Advanced Tactics",
          icon: Zap,
          color: "resource.culture",
          description:
            "Powerful tactics that can counter specific enemy strategies.",
        };
      default:
        return {
          name: "Unknown",
          icon: HelpCircle,
          color: "text.secondary",
          description: "Unknown tactical card type.",
        };
    }
  };

  // Handle adding a new card (for demonstration)
  const handleAddCard = (cardId) => {
    addTacticalCard(cardId);

    toast({
      title: "Card Added",
      description: `Added a ${tacticalCardTypes[cardId]?.name} card to your collection.`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  // Render section for a card type
  const renderCardTypeSection = (type) => {
    const cards = groupedCards[type];
    if (!cards || cards.length === 0) return null;

    const { name, icon: TypeIcon, color, description } = getCardTypeInfo(type);

    return (
      <Box mb={6}>
        <Flex align="center" mb={2}>
          <Icon as={TypeIcon} color={color} mr={2} />
          <Heading size="sm" color="text.primary">
            {name}
          </Heading>
        </Flex>

        <Text fontSize="sm" color="text.secondary" mb={3}>
          {description}
        </Text>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
          {cards.map((card) => (
            <Box
              key={card.id}
              bg={getCardColor(type)}
              p={3}
              borderRadius="md"
              borderWidth="1px"
              borderColor={
                selectedType === card.id ? "accent.main" : "transparent"
              }
              cursor="pointer"
              onClick={() => setSelectedType(card.id)}
              _hover={{ borderColor: "background.highlight" }}
            >
              <Flex justify="space-between" align="center" mb={2}>
                <Text fontSize="xl">{card.icon || "🃏"}</Text>
                <Badge px={2} colorScheme={card.defensive ? "green" : "red"}>
                  {card.defensive ? "Defensive" : "Offensive"}
                </Badge>
              </Flex>

              <Text fontWeight="semibold" color="text.primary" mb={1}>
                {card.name}
              </Text>

              <Text fontSize="xs" color="text.secondary" mb={2}>
                {card.description}
              </Text>

              <Flex justify="space-between" align="center">
                <Badge colorScheme="blue" px={2}>
                  Strength {card.strength}
                </Badge>

                <Badge colorScheme="gray" variant="solid" px={2}>
                  {card.count} {card.count === 1 ? "Card" : "Cards"}
                </Badge>
              </Flex>

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
                          .map((id) => tacticalCardTypes[id]?.name || id)
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

              {/* Demo buttons for the UI - would be controlled by game logic in real implementation */}
              {selectedType === card.id && (
                <Flex mt={3} gap={2}>
                  <SharedButton
                    size="xs"
                    variant="secondary"
                    leftIcon={<Icon as={Plus} boxSize={3} />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddCard(card.id);
                    }}
                  >
                    Add Card
                  </SharedButton>
                </Flex>
              )}
            </Box>
          ))}
        </SimpleGrid>
      </Box>
    );
  };

  // Render card acquisition info
  const renderAcquisitionInfo = () => {
    return (
      <Box bg="background.ui" p={4} borderRadius="md" mb={6}>
        <Flex align="center" mb={2}>
          <Icon as={Info} mr={2} color="resource.science" />
          <Heading size="sm" color="text.primary">
            Tactical Card Acquisition
          </Heading>
        </Flex>

        <Text fontSize="sm" color="text.secondary" mb={3}>
          Tactical cards can be acquired through several methods:
        </Text>

        <VStack
          align="stretch"
          spacing={2}
          fontSize="sm"
          color="text.secondary"
        >
          <Text>• Military advisors provide new cards every few turns</Text>
          <Text>• Research military technologies to unlock new card types</Text>
          <Text>• Train specialized military units for unique tactics</Text>
          <Text>
            • Discover ancient battlefields for historical battle tactics
          </Text>
        </VStack>

        <Divider my={3} />

        <Text fontSize="sm" color="text.secondary">
          These cards are consumed when used in battle. Choose your tactics
          wisely!
        </Text>
      </Box>
    );
  };

  return (
    <Box p={4}>
      <Flex justify="space-between" align="center" mb={4}>
        <Heading size="md" color="accent.main">
          Tactical Cards
        </Heading>
        <SharedButton
          variant="ghost"
          size="sm"
          onClick={onClose}
          aria-label="Close panel"
        >
          ✕
        </SharedButton>
      </Flex>

      {renderAcquisitionInfo()}

      {/* Card Type Tabs/Filters */}
      <Flex mb={4} gap={2}>
        <SharedButton
          size="sm"
          variant={selectedType === null ? "primary" : "secondary"}
          onClick={() => setSelectedType(null)}
        >
          All Cards
        </SharedButton>

        <SharedButton
          size="sm"
          variant={selectedType === "basic" ? "primary" : "secondary"}
          leftIcon={<Icon as={Flag} boxSize={4} />}
          onClick={() => setSelectedType("basic")}
        >
          Basic
        </SharedButton>

        <SharedButton
          size="sm"
          variant={selectedType === "intermediate" ? "primary" : "secondary"}
          leftIcon={<Icon as={Target} boxSize={4} />}
          onClick={() => setSelectedType("intermediate")}
        >
          Intermediate
        </SharedButton>

        <SharedButton
          size="sm"
          variant={selectedType === "advanced" ? "primary" : "secondary"}
          leftIcon={<Icon as={Zap} boxSize={4} />}
          onClick={() => setSelectedType("advanced")}
        >
          Advanced
        </SharedButton>
      </Flex>

      {/* Card List by Type */}
      {selectedType === null || selectedType === "basic"
        ? renderCardTypeSection("basic")
        : null}
      {selectedType === null || selectedType === "intermediate"
        ? renderCardTypeSection("intermediate")
        : null}
      {selectedType === null || selectedType === "advanced"
        ? renderCardTypeSection("advanced")
        : null}

      {/* Empty State */}
      {Object.values(groupedCards).every((group) => group.length === 0) && (
        <Box bg="background.ui" p={6} borderRadius="md" textAlign="center">
          <Icon as={HelpCircle} boxSize={10} color="text.secondary" mb={4} />
          <Heading size="md" color="text.primary" mb={2}>
            No Tactical Cards
          </Heading>
          <Text color="text.secondary">
            You don't have any tactical cards yet. Continue playing to acquire
            cards from military advisors and research.
          </Text>
        </Box>
      )}
    </Box>
  );
};

export default React.memo(TacticalCardsPanel);
