// src/components/victory/VictoryProgressPanel.jsx
import React from "react";
import {
  Box,
  Heading,
  Text,
  Progress,
  VStack,
  Flex,
  Divider,
  Icon,
  Tooltip,
} from "@chakra-ui/react";
import { Trophy, Award, Castle } from "lucide-react";
import { useVictoryStore } from "../../stores/victoryStore";
import SharedPanel from "../ui/SharedPanel";
import SharedButton from "../ui/SharedButton";

/**
 * Panel to display progress toward each victory condition
 */
const VictoryProgressPanel = ({ onClose }) => {
  const militaryProgress = useVictoryStore((state) => state.militaryProgress);
  const culturalProgress = useVictoryStore((state) => state.culturalProgress);
  const wonderProgress = useVictoryStore((state) => state.wonderProgress);

  return (
    <Box p={4}>
      <Flex justify="space-between" align="center" mb={4}>
        <Heading size="md" color="accent.main">
          Victory Progress
        </Heading>
        <SharedButton size="sm" variant="ghost" onClick={onClose}>
          ✕
        </SharedButton>
      </Flex>

      <VStack spacing={4} align="stretch">
        {/* Military Victory Progress */}
        <Box bg="background.ui" p={3} borderRadius="md">
          <Flex align="center" mb={2}>
            <Icon as={Trophy} color="status.danger" mr={2} />
            <Heading size="sm" color="text.primary">
              Military Victory
            </Heading>
          </Flex>

          <Text fontSize="sm" color="text.secondary" mb={3}>
            Conquer all rival capitals to achieve military dominance.
          </Text>

          <Flex justify="space-between" mb={2}>
            <Text fontSize="sm" color="text.secondary">
              Capitals Captured:
            </Text>
            <Text fontSize="sm" color="text.primary">
              {militaryProgress.capturedCapitals.length} /{" "}
              {militaryProgress.totalCapitals}
            </Text>
          </Flex>

          <Tooltip
            label={`${Math.round(militaryProgress.percentComplete)}% complete`}
            placement="top"
          >
            <Box width="100%">
              <Progress
                value={militaryProgress.percentComplete}
                size="sm"
                colorScheme="red"
                borderRadius="full"
              />
            </Box>
          </Tooltip>
        </Box>

        {/* Cultural Victory Progress */}
        <Box bg="background.ui" p={3} borderRadius="md">
          <Flex align="center" mb={2}>
            <Icon as={Award} color="resource.culture" mr={2} />
            <Heading size="sm" color="text.primary">
              Cultural Victory
            </Heading>
          </Flex>

          <Text fontSize="sm" color="text.secondary" mb={3}>
            Achieve cultural dominance through cultural buildings and influence.
          </Text>

          <Flex justify="space-between" mb={2}>
            <Text fontSize="sm" color="text.secondary">
              Cultural Influence:
            </Text>
            <Text fontSize="sm" color="text.primary">
              {Math.floor(culturalProgress.currentInfluence)} /{" "}
              {culturalProgress.targetInfluence}
            </Text>
          </Flex>

          <Tooltip
            label={`${Math.round(culturalProgress.percentComplete)}% complete`}
            placement="top"
          >
            <Box width="100%">
              <Progress
                value={culturalProgress.percentComplete}
                size="sm"
                colorScheme="purple"
                borderRadius="full"
              />
            </Box>
          </Tooltip>
        </Box>

        {/* Wonder Victory Progress */}
        <Box bg="background.ui" p={3} borderRadius="md">
          <Flex align="center" mb={2}>
            <Icon as={Castle} color="accent.main" mr={2} />
            <Heading size="sm" color="text.primary">
              Wonder Victory
            </Heading>
          </Flex>

          <Text fontSize="sm" color="text.secondary" mb={3}>
            Build and maintain the Grand Citadel for 5 turns.
          </Text>

          {wonderProgress.grandCitadelBuilt ? (
            <>
              <Flex justify="space-between" mb={2}>
                <Text fontSize="sm" color="text.secondary">
                  Turns Maintained:
                </Text>
                <Text fontSize="sm" color="text.primary">
                  {wonderProgress.turnsHeld} / {wonderProgress.requiredTurns}
                </Text>
              </Flex>

              <Tooltip
                label={`${Math.round(
                  wonderProgress.percentComplete
                )}% complete`}
                placement="top"
              >
                <Box width="100%">
                  <Progress
                    value={wonderProgress.percentComplete}
                    size="sm"
                    colorScheme="yellow"
                    borderRadius="full"
                  />
                </Box>
              </Tooltip>
            </>
          ) : (
            <Box bg="background.panel" p={2} borderRadius="md">
              <Text fontSize="sm" color="text.secondary" textAlign="center">
                The Grand Citadel has not yet been built.
              </Text>
            </Box>
          )}
        </Box>

        <Divider my={2} />

        <Text fontSize="sm" color="text.secondary" textAlign="center">
          Achieve any of these victory conditions to win the game.
        </Text>
      </VStack>
    </Box>
  );
};

export default VictoryProgressPanel;
