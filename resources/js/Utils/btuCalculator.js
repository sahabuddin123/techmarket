/**
 * BTU Calculator Service Utility for Residential Air Conditioners.
 * Calibrated for South Asian / Bangladesh tropical climate conditions.
 */
export function calculateBtu({
  roomSize = '0-90 Square Feet',
  wallType = 'Facebrick',
  sunlightWalls = 'None',
  roomPosition = 'Other Floor',
  doors = 'One',
  windows = '1',
  people = '2',
}) {
  // 1. Base BTU from room size
  const sizeMap = {
    '0-90 Square Feet': 9000,
    '91-120 Square Feet': 12000,
    '121-150 Square Feet': 14000,
    '151-180 Square Feet': 18000,
    '181-220 Square Feet': 20000,
    '221-260 Square Feet': 24000,
    '261-300 Square Feet': 28000,
    '301-350 Square Feet': 32000,
    '351-400 Square Feet': 36000,
    '401-500 Square Feet': 42000,
    '500+ Square Feet': 48000,
  };

  let btu = sizeMap[roomSize] || 12000;

  // 2. Wall type modifier
  const wallMultipliers = {
    'Facebrick': 1.0,
    'Cavity Brick': 0.95,
    'Concrete Block': 1.15,
    'Weatherboard / Timber': 1.1,
    'Glass / Curtain Wall': 1.3,
    'Insulated Wall': 0.85,
  };
  btu *= (wallMultipliers[wallType] || 1.0);

  // 3. Sunlight exposed walls
  const sunMap = {
    'None': 0,
    '1': 1000,
    '2': 2200,
    '3': 3500,
    '4': 5000,
  };
  btu += (sunMap[sunlightWalls] || 0);

  // 4. Room Position (Top Floor adds 18% roof heat)
  if (roomPosition === 'Top Floor') {
    btu *= 1.18;
  }

  // 5. Doors modifier
  if (doors === 'Two') {
    btu += 1000;
  }

  // 6. Windows modifier
  const windowCount = parseInt(windows, 10) || 1;
  btu += (windowCount - 1) * 750;

  // 7. Occupants modifier (600 BTU per person above 2)
  const peopleCount = parseInt(people, 10) || 2;
  if (peopleCount > 2) {
    btu += (peopleCount - 2) * 600;
  }

  const roundedBtu = Math.round(btu / 500) * 500;

  // Recommended AC Ton capacity
  let ton = '1.0 Ton';
  if (roundedBtu <= 10000) ton = '0.75 - 1.0 Ton';
  else if (roundedBtu <= 13500) ton = '1.0 Ton (12,000 BTU)';
  else if (roundedBtu <= 16500) ton = '1.25 - 1.5 Ton';
  else if (roundedBtu <= 20000) ton = '1.5 Ton (18,000 BTU)';
  else if (roundedBtu <= 26000) ton = '2.0 Ton (24,000 BTU)';
  else if (roundedBtu <= 32000) ton = '2.5 Ton (30,000 BTU)';
  else ton = '3.0 Ton or Dual Units (36,000+ BTU)';

  return {
    rawBtu: Math.round(btu),
    recommendedBtu: roundedBtu,
    recommendedTon: ton,
    inverterRecommended: true,
    estimatedPowerWatt: Math.round((roundedBtu / 3.412) * 0.35),
  };
}
