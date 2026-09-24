import {
  getUnits,
  UNIT_LEVELS,
  UNIT_TYPES
} from "../data/units.js";


// --------------------------------------------------
// STATE
// --------------------------------------------------

let selectedUnitId = null;


// --------------------------------------------------
// HELPERS
// --------------------------------------------------

function getChildren(units, parentId) {
  return units.filter(
    unit => unit.parentId === parentId
  );
}


function getLevelLabel(unit) {
  return (
    UNIT_LEVELS[unit.level]?.shortLabel ||
    UNIT_LEVELS[unit.level]?.label ||
    unit.level
  );
}


function getTypeLabel(unit) {
  return (
    UNIT_TYPES[unit.type]?.label ||
    unit.type
  );
}


// --------------------------------------------------
// EMPTY STATE
// --------------------------------------------------

function createEmptyState() {
  const empty = document.createElement("div");

  empty.className = "structure-empty";

  empty.innerHTML = `
    <div class="structure-empty__icon">+</div>

    <strong class="structure-empty__title">
      Brak jednostek
    </strong>

    <span class="structure-empty__text">
      Utwórz pierwszą jednostkę, aby rozpocząć planowanie.
    </span>
  `;

  return empty;
}


// --------------------------------------------------
// UNIT ROW
// --------------------------------------------------

function createUnitRow(unit, hasChildren) {
  const row = document.createElement("button");

  row.type = "button";
  row.className = "structure-unit";

  row.dataset.unitId = unit.id;


  if (unit.id === selectedUnitId) {
    row.classList.add("structure-unit--selected");
  }


  // ----------------------------------------------
  // EXPAND INDICATOR
  // ----------------------------------------------

  const expand = document.createElement("span");

  expand.className = "structure-unit__expand";

  expand.textContent =
    hasChildren ? "▾" : "";


  // ----------------------------------------------
  // PLACEHOLDER FOR SVG
  // ----------------------------------------------

  const symbol = document.createElement("span");

  symbol.className = "structure-unit__symbol";

  /*
   * Na razie używamy prostego znacznika.
   * W następnym etapie tutaj podepniemy
   * właściwy symbol SVG jednostki.
   */

  symbol.textContent = "□";


  // ----------------------------------------------
  // INFO
  // ----------------------------------------------

  const info = document.createElement("span");

  info.className = "structure-unit__info";


  const name = document.createElement("span");

  name.className = "structure-unit__name";
  name.textContent = unit.name;


  const meta = document.createElement("span");

  meta.className = "structure-unit__meta";

  meta.textContent =
    `${getLevelLabel(unit)} · ${getTypeLabel(unit)}`;


  info.appendChild(name);
  info.appendChild(meta);


  // ----------------------------------------------
  // ROW
  // ----------------------------------------------

  row.appendChild(expand);
  row.appendChild(symbol);
  row.appendChild(info);


  // ----------------------------------------------
  // SELECT
  // ----------------------------------------------

  row.addEventListener("click", () => {
    selectedUnitId = unit.id;

    renderStructureTree();

    document.dispatchEvent(
      new CustomEvent("structure:unit-selected", {
        detail: {
          unitId: unit.id
        }
      })
    );
  });


  return row;
}


// --------------------------------------------------
// BRANCH
// --------------------------------------------------

function createBranch(
  unit,
  units,
  depth = 0
) {
  const item = document.createElement("div");

  item.className = "structure-node";

  item.dataset.unitId = unit.id;
  item.dataset.depth = String(depth);


  const children =
    getChildren(units, unit.id);


  const row =
    createUnitRow(
      unit,
      children.length > 0
    );


  /*
   * Wcięcie zależy od miejsca jednostki
   * w strukturze, a nie od jej szczebla.
   */

  row.style.setProperty(
    "--structure-depth",
    depth
  );


  item.appendChild(row);


  if (children.length > 0) {
    const childrenContainer =
      document.createElement("div");

    childrenContainer.className =
      "structure-node__children";


    children.forEach(child => {
      childrenContainer.appendChild(
        createBranch(
          child,
          units,
          depth + 1
        )
      );
    });


    item.appendChild(childrenContainer);
  }


  return item;
}


// --------------------------------------------------
// RENDER
// --------------------------------------------------

export function renderStructureTree() {
  const container =
    document.getElementById("structureTree");

  if (!container) {
    return;
  }


  const units = getUnits();

  container.replaceChildren();


  if (units.length === 0) {
    container.appendChild(
      createEmptyState()
    );

    return;
  }


  /*
   * Jednostki bez przełożonego są korzeniami
   * poszczególnych struktur.
   */

  const rootUnits =
    units.filter(
      unit => unit.parentId === null
    );


  rootUnits.forEach(unit => {
    container.appendChild(
      createBranch(
        unit,
        units,
        0
      )
    );
  });
}


// --------------------------------------------------
// SELECTED UNIT
// --------------------------------------------------

export function getSelectedUnitId() {
  return selectedUnitId;
}


export function clearSelectedUnit() {
  selectedUnitId = null;

  renderStructureTree();
}