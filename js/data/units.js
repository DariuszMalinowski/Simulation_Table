// --------------------------------------------------
// UNIT LEVELS
// --------------------------------------------------

export const UNIT_LEVELS = {
  brigade: {
    id: "brigade",
    label: "Brygada",
    shortLabel: "Bryg."
  },

  regiment: {
    id: "regiment",
    label: "Pułk",
    shortLabel: "Pułk"
  },

  battalion: {
    id: "battalion",
    label: "Batalion",
    shortLabel: "Bat."
  },

  company: {
    id: "company",
    label: "Kompania",
    shortLabel: "Komp."
  },

  platoon: {
    id: "platoon",
    label: "Pluton",
    shortLabel: "Plut."
  },

  squad: {
    id: "squad",
    label: "Drużyna",
    shortLabel: "Druż."
  }
};


// --------------------------------------------------
// UNIT TYPES
// --------------------------------------------------

export const UNIT_TYPES = {
  headquarters: {
    id: "headquarters",
    label: "Dowodzenie"
  },

  command_post: {
  id: "command_post",
  label: "Stanowisko dowodzenia"
  },

  infantry: {
    id: "infantry",
    label: "Piechota"
  },

  light_infantry: {
    id: "light_infantry",
    label: "Piechota lekka"
  },

  motorized_infantry: {
    id: "motorized_infantry",
    label: "Piechota zmotoryzowana"
  },

  mechanized_infantry: {
    id: "mechanized_infantry",
    label: "Piechota zmechanizowana"
  },

  armor: {
    id: "armor",
    label: "Wojska pancerne"
  },

  airborne: {
    id: "airborne",
    label: "Wojska powietrznodesantowe"
  },

  engineers: {
    id: "engineers",
    label: "Saperzy"
  },

  mortar: {
    id: "mortar",
    label: "Moździerze"
  },

  support: {
  id: "support",
  label: "Wsparcie"
  },

  logistics: {
    id: "logistics",
    label: "Logistyka"
  },

  reconnaissance: {
    id: "reconnaissance",
    label: "Rozpoznanie"
  },

  drone: {
    id: "drone",
    label: "BSP"
  },

  military_police: {
    id: "military_police",
    label: "Żandarmeria"
  },

  police: {
    id: "police",
    label: "Policja"
  },

  special_forces: {
    id: "special_forces",
    label: "Wojska specjalne"
  }
};


// --------------------------------------------------
// FACTIONS
// --------------------------------------------------

export const UNIT_FACTIONS = {
  blue: {
    id: "blue",
    label: "Niebiescy"
  },

  red: {
    id: "red",
    label: "Czerwoni"
  }
};


// --------------------------------------------------
// UNIT STORAGE
// --------------------------------------------------

let units = [];


// --------------------------------------------------
// ID
// --------------------------------------------------

function generateUnitId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `unit-${Date.now()}-${Math.random()
    .toString(16)
    .slice(2)}`;
}


// --------------------------------------------------
// CREATE UNIT
// --------------------------------------------------

export function createUnit({
  name,
  level,
  type,
  faction = "blue",
  parentId = null
}) {
  if (!name || !name.trim()) {
    throw new Error("Jednostka musi posiadać nazwę.");
  }

  if (!UNIT_LEVELS[level]) {
    throw new Error(`Nieznany szczebel jednostki: ${level}`);
  }

  if (!UNIT_TYPES[type]) {
    throw new Error(`Nieznany typ jednostki: ${type}`);
  }

  if (!UNIT_FACTIONS[faction]) {
    throw new Error(`Nieznana strona: ${faction}`);
  }

  if (parentId && !getUnitById(parentId)) {
    throw new Error("Jednostka nadrzędna nie istnieje.");
  }

  const unit = {
    id: generateUnitId(),

    name: name.trim(),

    level,
    type,
    faction,

    parentId,

    createdAt: new Date().toISOString()
  };

  units.push(unit);

  return { ...unit };
}


