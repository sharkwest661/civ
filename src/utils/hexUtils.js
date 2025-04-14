/**
 * Hex Grid Utility Functions
 *
 * This module provides calculations for a hexagonal grid system using axial coordinates
 * For more information: https://www.redblobgames.com/grids/hexagons/
 */

// Hex size configuration
const DEFAULT_HEX_SIZE = 40; // Base size of each hexagon

/**
 * Convert from axial coordinates (q, r) to pixel coordinates (x, y)
 *
 * @param {number} q - The q coordinate in axial system (column-like)
 * @param {number} r - The r coordinate in axial system (row-like)
 * @param {number} size - The size of the hex (distance from center to corner)
 * @returns {Object} The x, y coordinates for the center of the hex
 */
export function axialToPixel(q, r, size = DEFAULT_HEX_SIZE) {
  const x = size * ((3 / 2) * q);
  const y = size * ((Math.sqrt(3) / 2) * q + Math.sqrt(3) * r);
  return { x, y };
}

/**
 * Convert from pixel coordinates (x, y) to axial coordinates (q, r)
 *
 * @param {number} x - The x coordinate in pixels
 * @param {number} y - The y coordinate in pixels
 * @param {number} size - The size of the hex (distance from center to corner)
 * @returns {Object} The q, r coordinates in the axial system
 */
export function pixelToAxial(x, y, size = DEFAULT_HEX_SIZE) {
  const q = (x * 2) / 3 / size;
  const r = (-x / 3 + (Math.sqrt(3) / 3) * y) / size;

  // Round to nearest hex
  return cubeToAxial(cubeRound(axialToCube({ q, r })));
}

/**
 * Convert from axial coordinates (q, r) to cube coordinates (x, y, z)
 *
 * @param {Object} hex - The hex in axial coordinates {q, r}
 * @returns {Object} The hex in cube coordinates {x, y, z}
 */
export function axialToCube(hex) {
  const x = hex.q;
  const z = hex.r;
  const y = -x - z;
  return { x, y, z };
}

/**
 * Convert from cube coordinates (x, y, z) to axial coordinates (q, r)
 *
 * @param {Object} cube - The hex in cube coordinates {x, y, z}
 * @returns {Object} The hex in axial coordinates {q, r}
 */
export function cubeToAxial(cube) {
  const q = cube.x;
  const r = cube.z;
  return { q, r };
}

/**
 * Round floating point cube coordinates to the nearest hex
 *
 * @param {Object} cube - The cube coordinates {x, y, z} (possibly fractional)
 * @returns {Object} The nearest hex in cube coordinates {x, y, z}
 */
export function cubeRound(cube) {
  let rx = Math.round(cube.x);
  let ry = Math.round(cube.y);
  let rz = Math.round(cube.z);

  const xDiff = Math.abs(rx - cube.x);
  const yDiff = Math.abs(ry - cube.y);
  const zDiff = Math.abs(rz - cube.z);

  if (xDiff > yDiff && xDiff > zDiff) {
    rx = -ry - rz;
  } else if (yDiff > zDiff) {
    ry = -rx - rz;
  } else {
    rz = -rx - ry;
  }

  return { x: rx, y: ry, z: rz };
}

/**
 * Calculate the vertices of a hexagon at given axial coordinates
 *
 * @param {number} q - The q coordinate in axial system
 * @param {number} r - The r coordinate in axial system
 * @param {number} size - The size of the hex (distance from center to corner)
 * @returns {Array} Array of points as [x, y] arrays for the hexagon vertices
 */
export function calculateHexPoints(q, r, size = DEFAULT_HEX_SIZE) {
  const { x, y } = axialToPixel(q, r, size);

  // Calculate the six corners of the hexagon
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle = ((2 * Math.PI) / 6) * i;
    const hx = x + size * Math.cos(angle);
    const hy = y + size * Math.sin(angle);
    points.push([hx, hy]);
  }

  return points;
}

/**
 * Generate a hex grid with the given radius (distance from center)
 *
 * @param {number} radius - How many hexes from the center (0,0)
 * @returns {Array} Array of hex objects with axial coordinates {q, r}
 */
export function generateHexGrid(radius) {
  const hexes = [];

  for (let q = -radius; q <= radius; q++) {
    const r1 = Math.max(-radius, -q - radius);
    const r2 = Math.min(radius, -q + radius);

    for (let r = r1; r <= r2; r++) {
      hexes.push({ q, r });
    }
  }

  return hexes;
}

/**
 * Get all neighboring hexes for a given hex
 *
 * @param {Object} hex - The hex in axial coordinates {q, r}
 * @returns {Array} Array of neighboring hex objects with axial coordinates {q, r}
 */
export function getNeighbors(hex) {
  const directions = [
    { q: 1, r: 0 },
    { q: 1, r: -1 },
    { q: 0, r: -1 },
    { q: -1, r: 0 },
    { q: -1, r: 1 },
    { q: 0, r: 1 },
  ];

  return directions.map((dir) => ({
    q: hex.q + dir.q,
    r: hex.r + dir.r,
  }));
}

/**
 * Calculate the distance between two hexes in axial coordinates
 *
 * @param {Object} hexA - First hex in axial coordinates {q, r}
 * @param {Object} hexB - Second hex in axial coordinates {q, r}
 * @returns {number} The distance in hex steps
 */
export function hexDistance(hexA, hexB) {
  const cubeA = axialToCube(hexA);
  const cubeB = axialToCube(hexB);

  return Math.max(
    Math.abs(cubeA.x - cubeB.x),
    Math.abs(cubeA.y - cubeB.y),
    Math.abs(cubeA.z - cubeB.z)
  );
}

/**
 * Format hex coordinates as a unique string identifier
 *
 * @param {Object} hex - The hex in axial coordinates {q, r}
 * @returns {string} String in the format "q,r"
 */
export function hexToId(hex) {
  return `${hex.q},${hex.r}`;
}

/**
 * Parse a hex ID string back to axial coordinates
 *
 * @param {string} id - The hex ID in the format "q,r"
 * @returns {Object} The hex in axial coordinates {q, r}
 */
export function idToHex(id) {
  const [q, r] = id.split(",").map(Number);
  return { q, r };
}

/**
 * Convert hex points to an SVG polygon points string
 *
 * @param {Array} points - Array of points as [x, y] arrays
 * @returns {string} SVG points attribute value
 */
export function pointsToSvgString(points) {
  return points.map(([x, y]) => `${x},${y}`).join(" ");
}

/**
 * Calculate the bounding box for a collection of hexes
 *
 * @param {Array} hexes - Array of hex objects with axial coordinates {q, r}
 * @param {number} size - The size of the hex (distance from center to corner)
 * @returns {Object} Bounding box {minX, minY, maxX, maxY, width, height}
 */
export function calculateBoundingBox(hexes, size = DEFAULT_HEX_SIZE) {
  if (!hexes || hexes.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  hexes.forEach((hex) => {
    const points = calculateHexPoints(hex.q, hex.r, size);

    points.forEach(([x, y]) => {
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    });
  });

  const width = maxX - minX;
  const height = maxY - minY;

  return { minX, minY, maxX, maxY, width, height };
}
