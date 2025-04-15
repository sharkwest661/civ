// src/components/military/MilitaryPanel-Fix.jsx
// (Updated import statement to use TacticalCardSelector)
import React, { useState, useCallback, useEffect, useMemo } from "react";
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
  Progress,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from "@chakra-ui/react";
import {
  Users,
  Building,
  FlaskConical,
  Sword,
  Shield,
  Target,
  ArrowRight,
  Clock,
  X,
  Check,
  AlertTriangle,
  MapPin,
} from "lucide-react";
import { useMilitaryStore } from "../../stores/militaryStore";
import { useWorkersStore } from "../../stores/workersStore";
import { useResourcesStore } from "../../stores/resourcesStore";
import { useMapStore } from "../../stores/mapStore";
import SharedButton from "../ui/SharedButton";
import TrainUnitPanel from "./TrainUnitPanel";
import TacticalCardSelector from "./TacticalCardSelector"; // CORRECTED IMPORT HERE
import CombatPanel from "./CombatPanel";
import { hexToId } from "../../utils/hexUtils";

/**
 * MilitaryPanel component - Main interface for military management
 */
const MilitaryPanel = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedTerritory, setSelectedTerritory] = useState(null);
  const toast = useToast();

  // Get military state from store
  const militaryUnits = useMilitaryStore((state) => state.militaryUnits);
  const unitTypes = useMilitaryStore((state) => state.unitTypes);
  const trainUnit = useMilitaryStore((state) => state.trainUnit);
  const getUnitsInTerritory = useMilitaryStore(
    (state) => state.getUnitsInTerritory
  );
  const calculateMaintenance = useMilitaryStore(
    (state) => state.calculateMaintenance
  );
  const combat = useMilitaryStore((state) => state.combat);
  const startCombat = useMilitaryStore((state) => state.startCombat);

  // Get worker state
  const availableWorkerCount = useWorkersStore(
    (state) => state.availableWorkerCount
  );

  // Get resource state
  const production = useResourcesStore((state) => state.production);
  const gold = useResourcesStore((state) => state.gold);
  const updateResource = useResourcesStore((state) => state.updateResource);

  // Get map state
  const territories = useMapStore((state) => state.territories);
  const mapSelectedTerritory = useMapStore((state) => state.selectedTerritory);
  const setTerritoryOwner = useMapStore((state) => state.setTerritoryOwner);

  // Rest of the component unchanged...

  // When map selection changes, update local state
  React.useEffect(() => {
    if (mapSelectedTerritory) {
      setSelectedTerritory(mapSelectedTerritory);
    }
  }, [mapSelectedTerritory]);

  // Get current selected territory ID
  const selectedTerritoryId = useMemo(() => {
    if (!selectedTerritory) return null;
    return hexToId(selectedTerritory);
  }, [selectedTerritory]);

  // Get territory data
  const territory = useMemo(() => {
    if (!selectedTerritoryId) return null;
    return territories[selectedTerritoryId];
  }, [selectedTerritoryId, territories]);

  // Get units in selected territory
  const selectedTerritoryUnits = useMemo(() => {
    if (!selectedTerritoryId) return [];
    return getUnitsInTerritory(selectedTerritoryId);
  }, [selectedTerritoryId, getUnitsInTerritory]);

  // Calculate maintenance costs
  const maintenanceCosts = useMemo(() => {
    return calculateMaintenance();
  }, [calculateMaintenance]);

  // Handle worker conversion
  const handleConvertWorker = useCallback(
    (territoryId) => {
      // In a real implementation, this would interact with the worker store
      // For now, just check if we have workers available
      if (availableWorkerCount <= 0) {
        toast({
          title: "No workers available",
          description: "You need at least one worker to train a military unit.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return false;
      }
      return true;
    },
    [availableWorkerCount, toast]
  );

  // Handle resource payment
  const handlePayResources = useCallback(
    (cost) => {
      // Check if we have enough resources
      if (cost.production && production.amount < cost.production) {
        toast({
          title: "Insufficient resources",
          description: `You need ${cost.production} production to train this unit.`,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return false;
      }

      // Deduct resources
      if (cost.production) {
        updateResource("production", -cost.production);
      }
      return true;
    },
    [production, updateResource, toast]
  );

  // Handle unit training
  const handleTrainUnit = useCallback(
    (unitTypeId) => {
      if (!selectedTerritoryId) {
        toast({
          title: "No territory selected",
          description: "Select a territory to train units.",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      const success = trainUnit(
        selectedTerritoryId,
        unitTypeId,
        handleConvertWorker,
        handlePayResources
      );

      if (success) {
        toast({
          title: "Unit trained",
          description: `A new ${unitTypes[unitTypeId].name} has been trained.`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
    },
    [
      selectedTerritoryId,
      trainUnit,
      handleConvertWorker,
      handlePayResources,
      unitTypes,
      toast,
    ]
  );

  // Handle initiating combat
  const handleInitiateCombat = useCallback(
    (defendingTerritoryId) => {
      if (!selectedTerritoryId) {
        toast({
          title: "No territory selected",
          description: "Select a territory with military units to attack from.",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      // Check if we have units in the selected territory
      const attackingUnits = getUnitsInTerritory(selectedTerritoryId);
      if (attackingUnits.length === 0) {
        toast({
          title: "No units available",
          description: "You need military units to attack.",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      // Get territory function for the combat system
      const getTerritory = (territoryId) => territories[territoryId];

      const success = startCombat(
        selectedTerritoryId,
        defendingTerritoryId,
        getTerritory
      );

      if (success) {
        // Switch to combat tab
        setActiveTab(2);
      } else {
        toast({
          title: "Cannot initiate combat",
          description:
            "Failed to start combat. Check your units and territory selection.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    },
    [selectedTerritoryId, getUnitsInTerritory, startCombat, territories, toast]
  );

  // Handle territory conquest after combat
  const handleTerritoryConquest = useCallback(
    (territoryId, ownerTerritoryId) => {
      // Get the owner ID from the owner territory
      const ownerTerritory = territories[ownerTerritoryId];
      if (!ownerTerritory || !ownerTerritory.owner) return;

      // Set the new owner of the conquered territory
      setTerritoryOwner(territoryId, ownerTerritory.owner);
    },
    [territories, setTerritoryOwner]
  );

  // Render the overview section
  const renderOverview = () => {
    return (
      <Box>
        <Heading size="md" mb={4} color="accent.main">
          Military Overview
        </Heading>

        {/* Resource indicator */}
        <Flex
          bg="background.highlight"
          p={3}
          borderRadius="md"
          mb={4}
          justify="space-between"
          align="center"
        >
          <VStack align="flex-start" spacing={1}>
            <Text fontSize="sm" color="text.secondary">
              Military Maintenance:
            </Text>
            <Text fontSize="sm" color="resource.gold">
              {maintenanceCosts.gold} Gold per turn
            </Text>
          </VStack>
          <Flex direction="column" align="flex-end">
            <Text fontWeight="bold" color="resource.gold">
              {Math.floor(gold?.amount || 0)} 💰
            </Text>
            <Text
              fontSize="xs"
              color={
                (gold?.production || 0) - maintenanceCosts.gold >= 0
                  ? "status.success"
                  : "status.danger"
              }
            >
              {(gold?.production || 0) >= maintenanceCosts.gold
                ? "Sufficient income"
                : "Income deficit!"}
            </Text>
          </Flex>
        </Flex>

        {/* Military strength by territory */}
        <Heading size="sm" mb={3} color="text.primary">
          Military Deployment
        </Heading>

        {Object.entries(militaryUnits).length === 0 ? (
          <Box bg="background.ui" p={4} borderRadius="md" textAlign="center">
            <Text color="text.secondary">
              No military units have been trained yet.
            </Text>
            <Text color="text.secondary" fontSize="sm" mt={2}>
              Select a territory and train units in the Units tab.
            </Text>
          </Box>
        ) : (
          <VStack spacing={3} align="stretch" mb={4}>
            {Object.entries(militaryUnits).map(
              ([territoryId, territoryData]) => {
                const territory = territories[territoryId];
                const totalUnits = territoryData.units.length;

                // Group units by type for display
                const unitCounts = territoryData.units.reduce(
                  (counts, unit) => {
                    counts[unit.type] = (counts[unit.type] || 0) + 1;
                    return counts;
                  },
                  {}
                );

                return (
                  <Box
                    key={territoryId}
                    bg="background.ui"
                    p={3}
                    borderRadius="md"
                    cursor="pointer"
                    _hover={{ bg: "background.highlight" }}
                    onClick={() => {
                      const hex = territory
                        ? { q: territory.q, r: territory.r }
                        : null;
                      if (hex) setSelectedTerritory(hex);
                    }}
                  >
                    <Flex justify="space-between" align="center" mb={2}>
                      <Flex align="center">
                        <Icon as={MapPin} mr={2} />
                        <Text color="text.primary">
                          Territory:{" "}
                          {territory?.type
                            ? territory.type.charAt(0).toUpperCase() +
                              territory.type.slice(1)
                            : "Unknown"}
                          {territory?.isCapital ? " (Capital)" : ""}
                        </Text>
                      </Flex>
                      <Badge colorScheme="blue" px={2}>
                        {totalUnits} {totalUnits === 1 ? "Unit" : "Units"}
                      </Badge>
                    </Flex>

                    <Flex wrap="wrap" gap={2} mt={2}>
                      {Object.entries(unitCounts).map(([type, count]) => (
                        <Badge
                          key={type}
                          colorScheme={
                            type === "warrior"
                              ? "gray"
                              : type === "archer"
                              ? "green"
                              : type === "horseman"
                              ? "yellow"
                              : "purple"
                          }
                          display="flex"
                          alignItems="center"
                          px={2}
                          py={1}
                        >
                          <Text mr={1}>{unitTypes[type]?.icon}</Text>
                          {unitTypes[type]?.name}: {count}
                        </Badge>
                      ))}
                    </Flex>
                  </Box>
                );
              }
            )}
          </VStack>
        )}

        {/* Selected territory info */}
        {selectedTerritory && territory && (
          <Box mt={4}>
            <Heading size="sm" mb={3} color="text.primary">
              Selected Territory
            </Heading>
            <Box bg="background.ui" p={3} borderRadius="md">
              <Flex justify="space-between" align="center" mb={2}>
                <Text color="text.primary">
                  {territory.type
                    ? territory.type.charAt(0).toUpperCase() +
                      territory.type.slice(1)
                    : "Unknown"}
                  {territory.isCapital ? " (Capital)" : ""} at (
                  {selectedTerritory.q}, {selectedTerritory.r})
                </Text>
                <Badge colorScheme={territory.owner ? "green" : "gray"} px={2}>
                  {territory.owner ? "Owned" : "Neutral"}
                </Badge>
              </Flex>

              {/* Units in territory */}
              {selectedTerritoryUnits.length > 0 ? (
                <Box mt={3}>
                  <Text fontSize="sm" color="text.secondary" mb={2}>
                    Units in this territory:
                  </Text>
                  <VStack spacing={2} align="stretch">
                    {selectedTerritoryUnits.map((unit) => (
                      <Flex
                        key={unit.id}
                        bg="background.panel"
                        p={2}
                        borderRadius="md"
                        justify="space-between"
                        align="center"
                      >
                        <HStack>
                          <Text>{unitTypes[unit.type]?.icon}</Text>
                          <Text fontSize="sm">
                            {unitTypes[unit.type]?.name}
                          </Text>
                        </HStack>
                        <HStack spacing={3}>
                          <Flex align="center">
                            <Icon as={Sword} size={4} mr={1} />
                            <Text fontSize="sm">{unit.strength}</Text>
                          </Flex>
                          <Flex align="center">
                            <Icon as={Shield} size={4} mr={1} />
                            <Text fontSize="sm">{unit.health}%</Text>
                          </Flex>
                        </HStack>
                      </Flex>
                    ))}
                  </VStack>
                </Box>
              ) : (
                <Text fontSize="sm" color="text.secondary" mt={2}>
                  No military units in this territory.
                </Text>
              )}

              {/* Quick action buttons for selected territory */}
              <Flex mt={4} gap={3} justify="flex-end">
                <SharedButton
                  size="sm"
                  variant="secondary"
                  onClick={() => setActiveTab(1)}
                  leftIcon={<Icon as={Shield} boxSize={4} />}
                >
                  Train Units
                </SharedButton>
                <SharedButton
                  size="sm"
                  variant="primary"
                  onClick={() => setActiveTab(3)}
                  leftIcon={<Icon as={Target} boxSize={4} />}
                  isDisabled={selectedTerritoryUnits.length === 0}
                >
                  Attack
                </SharedButton>
              </Flex>
            </Box>
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Box p={4}>
      <Flex justify="space-between" align="center" mb={4}>
        <Heading size="md" color="accent.main">
          Military Command
        </Heading>
        <SharedButton
          variant="ghost"
          size="sm"
          onClick={onClose}
          aria-label="Close panel"
        >
          ✕
        </SharedButton>
      </Flex>

      <Tabs index={activeTab} onChange={setActiveTab} variant="enclosed" mb={4}>
        <TabList>
          <Tab>Overview</Tab>
          <Tab>Units</Tab>
          <Tab>Combat</Tab>
          <Tab>Attack</Tab>
        </TabList>

        <TabPanels>
          {/* Overview Tab */}
          <TabPanel p={0} pt={4}>
            {renderOverview()}
          </TabPanel>

          {/* Units Tab */}
          <TabPanel p={0} pt={4}>
            <TrainUnitPanel
              unitTypes={unitTypes}
              selectedTerritory={territory}
              onTrainUnit={handleTrainUnit}
              productionResource={production}
              availableWorkerCount={availableWorkerCount}
            />
          </TabPanel>

          {/* Combat Tab */}
          <TabPanel p={0} pt={4}>
            <CombatPanel
              combat={combat}
              onTerritoryConquest={handleTerritoryConquest}
            />
          </TabPanel>

          {/* Attack Tab */}
          <TabPanel p={0} pt={4}>
            <Box>
              <Heading size="md" mb={4} color="accent.main">
                Launch Attack
              </Heading>

              {!selectedTerritory || selectedTerritoryUnits.length === 0 ? (
                <Box bg="background.ui" p={4} borderRadius="md" mb={4}>
                  <Flex align="center" color="status.warning">
                    <Icon as={AlertTriangle} mr={2} />
                    <Text>
                      {!selectedTerritory
                        ? "No territory selected."
                        : "No military units in selected territory."}
                    </Text>
                  </Flex>
                  <Text color="text.secondary" fontSize="sm" mt={2}>
                    {!selectedTerritory
                      ? "Select a territory to launch an attack from."
                      : "Train military units before launching an attack."}
                  </Text>
                </Box>
              ) : (
                <>
                  <Box bg="background.ui" p={3} borderRadius="md" mb={4}>
                    <Flex align="center" mb={2}>
                      <Icon as={MapPin} mr={2} />
                      <Text color="text.primary">
                        Attack from:{" "}
                        {territory?.type
                          ? territory.type.charAt(0).toUpperCase() +
                            territory.type.slice(1)
                          : "Unknown"}
                        {territory?.isCapital ? " (Capital)" : ""} (
                        {selectedTerritory.q}, {selectedTerritory.r})
                      </Text>
                    </Flex>

                    <Text fontSize="sm" color="text.secondary" mb={2}>
                      Attacking forces:
                    </Text>
                    <Flex gap={2} wrap="wrap">
                      {Object.entries(
                        selectedTerritoryUnits.reduce((counts, unit) => {
                          counts[unit.type] = (counts[unit.type] || 0) + 1;
                          return counts;
                        }, {})
                      ).map(([type, count]) => (
                        <Badge
                          key={type}
                          colorScheme={
                            type === "warrior"
                              ? "gray"
                              : type === "archer"
                              ? "green"
                              : type === "horseman"
                              ? "yellow"
                              : "purple"
                          }
                          display="flex"
                          alignItems="center"
                          px={2}
                          py={1}
                        >
                          <Text mr={1}>{unitTypes[type]?.icon}</Text>
                          {unitTypes[type]?.name}: {count}
                        </Badge>
                      ))}
                    </Flex>
                  </Box>

                  <Heading size="sm" mb={3} color="text.primary">
                    Select Target Territory
                  </Heading>

                  {/* List of adjacent territories */}
                  <VStack spacing={3} align="stretch">
                    {Object.entries(territories)
                      .filter(([id, territory]) => {
                        // Filter for adjacent territories that aren't owned by the player
                        // This would need proper adjacency checking
                        if (territory.owner === "player1") return false;

                        // In a real implementation we would check adjacency properly
                        // For now just show all non-player territories
                        return true;
                      })
                      .map(([id, territory]) => {
                        const defenderUnits = getUnitsInTerritory(id);

                        return (
                          <Box
                            key={id}
                            bg="background.ui"
                            p={3}
                            borderRadius="md"
                            borderWidth="1px"
                            borderColor={
                              territory.isUnderAttack
                                ? "status.danger"
                                : "transparent"
                            }
                          >
                            <Flex justify="space-between" align="center" mb={2}>
                              <Flex align="center">
                                <Icon as={MapPin} mr={2} />
                                <Text color="text.primary">
                                  {territory.type
                                    ? territory.type.charAt(0).toUpperCase() +
                                      territory.type.slice(1)
                                    : "Unknown"}
                                  {territory.isCapital ? " (Capital)" : ""}
                                </Text>
                              </Flex>
                              <Badge
                                colorScheme={territory.owner ? "red" : "gray"}
                                px={2}
                              >
                                {territory.owner ? "Enemy" : "Neutral"}
                              </Badge>
                            </Flex>

                            {/* Defender units if known */}
                            {defenderUnits.length > 0 && (
                              <Box mt={2} mb={3}>
                                <Text
                                  fontSize="sm"
                                  color="text.secondary"
                                  mb={1}
                                >
                                  Defending forces:
                                </Text>
                                <Flex gap={2} wrap="wrap">
                                  {Object.entries(
                                    defenderUnits.reduce((counts, unit) => {
                                      counts[unit.type] =
                                        (counts[unit.type] || 0) + 1;
                                      return counts;
                                    }, {})
                                  ).map(([type, count]) => (
                                    <Badge
                                      key={type}
                                      colorScheme="red"
                                      display="flex"
                                      alignItems="center"
                                      px={2}
                                      py={1}
                                    >
                                      <Text mr={1}>
                                        {unitTypes[type]?.icon}
                                      </Text>
                                      {unitTypes[type]?.name}: {count}
                                    </Badge>
                                  ))}
                                </Flex>
                              </Box>
                            )}

                            <Flex justify="flex-end">
                              <SharedButton
                                size="sm"
                                variant="danger"
                                onClick={() => handleInitiateCombat(id)}
                                leftIcon={<Icon as={Sword} boxSize={4} />}
                              >
                                Attack
                              </SharedButton>
                            </Flex>
                          </Box>
                        );
                      })}
                  </VStack>
                </>
              )}
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default React.memo(MilitaryPanel);
