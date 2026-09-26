import {
  STAFF_TYPES,
  getStaffItems,
  getStaffChildren,
  getStaffItemById,
  getStaffDescendantIds,
  deleteStaffItem
} from "../data/staff.js";

import {
  openStaffEditor
} from "./staffEditor.js";


// --------------------------------------------------
// STATE
// --------------------------------------------------

let selectedStaffItemId = null;

let openStaffMenuId = null;

const collapsedStaffIds =
  new Set();

// --------------------------------------------------
// HELPERS
// --------------------------------------------------

function getTypeLabel(item) {
  return (
    STAFF_TYPES[item.type]?.label ||
    item.type
  );
}


function getMarkerLabel(item) {
  if (
    item.abbreviation &&
    item.abbreviation.trim()
  ) {
    return item.abbreviation
      .trim()
      .slice(0, 5);
  }

  return (
    STAFF_TYPES[item.type]
      ?.defaultAbbreviation ||
    "•"
  );
}


// --------------------------------------------------
// EMPTY STATE
// --------------------------------------------------

function createEmptyState() {
  const empty =
    document.createElement("div");

  empty.className =
    "empty-state";

  empty.innerHTML = `
    <div class="empty-state__icon">
      +
    </div>

    <strong>
      Brak struktury sztabu
    </strong>

    <span>
      Utwórz pierwszy element struktury sztabu,
      aby rozpocząć planowanie.
    </span>
  `;

  return empty;
}


// --------------------------------------------------
// MENU
// --------------------------------------------------

function createStaffMenu(item) {
  const menu =
  document.createElement("div");

  menu.className =
    "structure-unit__menu structure-unit__menu--open";

  // ----------------------------------------------
  // ADD CHILD
  // ----------------------------------------------

  const addButton =
    document.createElement("button");

  addButton.type =
    "button";

  addButton.className =
    "structure-unit__menu-item";

  addButton.textContent =
    "+ Dodaj podległą";


  addButton.addEventListener(
    "click",
    event => {
      event.stopPropagation();

      collapsedStaffIds.delete(
        item.id
      );

      openStaffMenuId = null;

      openStaffEditor({
        parentId: item.id,

        onSave: () => {
          renderStaffTree();
        }
      });
    }
  );


  // ----------------------------------------------
  // EDIT
  // ----------------------------------------------

  const editButton =
    document.createElement("button");

  editButton.type =
    "button";

  editButton.className =
    "structure-unit__menu-item";

  editButton.textContent =
    "Edytuj";


  editButton.addEventListener(
    "click",
    event => {
      event.stopPropagation();

    openStaffMenuId = null;

      openStaffEditor({
        staffItemId: item.id,

        onSave: savedItem => {
          /*
           * Jeżeli element został przeniesiony
           * pod nowego przełożonego,
           * rozwijamy nową gałąź.
           */

          if (
            savedItem?.parentId
          ) {
            collapsedStaffIds.delete(
              savedItem.parentId
            );
          }


          renderStaffTree();
        }
      });
    }
  );


  // ----------------------------------------------
  // DELETE
  // ----------------------------------------------

  const deleteButton =
    document.createElement("button");

  deleteButton.type =
    "button";

  deleteButton.className =
    "structure-unit__menu-item structure-unit__menu-item--danger";

  deleteButton.textContent =
    "Usuń";


  deleteButton.addEventListener(
    "click",
    event => {
      event.stopPropagation();


      const descendantIds =
        getStaffDescendantIds(
          item.id
        );


      let message;


      if (
        descendantIds.size > 0
      ) {
        message =
          `Usunąć „${item.name}” oraz wszystkie elementy podległe (${descendantIds.size})?`;
      } else {
        message =
          `Usunąć „${item.name}”?`;
      }


      const confirmed =
        window.confirm(
          message
        );


      if (!confirmed) {
        return;
      }

      openStaffMenuId = null;
      /*
       * Czyścimy informacje o zwinięciu
       * dla całej usuwanej gałęzi.
       */

      collapsedStaffIds.delete(
        item.id
      );


      descendantIds.forEach(
        id => {
          collapsedStaffIds.delete(
            id
          );
        }
      );


      deleteStaffItem(
        item.id
      );


      if (
        selectedStaffItemId ===
        item.id ||
        descendantIds.has(
          selectedStaffItemId
        )
      ) {
        selectedStaffItemId =
          null;
      }


      renderStaffTree();


      window.dispatchEvent(
        new CustomEvent(
          "staff:item-deleted",
          {
            detail: {
              staffItemId:
                item.id,

              descendantIds:
                Array.from(
                  descendantIds
                )
            }
          }
        )
      );
    }
  );


  menu.appendChild(
    addButton
  );

  menu.appendChild(
    editButton
  );

  menu.appendChild(
    deleteButton
  );


  return menu;
}


// --------------------------------------------------
// STAFF ROW
// --------------------------------------------------

