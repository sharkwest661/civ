// src/components/military/UnitCard.jsx
import React from "react";
import {
  Box,
  Text,
  Flex,
  HStack,
  VStack,
  Badge,
  Progress,
  Tooltip,
  Icon,
} from "@chakra-ui/react";
import {
  Sword,
  Shield,
  TrendingUp,
  Heart,
  Star,
  Users,
  AlertCircle,
  Award,
} from "lucide-react";
import { useMilitaryStore } from "../../stores/enhancedMilitaryStore";
import { formatTerritoryType } from "../../utils/gameUtils";

/**
 * UnitCard - Displays a military unit with its stats and status
 *
 * @param {Object} props
 * @param {Object} props.unit - The unit to display
 * @param {boolean} props.isCompact - Whether to show in compact mode
 * @param {boolean} props.isSelectable - Whether the card is selectable
 * @param {boolean} props.isSelected - Whether the card is selected
 * @param {Function} props.onClick - Callback when card is clicked
 */
const UnitCard = ({
  unit,
  isCompact = false,
  isSelectable = false,
  isSelected = false,
  onClick = () => {},
}) => {
  // Get unit types data
  const unitTypes = useMilitaryStore((state) => state.unitTypes);

  if (!unit || !unitTypes[unit.type]) {
    return (
      <Box
        bg="background.ui"
        p={2}
        borderRadius="md"
        borderWidth="1px"
        borderColor="background.highlight"
      >
        <Flex align="center" justify="center">
          <Icon as={AlertCircle} color="status.warning" mr={2} />
          <Text color="text.secondary">Invalid Unit</Text>
        </Flex>
      </Box>
    );
  }

  // Get unit type data
  const unitType = unitTypes[unit.type];

  // Calculate level-based bonuses
  const levelBonus = Math.round((unit.level - 1) * 0.1 * 100); // 10% per level
  const effectiveStrength = Math.round(
    unitType.strength * (1 + (unit.level - 1) * 0.1)
  );

  // Determine if unit has special abilities
  const hasSpecialAbility = !!unitType.specialAbility;
  const specialAbilityDesc = getSpecialAbilityDescription(
    unitType.specialAbility
  );

  // Compact view (for lists and small spaces)
  if (isCompact) {
    return (
      <Box
        bg="background.ui"
        p={2}
        borderRadius="md"
        borderWidth="1px"
        borderColor={isSelected ? "accent.main" : "transparent"}
        cursor={isSelectable ? "pointer" : "default"}
        onClick={isSelectable ? onClick : undefined}
        _hover={isSelectable ? { borderColor: "background.highlight" } : {}}
        transition="all 0.2s"
      >
        <Flex justify="space-between" align="center">
          <HStack spacing={2}>
            <Text fontSize="lg">{unitType.icon}</Text>
            <Text fontSize="sm" fontWeight="medium" color="text.primary">
              {unitType.name}
            </Text>
          </HStack>

          <HStack spacing={2}>
            <Tooltip label="Strength">
              <Flex align="center">
                <Icon as={Sword} size={12} color="resource.production" />
                <Text fontSize="xs" ml={1}>
                  {effectiveStrength}
                </Text>
              </Flex>
            </Tooltip>

            <Tooltip label="Health">
              <Flex align="center">
                <Icon as={Heart} size={12} color="status.danger" />
                <Text fontSize="xs" ml={1}>
                  {unit.health}%
                </Text>
              </Flex>
            </Tooltip>

            <Badge
              colorScheme={
                unit.level >= 3 ? "purple" : unit.level === 2 ? "blue" : "gray"
              }
              fontSize="xs"
            >
              Lvl {unit.level}
            </Badge>
          </HStack>
        </Flex>
      </Box>
    );
  }

  // Full detailed view
  return (
    <Box
      bg="background.ui"
      p={3}
      borderRadius="md"
      borderWidth="1px"
      borderColor={isSelected ? "accent.main" : "background.highlight"}
      cursor={isSelectable ? "pointer" : "default"}
      onClick={isSelectable ? onClick : undefined}
      _hover={isSelectable ? { borderColor: "accent.hover" } : {}}
      transition="all 0.2s"
    >
      {/* Unit Header */}
      <Flex justify="space-between" align="center" mb={2}>
        <HStack>
          <Text fontSize="xl">{unitType.icon}</Text>
          <Box>
            <Text fontWeight="bold" color="text.primary">
              {unitType.name}
            </Text>
            <Text fontSize="xs" color="text.secondary">
              {unitType.era} Era
            </Text>
          </Box>
        </HStack>

        <Tooltip
          label={`Level ${unit.level}${
            levelBonus ? ` (+${levelBonus}% bonus)` : ""
          }`}
        >
          <Badge
            px={2}
            py={0.5}
            borderRadius="full"
            colorScheme={
              unit.level >= 4
                ? "purple"
                : unit.level === 3
                ? "green"
                : unit.level === 2
                ? "blue"
                : "gray"
            }
          >
            <Flex align="center">
              <Icon as={Star} size={12} mr={1} />
              <Text>{unit.level}</Text>
            </Flex>
          </Badge>
        </Tooltip>
      </Flex>

      {/* Unit Stats */}
      <Box mb={3}>
        <Grid templateColumns="1fr 1fr" gap={2}>
          <Stat
            icon={Sword}
            color="resource.production"
            label="Strength"
            value={effectiveStrength}
            bonus={levelBonus > 0 ? `+${levelBonus}%` : undefined}
          />

          <Stat
            icon={TrendingUp}
            color="resource.science"
            label="Movement"
            value={`${unit.movesLeft}/${unitType.movementRange}`}
          />

          <Stat
            icon={Shield}
            color="resource.gold"
            label="Maintenance"
            value={unitType.maintenanceCost?.gold || 0}
            suffix="gold"
          />

          <Stat
            icon={Heart}
            color="status.danger"
            label="Health"
            value={`${unit.health}%`}
            isProgressBar={true}
            progressValue={unit.health}
            progressColor={
              unit.health > 70 ? "green" : unit.health > 30 ? "yellow" : "red"
            }
          />
        </Grid>
      </Box>

      {/* Unit Experience */}
      <Box mb={3}>
        <Flex justify="space-between" align="center" mb={1}>
          <Text fontSize="xs" color="text.secondary">
            Experience:
          </Text>
          <Text fontSize="xs" color="resource.gold">
            {unit.experience}/100 XP
          </Text>
        </Flex>

        <Progress
          value={unit.experience}
          size="xs"
          colorScheme="yellow"
          borderRadius="full"
        />
      </Box>

      {/* Special Ability */}
      {hasSpecialAbility && (
        <Box
          bg="background.panel"
          p={2}
          borderRadius="md"
          borderLeftWidth="2px"
          borderColor="resource.culture"
        >
          <Flex align="center" mb={1}>
            <Icon as={Award} size={12} color="resource.culture" mr={1} />
            <Text fontSize="xs" fontWeight="medium" color="text.primary">
              {formatSpecialAbilityName(unitType.specialAbility)}
            </Text>
          </Flex>

          <Text fontSize="xs" color="text.secondary">
            {specialAbilityDesc}
          </Text>
        </Box>
      )}

      {/* Unit Description */}
      <Text fontSize="xs" color="text.secondary" mt={2}>
        {unitType.description}
      </Text>

      {/* Upgrade Available */}
      {unitType.upgradeTo && (
        <Badge mt={2} colorScheme="green" fontSize="xs">
          Can upgrade to{" "}
          {unitTypes[unitType.upgradeTo]?.name || unitType.upgradeTo}
        </Badge>
      )}
    </Box>
  );
};

