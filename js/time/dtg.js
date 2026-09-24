const NATO_MONTHS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC"
];

/**
 * Formatuje datę do wojskowego zapisu DTG.
 *
 * Przykład:
 * 16.09.2026 06:00 + strefa B
 * -> 160600BSEP26
 */
export function formatDtg(date, zoneLetter = "Z") {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return "—";
  }

  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  const month = NATO_MONTHS[date.getMonth()];
  const year = String(date.getFullYear()).slice(-2);

  return `${day}${hours}${minutes}${zoneLetter}${month}${year}`;
}


/**
 * Zwraca skróconą datę do nagłówka osi czasu.
 *
 * Przykład:
 * 16 SEP 2026
 */
export function formatTimelineDate(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return "";
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = NATO_MONTHS[date.getMonth()];
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
}


/**
 * Zwraca godzinę w formacie wojskowym.
 *
 * Przykład:
 * 06:00 -> 0600
 */
export function formatMilitaryTime(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return "";
  }

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
}