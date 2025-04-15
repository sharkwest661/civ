// src/components/military/UnitDetailView.jsx
import React from "react";
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
  Icon,
  Tooltip,
  SimpleGrid,
} from "@chakra-ui/react";
import {
  Sword,
  Shield,
  Heart,
  TrendingUp,
  Star,
  Award,
  MapPin,
  Target,
  Zap,
} from "lucide-react";
import { useMilitaryStore } from "../../stores/militaryStore";
import { useMapStore } from "../../stores/mapStore";
import SharedButton from "../ui/SharedButton";
import {
  TERRAIN_EFFECTS,
  UNIT_ADVANTAGES,
} from "../../constants/militaryConstants";

/**
 * UnitDetailView - Displays detailed information about a military unit
 */
const UnitDetailView = ({ unit, onClose, onMoveUnit, onDismissUnit }) => {
  // Get unit types and territory data
  const unitTypes = useMilitaryStore((state) => state.unitTypes);
  const territories = useMapStore((state) => state.territories);

  // Early exit if no unit
  if (!unit) return null;

  // Get unit type details
  const unitType = unitTypes[unit.type] || {};
  const territory = territories[unit.position] || {};

  // Calculate experience to next level
  const experienceToNextLevel = 100;
  const experienceProgress = (unit.experience / experienceToNextLevel) * 100;

  // Get advantages and disadvantages
  const getUnitTypeDisplay = (typeId) => {
    const type = unitTypes[typeId];
    return type ? type.name : typeId;
  };

  // Get advantages against
  const advantagesAgainst =
    UNIT_ADVANTAGES[unit.type]?.advantageAgainst?.map(getUnitTypeDisplay) || [];

  // Get disadvantages against
  const disadvantagesAgainst =
    UNIT_ADVANTAGES[unit.type]?.disadvantageAgainst?.map(getUnitTypeDisplay) ||
    [];

  // Get terrains where this unit is effective
  const effectiveTerrains = Object.entries(TERRAIN_EFFECTS)
    .filter(([_, effects]) => {
      // Check if unit is effective in this terrain
      if (unit.type === "archer" && effects.defense) return true;
      if (unit.type === "horseman" && effects.attack) return true;
      return false;
    })
    .map(
      ([terrainType, _]) =>
        terrainType.charAt(0).toUpperCase() + terrainType.slice(1)
    );

  // Calculate stat changes from level
  const levelBonus = (unit.level - 1) * 0.05; // 5% per level
  const adjustedStrength = Math.round(unitType.strength * (1 + levelBonus));

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={4}>
        <Heading size="md" color="accent.main">
          Unit Details
        </Heading>
        <SharedButton
          variant="ghost"
          size="sm"
          onClick={onClose}
          aria-label="Close unit details"
        >
          ✕
        </SharedButton>
      </Flex>

      {/* Unit Header */}
      <Flex
        bg="background.highlight"
        p={4}
        borderRadius="md"
        mb={4}
        align="center"
        gap={4}
      >
        <Text fontSize="3xl">{unitType.icon || "⚔️"}</Text>
        <Box>
          <Heading size="md" color="text.primary">
            {unitType.name || "Unit"}
          </Heading>
          <Text fontSize="sm" color="text.secondary">
            {unitType.description || "Military unit"}
          </Text>
        </Box>
        <Badge ml="auto" colorScheme="blue">
          Level {unit.level}
        </Badge>
      </Flex>

      {/* Main Stats */}
      <Box bg="background.ui" p={4} borderRadius="md" mb={4}>
        <SimpleGrid columns={2} spacing={4}>
          {/* Combat Stats */}
          <Box>
            <Heading size="sm" mb={3} color="text.primary">
              Combat Stats
            </Heading>
            <VStack align="stretch" spacing={2}>
              <Flex justify="space-between" align="center">
                <Flex align="center">
                  <Icon as={Sword} boxSize={4} color="status.danger" mr={2} />
                  <Text fontSize="sm" color="text.secondary">
                    Strength:
                  </Text>
                </Flex>
                <Text fontWeight="bold" color="text.primary">
                  {adjustedStrength}
                  {levelBonus > 0 && (
                    <Text as="span" fontSize="xs" color="status.success" ml={1}>
                      (+{Math.round(levelBonus * 100)}%)
                    </Text>
                  )}
                </Text>
              </Flex>

              <Flex justify="space-between" align="center">
                <Flex align="center">
                  <Icon as={Heart} boxSize={4} color="status.danger" mr={2} />
                  <Text fontSize="sm" color="text.secondary">
                    Health:
                  </Text>
                </Flex>
                <Flex align="center" gap={2}>
                  <Progress
                    value={unit.health}
                    size="sm"
                    width="80px"
                    colorScheme={
                      unit.health > 70
                        ? "green"
                        : unit.health > 30
                        ? "yellow"
                        : "red"
                    }
                    borderRadius="full"
                  />
                  <Text fontWeight="bold" color="text.primary">
                    {unit.health}%
                  </Text>
                </Flex>
              </Flex>

              <Flex justify="space-between" align="center">
                <Flex align="center">
                  <Icon
                    as={TrendingUp}
                    boxSize={4}
                    color="resource.science"
                    mr={2}
                  />
                  <Text fontSize="sm" color="text.secondary">
                    Movement:
                  </Text>
                </Flex>
                <Text fontWeight="bold" color="text.primary">
                  {unit.movesLeft} / {unitType.movementRange}
                </Text>
              </Flex>
            </VStack>
          </Box>

          {/* Experience */}
          <Box>
            <Heading size="sm" mb={3} color="text.primary">
              Experience
            </Heading>
            <VStack align="stretch" spacing={2}>
              <Flex align="center" mb={1}>
                <Icon as={Star} boxSize={4} color="resource.gold" mr={2} />
                <Text fontSize="sm" color="text.secondary">
                  Level {unit.level} - {unit.experience} /{" "}
                  {experienceToNextLevel} XP
                </Text>
              </Flex>

              <Progress
                value={experienceProgress}
                size="sm"
                colorScheme="yellow"
                borderRadius="full"
                mb={2}
              />

              <Flex align="center">
                <Icon as={Award} boxSize={4} color="resource.gold" mr={2} />
                <Text fontSize="xs" color="text.secondary">
                  {levelBonus > 0
                    ? `+${Math.round(
                        levelBonus * 100
                      )}% combat bonus from experience`
                    : "No experience bonuses yet"}
                </Text>
              </Flex>
            </VStack>
          </Box>
        </SimpleGrid>
      </Box>

      {/* Location */}
      <Box bg="background.ui" p={4} borderRadius="md" mb={4}>
        <Heading size="sm" mb={3} color="text.primary">
          Current Location
        </Heading>
        <Flex align="center" mb={2}>
          <Icon as={MapPin} boxSize={4} color="text.primary" mr={2} />
          <Text color="text.primary">
            {territory.type
              ? territory.type.charAt(0).toUpperCase() + territory.type.slice(1)
              : "Unknown"}
            {territory.isCapital ? " (Capital)" : ""}
          </Text>
          {territory.owner && (
            <Badge
              ml={2}
              colorScheme={territory.owner === "player1" ? "green" : "red"}
            >
              {territory.owner === "player1" ? "Owned" : "Enemy"}
            </Badge>
          )}
        </Flex>

        {territory.resource && (
          <Text fontSize="sm" color="text.secondary" ml={6} mb={2}>
            Resource: {territory.resource}
          </Text>
        )}

        {/* Movement Options */}
        {unit.movesLeft > 0 && onMoveUnit && (
          <SharedButton
            variant="secondary"
            size="sm"
            leftIcon={<Icon as={TrendingUp} boxSize={4} />}
            mt={2}
            onClick={() => onMoveUnit(unit)}
            width="100%"
          >
            Move Unit ({unit.movesLeft} moves left)
          </SharedButton>
        )}
      </Box>

      {/* Strengths & Weaknesses */}
      <Box bg="background.ui" p={4} borderRadius="md" mb={4}>
        <Heading size="sm" mb={3} color="text.primary">
          Strengths & Weaknesses
        </Heading>

        {/* Effective against */}
        {advantagesAgainst.length > 0 && (
          <Box mb={3}>
            <Flex align="center" mb={1}>
              <Icon as={Target} boxSize={4} color="status.success" mr={2} />
              <Text fontSize="sm" color="text.primary">
                Effective Against:
              </Text>
            </Flex>
            <Flex gap={2} wrap="wrap" ml={6}>
              {advantagesAgainst.map((unitName, index) => (
                <Badge key={index} colorScheme="green">
                  {unitName}
                </Badge>
              ))}
            </Flex>
          </Box>
        )}

        {/* Weak against */}
        {disadvantagesAgainst.length > 0 && (
          <Box mb={3}>
            <Flex align="center" mb={1}>
              <Icon as={Shield} boxSize={4} color="status.danger" mr={2} />
              <Text fontSize="sm" color="text.primary">
                Vulnerable To:
              </Text>
            </Flex>
            <Flex gap={2} wrap="wrap" ml={6}>
              {disadvantagesAgainst.map((unitName, index) => (
                <Badge key={index} colorScheme="red">
                  {unitName}
                </Badge>
              ))}
            </Flex>
          </Box>
        )}

        {/* Terrain preferences */}
        {effectiveTerrains.length > 0 && (
          <Box>
            <Flex align="center" mb={1}>
              <Icon as={MapPin} boxSize={4} color="resource.science" mr={2} />
              <Text fontSize="sm" color="text.primary">
                Preferred Terrain:
              </Text>
            </Flex>
            <Flex gap={2} wrap="wrap" ml={6}>
              {effectiveTerrains.map((terrain, index) => (
                <Badge key={index} colorScheme="blue">
                  {terrain}
                </Badge>
              ))}
            </Flex>
          </Box>
        )}

        {/* Special abilities */}
        {unitType.special && (
          <Box mt={3}>
            <Flex align="center" mb={1}>
              <Icon as={Zap} boxSize={4} color="resource.culture" mr={2} />
              <Text fontSize="sm" color="text.primary">
                Special Abilities:
              </Text>
            </Flex>
            <Text fontSize="sm" color="text.secondary" ml={6}>
              {unitType.special}
            </Text>
          </Box>
        )}
      </Box>

      {/* Maintenance */}
      <Box bg="background.ui" p={4} borderRadius="md" mb={4}>
        <Heading size="sm" mb={3} color="text.primary">
          Maintenance
        </Heading>
        <Flex justify="space-between" align="center">
          <Text fontSize="sm" color="text.secondary">
            Upkeep Cost:
          </Text>
          <Badge colorScheme="yellow">
            {unitType.maintenanceCost?.gold || 1} Gold per turn
          </Badge>
        </Flex>
      </Box>

      {/* Action Buttons */}
      <Flex gap={3} justify="flex-end">
        {onDismissUnit && (
          <SharedButton
            variant="danger"
            size="sm"
            onClick={() => onDismissUnit(unit)}
          >
            Dismiss Unit
          </SharedButton>
        )}

        <SharedButton variant="primary" size="sm" onClick={onClose}>
          Close
        </SharedButton>
      </Flex>
    </Box>
  );
};

export default React.memo(UnitDetailView);
