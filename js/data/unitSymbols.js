// ==================================================
// UNIT SYMBOLS
// ==================================================

const UNIT_SYMBOLS = {
  blue: {
    airborne: "blue_airborne.svg",
    armor: "blue_armor.svg",
    drone: "blue_drone.svg",
    engineers: "blue_engineers.svg",
    headquarters: "blue_headquarters.svg",
    infantry: "blue_light_infantry.svg",
    light_infantry: "blue_light_infantry.svg",
    logistics: "blue_logistics.svg",
    mechanized_infantry: "blue_mechanized_infantry.svg",
    military_police: "blue_military_police.svg",
    mortar: "blue_mortar.svg",
    motorized_infantry: "blue_motorized_infantry.svg",
    police: "blue_police.svg",
    special_forces: "blue_special_forces.svg"
  },

  red: {
    airborne: "red_airborne.svg",
    armor: "red_armor.svg",
    drone: "red_drone.svg",
    engineers: "red_engineers.svg",
    headquarters: "red_headquarters.svg",
    infantry: "red_infantry.svg",
    light_infantry: "red_infantry.svg",
    logistics: "red_logistics.svg",
    mechanized_infantry: "red_mechanized_infantry.svg",
    mortar: "red_mortar.svg",
    motorized_infantry: "red_motorized_infantry.svg",
    special_forces: "red_special_forces.svg"
  }
};


// ==================================================
// GET UNIT SYMBOL PATH
// ==================================================

export function getUnitSymbolPath(unit) {
  if (!unit) {
    return null;
  }

  const factionSymbols =
    UNIT_SYMBOLS[unit.faction];

  if (!factionSymbols) {
    return null;
  }

  const fileName =
    factionSymbols[unit.type];

  if (!fileName) {
    return null;
  }

  return `/assets/units/${fileName}`;
}