import {
  STAFF_TYPES,
  createStaffItem,
  updateStaffItem,
  getStaffItems,
  getStaffItemById,
  getStaffDescendantIds
} from "../data/staff.js";


// --------------------------------------------------
// PARENT SELECT
// --------------------------------------------------

function createParentSelect(
  editedItem = null
) {
  const select =
    document.createElement("select");

  select.id =
    "staffEditorParent";


  // ----------------------------------------------
  // ROOT OPTION
  // ----------------------------------------------

  const rootOption =
    document.createElement("option");

  rootOption.value =
    "";

  rootOption.textContent =
    "Brak — element główny";

  select.appendChild(
    rootOption
  );


  // ----------------------------------------------
  // EXCLUDED ITEMS
  // ----------------------------------------------

  const excludedIds =
    new Set();


  if (editedItem) {
    excludedIds.add(
      editedItem.id
    );


    const descendantIds =
      getStaffDescendantIds(
        editedItem.id
      );


    descendantIds.forEach(
      id => {
        excludedIds.add(
          id
        );
      }
    );
  }


  // ----------------------------------------------
  // OPTIONS
  // ----------------------------------------------

  getStaffItems().forEach(
    item => {
      if (
        excludedIds.has(
          item.id
        )
      ) {
        return;
      }


      const option =
        document.createElement(
          "option"
        );

      option.value =
        item.id;


      const typeLabel =
        STAFF_TYPES[item.type]?.label ||
        item.type;


      option.textContent =
        `${item.name} — ${typeLabel}`;


      select.appendChild(
        option
      );
    }
  );


  return select;
}


// --------------------------------------------------
// TYPE SELECT
// --------------------------------------------------

function createTypeSelect() {
  const select =
    document.createElement("select");

  select.id =
    "staffEditorType";


  Object.values(
    STAFF_TYPES
  ).forEach(
    type => {
      const option =
        document.createElement(
          "option"
        );

      option.value =
        type.id;

      option.textContent =
        type.label;


      select.appendChild(
        option
      );
    }
  );


  return select;
}

// --------------------------------------------------
// SUGGESTED CHILD TYPE
// --------------------------------------------------

function getSuggestedChildType(
  parentItem
) {
  if (!parentItem) {
    return null;
  }

  const suggestions = {
    division: "section",
    section: "personnel"
  };

  return (
    suggestions[parentItem.type] ||
    null
  );
}


// --------------------------------------------------
// EDITOR
// --------------------------------------------------