// --------------------------------------------------
// GET UNITS
// --------------------------------------------------

export function getUnits() {
  return units.map(unit => ({ ...unit }));
}


export function getUnitById(unitId) {
  const unit = units.find(
    currentUnit => currentUnit.id === unitId
  );

  return unit || null;
}


// --------------------------------------------------
// CHILDREN
// --------------------------------------------------

export function getUnitChildren(parentId) {
  return units
    .filter(unit => unit.parentId === parentId)
    .map(unit => ({ ...unit }));
}


// --------------------------------------------------
// ROOT UNITS
// --------------------------------------------------

export function getRootUnits() {
  return units
    .filter(unit => unit.parentId === null)
    .map(unit => ({ ...unit }));
}


// --------------------------------------------------
// UPDATE UNIT
// --------------------------------------------------

export function updateUnit(unitId, changes = {}) {
  const unit = getUnitById(unitId);

  if (!unit) {
    return null;
  }

  const storedUnit = units.find(
    currentUnit => currentUnit.id === unitId
  );

  if (changes.name !== undefined) {
    const newName = String(changes.name).trim();

    if (!newName) {
      throw new Error(
        "Jednostka musi posiadać nazwę."
      );
    }

    storedUnit.name = newName;
  }

  if (changes.level !== undefined) {
    if (!UNIT_LEVELS[changes.level]) {
      throw new Error(
        `Nieznany szczebel jednostki: ${changes.level}`
      );
    }

    storedUnit.level = changes.level;
  }

  if (changes.type !== undefined) {
    if (!UNIT_TYPES[changes.type]) {
      throw new Error(
        `Nieznany typ jednostki: ${changes.type}`
      );
    }

    storedUnit.type = changes.type;
  }

  if (changes.faction !== undefined) {
    if (!UNIT_FACTIONS[changes.faction]) {
      throw new Error(
        `Nieznana strona: ${changes.faction}`
      );
    }

    storedUnit.faction = changes.faction;
  }

  return { ...storedUnit };
}


// --------------------------------------------------
// CHANGE PARENT
// --------------------------------------------------

export function setUnitParent(
  unitId,
  parentId = null
) {
  const unit = units.find(
    currentUnit => currentUnit.id === unitId
  );

  if (!unit) {
    return false;
  }

  if (parentId === unitId) {
    throw new Error(
      "Jednostka nie może być własnym przełożonym."
    );
  }

  if (
    parentId !== null &&
    !getUnitById(parentId)
  ) {
    throw new Error(
      "Jednostka nadrzędna nie istnieje."
    );
  }

  unit.parentId = parentId;

  return true;
}


// --------------------------------------------------
// DELETE UNIT
// --------------------------------------------------

export function deleteUnit(unitId) {
  const exists = units.some(
    unit => unit.id === unitId
  );

  if (!exists) {
    return false;
  }

  /*
   * Na tym etapie usuwamy również wszystkie
   * jednostki podległe.
   */

  const idsToDelete = new Set([unitId]);

  let foundChildren = true;

  while (foundChildren) {
    foundChildren = false;

    for (const unit of units) {
      if (
        unit.parentId &&
        idsToDelete.has(unit.parentId) &&
        !idsToDelete.has(unit.id)
      ) {
        idsToDelete.add(unit.id);
        foundChildren = true;
      }
    }
  }

  units = units.filter(
    unit => !idsToDelete.has(unit.id)
  );

  return true;
}


// --------------------------------------------------
// CLEAR
// --------------------------------------------------

export function clearUnits() {
  units = [];
}


// --------------------------------------------------
// IMPORT / LOAD
// --------------------------------------------------

export function setUnits(newUnits) {
  if (!Array.isArray(newUnits)) {
    throw new Error(
      "Nieprawidłowa lista jednostek."
    );
  }

  units = newUnits.map(unit => ({
    ...unit
  }));
}