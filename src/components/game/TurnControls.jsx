// src/components/game/TurnControls.jsx
import React from "react";
import { Flex, Icon } from "@chakra-ui/react";
import { ArrowRight } from "lucide-react";
import SharedButton from "../ui/SharedButton";

/**
 * TurnControls component provides controls for ending the current turn
 * Updated to use our shared Chakra UI components
 */
const TurnControls = React.memo(({ onEndTurn = () => {} }) => {
  return (
    <Flex className="turn-controls" justify="flex-end">
      <SharedButton
        onClick={onEndTurn}
        variant="primary"
        rightIcon={<Icon as={ArrowRight} boxSize={5} />}
      >
        End Turn
      </SharedButton>
    </Flex>
  );
});

// Add display name for debugging
TurnControls.displayName = "TurnControls";

export default TurnControls;