export function openStaffEditor({
  parentId = null,
  staffItemId = null,
  onSave = null
} = {}) {

  // ----------------------------------------------
  // EDIT MODE
  // ----------------------------------------------

  const editedItem =
    staffItemId
      ? getStaffItemById(
          staffItemId
        )
      : null;


  if (
    staffItemId &&
    !editedItem
  ) {
    console.error(
      "Nie znaleziono elementu sztabu:",
      staffItemId
    );

    return;
  }


  const isEditMode =
    Boolean(
      editedItem
    );


  // ----------------------------------------------
  // OVERLAY
  // ----------------------------------------------

  const overlay =
    document.createElement("div");

  overlay.className =
    "structure-editor-overlay";


  // ----------------------------------------------
  // DIALOG
  // ----------------------------------------------

  const dialog =
    document.createElement("div");

  dialog.className =
    "structure-editor";

  dialog.setAttribute(
    "role",
    "dialog"
  );

  dialog.setAttribute(
    "aria-modal",
    "true"
  );

  dialog.setAttribute(
    "aria-labelledby",
    "staffEditorTitle"
  );


  // ----------------------------------------------
  // HEADER
  // ----------------------------------------------

  const header =
    document.createElement("div");

  header.className =
    "structure-editor__header";


  const title =
    document.createElement("h3");

  title.id =
    "staffEditorTitle";

  title.textContent =
    isEditMode
      ? "Edytuj element sztabu"
      : "Dodaj element sztabu";


  const closeButton =
    document.createElement("button");

  closeButton.type =
    "button";

  closeButton.className =
    "structure-editor__close";

  closeButton.textContent =
    "×";

  closeButton.setAttribute(
    "aria-label",
    "Zamknij"
  );


  header.appendChild(
    title
  );

  header.appendChild(
    closeButton
  );


  // ----------------------------------------------
  // FORM
  // ----------------------------------------------

  const form =
    document.createElement("form");

  form.className =
    "structure-editor__form";


  // ----------------------------------------------
  // NAME
  // ----------------------------------------------

  const nameLabel =
    document.createElement("label");

  nameLabel.className =
    "structure-editor__field";


  const nameText =
    document.createElement("span");

  nameText.textContent =
    "Nazwa";


  const nameInput =
    document.createElement("input");

  nameInput.id =
    "staffEditorName";

  nameInput.type =
    "text";

  nameInput.required =
    true;

  nameInput.autocomplete =
    "off";

  nameInput.placeholder =
    "np. Sekcja Planowania";


  nameLabel.appendChild(
    nameText
  );

  nameLabel.appendChild(
    nameInput
  );


  // ----------------------------------------------
  // TYPE
  // ----------------------------------------------

  const typeLabel =
    document.createElement("label");

  typeLabel.className =
    "structure-editor__field";


  const typeText =
    document.createElement("span");

  typeText.textContent =
    "Typ";


  const typeSelect =
    createTypeSelect();


  typeLabel.appendChild(
    typeText
  );

  typeLabel.appendChild(
    typeSelect
  );

  // ----------------------------------------------
  // ABBREVIATION
  // ----------------------------------------------

  const abbreviationLabel =
    document.createElement("label");

  abbreviationLabel.className =
    "structure-editor__field";


  const abbreviationText =
    document.createElement("span");

  abbreviationText.textContent =
    "Skrót";


  const abbreviationInput =
    document.createElement("input");

  abbreviationInput.id =
    "staffEditorAbbreviation";

  abbreviationInput.type =
    "text";

  abbreviationInput.maxLength =
    5;

  abbreviationInput.autocomplete =
    "off";

  abbreviationInput.placeholder =
    "np. S3";


  abbreviationInput.addEventListener(
    "input",
    () => {
      abbreviationInput.value =
        abbreviationInput.value
          .slice(0, 5);
    }
  );


  abbreviationLabel.appendChild(
    abbreviationText
  );

  abbreviationLabel.appendChild(
    abbreviationInput
  );

  // ----------------------------------------------
  // PARENT
  // ----------------------------------------------

  const parentLabel =
    document.createElement("label");

  parentLabel.className =
    "structure-editor__field";


  const parentText =
    document.createElement("span");

  parentText.textContent =
    "Element nadrzędny";


  const parentSelect =
    createParentSelect(
      editedItem
    );


  parentLabel.appendChild(
    parentText
  );

  parentLabel.appendChild(
    parentSelect
  );


  // ----------------------------------------------
  // INITIAL VALUES
  // ----------------------------------------------

  if (isEditMode) {
    nameInput.value =
      editedItem.name;

    typeSelect.value =
      editedItem.type;

    abbreviationInput.value =
        editedItem.abbreviation ||
        STAFF_TYPES[
            editedItem.type
        ]?.defaultAbbreviation ||
        "";

    parentSelect.value =
      editedItem.parentId || "";
  } else {
    /*
     * Jeżeli edytor został otwarty przez
     * "Dodaj podległą", ustawiamy wskazany
     * element jako nadrzędny.
     */

    const parentItem =
      getStaffItemById(
        parentId
      );

    if (parentItem) {
      parentSelect.value =
        parentItem.id;

      const suggestedType =
        getSuggestedChildType(
          parentItem
        );

      if (suggestedType) {
        typeSelect.value =
          suggestedType;
      }
    }
  }

  if (!isEditMode) {
    abbreviationInput.value =
        STAFF_TYPES[
        typeSelect.value
        ]?.defaultAbbreviation ||
        "";
  }


  typeSelect.addEventListener(
    "change",
    () => {
        abbreviationInput.value =
        STAFF_TYPES[
            typeSelect.value
        ]?.defaultAbbreviation ||
        "";
    }
  );

  // ----------------------------------------------
  // ACTIONS
  // ----------------------------------------------

  const actions =
    document.createElement("div");

  actions.className =
    "structure-editor__actions";


  const cancelButton =
    document.createElement("button");

  cancelButton.type =
    "button";

  cancelButton.className =
    "button button--secondary";

  cancelButton.textContent =
    "Anuluj";


  const saveButton =
    document.createElement("button");

  saveButton.type =
    "submit";

  saveButton.className =
    "button button--primary";

  saveButton.textContent =
    isEditMode
      ? "Zapisz zmiany"
      : "Dodaj";


  actions.appendChild(
    cancelButton
  );

  actions.appendChild(
    saveButton
  );


  // ----------------------------------------------
  // FORM STRUCTURE
  // ----------------------------------------------

  form.appendChild(
    nameLabel
  );

  form.appendChild(
    typeLabel
  );

  form.appendChild(
    abbreviationLabel
  );

  form.appendChild(
    parentLabel
  );

  form.appendChild(
    actions
  );


  dialog.appendChild(
    header
  );

  dialog.appendChild(
    form
  );

  overlay.appendChild(
    dialog
  );

  document.body.appendChild(
    overlay
  );

  // ----------------------------------------------
  // CLOSE
  // ----------------------------------------------

  function closeEditor() {
    document.removeEventListener(
      "keydown",
      handleKeydown
    );

    overlay.remove();
  }


  function handleKeydown(event) {
    if (
      event.key === "Escape"
    ) {
      closeEditor();
    }
  }


  closeButton.addEventListener(
    "click",
    closeEditor
  );


  cancelButton.addEventListener(
    "click",
    closeEditor
  );


  overlay.addEventListener(
    "click",
    event => {
      if (
        event.target === overlay
      ) {
        closeEditor();
      }
    }
  );


  document.addEventListener(
    "keydown",
    handleKeydown
  );


  // ----------------------------------------------
  // SUBMIT
  // ----------------------------------------------

  form.addEventListener(
    "submit",
    event => {
      event.preventDefault();


      const values = {
        name:
            nameInput.value,

        type:
            typeSelect.value,

        abbreviation:
            abbreviationInput.value,

        parentId:
            parentSelect.value ||
            null
      };


      try {
        let savedItem;


        if (isEditMode) {
          savedItem =
            updateStaffItem(
              editedItem.id,
              values
            );
        } else {
          savedItem =
            createStaffItem(
              values
            );
        }


        closeEditor();


        if (
          typeof onSave ===
          "function"
        ) {
          onSave(
            savedItem
          );
        }
      } catch (error) {
        console.error(
          error
        );

        alert(
          error.message ||
          "Nie udało się zapisać elementu sztabu."
        );
      }
    }
  );


  // ----------------------------------------------
  // FOCUS
  // ----------------------------------------------

  requestAnimationFrame(
    () => {
      nameInput.focus();


      if (isEditMode) {
        nameInput.select();
      }
    }
  );
}
