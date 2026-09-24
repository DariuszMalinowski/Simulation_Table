import {
  UNIT_LEVELS,
  UNIT_TYPES,
  UNIT_FACTIONS,
  createUnit,
  getUnits
} from "../data/units.js";


// --------------------------------------------------
// HELPERS
// --------------------------------------------------

function createOption(value, label) {
  const option = document.createElement("option");

  option.value = value;
  option.textContent = label;

  return option;
}


function createSelectFromObject(data, emptyLabel = null) {
  const select = document.createElement("select");

  if (emptyLabel) {
    select.appendChild(
      createOption("", emptyLabel)
    );
  }

  Object.values(data).forEach(item => {
    select.appendChild(
      createOption(item.id, item.label)
    );
  });

  return select;
}


// --------------------------------------------------
// FIELD
// --------------------------------------------------

function createField(labelText, input) {
  const label = document.createElement("label");

  label.className = "structure-editor__field";

  const title = document.createElement("span");

  title.className = "structure-editor__label";
  title.textContent = labelText;

  label.appendChild(title);
  label.appendChild(input);

  return label;
}


// --------------------------------------------------
// PARENT SELECT
// --------------------------------------------------

function createParentSelect() {
  const select = document.createElement("select");

  select.appendChild(
    createOption("", "Brak — jednostka główna")
  );

  const units = getUnits();

  units.forEach(unit => {
    const level =
      UNIT_LEVELS[unit.level]?.shortLabel ||
      UNIT_LEVELS[unit.level]?.label ||
      "";

    const label = level
      ? `${unit.name} — ${level}`
      : unit.name;

    select.appendChild(
      createOption(unit.id, label)
    );
  });

  return select;
}


// --------------------------------------------------
// DIALOG
// --------------------------------------------------

export function openStructureEditor({
  parentId = null,
  onSave = null
} = {}) {
  const overlay = document.createElement("div");

  overlay.className = "structure-editor-overlay";


  const dialog = document.createElement("div");

  dialog.className = "structure-editor";


  // ------------------------------------------------
  // HEADER
  // ------------------------------------------------

  const header = document.createElement("div");

  header.className = "structure-editor__header";


  const title = document.createElement("h2");

  title.className = "structure-editor__title";
  title.textContent = "Dodaj jednostkę";


  const closeButton = document.createElement("button");

  closeButton.type = "button";
  closeButton.className = "structure-editor__close";
  closeButton.textContent = "×";
  closeButton.setAttribute(
    "aria-label",
    "Zamknij"
  );


  header.appendChild(title);
  header.appendChild(closeButton);


  // ------------------------------------------------
  // FORM
  // ------------------------------------------------

  const form = document.createElement("form");

  form.className = "structure-editor__form";


  // NAME

  const nameInput = document.createElement("input");

  nameInput.type = "text";
  nameInput.placeholder = "np. 1 Batalion Zmechanizowany";
  nameInput.autocomplete = "off";
  nameInput.required = true;


  // LEVEL

  const levelSelect =
    createSelectFromObject(UNIT_LEVELS);


  // TYPE

  const typeSelect =
    createSelectFromObject(UNIT_TYPES);


  // FACTION

  const factionSelect =
    createSelectFromObject(UNIT_FACTIONS);


  // PARENT

  const parentSelect = createParentSelect();

  if (parentId) {
    parentSelect.value = parentId;
  }


  form.appendChild(
    createField("Nazwa", nameInput)
  );

  form.appendChild(
    createField("Szczebel", levelSelect)
  );

  form.appendChild(
    createField("Typ", typeSelect)
  );

  form.appendChild(
    createField("Strona", factionSelect)
  );

  form.appendChild(
    createField("Przełożony", parentSelect)
  );


  // ------------------------------------------------
  // ACTIONS
  // ------------------------------------------------

  const actions = document.createElement("div");

  actions.className = "structure-editor__actions";


  const cancelButton =
    document.createElement("button");

  cancelButton.type = "button";
  cancelButton.className =
    "button button--secondary";

  cancelButton.textContent = "Anuluj";


  const saveButton =
    document.createElement("button");

  saveButton.type = "submit";
  saveButton.className =
    "button button--primary";

  saveButton.textContent = "Dodaj";


  actions.appendChild(cancelButton);
  actions.appendChild(saveButton);

  form.appendChild(actions);


  // ------------------------------------------------
  // DIALOG STRUCTURE
  // ------------------------------------------------

  dialog.appendChild(header);
  dialog.appendChild(form);

  overlay.appendChild(dialog);

  document.body.appendChild(overlay);


  // ------------------------------------------------
  // CLOSE
  // ------------------------------------------------

  function close() {
    overlay.remove();
  }


  closeButton.addEventListener(
    "click",
    close
  );


  cancelButton.addEventListener(
    "click",
    close
  );


  overlay.addEventListener(
    "click",
    event => {
      if (event.target === overlay) {
        close();
      }
    }
  );


  // ------------------------------------------------
  // SUBMIT
  // ------------------------------------------------

  form.addEventListener(
    "submit",
    event => {
      event.preventDefault();

      try {
        const unit = createUnit({
          name: nameInput.value,
          level: levelSelect.value,
          type: typeSelect.value,
          faction: factionSelect.value,
          parentId:
            parentSelect.value || null
        });

        close();

        if (typeof onSave === "function") {
          onSave(unit);
        }

      } catch (error) {
        console.error(error);

        alert(
          error.message ||
          "Nie udało się dodać jednostki."
        );
      }
    }
  );


  // ------------------------------------------------
  // INITIAL FOCUS
  // ------------------------------------------------

  requestAnimationFrame(() => {
    nameInput.focus();
  });
}