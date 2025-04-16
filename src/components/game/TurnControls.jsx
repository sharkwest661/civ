// src/components/game/TurnControls.jsx
import React, { useCallback } from "react";
import { Flex, Icon, useToast, Text } from "@chakra-ui/react";
import { ArrowRight, Beaker } from "lucide-react";
import SharedButton from "../ui/SharedButton";
import { useTechnologyStore } from "../../stores/technologyStore";

/**
 * TurnControls component provides controls for ending the current turn
 * Enhanced with research reminder functionality
 */
const TurnControls = React.memo(
  ({ onEndTurn = () => {}, onOpenResearch = () => {} }) => {
    const toast = useToast();

    // Get current research state
    const currentResearch = useTechnologyStore(
      (state) => state.currentResearch
    );

    // Handle end turn with research reminder
    const handleEndTurn = useCallback(() => {
      // If research is already selected, end turn immediately
      if (currentResearch) {
        onEndTurn();
        return;
      }

      // If no research selected, show warning and wait for user decision
      toast({
        title: "No Research Selected",
        description:
          "You haven't selected any technology to research. Your science points will not be used this turn.",
        status: "warning",
        duration: 10000, // Longer duration to give time to decide
        isClosable: true,
        position: "top",
        render: ({ onClose }) => (
          <Flex
            bg="background.panel"
            color="text.primary"
            p={4}
            borderRadius="md"
            borderLeft="4px solid"
            borderColor="status.warning"
            direction="column"
            boxShadow="md"
          >
            <Flex align="center" mb={2}>
              <Icon as={Beaker} color="status.warning" mr={2} />
              <Flex direction="column">
                <Text fontWeight="bold">No Research Selected</Text>
                <Text fontSize="sm" color="text.secondary">
                  You haven't selected any technology to research. Your science
                  points will not be used this turn.
                </Text>
              </Flex>
            </Flex>
            <Flex mt={2} justify="flex-end" gap={2}>
              <SharedButton
                size="sm"
                variant="ghost"
                onClick={() => {
                  onEndTurn(); // End turn only if player confirms
                  onClose();
                }}
              >
                Continue Anyway
              </SharedButton>
              <SharedButton
                size="sm"
                variant="primary"
                onClick={() => {
                  onOpenResearch();
                  onClose();
                }}
              >
                Select Research
              </SharedButton>
            </Flex>
          </Flex>
        ),
      });
    }, [currentResearch, onEndTurn, onOpenResearch, toast]);

    return (
      <Flex className="turn-controls" justify="flex-end">
        <SharedButton
          onClick={handleEndTurn}
          variant="primary"
          rightIcon={<Icon as={ArrowRight} boxSize={5} />}
        >
          End Turn
        </SharedButton>
      </Flex>
    );
  }
);

// Add display name for debugging
TurnControls.displayName = "TurnControls";

export default TurnControls;
