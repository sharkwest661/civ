// src/components/buildings/BuildingPanel.jsx
import React, { useState, useMemo } from "react";
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Flex,
  Divider,
  Badge,
  Icon,
  useToast,
} from "@chakra-ui/react";
import { Building, Hammer, AlertCircle } from "lucide-react";
import { useMapStore } from "../../stores/mapStore";
import { useResourcesStore } from "../../stores/resourcesStore";
import { hexToId } from "../../utils/hexUtils";
import SharedButton from "../ui/SharedButton";
import SharedPanel from "../ui/SharedPanel";
import {
  BUILDING_TYPES,
  formatTerritoryType,
  getTerritoryBuildingSlotLimit,
} from "../../utils/gameUtils";

/**
 * BuildingPanel component for managing building construction and upgrades
 * Fixed to work with refactored resources store
 */
const BuildingPanel = React.memo(({ selectedTerritory, onClose }) => {
  const [selectedBuildingType, setSelectedBuildingType] = useState(null);
  const toast = useToast();

  // Get territory information from mapStore with individual selectors
  const territories = useMapStore((state) => state.territories);
  const addBuilding = useMapStore((state) => state.addBuilding);
  const upgradeBuilding = useMapStore((state) => state.upgradeBuilding);

  // Get resources from resourcesStore with individual selectors
  // Important: With our refactored store, we select individual resources directly
  const productionResource = useResourcesStore((state) => state.production);
  const updateResource = useResourcesStore((state) => state.updateResource);

  // Building types and their costs - memoized to prevent recreating on every render
  const buildingTypes = useMemo(() => Object.values(BUILDING_TYPES), []);

  // Check if we have a valid selected territory
  if (!selectedTerritory) {
    return (
      <Box p={4}>
        <Heading size="md" color="accent.main" mb={4}>
          Building Management
        </Heading>
        <Text color="text.secondary" textAlign="center" py={6}>
          Select a territory to build or upgrade structures.
        </Text>
      </Box>
    );
  }

  // Get territory ID from selected hex
  const territoryId = hexToId(selectedTerritory);
  const territory = territories[territoryId] || {};

  // Check if a building can be constructed in this territory
  const canBuildInTerritory = (building) => {
    if (!territory.type) return false;
    if (!territory.isOwned) return false;

    // Check building slot limit
    const slotLimit = getTerritoryBuildingSlotLimit(territory);
    if ((territory.buildings?.length || 0) >= slotLimit) return false;

    // Check if territory type is suitable
    return building.requirements.territoryTypes.includes(territory.type);
  };

  // Check if we have enough resources to build
  const canAffordBuilding = (building) => {
    // Make sure productionResource exists and has an amount property
    return (productionResource?.amount || 0) >= building.productionCost;
  };

  // Handle building construction
  const handleBuild = (buildingType) => {
    // Check if we can afford it
    if (!canAffordBuilding(buildingType)) {
      toast({
        title: "Not enough resources",
        description: `You need ${buildingType.productionCost} production points to build a ${buildingType.name}`,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Create the new building
    const newBuilding = {
      id: buildingType.id,
      name: buildingType.name,
      type: buildingType.id,
      level: 1,
      workers: [],
    };

    // Add the building to the territory
    addBuilding(territoryId, newBuilding);

    // Deduct the resources
    updateResource("production", -buildingType.productionCost);

    // Show success toast
    toast({
      title: "Building Constructed",
      description: `${buildingType.name} has been built successfully`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  // Handle building upgrade
  const handleUpgrade = (buildingIndex, currentLevel) => {
    // Calculate upgrade cost (increases with level)
    const upgradeCost = 20 * currentLevel;

    // Check if we can afford it
    if ((productionResource?.amount || 0) < upgradeCost) {
      toast({
        title: "Not enough resources",
        description: `You need ${upgradeCost} production points for this upgrade`,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Upgrade the building
    upgradeBuilding(territoryId, buildingIndex, currentLevel + 1);

    // Deduct the resources
    updateResource("production", -upgradeCost);

    // Show success toast
    toast({
      title: "Building Upgraded",
      description: "Building has been upgraded successfully",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  // Render the list of existing buildings in the territory
  const renderExistingBuildings = () => {
    if (!territory.buildings || territory.buildings.length === 0) {
      return (
        <Text color="text.secondary" mb={4}>
          No buildings in this territory.
        </Text>
      );
    }

    return (
      <Box mb={6}>
        <Heading size="sm" color="text.primary" mb={3}>
          Existing Buildings
        </Heading>
        <VStack spacing={3} align="stretch">
          {territory.buildings.map((building, index) => (
            <Box key={index} bg="background.ui" p={3} borderRadius="md">
              <Flex justify="space-between" align="center">
                <Box>
                  <Text color="text.primary" fontWeight="medium">
                    {building.name}
                  </Text>
                  <Text color="text.secondary" fontSize="sm">
                    Level: {building.level || 1}
                  </Text>
                </Box>
                {(building.level || 1) < 3 && (
                  <SharedButton
                    variant="secondary"
                    size="sm"
                    onClick={() => handleUpgrade(index, building.level || 1)}
                    isDisabled={
                      (productionResource?.amount || 0) <
                      20 * (building.level || 1)
                    }
                    leftIcon={<Icon as={Hammer} boxSize={4} />}
                  >
                    Upgrade ({20 * (building.level || 1)})
                  </SharedButton>
                )}
              </Flex>
            </Box>
          ))}
        </VStack>
      </Box>
    );
  };

  // Render the list of available buildings to construct
  const renderAvailableBuildings = () => {
    // Check if we reached building slot limit
    const slotLimit = getTerritoryBuildingSlotLimit(territory);
    const currentBuildings = territory.buildings?.length || 0;
    const slotsRemaining = slotLimit - currentBuildings;

    if (slotsRemaining <= 0) {
      return (
        <Box bg="background.ui" p={4} borderRadius="md" mb={4}>
          <Flex align="center" color="status.warning">
            <Icon as={AlertCircle} mr={2} />
            <Text>Building slot limit reached for this territory.</Text>
          </Flex>
          <Text color="text.secondary" fontSize="sm" mt={2}>
            Upgrade existing buildings or expand to new territories.
          </Text>
        </Box>
      );
    }

    return (
      <Box>
        <Heading size="sm" color="text.primary" mb={3}>
          Construct New Building
        </Heading>
        <VStack spacing={3} align="stretch">
          {buildingTypes.map((building) => {
            const canBuild =
              canBuildInTerritory(building) && canAffordBuilding(building);

            return (
              <Box
                key={building.id}
                bg="background.ui"
                p={3}
                borderRadius="md"
                opacity={canBuild ? 1 : 0.6}
                cursor={canBuild ? "pointer" : "not-allowed"}
                onClick={() => canBuild && handleBuild(building)}
                transition="all 0.2s"
                _hover={canBuild ? { bg: "background.highlight" } : {}}
              >
                <Flex justify="space-between" align="center" mb={1}>
                  <Flex align="center">
                    <Icon as={Building} mr={2} color="text.primary" />
                    <Text color="text.primary" fontWeight="medium">
                      {building.name}
                    </Text>
                  </Flex>
                  <Badge
                    px={2}
                    py={0.5}
                    borderRadius="md"
                    colorScheme={canAffordBuilding(building) ? "yellow" : "red"}
                  >
                    {building.productionCost} ⚒️
                  </Badge>
                </Flex>

                <Text color="text.secondary" fontSize="sm" mb={2}>
                  {building.description}
                </Text>

                {!canBuildInTerritory(building) && (
                  <Text color="status.danger" fontSize="xs">
                    Cannot build in this territory type
                  </Text>
                )}

                {canBuildInTerritory(building) &&
                  !canAffordBuilding(building) && (
                    <Text color="status.danger" fontSize="xs">
                      Not enough production points
                    </Text>
                  )}
              </Box>
            );
          })}
        </VStack>
      </Box>
    );
  };

  return (
    <Box p={4}>
      <Flex justify="space-between" align="center" mb={4}>
        <Heading size="md" color="accent.main">
          Building Management
        </Heading>
        <SharedButton size="sm" variant="ghost" onClick={onClose}>
          ✕
        </SharedButton>
      </Flex>

      <Box bg="background.ui" p={3} borderRadius="md" mb={4}>
        <VStack align="stretch" spacing={1}>
          <Text color="text.primary">
            Selected Territory: ({selectedTerritory.q}, {selectedTerritory.r})
          </Text>
          <Text color="text.secondary">
            Type: {formatTerritoryType(territory.type)}
          </Text>
          {territory.resource && (
            <Text color="text.secondary">Resource: {territory.resource}</Text>
          )}
          <Flex align="center" mt={1}>
            <Text color="text.secondary" fontSize="sm">
              Building Slots: {territory.buildings?.length || 0}/
              {getTerritoryBuildingSlotLimit(territory)}
            </Text>
            <Box
              ml={2}
              w="100px"
              h="6px"
              bg="background.highlight"
              borderRadius="full"
              overflow="hidden"
            >
              <Box
                h="100%"
                w={`${
                  ((territory.buildings?.length || 0) /
                    getTerritoryBuildingSlotLimit(territory)) *
                  100
                }%`}
                bg="accent.main"
                borderRadius="full"
              />
            </Box>
          </Flex>
        </VStack>
      </Box>

      {/* Production resources indicator */}
      <Flex
        bg="background.highlight"
        p={2}
        borderRadius="md"
        mb={4}
        justify="space-between"
        align="center"
      >
        <Text fontSize="sm" color="text.secondary">
          Available Production:
        </Text>
        <Text fontWeight="bold" color="resource.production">
          {Math.floor(productionResource?.amount || 0)} ⚒️
        </Text>
      </Flex>

      {/* Existing buildings section */}
      {renderExistingBuildings()}

      <Divider my={4} />

      {/* New building section */}
      {territory.isOwned && renderAvailableBuildings()}

      {!territory.isOwned && (
        <Box bg="background.ui" p={4} borderRadius="md" textAlign="center">
          <Text color="text.secondary">
            You can only build in territories you own.
          </Text>
        </Box>
      )}
    </Box>
  );
});

// Add display name for debugging
BuildingPanel.displayName = "BuildingPanel";

export default BuildingPanel;
