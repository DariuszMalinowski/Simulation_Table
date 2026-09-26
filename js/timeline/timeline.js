import {
  formatMilitaryTime,
  formatTimelineDate
} from "../time/dtg.js";

import {
  getOperationalDayLabel
} from "../time/planTime.js";


const TIMELINE_HOURS = 24;


// ==================================================
// DATE HELPERS
// ==================================================

/**
 * Sprawdza, czy dwie daty należą
 * do tej samej doby kalendarzowej.
 */
function isSameCalendarDay(
  firstDate,
  secondDate
) {
  return (
    firstDate.getFullYear() ===
      secondDate.getFullYear() &&
    firstDate.getMonth() ===
      secondDate.getMonth() &&
    firstDate.getDate() ===
      secondDate.getDate()
  );
}


// ==================================================
// TIMELINE
// ==================================================

/**
 * Generuje nagłówek osi czasu.
 *
 * Doba operacyjna jest pobierana z planTime.js.
 *
 * Przykład:
 *
 * start:
 * 26 SEP 2026 06:00
 *
 * czas operacyjny:
 * D+2
 *
 * 26 SEP:
 * 06:00 - 23:59 -> D+2
 *
 * 27 SEP:
 * 00:00 - 23:59 -> D+3
 */
export function renderTimeline(
  startDate
) {
  const container =
    document.getElementById(
      "timelineHeader"
    );

  const operationalDays =
    document.getElementById(
      "timelineOperationalDays"
    );

  if (!container || !operationalDays) {
    return;
  }


  container.innerHTML = "";
  operationalDays.innerHTML = "";

  container.parentElement.style.setProperty(
    "--timeline-hours",
    TIMELINE_HOURS
  );


  if (
    !(startDate instanceof Date) ||
    Number.isNaN(
      startDate.getTime()
    )
  ) {
    return;
  }


  // ------------------------------------------------
  // HOURS
  // ------------------------------------------------

  let daySegment = null;
  let segmentHours = 0;

  for (
    let i = 0;
    i < TIMELINE_HOURS;
    i += 1
  ) {

    // ----------------------------------------------
    // CURRENT HOUR
    // ----------------------------------------------

    const current =
      new Date(
        startDate.getTime()
      );


    current.setHours(
      startDate.getHours() + i
    );


    // ----------------------------------------------
    // PREVIOUS HOUR
    // ----------------------------------------------

    const previous =
      i > 0
        ? new Date(
            startDate.getTime()
          )
        : null;


    if (previous) {
      previous.setHours(
        startDate.getHours() +
          i -
          1
      );
    }


    // ----------------------------------------------
    // DAY CHANGE
    // ----------------------------------------------

    const dayChanged =
      previous
        ? !isSameCalendarDay(
            previous,
            current
          )
        : false;


    // ----------------------------------------------
    // OPERATIONAL DAY
    // ----------------------------------------------

    const operationalDay =
      getOperationalDayLabel(
        current
      );

    if (i === 0 || dayChanged) {
      daySegment =
        document.createElement("div");

      daySegment.className =
        "timeline-operational-day";

      daySegment.textContent =
        operationalDay;

      operationalDays.appendChild(
        daySegment
      );

      segmentHours = 0;
    }

    segmentHours += 1;
    daySegment.style.gridColumn =
      `span ${segmentHours}`;


    // ----------------------------------------------
    // HOUR ELEMENT
    // ----------------------------------------------

    const hour =
      document.createElement(
        "div"
      );


    hour.className =
      "timeline-hour";


    hour.dataset.operationalDay =
      operationalDay;


    // ----------------------------------------------
    // FIRST HOUR / NEW CALENDAR DAY
    // ----------------------------------------------

    if (
      i === 0 ||
      dayChanged
    ) {
      hour.classList.add(
        "timeline-hour--day"
      );


      hour.innerHTML = `
        <span class="timeline-hour__date">
          ${formatTimelineDate(current)}
        </span>

        <strong>
          ${formatMilitaryTime(current)}
        </strong>
      `;
    }


    // ----------------------------------------------
    // NORMAL HOUR
    // ----------------------------------------------

    else {
      hour.innerHTML = `
        <strong>
          ${formatMilitaryTime(current)}
        </strong>
      `;
    }


    container.appendChild(
      hour
    );
  }
}
