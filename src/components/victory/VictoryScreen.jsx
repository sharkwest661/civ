// src/components/victory/VictoryScreen.jsx
import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  Text,
  Box,
  Heading,
  Flex,
  Icon,
} from "@chakra-ui/react";
import { Trophy, Award, Castle } from "lucide-react";
import { useVictoryStore } from "../../stores/victoryStore";
import { useGameStore } from "../../stores/gameStore";
import { useMapStore } from "../../stores/mapStore";
import { useTechnologyStore } from "../../stores/technologyStore";
import SharedButton from "../ui/SharedButton";

/**
 * Victory screen displayed when a player achieves victory
 */
const VictoryScreen = ({ isOpen, onClose }) => {
  const victoryType = useVictoryStore((state) => state.victoryType);
  const currentTurn = useGameStore((state) => state.currentTurn);

  // Count owned territories
  const territories = useMapStore((state) => state.territories);
  const ownedTerritoryCount = Object.values(territories).filter(
    (t) => t.isOwned && t.owner === "player1"
  ).length;

  // Count buildings
  const buildingCount = Object.values(territories).reduce((total, t) => {
    if (t.isOwned && t.owner === "player1") {
      return total + (t.buildings?.length || 0);
    }
    return total;
  }, 0);

  // Count researched technologies
  const technologies = useTechnologyStore((state) => state.technologies);
  const researchedTechCount = Object.values(technologies).filter(
    (t) => t.researched
  ).length;

  // Victory type specific content
  const getVictoryContent = () => {
    switch (victoryType) {
      case "military":
        return {
          title: "Military Victory!",
          icon: Trophy,
          description:
            "Through superior strategy and military might, you have conquered all rival capitals and established your dominance over the known world. Your legacy as a conqueror will be remembered for ages to come.",
          color: "status.danger",
        };

      case "cultural":
        return {
          title: "Cultural Victory!",
          icon: Award,
          description:
            "Your civilization's cultural achievements have captivated the world. Your art, philosophy, and way of life have spread across the lands, making your empire the envy of all others. Your cultural legacy will inspire generations to come.",
          color: "resource.culture",
        };

      case "wonder":
        return {
          title: "Wonder Victory!",
          icon: Castle,
          description:
            "The Grand Citadel stands as a testament to your civilization's ingenuity and greatness. This architectural marvel has secured your place in history and established your empire as the greatest of its era.",
          color: "accent.main",
        };

      default:
        return {
          title: "Victory!",
          icon: Trophy,
          description:
            "You have achieved victory and established your empire as the dominant force in the world.",
          color: "accent.main",
        };
    }
  };

  const content = getVictoryContent();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      isCentered
      closeOnOverlayClick={false}
    >
      <ModalOverlay backdropFilter="blur(3px)" />
      <ModalContent
        bg="background.panel"
        borderWidth="2px"
        borderColor={content.color}
        p={4}
      >
        <ModalHeader p={0}>
          <Flex justify="center" mt={8}>
            <Heading
              size="xl"
              color={content.color}
              fontFamily="heading"
              textAlign="center"
            >
              {content.title}
            </Heading>
          </Flex>
        </ModalHeader>

        <ModalBody>
          <Flex justifyContent="center" mb={8}>
            <Icon as={content.icon} boxSize="24" color={content.color} />
          </Flex>

          <Text fontSize="lg" textAlign="center" mb={6} color="text.primary">
            {content.description}
          </Text>

          <Box bg="background.ui" p={4} borderRadius="md" mb={6}>
            <Heading size="md" mb={3} color="accent.main">
              Your Empire's Achievements
            </Heading>

            <Text mb={2} color="text.primary">
              • Ruled for {currentTurn} turns
            </Text>
            <Text mb={2} color="text.primary">
              • Controlled {ownedTerritoryCount} territories
            </Text>
            <Text mb={2} color="text.primary">
              • Built {buildingCount} buildings
            </Text>
            <Text mb={2} color="text.primary">
              • Researched {researchedTechCount} technologies
            </Text>
          </Box>

          <Flex justify="center" mt={8}>
            <SharedButton variant="primary" size="lg" onClick={onClose}>
              Continue Playing
            </SharedButton>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default VictoryScreen;
