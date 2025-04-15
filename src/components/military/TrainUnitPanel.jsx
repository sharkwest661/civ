// src/components/military/TrainUnitPanel.jsx
import React, { useState, useMemo } from "react";
import {
  Box,
  Heading,
  Text,
  Flex,
  VStack,
  HStack,
  Badge,
  Divider,
  Icon,
  SimpleGrid,
  Button,
  Progress,
  Tooltip,
} from "@chakra-ui/react";
import {
  Shield,
  Sword,
  UserMinus,
  AlertTriangle,
  AlignJustify,
  Heart,
  TrendingUp,
  Coins,
} from "lucide-react";
import SharedButton from "../ui/SharedButton";

/**
 * TrainUnitPanel - Panel for training new military units
 */
const TrainUnitPanel = ({
  unitTypes = {},
  selectedTerritory = null,
  onTrainUnit,
  productionResource = {},
  availableWorkerCount = 0,
}) => {
  const [selectedUnitType, setSelectedUnitType] = useState(null);

  // Format unit types into an array for rendering
  const unitTypesList = useMemo(() => {
    return Object.values(unitTypes).map((unit) => ({
      ...unit,
      // Check if we have required resources
      canAfford: productionResource?.amount >= (unit.cost.production || 0),
      // Check if we have required workers
      hasWorkers: availableWorkerCount >= (unit.requiredWorkers || 1),
      // Check required special resources
      hasRequiredResources: true, // Would check strategic resources
    }));
  }, [unitTypes, productionResource, availableWorkerCount]);

  // Get territory building slot limit
  const getTerritoryDescription = () => {
    if (!selectedTerritory) return "No territory selected";

    let description = selectedTerritory.type
      ? selectedTerritory.type.charAt(0).toUpperCase() +
        selectedTerritory.type.slice(1)
      : "Unknown";

    if (selectedTerritory.isCapital) description += " (Capital)";
    if (selectedTerritory.resource)
      description += ` with ${selectedTerritory.resource}`;

    return description;
  };

  // Render territory selection or warning
  const renderTerritorySelection = () => {
    if (!selectedTerritory) {
      return (
        <Box bg="background.ui" p={4} borderRadius="md" mb={4}>
          <Flex align="center" color="status.warning">
            <Icon as={AlertTriangle} mr={2} />
            <Text>No territory selected</Text>
          </Flex>
          <Text color="text.secondary" fontSize="sm" mt={2}>
            Select a territory on the map to train units there.
          </Text>
        </Box>
      );
    }

    return (
      <Box bg="background.ui" p={3} borderRadius="md" mb={4}>
        <Text mb={1} color="text.primary">
          Selected Territory: {getTerritoryDescription()}
        </Text>

        {!selectedTerritory.isOwned && (
          <Text fontSize="sm" color="status.danger">
            You can only train units in territories you own.
          </Text>
        )}
      </Box>
    );
  };

  // Render resource indicators
  const renderResourceIndicators = () => {
    return (
      <Box bg="background.highlight" p={3} borderRadius="md" mb={4}>
        <Heading size="sm" mb={2} color="text.primary">
          Available Resources
        </Heading>

        <Flex justify="space-between" align="center" mb={2}>
          <Flex align="center">
            <Icon
              as={AlignJustify}
              size={16}
              color="resource.production"
              mr={2}
            />
            <Text fontSize="sm" color="text.secondary">
              Production:
            </Text>
          </Flex>
          <Text fontWeight="bold" color="resource.production">
            {Math.floor(productionResource?.amount || 0)} ⚒️
          </Text>
        </Flex>

        <Flex justify="space-between" align="center">
          <Flex align="center">
            <Icon as={UserMinus} size={16} mr={2} />
            <Text fontSize="sm" color="text.secondary">
              Available Workers:
            </Text>
          </Flex>
          <Text fontWeight="bold">{availableWorkerCount}</Text>
        </Flex>
      </Box>
    );
  };

  // Render unit selection
  const renderUnitSelection = () => {
    return (
      <>
        <Heading size="sm" mb={3} color="text.primary">
          Available Units
        </Heading>

        <SimpleGrid columns={1} spacing={3} mb={4}>
          {unitTypesList.map((unit) => {
            const canTrain =
              unit.canAfford &&
              unit.hasWorkers &&
              unit.hasRequiredResources &&
              selectedTerritory?.isOwned;

            return (
              <Box
                key={unit.id}
                bg={
                  selectedUnitType === unit.id
                    ? "background.highlight"
                    : "background.ui"
                }
                p={3}
                borderRadius="md"
                borderWidth="1px"
                borderColor={
                  selectedUnitType === unit.id ? "accent.main" : "transparent"
                }
                cursor="pointer"
                onClick={() => setSelectedUnitType(unit.id)}
                opacity={canTrain ? 1 : 0.7}
                _hover={canTrain ? { borderColor: "background.highlight" } : {}}
              >
                <Flex justify="space-between" align="flex-start" mb={2}>
                  <HStack>
                    <Text fontSize="xl">{unit.icon}</Text>
                    <Box>
                      <Text fontWeight="medium" color="text.primary">
                        {unit.name}
                      </Text>
                      <Text fontSize="xs" color="text.secondary">
                        {unit.description}
                      </Text>
                    </Box>
                  </HStack>

                  <Badge colorScheme="blue" px={2} py={0.5}>
                    {unit.requiredWorkers} Worker
                    {unit.requiredWorkers > 1 ? "s" : ""}
                  </Badge>
                </Flex>

                <Divider mb={2} />

                <Flex justify="space-between" mb={3}>
                  <HStack spacing={4}>
                    <Tooltip label="Combat Strength">
                      <Flex align="center">
                        <Icon as={Sword} size={16} mr={1} />
                        <Text fontSize="sm">{unit.strength}</Text>
                      </Flex>
                    </Tooltip>

                    <Tooltip label="Health">
                      <Flex align="center">
                        <Icon as={Heart} size={16} mr={1} />
                        <Text fontSize="sm">100%</Text>
                      </Flex>
                    </Tooltip>

                    <Tooltip label="Movement Range">
                      <Flex align="center">
                        <Icon as={TrendingUp} size={16} mr={1} />
                        <Text fontSize="sm">{unit.movementRange}</Text>
                      </Flex>
                    </Tooltip>

                    <Tooltip label="Maintenance Cost">
                      <Flex align="center">
                        <Icon as={Coins} size={16} mr={1} />
                        <Text fontSize="sm">
                          {unit.maintenanceCost.gold}/turn
                        </Text>
                      </Flex>
                    </Tooltip>
                  </HStack>
                </Flex>

                <Flex justify="space-between" align="center">
                  <Flex align="center">
                    <Badge
                      colorScheme={unit.canAfford ? "green" : "red"}
                      variant="subtle"
                      px={2}
                    >
                      {unit.cost.production} ⚒️
                    </Badge>

                    {Object.entries(unit.requiredResources).length > 0 && (
                      <Badge
                        ml={2}
                        colorScheme="purple"
                        variant="subtle"
                        px={2}
                      >
                        +{" "}
                        {Object.entries(unit.requiredResources)
                          .map(([resource, amount]) => `${amount} ${resource}`)
                          .join(", ")}
                      </Badge>
                    )}
                  </Flex>

                  {!unit.canAfford && (
                    <Text fontSize="xs" color="status.danger">
                      Insufficient production
                    </Text>
                  )}

                  {!unit.hasWorkers && (
                    <Text fontSize="xs" color="status.danger">
                      No workers available
                    </Text>
                  )}
                </Flex>
              </Box>
            );
          })}
        </SimpleGrid>

        {/* Training action */}
        <Flex justify="flex-end">
          <SharedButton
            variant="primary"
            size="md"
            leftIcon={<Icon as={Shield} boxSize={5} />}
            onClick={() => {
              onTrainUnit(selectedUnitType);
              setSelectedUnitType(null);
            }}
            isDisabled={
              !selectedUnitType ||
              !selectedTerritory?.isOwned ||
              availableWorkerCount <= 0 ||
              !unitTypesList.find((u) => u.id === selectedUnitType)?.canAfford
            }
          >
            Train Unit
          </SharedButton>
        </Flex>
      </>
    );
  };

  return (
    <Box>
      <Heading size="md" mb={4} color="accent.main">
        Train Military Units
      </Heading>

      {renderTerritorySelection()}
      {renderResourceIndicators()}
      {renderUnitSelection()}
    </Box>
  );
};

export default React.memo(TrainUnitPanel);
