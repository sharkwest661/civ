// src/components/victory/DefeatScreen.jsx
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
import { Flag, RefreshCw } from "lucide-react";
import { useVictoryStore } from "../../stores/victoryStore";
import { useGameStore } from "../../stores/gameStore";
import SharedButton from "../ui/SharedButton";

/**
 * Defeat screen displayed when a player is defeated
 */
const DefeatScreen = ({ isOpen, onClose, onRestartGame }) => {
  const defeatReason = useVictoryStore((state) => state.defeatReason);
  const currentTurn = useGameStore((state) => state.currentTurn);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      isCentered
      closeOnOverlayClick={false}
    >
      <ModalOverlay backdropFilter="blur(3px)" bg="rgba(0,0,0,0.8)" />
      <ModalContent
        bg="background.panel"
        borderWidth="2px"
        borderColor="status.danger"
        p={4}
      >
        <ModalHeader p={0}>
          <Flex justify="center" mt={8}>
            <Heading
              size="xl"
              color="status.danger"
              fontFamily="heading"
              textAlign="center"
            >
              Defeat
            </Heading>
          </Flex>
        </ModalHeader>

        <ModalBody>
          <Flex justifyContent="center" mb={8}>
            <Icon as={Flag} boxSize="20" color="status.danger" />
          </Flex>

          <Text fontSize="lg" textAlign="center" mb={6} color="text.primary">
            {defeatReason ||
              "Your empire has fallen. Your once-mighty civilization has been defeated and will fade into the shadows of history."}
          </Text>

          <Box bg="background.ui" p={4} borderRadius="md" mb={6}>
            <Heading size="md" mb={3} color="accent.main">
              Your Empire's Legacy
            </Heading>

            <Text mb={2} color="text.primary">
              Your empire stood for {currentTurn} turns before falling.
            </Text>
            <Text color="text.primary">
              Though your reign has ended, your empire's achievements will be
              remembered in the annals of history.
            </Text>
          </Box>

          <Flex justify="center" gap={4} mt={8}>
            <SharedButton
              variant="ghost"
              leftIcon={<Icon as={RefreshCw} boxSize={4} />}
              onClick={onRestartGame}
            >
              Start a New Game
            </SharedButton>

            <SharedButton variant="primary" onClick={onClose}>
              Continue Playing
            </SharedButton>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default DefeatScreen;
