import {
  setPlanTime,
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

import {
  renderStaffTree
} from "./staff/staffTree.js";

import {
  openStaffEditor
} from "./staff/staffEditor.js";


// --------------------------------------------------
// PLANNING MODES
// --------------------------------------------------

const PLANNING_MODES = {
  UNITS: "units",
  STAFF: "staff"
};

let activePlanningMode =
  PLANNING_MODES.UNITS;


// --------------------------------------------------
// DOM
// --------------------------------------------------

const dateInput =
  document.getElementById(
    "planStartDate"
  );

const timeInput =
  document.getElementById(
    "planStartTime"
  );

const zoneSelect =
  document.getElementById(
    "planTimeZone"
  );


// --------------------------------------------------
// OPERATIONAL TIME DOM
// --------------------------------------------------

const operationalCodeInput =
  document.getElementById(
    "operationalTimeCode"
  );

const operationalSignSelect =
  document.getElementById(
    "operationalTimeSign"
  );

const operationalValueInput =
  document.getElementById(
    "operationalTimeValue"
  );

const operationalTimeDisplay =
  document.getElementById(
    "planOperationalTime"
  );


// --------------------------------------------------
// OTHER DOM
// --------------------------------------------------

const setButton =
  document.getElementById(
    "setPlanStartButton"
  );

const dtgDisplay =
  document.getElementById(
    "planStartDtg"
  );

const footerTime =
  document.getElementById(
    "currentPlanTime"
  );


const planningModeUnits =
  document.getElementById(
    "planningModeUnits"
  );

const planningModeStaff =
  document.getElementById(
    "planningModeStaff"
  );

const structureModeTitle =
  document.getElementById(
    "structureModeTitle"
  );

const addStructureButton =
  document.getElementById(
    "addStructureButton"
  );


// --------------------------------------------------
// OPERATIONAL TIME
// --------------------------------------------------

/**
 * Pobiera kod czasu operacyjnego.
 *
 * Przykłady:
 *
 * D
 * H
 * F
 *
 * Usuwamy zbędne spacje.
 * Jeżeli pole jest puste, używamy D.
 */
function getOperationalCode() {
  const code =
    operationalCodeInput?.value
      ?.trim();


  if (!code) {
    return "D";
  }


  return code;
}


/**
 * Pobiera wartość czasu operacyjnego
 * z formularza i zamienia:
 *
 * + 2 -> 2
 * - 2 -> -2
 *
 * Dla wartości 0 znak nie ma znaczenia.
 */
function getOperationalOffset() {
  const value =
    Number(
      operationalValueInput?.value
    );


  if (
    !Number.isFinite(value)
  ) {
    return 0;
  }


  const wholeValue =
    Math.abs(
      Math.trunc(value)
    );


  if (
    wholeValue === 0
  ) {
    return 0;
  }


  if (
    operationalSignSelect?.value === "-"
  ) {
    return -wholeValue;
  }


  return wholeValue;
}


/**
 * Formatuje czas operacyjny.
 *
 * D + 0 -> D
 * D + 1 -> D+1
 * D - 1 -> D-1
 * H + 3 -> H+3
 */
function formatOperationalTime(
  code,
  offset
) {
  if (offset === 0) {
    return code;
  }


  if (offset > 0) {
    return `${code}+${offset}`;
  }


  return `${code}${offset}`;
}


// --------------------------------------------------
// PLAN TIME
// --------------------------------------------------

function updatePlanTime() {
  const operationalCode =
    getOperationalCode();

  const operationalOffset =
    getOperationalOffset();


  const result =
    setPlanTime({
      dateValue:
        dateInput?.value,

      timeValue:
        timeInput?.value,

      timeZoneLetter:
        zoneSelect?.value,

      operationalCode,

      operationalOffset
    });


  if (!result) {
    return;
  }


  // ----------------------------------------------
  // DTG
  // ----------------------------------------------

  const dtg =
    getPlanStartDtg();

  const zone =
    getTimeZoneLabel();


  if (dtgDisplay) {
    dtgDisplay.textContent =
      dtg;
  }


  // ----------------------------------------------
  // OPERATIONAL TIME
  // ----------------------------------------------

  const operationalTime =
    formatOperationalTime(
      operationalCode,
      operationalOffset
    );


  if (operationalTimeDisplay) {
    operationalTimeDisplay.textContent =
      operationalTime;
  }


  // ----------------------------------------------
  // FOOTER
  // ----------------------------------------------

  if (footerTime) {
    footerTime.textContent =
      `START: ${dtg} · ${zone} · ${operationalTime}`;
  }


  // ----------------------------------------------
  // TIMELINE
  // ----------------------------------------------

  renderTimeline(
    result.start
  );
}


setButton?.addEventListener(
  "click",
  updatePlanTime
);


// --------------------------------------------------
// PLANNING MODE
// --------------------------------------------------

function updatePlanningModeUI() {
  const isUnitsMode =
    activePlanningMode ===
    PLANNING_MODES.UNITS;


  // ----------------------------------------------
  // BUTTONS
  // ----------------------------------------------

  planningModeUnits?.classList.toggle(
    "planning-mode__button--active",
    isUnitsMode
  );

  planningModeStaff?.classList.toggle(
    "planning-mode__button--active",
    !isUnitsMode
  );


  planningModeUnits?.setAttribute(
    "aria-pressed",
    String(isUnitsMode)
  );

  planningModeStaff?.setAttribute(
    "aria-pressed",
    String(!isUnitsMode)
  );


  // ----------------------------------------------
  // TITLE
  // ----------------------------------------------

  if (structureModeTitle) {
    structureModeTitle.textContent =
      isUnitsMode
        ? "Jednostki"
        : "Sztab";
  }


  // ----------------------------------------------
  // STRUCTURE
  // ----------------------------------------------

  if (isUnitsMode) {
    renderStructureTree();
  } else {
    renderStaffTree();
  }
}


function setPlanningMode(mode) {
  if (
    mode !== PLANNING_MODES.UNITS &&
    mode !== PLANNING_MODES.STAFF
  ) {
    return;
  }


  if (
    activePlanningMode === mode
  ) {
    return;
  }


  activePlanningMode =
    mode;


  updatePlanningModeUI();
}


// --------------------------------------------------
// PLANNING MODE EVENTS
// --------------------------------------------------

planningModeUnits?.addEventListener(
  "click",
  () => {
    setPlanningMode(
      PLANNING_MODES.UNITS
    );
  }
);


planningModeStaff?.addEventListener(
  "click",
  () => {
    setPlanningMode(
      PLANNING_MODES.STAFF
    );
  }
);


// --------------------------------------------------
// ADD STRUCTURE ITEM
// --------------------------------------------------

addStructureButton?.addEventListener(
  "click",
  () => {

    // ----------------------------------------------
    // UNITS
    // ----------------------------------------------

    if (
      activePlanningMode ===
      PLANNING_MODES.UNITS
    ) {
      openStructureEditor({
        onSave: unit => {
          console.log(
            "Dodano jednostkę:",
            unit
          );

          renderStructureTree();
        }
      });

      return;
    }


    // ----------------------------------------------
    // STAFF
    // ----------------------------------------------

    if (
      activePlanningMode ===
      PLANNING_MODES.STAFF
    ) {
      openStaffEditor({
        onSave: staffItem => {
          console.log(
            "Dodano element sztabu:",
            staffItem
          );

          renderStaffTree();
        }
      });
    }
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
  if (
    dateInput?.value
  ) {
    return;
  }


  if (!dateInput) {
    return;
  }


  const today =
    new Date();


  const year =
    today.getFullYear();


  const month =
    String(
      today.getMonth() + 1
    ).padStart(
      2,
      "0"
    );


  const day =
    String(
      today.getDate()
    ).padStart(
      2,
      "0"
    );


  dateInput.value =
    `${year}-${month}-${day}`;
}


// --------------------------------------------------
// INIT
// --------------------------------------------------

setDefaultDate();

updatePlanningModeUI();


console.log(
  "Staff Planner uruchomiony."
);