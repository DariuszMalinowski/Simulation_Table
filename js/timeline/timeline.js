import {
  formatMilitaryTime,
  formatTimelineDate
} from "../time/dtg.js";


const TIMELINE_HOURS = 24;


/**
 * Generuje nagłówek osi czasu.
 */
export function renderTimeline(startDate) {
  const container = document.getElementById(
    "timelineHeader"
  );

  if (!container) {
    return;
  }

  container.innerHTML = "";

  if (!(startDate instanceof Date)) {
    return;
  }

  for (let i = 0; i < TIMELINE_HOURS; i += 1) {
    const current = new Date(startDate.getTime());

    current.setHours(
      startDate.getHours() + i
    );

    const hour = document.createElement("div");

    hour.className = "timeline-hour";

    // Przy zmianie dnia pokażemy również datę.
    const previous =
      i > 0
        ? new Date(
            startDate.getFullYear(),
            startDate.getMonth(),
            startDate.getDate(),
            startDate.getHours() + i - 1
          )
        : null;

    const dayChanged =
      previous &&
      previous.getDate() !== current.getDate();

    if (i === 0 || dayChanged) {
      hour.classList.add("timeline-hour--day");

      hour.innerHTML = `
        <span class="timeline-hour__date">
          ${formatTimelineDate(current)}
        </span>

        <strong>
          ${formatMilitaryTime(current)}
        </strong>
      `;
    } else {
      hour.innerHTML = `
        <strong>
          ${formatMilitaryTime(current)}
        </strong>
      `;
    }

    container.appendChild(hour);
  }
}