/**
 * Wall sensors from wall-sensors.xlsx (74 sensors).
 * Naming: First letter = direction (E/S/W/N), digit = floor (0=Basement, 1=1st, 2=2nd, 3=Roof), TH = through wall.
 * Legend format: "East Basement", "South 1 1st Floor", "North 1 2nd Floor", etc.
 */

export const WALL_SENSORS = [
  "E0FTHC034", "E0FTHC035", "E0FTHC036", "N0FTHC037", "N0FTHC038", "N0FTHC039",
  "N1FTH040", "N1FTH041", "N1FTH042", "N1FTH043", "N0FTH044", "N0FTH045", "N0FTH046", "N0FTH047",
  "S1FTH048", "S1FTH049", "S1FTH050", "S1FTH051", "S0FTH052", "S0FTH053", "S0FTH054", "S0FTH055",
  "N1ETH056", "N1ETH057", "N1ETH058", "N1ETH059", "N1ETH060", "S1ETH061", "S1ETH062", "S1ETH063", "S1ETH064", "S1ETH065",
  "E1ETH066", "E1ETH067", "E1ETH068", "E1ETH069", "E1ETH070", "W1ETH071", "W1ETH072", "W1ETH073", "W1ETH074", "W1ETH075",
  "N3ERTH076", "N3ERTH077", "N3ERTH078", "N3ERTH079", "N3ERTH080", "N3ERTH081",
  "S3ERTH082", "S3ERTH083", "S3ERTH084", "S3ERTH085", "S3ERTH086", "S3ERTH087",
  "S1FTHC003", "S1FTHC004", "S1FTHC005", "S1FTHC006", "S1FTHC007",
  "S0FTHC008", "S0FTHC009", "S0FTHC010", "S0FTHC011", "S0FTHC012",
  "W1FTHC013", "W1FTHC014", "W1FTHC015", "W1FTHC016", "W1FTHC017",
  "W0FTHC018", "W0FTHC019", "W0FTHC020", "W0FTHC021", "W0FTHC022",
];

const FLOOR_CHAR_TO_LABEL = {
  "0": "Basement",
  "1": "1st Floor",
  "2": "2nd Floor",
  "3": "Roof",
};

const DIR_CHAR_TO_LABEL = {
  E: "East",
  N: "North",
  S: "South",
  W: "West",
};

/** Floor label for each sensor (Basement, 1st Floor, 2nd Floor, Roof). */
export function getFloorForSensor(code) {
  if (!code || code.length < 2) return null;
  return FLOOR_CHAR_TO_LABEL[code[1]] ?? null;
}

/** Direction for each sensor (East, North, South, West). */
export function getOrientationForSensor(code) {
  if (!code || code.length < 1) return null;
  return DIR_CHAR_TO_LABEL[code[0]] ?? null;
}

/** Build FLOOR_SENSOR_MAP: { "Basement": [...], "1st Floor": [...], ... } */
export function getFloorSensorMap() {
  const map = { Basement: [], "1st Floor": [], "2nd Floor": [], Roof: [] };
  for (const code of WALL_SENSORS) {
    const floor = getFloorForSensor(code);
    if (floor && map[floor]) map[floor].push(code);
  }
  return map;
}

/** Orientation (East/North/South/West) per sensor code. */
export function getSensorOrientationMap() {
  const map = {};
  for (const code of WALL_SENSORS) {
    map[code] = getOrientationForSensor(code);
  }
  return map;
}

export const FLOOR_OPTIONS = ["Basement", "1st Floor", "2nd Floor", "Roof"];
export const ORIENTATION_OPTIONS = ["North", "South", "East", "West"];

export const FLOOR_SENSOR_MAP = getFloorSensorMap();
export const SENSOR_ORIENTATION = getSensorOrientationMap();