// Helper component for unit stats
const Stat = ({
  icon,
  color,
  label,
  value,
  suffix = "",
  bonus = undefined,
  isProgressBar = false,
  progressValue = 0,
  progressColor = "blue",
}) => {
  return (
    <Box>
      <Flex align="center" mb={1}>
        <Icon as={icon} size={12} color={color} mr={1} />
        <Text fontSize="xs" color="text.secondary">
          {label}:
        </Text>
      </Flex>

      {isProgressBar ? (
        <Progress
          value={progressValue}
          size="xs"
          colorScheme={progressColor}
          borderRadius="full"
        />
      ) : (
        <Flex align="center">
          <Text fontSize="sm" fontWeight="medium" color="text.primary">
            {value} {suffix}
          </Text>

          {bonus && (
            <Badge fontSize="2xs" ml={1} colorScheme="green">
              {bonus}
            </Badge>
          )}
        </Flex>
      )}
    </Box>
  );
};

// Helper to format grid template
const Grid = ({ children, templateColumns, gap }) => {
  return (
    <Box display="grid" gridTemplateColumns={templateColumns} gap={gap}>
      {children}
    </Box>
  );
};

// Helper to get special ability description
function getSpecialAbilityDescription(ability) {
  switch (ability) {
    case "antiCavalry":
      return "+3 strength against cavalry units";
    case "fortificationDamage":
      return "200% damage against fortifications";
    case "formationFighting":
      return "+1 strength for each adjacent swordsman";
    case "charge":
      return "+2 strength when attacking";
    case "volleyFire":
      return "+3 strength when defending";
    case "enhancedVisibility":
      return "Can see further, revealing additional tiles";
    case "terrainBonus":
      return "Combat bonus on certain terrain types";
    default:
      return "Special ability";
  }
}

// Helper to format special ability names
function formatSpecialAbilityName(ability) {
  if (!ability) return "";

  // Convert camelCase to Proper Case with spaces
  return (
    ability
      // Insert a space before uppercase letters
      .replace(/([A-Z])/g, " $1")
      // Capitalize the first letter
      .replace(/^./, (str) => str.toUpperCase())
      .trim()
  );
}

export default UnitCard;
