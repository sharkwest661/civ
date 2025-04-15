// src/components/military/CombatAssessmentView.jsx
import React from "react";
import {
  Box,
  Heading,
  Text,
  Flex,
  VStack,
  Badge,
  Progress,
  Icon,
  Divider,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from "@chakra-ui/react";
import {
  Sword,
  Shield,
  AlertTriangle,
  CheckCircle,
  X,
  ArrowRight,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import SharedButton from "../ui/SharedButton";
import { assessAttackChances } from "../../utils/militaryUtils";

/**
 * CombatAssessmentView - Displays an assessment of potential combat
 * between attacking and defending forces
 */
const CombatAssessmentView = ({
  attackingUnits = [],
  defendingUnits = [],
  attackingTerritory = {},
  defendingTerritory = {},
  onAttack,
  onCancel,
}) => {
  // Generate combat assessment
  const assessment = assessAttackChances(
    attackingUnits,
    defendingUnits,
    attackingTerritory,
    defendingTerritory
  );

  // Format probability as percentage
  const winProbabilityPercent = Math.round(assessment.winProbability * 100);

  // Get color scheme based on assessment
  const getAssessmentColor = () => {
    if (winProbabilityPercent >= 65) return "green";
    if (winProbabilityPercent >= 40) return "yellow";
    return "red";
  };

  // Get icon based on assessment
  const getAssessmentIcon = () => {
    if (winProbabilityPercent >= 65) return CheckCircle;
    if (winProbabilityPercent >= 40) return AlertTriangle;
    return X;
  };

  const AssessmentIcon = getAssessmentIcon();

  return (
    <Box>
      <Heading size="md" mb={4} color="accent.main">
        Combat Assessment
      </Heading>

      {/* Summary Box */}
      <Box
        bg={`status.${getAssessmentColor()}30`}
        p={4}
        borderRadius="md"
        borderWidth="1px"
        borderColor={`status.${getAssessmentColor()}`}
        mb={4}
      >
        <Flex align="center" justify="space-between" mb={3}>
          <Flex align="center">
            <Icon
              as={AssessmentIcon}
              color={`status.${getAssessmentColor()}`}
              boxSize={5}
              mr={2}
            />
            <Text fontWeight="bold" color="text.primary">
              {assessment.assessment} Outcome
            </Text>
          </Flex>
          <Badge colorScheme={getAssessmentColor()} fontSize="md" px={2}>
            {winProbabilityPercent}% Success
          </Badge>
        </Flex>

        <Progress
          value={winProbabilityPercent}
          size="sm"
          colorScheme={getAssessmentColor()}
          borderRadius="full"
          mb={2}
        />

        <Text fontSize="sm" color="text.secondary">
          Based on military strength, unit types, and terrain factors.
          {winProbabilityPercent < 40 &&
            " This attack has a low chance of success."}
          {winProbabilityPercent >= 65 &&
            " Your forces have a strong advantage in this battle."}
        </Text>
      </Box>

      {/* Territory Comparison */}
      <Flex gap={4} mb={4}>
        <Box
          flex="1"
          bg="background.ui"
          p={3}
          borderRadius="md"
          textAlign="center"
        >
          <Badge colorScheme="blue" mb={2}>
            Attacking From
          </Badge>
          <Text color="text.primary">
            {attackingTerritory.type
              ? attackingTerritory.type.charAt(0).toUpperCase() +
                attackingTerritory.type.slice(1)
              : "Unknown"}{" "}
            {attackingTerritory.isCapital ? "(Capital)" : ""}
          </Text>
          <Text fontSize="sm" color="text.secondary" mt={1}>
            Units: {attackingUnits.length}
          </Text>
        </Box>

        <Flex align="center">
          <Icon as={ArrowRight} boxSize={6} color="accent.main" />
        </Flex>

        <Box
          flex="1"
          bg="background.ui"
          p={3}
          borderRadius="md"
          textAlign="center"
        >
          <Badge colorScheme="red" mb={2}>
            Defending Territory
          </Badge>
          <Text color="text.primary">
            {defendingTerritory.type
              ? defendingTerritory.type.charAt(0).toUpperCase() +
                defendingTerritory.type.slice(1)
              : "Unknown"}{" "}
            {defendingTerritory.isCapital ? "(Capital)" : ""}
          </Text>
          <Text fontSize="sm" color="text.secondary" mt={1}>
            Units: {defendingUnits.length}
          </Text>
        </Box>
      </Flex>

      {/* Strength Comparison */}
      <Box bg="background.ui" p={4} borderRadius="md" mb={4}>
        <Heading size="sm" mb={3} color="text.primary">
          Combat Strength Comparison
        </Heading>

        <Flex justify="space-between" align="center" mb={2}>
          <Flex align="center">
            <Icon as={Sword} boxSize={4} mr={2} color="status.info" />
            <Text fontSize="sm" color="text.secondary">
              Your Forces:
            </Text>
          </Flex>
          <Text fontWeight="bold" color="text.primary">
            {assessment.attackStrength.toFixed(1)}
          </Text>
        </Flex>

        <Flex justify="space-between" align="center" mb={3}>
          <Flex align="center">
            <Icon as={Shield} boxSize={4} mr={2} color="status.danger" />
            <Text fontSize="sm" color="text.secondary">
              Enemy Forces:
            </Text>
          </Flex>
          <Text fontWeight="bold" color="text.primary">
            {assessment.defenseStrength.toFixed(1)}
          </Text>
        </Flex>

        <Divider mb={3} />

        <Flex justify="space-between" align="center">
          <Text fontSize="sm" color="text.secondary">
            Strength Ratio:
          </Text>
          <Badge
            colorScheme={
              assessment.attackStrength >= assessment.defenseStrength
                ? "green"
                : "red"
            }
            px={2}
          >
            {(assessment.attackStrength / assessment.defenseStrength).toFixed(
              2
            )}
            :1
          </Badge>
        </Flex>
      </Box>

      {/* Detailed Factor Analysis */}
      <Box bg="background.ui" p={4} borderRadius="md" mb={4}>
        <Heading size="sm" mb={3} color="text.primary">
          Battle Factors
        </Heading>

        <Table size="sm" variant="simple">
          <Thead>
            <Tr>
              <Th color="text.secondary">Factor</Th>
              <Th color="status.info" isNumeric>
                Your Forces
              </Th>
              <Th color="status.danger" isNumeric>
                Enemy Forces
              </Th>
              <Th width="40px"></Th>
            </Tr>
          </Thead>
          <Tbody>
            {assessment.factors.map((factor, index) => (
              <Tr key={index}>
                <Td color="text.secondary">{factor.name}</Td>
                <Td isNumeric color="text.primary">
                  {factor.attacker}
                </Td>
                <Td isNumeric color="text.primary">
                  {factor.defender}
                </Td>
                <Td>
                  {factor.favorable ? (
                    <Icon as={ChevronUp} color="status.success" />
                  ) : (
                    <Icon as={ChevronDown} color="status.danger" />
                  )}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>

        <Text fontSize="xs" color="text.secondary" mt={3}>
          Note: Combat also involves tactical card play which can significantly
          influence the outcome beyond these base factors.
        </Text>
      </Box>

      {/* Action Buttons */}
      <Flex justify="flex-end" gap={3}>
        <SharedButton variant="ghost" onClick={onCancel}>
          Cancel
        </SharedButton>
        <SharedButton
          variant="danger"
          leftIcon={<Icon as={Sword} boxSize={4} />}
          onClick={onAttack}
        >
          Launch Attack
        </SharedButton>
      </Flex>
    </Box>
  );
};

export default React.memo(CombatAssessmentView);
