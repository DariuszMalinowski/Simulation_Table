import {
  setPlanTime,
  getPlanTime,
  getPlanStartDtg,
  getTimeZoneLabel
} from "./time/planTime.js";

import {
  renderTimeline
} from "./timeline/timeline.js";

import {
  openStructureEditor
} from "./structure/structureEditor.js";

import {
  renderStructureTree
} from "./structure/structureTree.js";


// --------------------------------------------------
// DOM
// --------------------------------------------------

const dateInput =
  document.getElementById("planStartDate");

const timeInput =
  document.getElementById("planStartTime");

const zoneSelect =
  document.getElementById("planTimeZone");

const setButton =
  document.getElementById("setPlanStartButton");

const dtgDisplay =
  document.getElementById("planStartDtg");

const footerTime =
  document.getElementById("currentPlanTime");

const addUnitButton =
  document.getElementById("addUnitButton");


// --------------------------------------------------
// PLAN TIME
// --------------------------------------------------

function updatePlanTime() {
  const result = setPlanTime({
    dateValue: dateInput.value,
    timeValue: timeInput.value,
    timeZoneLetter: zoneSelect.value
  });

  if (!result) {
    return;
  }

  const dtg = getPlanStartDtg();
  const zone = getTimeZoneLabel();

  dtgDisplay.textContent = dtg;

  if (footerTime) {
    footerTime.textContent =
      `START: ${dtg} · ${zone}`;
  }

  renderTimeline(result.start);
}


setButton?.addEventListener(
  "click",
  updatePlanTime
);


// --------------------------------------------------
// STRUCTURE
// --------------------------------------------------

addUnitButton?.addEventListener(
  "click",
  () => {
    openStructureEditor({
      onSave: unit => {
        console.log(
          "Dodano jednostkę:",
          unit
        );

        renderStructureTree();
      }
    });
  }
);


// --------------------------------------------------
// DEFAULT DATE
// --------------------------------------------------

/**
 * Ustawiamy dzisiejszą datę jako wartość
 * początkową formularza, jeżeli pole jest puste.
 *
 * Nie zatwierdzamy jej jeszcze jako czasu
 * symulacji — robi to użytkownik przyciskiem Ustaw.
 */
function setDefaultDate() {
  if (dateInput?.value) {
    return;
  }

  if (!dateInput) {
    return;
  }

  const today = new Date();

  const year =
    today.getFullYear();

  const month = String(
    today.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    today.getDate()
  ).padStart(2, "0");

  dateInput.value =
    `${year}-${month}-${day}`;
}


// --------------------------------------------------
// INIT
// --------------------------------------------------

setDefaultDate();

renderStructureTree();

console.log(
  "Staff Planner uruchomiony."
);