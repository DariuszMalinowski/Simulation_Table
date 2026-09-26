// ==================================================
// STAFF TYPES
// ==================================================

export const STAFF_TYPES = {
  command: {
    id: "command",
    label: "Dowództwo",
    defaultAbbreviation: "D"
  },

  staff: {
    id: "staff",
    label: "Sztab",
    defaultAbbreviation: "SZ"
  },

  division: {
    id: "division",
    label: "Pion",
    defaultAbbreviation: "P"
  },

  section: {
    id: "section",
    label: "Sekcja",
    defaultAbbreviation: "S"
  },

  personnel: {
    id: "personnel",
    label: "Personel",
    defaultAbbreviation: "p"
  }
};


// ==================================================
// STATE
// ==================================================

let staffItems = [];


// ==================================================
// ID
// ==================================================

function createStaffId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }


  return (
    "staff-" +
    Date.now() +
    "-" +
    Math.random()
      .toString(36)
      .slice(2, 10)
  );
}


// ==================================================
// GET STAFF
// ==================================================

export function getStaffItems() {
  return staffItems;
}


export function getStaffItemById(
  staffItemId
) {
  return (
    staffItems.find(
      item =>
        item.id === staffItemId
    ) || null
  );
}


// ==================================================
// CHILDREN
// ==================================================

export function getStaffChildren(
  parentId
) {
  return staffItems.filter(
    item =>
      item.parentId === parentId
  );
}


// ==================================================
// DESCENDANTS
// ==================================================

export function getStaffDescendantIds(
  staffItemId
) {
  const descendantIds =
    new Set();

  const queue = [
    staffItemId
  ];


  while (
    queue.length > 0
  ) {
    const currentId =
      queue.shift();


    const children =
      staffItems.filter(
        item =>
          item.parentId === currentId
      );


    children.forEach(
      child => {
        if (
          descendantIds.has(
            child.id
          )
        ) {
          return;
        }


        descendantIds.add(
          child.id
        );

        queue.push(
          child.id
        );
      }
    );
  }


  return descendantIds;
}


// ==================================================
// VALIDATION
// ==================================================

function validateStaffType(type) {
  if (!STAFF_TYPES[type]) {
    throw new Error(
      `Nieznany typ elementu sztabu: ${type}`
    );
  }
}


function validateStaffName(name) {
  if (
    typeof name !== "string" ||
    !name.trim()
  ) {
    throw new Error(
      "Nazwa elementu sztabu jest wymagana."
    );
  }
}

function normalizeAbbreviation(
  abbreviation,
  type
) {
  const defaultAbbreviation =
    STAFF_TYPES[type]
      ?.defaultAbbreviation ||
    "";

  const value =
    typeof abbreviation === "string"
      ? abbreviation.trim()
      : "";

  return (
    value ||
    defaultAbbreviation
  )
    .slice(0, 5);
}


// ==================================================
// CREATE STAFF ITEM
// ==================================================

export function createStaffItem({
  name,
  type,
  abbreviation = "",
  parentId = null
}) {
  validateStaffName(name);

  validateStaffType(type);


  if (
    parentId !== null &&
    !getStaffItemById(parentId)
  ) {
    throw new Error(
      "Element nadrzędny sztabu nie istnieje."
    );
  }


  const staffItem = {
    id:
      createStaffId(),

    name:
      name.trim(),

    type,

    abbreviation:
      normalizeAbbreviation(
        abbreviation,
        type
      ),

    parentId
  };


  staffItems.push(
    staffItem
  );


  return staffItem;
}


// ==================================================
// SET PARENT
// ==================================================

export function setStaffParent(
  staffItemId,
  parentId = null
) {
  const staffItem =
    getStaffItemById(
      staffItemId
    );


  if (!staffItem) {
    return false;
  }


  // Element nie może być własnym przełożonym.

  if (
    parentId === staffItemId
  ) {
    throw new Error(
      "Element sztabu nie może być własnym przełożonym."
    );
  }


  // Nowy przełożony musi istnieć.

  if (
    parentId !== null &&
    !getStaffItemById(parentId)
  ) {
    throw new Error(
      "Element nadrzędny sztabu nie istnieje."
    );
  }


  /*
   * Nie możemy przenieść elementu
   * pod jego własnego potomka.
   *
   * Zapobiega to utworzeniu pętli:
   *
   * A
   * └── B
   *     └── A
   */

  if (
    parentId !== null
  ) {
    const descendantIds =
      getStaffDescendantIds(
        staffItemId
      );


    if (
      descendantIds.has(
        parentId
      )
    ) {
      throw new Error(
        "Element podległy nie może zostać przełożonym swojego elementu nadrzędnego."
      );
    }
  }


  staffItem.parentId =
    parentId;


  return true;
}


// ==================================================
// UPDATE STAFF ITEM
// ==================================================

export function updateStaffItem(
  staffItemId,
  changes = {}
) {
  const staffItem =
    getStaffItemById(
      staffItemId
    );


  if (!staffItem) {
    return null;
  }


  if (
    changes.name !== undefined
  ) {
    validateStaffName(
      changes.name
    );

    staffItem.name =
      changes.name.trim();
  }


  if (
    changes.type !== undefined
  ) {
    validateStaffType(
      changes.type
    );

    staffItem.type =
      changes.type;
  }

  if (
    changes.abbreviation !== undefined
  ) {
    staffItem.abbreviation =
      normalizeAbbreviation(
        changes.abbreviation,
        staffItem.type
      );
  }

  if (
    changes.parentId !== undefined
  ) {
    setStaffParent(
      staffItemId,
      changes.parentId
    );
  }


  return staffItem;
}


// ==================================================
// DELETE STAFF ITEM
// ==================================================

export function deleteStaffItem(
  staffItemId
) {
  const staffItem =
    getStaffItemById(
      staffItemId
    );


  if (!staffItem) {
    return false;
  }


  const descendantIds =
    getStaffDescendantIds(
      staffItemId
    );


  descendantIds.add(
    staffItemId
  );


  staffItems =
    staffItems.filter(
      item =>
        !descendantIds.has(
          item.id
        )
    );


  return true;
}


// ==================================================
// SET STAFF
// ==================================================

export function setStaffItems(
  newStaffItems
) {
  if (
    !Array.isArray(
      newStaffItems
    )
  ) {
    throw new Error(
      "Struktura sztabu musi być tablicą."
    );
  }


  staffItems =
    newStaffItems.map(
      item => ({
        ...item
      })
    );
}


// ==================================================
// CLEAR STAFF
// ==================================================

export function clearStaffItems() {
  staffItems = [];
}