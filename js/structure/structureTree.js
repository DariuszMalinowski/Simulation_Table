import {
  getUnits,
  UNIT_LEVELS,
  UNIT_TYPES,
  getUnitDescendantIds,
  deleteUnit
} from "../data/units.js";

import {
  getUnitSymbolPath
} from "../data/unitSymbols.js";

import {
  openStructureEditor
} from "./structureEditor.js";


// --------------------------------------------------
// STATE
// --------------------------------------------------

let selectedUnitId = null;

const collapsedUnitIds =
  new Set();

// --------------------------------------------------
// UNIT MENU
// --------------------------------------------------

function closeUnitMenus() {
  document
    .querySelectorAll(
      ".structure-unit__menu--open"
    )
    .forEach(menu => {
      menu.classList.remove(
        "structure-unit__menu--open"
      );
    });
}

// --------------------------------------------------
// HELPERS
// --------------------------------------------------

function getChildren(
  units,
  parentId
) {
  return units.filter(
    unit =>
      unit.parentId === parentId
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
// SELECT UNIT
// --------------------------------------------------

function selectUnit(unit) {
  selectedUnitId =
    unit.id;

  renderStructureTree();


  document.dispatchEvent(
    new CustomEvent(
      "structure:unit-selected",
      {
        detail: {
          unitId: unit.id
        }
      }
    )
  );
}


// --------------------------------------------------
// EMPTY STATE
// --------------------------------------------------

function createEmptyState() {
  const empty =
    document.createElement("div");

  empty.className =
    "structure-empty";

  empty.innerHTML = `
    <div class="structure-empty__icon">
      +
    </div>

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
// UNIT SYMBOL
// --------------------------------------------------

function createUnitSymbol(unit) {
  const symbol =
    document.createElement("span");

  symbol.className =
    "structure-unit__symbol";


  const symbolPath =
    getUnitSymbolPath(unit);


  if (symbolPath) {
    const image =
      document.createElement("img");

    image.src =
      symbolPath;

    image.alt = "";

    image.className =
      "structure-unit__symbol-image";

    symbol.appendChild(
      image
    );
  } else {
    symbol.textContent =
      "□";
  }


  return symbol;
}


// --------------------------------------------------
// EXPAND INDICATOR
// --------------------------------------------------

function createExpandIndicator(
  unit,
  hasChildren
) {
  const expand =
    document.createElement("button");

  expand.type =
    "button";

  expand.className =
    "structure-unit__expand";


  if (!hasChildren) {
    expand.disabled = true;

    expand.setAttribute(
      "aria-hidden",
      "true"
    );

    return expand;
  }


  const isCollapsed =
    collapsedUnitIds.has(
      unit.id
    );


  expand.textContent =
    isCollapsed
      ? "▸"
      : "▾";


  expand.classList.add(
    "structure-unit__expand--active"
  );


  expand.title =
    isCollapsed
      ? "Rozwiń jednostki podległe"
      : "Zwiń jednostki podległe";


  expand.setAttribute(
    "aria-label",
    expand.title
  );


  expand.setAttribute(
    "aria-expanded",
    String(!isCollapsed)
  );


  expand.addEventListener(
    "click",
    event => {
      event.stopPropagation();


      if (
        collapsedUnitIds.has(
          unit.id
        )
      ) {
        collapsedUnitIds.delete(
          unit.id
        );
      } else {
        collapsedUnitIds.add(
          unit.id
        );
      }


      renderStructureTree();
    }
  );


  return expand;
}


// --------------------------------------------------
// UNIT ACTIONS
// --------------------------------------------------

function createUnitActions(unit) {
  const actions =
    document.createElement("div");

  actions.className =
    "structure-unit__actions";


  // ------------------------------------------------
  // MENU BUTTON
  // ------------------------------------------------

  const menuButton =
    document.createElement("button");

  menuButton.type =
    "button";

  menuButton.className =
    "structure-unit__menu-button";

  menuButton.textContent =
    "⋯";

  menuButton.title =
    "Opcje jednostki";

  menuButton.setAttribute(
    "aria-label",
    `Opcje jednostki ${unit.name}`
  );


  // ------------------------------------------------
  // MENU
  // ------------------------------------------------

  const menu =
    document.createElement("div");

  menu.className =
    "structure-unit__menu";


  // ------------------------------------------------
  // ADD CHILD
  // ------------------------------------------------

  const addChildButton =
    document.createElement("button");

  addChildButton.type =
    "button";

  addChildButton.className =
    "structure-unit__menu-item";

  addChildButton.textContent =
    "+ Dodaj podległą";


  // ------------------------------------------------
  // EDIT
  // ------------------------------------------------

  const editButton =
    document.createElement("button");

  editButton.type =
    "button";

  editButton.className =
    "structure-unit__menu-item";

  editButton.textContent =
    "Edytuj";

// ------------------------------------------------
// DELETE
// ------------------------------------------------

  const deleteButton =
    document.createElement("button");

  deleteButton.type =
    "button";

  deleteButton.className =
    "structure-unit__menu-item structure-unit__menu-item--danger";

  deleteButton.textContent =
    "Usuń";

  // ------------------------------------------------
  // MENU STRUCTURE
  // ------------------------------------------------

  menu.appendChild(
    addChildButton
  );

  menu.appendChild(
    editButton
  );

  menu.appendChild(
    deleteButton
  );


  // ------------------------------------------------
  // OPEN / CLOSE MENU
  // ------------------------------------------------

  menuButton.addEventListener(
    "click",
    event => {
      event.stopPropagation();


      const wasOpen =
        menu.classList.contains(
          "structure-unit__menu--open"
        );


      /*
      * Najpierw zamykamy wszystkie
      * otwarte menu jednostek.
      */

      closeUnitMenus();


      /*
      * Jeżeli kliknięte menu wcześniej
      * było zamknięte, otwieramy je.
      *
      * Jeżeli było otwarte, pozostaje
      * zamknięte.
      */

      if (!wasOpen) {
        menu.classList.add(
          "structure-unit__menu--open"
        );
      }
    }
  );


  // ------------------------------------------------
  // ADD CHILD ACTION
  // ------------------------------------------------

  addChildButton.addEventListener(
    "click",
    event => {
      event.stopPropagation();


      openStructureEditor({
        parentId: unit.id,

        onSave: () => {
          /*
           * Jeżeli gałąź była zwinięta,
           * po dodaniu jednostki rozwijamy ją,
           * aby użytkownik od razu zobaczył
           * nowo utworzoną jednostkę.
           */

          collapsedUnitIds.delete(
            unit.id
          );

          renderStructureTree();
        }
      });
    }
  );


  // ------------------------------------------------
  // EDIT ACTION
  // ------------------------------------------------

  editButton.addEventListener(
    "click",
    event => {
      event.stopPropagation();


      openStructureEditor({
        unitId: unit.id,

        onSave: updatedUnit => {
          /*
           * Jeżeli podczas edycji zmieniono
           * przełożonego jednostki, rozwijamy
           * nową gałąź nadrzędną.
           */

          if (
            updatedUnit?.parentId
          ) {
            collapsedUnitIds.delete(
              updatedUnit.parentId
            );
          }


          renderStructureTree();
        }
      });
    }
  );

  // ------------------------------------------------
  // DELETE ACTION
  // ------------------------------------------------

  deleteButton.addEventListener(
    "click",
    event => {
      event.stopPropagation();


      const descendantIds =
        getUnitDescendantIds(
          unit.id
        );

      const descendantCount =
        descendantIds.size;


      /*
      * Inny komunikat pokazujemy dla
      * pojedynczej jednostki, a inny
      * dla całej gałęzi struktury.
      */

      let message;


      if (descendantCount === 0) {
        message =
          `Czy na pewno chcesz usunąć jednostkę:\n\n${unit.name}?`;
      } else {
        message =
          `Czy na pewno chcesz usunąć jednostkę:\n\n` +
          `${unit.name}\n\n` +
          `Razem z nią zostaną usunięte wszystkie jednostki podległe (${descendantCount}).\n\n` +
          `Tej operacji nie można cofnąć.`;
      }


      const confirmed =
        window.confirm(
          message
        );


      if (!confirmed) {
        return;
      }


      /*
      * Usuwamy ID usuwanych elementów również
      * ze stanu zwiniętych gałęzi.
      */

      descendantIds.forEach(
        descendantId => {
          collapsedUnitIds.delete(
            descendantId
          );
        }
      );


      collapsedUnitIds.delete(
        unit.id
      );


      const deleted =
        deleteUnit(
          unit.id
        );


      if (!deleted) {
        alert(
          "Nie udało się usunąć jednostki."
        );

        return;
      }


      /*
      * Usuwana jednostka była zaznaczona,
      * więc czyścimy zaznaczenie.
      */

      if (
        selectedUnitId === unit.id
      ) {
        selectedUnitId =
          null;
      }


      renderStructureTree();


      /*
      * Informujemy przyszłe elementy aplikacji,
      * że struktura została zmieniona.
      *
      * Przyda się później m.in. harmonogramowi.
      */

      document.dispatchEvent(
        new CustomEvent(
          "structure:unit-deleted",
          {
            detail: {
              unitId:
                unit.id,

              descendantIds:
                [
                  ...descendantIds
                ]
            }
          }
        )
      );
    }
  );

  // ------------------------------------------------
  // ACTIONS STRUCTURE
  // ------------------------------------------------

  actions.appendChild(
    menuButton
  );

  actions.appendChild(
    menu
  );


  return actions;
}


// --------------------------------------------------
// UNIT ROW
// --------------------------------------------------

function createUnitRow(
  unit,
  hasChildren
) {
  /*
   * Wiersz nie jest już <button>.
   *
   * Dzięki temu możemy bezpiecznie umieścić
   * w nim osobne przyciski:
   *
   * - rozwijanie struktury,
   * - menu jednostki.
   */
  const row =
    document.createElement("div");

  row.className =
    "structure-unit";

  row.dataset.unitId =
    unit.id;


  const isSelected =
    unit.id === selectedUnitId;


  if (isSelected) {
    row.classList.add(
      "structure-unit--selected"
    );
  }


  // ----------------------------------------------
  // EXPAND
  // ----------------------------------------------

  const expand =
    createExpandIndicator(
      unit,
      hasChildren
    );


  // ----------------------------------------------
  // MAIN / SELECT AREA
  // ----------------------------------------------

  const main =
    document.createElement("button");

  main.type =
    "button";

  main.className =
    "structure-unit__main";


  const symbol =
    createUnitSymbol(unit);


  const info =
    document.createElement("span");

  info.className =
    "structure-unit__info";


  const name =
    document.createElement("span");

  name.className =
    "structure-unit__name";

  name.textContent =
    unit.name;


  const meta =
    document.createElement("span");

  meta.className =
    "structure-unit__meta";

  meta.textContent =
    `${getLevelLabel(unit)} · ${getTypeLabel(unit)}`;


  info.appendChild(
    name
  );

  info.appendChild(
    meta
  );


  main.appendChild(
    symbol
  );

  main.appendChild(
    info
  );


  main.addEventListener(
    "click",
    () => {
      selectUnit(unit);
    }
  );


  // ----------------------------------------------
  // ROW
  // ----------------------------------------------

  row.appendChild(
    expand
  );

  row.appendChild(
    main
  );


  /*
   * Menu pokazujemy wyłącznie
   * przy aktualnie zaznaczonej jednostce.
   */
  if (isSelected) {
    row.appendChild(
      createUnitActions(unit)
    );
  }


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
  const item =
    document.createElement("div");

  item.className =
    "structure-node";

  item.dataset.unitId =
    unit.id;

  item.dataset.depth =
    String(depth);


  const children =
    getChildren(
      units,
      unit.id
    );


  const row =
    createUnitRow(
      unit,
      children.length > 0
    );


  row.style.setProperty(
    "--structure-depth",
    depth
  );


  item.appendChild(
    row
  );


  // ----------------------------------------------
  // CHILDREN
  // ----------------------------------------------

  const isCollapsed =
    collapsedUnitIds.has(
      unit.id
    );


  if (
    children.length > 0 &&
    !isCollapsed
  ) {
    const childrenContainer =
      document.createElement("div");

    childrenContainer.className =
      "structure-node__children";


    children.forEach(
      child => {
        childrenContainer.appendChild(
          createBranch(
            child,
            units,
            depth + 1
          )
        );
      }
    );


    item.appendChild(
      childrenContainer
    );
  }


  return item;
}


// --------------------------------------------------
// RENDER
// --------------------------------------------------

export function renderStructureTree() {
  const container =
    document.getElementById(
      "structureTree"
    );


  if (!container) {
    return;
  }


  const units =
    getUnits();


  container.replaceChildren();


  if (units.length === 0) {
    container.appendChild(
      createEmptyState()
    );

    return;
  }


  const rootUnits =
    units.filter(
      unit =>
        unit.parentId === null
    );


  rootUnits.forEach(
    unit => {
      container.appendChild(
        createBranch(
          unit,
          units,
          0
        )
      );
    }
  );
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

// --------------------------------------------------
// CLOSE UNIT MENU ON OUTSIDE CLICK
// --------------------------------------------------

document.addEventListener(
  "click",
  event => {
    const clickedInsideActions =
      event.target.closest(
        ".structure-unit__actions"
      );


    if (!clickedInsideActions) {
      closeUnitMenus();
    }
  }
);