function createStaffRow(
  item,
  depth
) {
  const row =
    document.createElement("div");

  row.className =
    "staff-item";

  row.dataset.staffId =
    item.id;

  row.style.setProperty(
    "--staff-depth",
    depth
  );


  const isSelected =
    selectedStaffItemId ===
    item.id;


  if (isSelected) {
    row.classList.add(
      "staff-item--selected"
    );
  }


  const children =
    getStaffChildren(
      item.id
    );

  const hasChildren =
    children.length > 0;


  // ----------------------------------------------
  // EXPAND BUTTON
  // ----------------------------------------------

  const expandButton =
    document.createElement("button");

  expandButton.type =
    "button";

  expandButton.className =
    "staff-item__expand";


  if (hasChildren) {
    const isCollapsed =
      collapsedStaffIds.has(
        item.id
      );


    expandButton.textContent =
      isCollapsed
        ? "▸"
        : "▾";


    expandButton.setAttribute(
      "aria-label",
      isCollapsed
        ? "Rozwiń"
        : "Zwiń"
    );


    expandButton.addEventListener(
      "click",
      event => {
        event.stopPropagation();


        if (
          collapsedStaffIds.has(
            item.id
          )
        ) {
          collapsedStaffIds.delete(
            item.id
          );
        } else {
          collapsedStaffIds.add(
            item.id
          );
        }


        renderStaffTree();
      }
    );
  } else {
    expandButton.classList.add(
      "staff-item__expand--empty"
    );

    expandButton.textContent =
      "";
  }


  // ----------------------------------------------
  // MARKER
  // ----------------------------------------------

  const marker =
    document.createElement("span");

  marker.className =
    "staff-item__marker";

  marker.textContent =
    getMarkerLabel(
      item
    );


  // ----------------------------------------------
  // INFO
  // ----------------------------------------------

  const info =
    document.createElement("div");

  info.className =
    "staff-item__info";


  const name =
    document.createElement("span");

  name.className =
    "staff-item__name";

  name.textContent =
    item.name;


  const type =
    document.createElement("span");

  type.className =
    "staff-item__type";

  type.textContent =
    getTypeLabel(
      item
    );


  info.appendChild(
    name
  );

  info.appendChild(
    type
  );


  // ----------------------------------------------
  // MENU BUTTON
  // ----------------------------------------------

  const menuWrapper =
    document.createElement("div");

  menuWrapper.className =
    "staff-item__menu-wrapper";


  if (isSelected) {
    const menuButton =
      document.createElement(
        "button"
      );

    menuButton.type =
      "button";

    menuButton.className =
      "staff-item__menu-button";

    menuButton.textContent =
      "⋯";

    menuButton.setAttribute(
      "aria-label",
      "Opcje"
    );


    menuButton.addEventListener(
      "click",
      event => {
        event.stopPropagation();

        if (
          openStaffMenuId ===
          item.id
        ) {
          openStaffMenuId =
            null;
        } else {
          openStaffMenuId =
            item.id;
        }

        renderStaffTree();
      }
    );


    menuWrapper.appendChild(
      menuButton
    );


    if (
      openStaffMenuId ===
      item.id
    ) {
      const menu =
        createStaffMenu(
          item
        );

      menuWrapper.appendChild(
        menu
      );
    }
  }


  // ----------------------------------------------
  // SELECT
  // ----------------------------------------------

  row.addEventListener(
    "click",
    () => {
      if (
        selectedStaffItemId !==
        item.id
      ) {
        openStaffMenuId =
          null;
      }

      selectedStaffItemId =
        item.id;

      renderStaffTree();
    }
  );

  // ----------------------------------------------
  // ROW
  // ----------------------------------------------

  row.appendChild(
    expandButton
  );

  row.appendChild(
    marker
  );

  row.appendChild(
    info
  );

  row.appendChild(
    menuWrapper
  );


  return row;
}


// --------------------------------------------------
// BRANCH
// --------------------------------------------------

function createBranch(
  item,
  depth = 0
) {
  const branch =
    document.createElement("div");

  branch.className =
    "staff-node";

  branch.dataset.staffId =
    item.id;


  branch.appendChild(
    createStaffRow(
      item,
      depth
    )
  );


  if (
    collapsedStaffIds.has(
      item.id
    )
  ) {
    return branch;
  }


  const children =
    getStaffChildren(
      item.id
    );


  children.forEach(
    child => {
      branch.appendChild(
        createBranch(
          child,
          depth + 1
        )
      );
    }
  );


  return branch;
}


// --------------------------------------------------
// RENDER
// --------------------------------------------------

export function renderStaffTree() {
  const container =
    document.getElementById(
      "structureTree"
    );


  if (!container) {
    return;
  }


  const staffItems =
    getStaffItems();


  container.replaceChildren();


  if (
    staffItems.length === 0
  ) {
    selectedStaffItemId =
      null;

    container.appendChild(
      createEmptyState()
    );

    return;
  }


  /*
   * Jeżeli zaznaczony element został wcześniej
   * usunięty, czyścimy zaznaczenie.
   */

  if (
    selectedStaffItemId &&
    !getStaffItemById(
      selectedStaffItemId
    )
  ) {
    selectedStaffItemId =
      null;
  }


  const rootItems =
    staffItems.filter(
      item =>
        item.parentId === null
    );


  rootItems.forEach(
    item => {
      container.appendChild(
        createBranch(
          item,
          0
        )
      );
    }
  );
}