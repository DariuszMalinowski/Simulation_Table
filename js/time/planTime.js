import { formatDtg } from "./dtg.js";

const TIME_ZONES = {
  Y: -12,
  X: -11,
  W: -10,
  V: -9,
  U: -8,
  T: -7,
  S: -6,
  R: -5,
  Q: -4,
  P: -3,
  O: -2,
  N: -1,

  Z: 0,

  A: 1,
  B: 2,
  C: 3,
  D: 4,
  E: 5,
  F: 6,
  G: 7,
  H: 8,
  I: 9,
  K: 10,
  L: 11,
  M: 12
};


let planTime = {
  start: null,
  timeZoneLetter: "B",
  timeZoneOffset: 2
};


/**
 * Tworzy lokalną datę z pól formularza.
 *
 * Robimy to ręcznie zamiast:
 * new Date("2026-09-16T06:00")
 *
 * dzięki czemu mamy pełną kontrolę nad
 * wartościami formularza.
 */
function createDate(dateValue, timeValue) {
  if (!dateValue || !timeValue) {
    return null;
  }

  const [year, month, day] = dateValue
    .split("-")
    .map(Number);

  const [hours, minutes] = timeValue
    .split(":")
    .map(Number);

  const date = new Date(
    year,
    month - 1,
    day,
    hours,
    minutes,
    0,
    0
  );

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}


/**
 * Ustawia czas początkowy symulacji.
 */
export function setPlanTime({
  dateValue,
  timeValue,
  timeZoneLetter
}) {
  const start = createDate(dateValue, timeValue);

  if (!start) {
    return null;
  }

  const offset = TIME_ZONES[timeZoneLetter];

  if (offset === undefined) {
    return null;
  }

  planTime = {
    start,
    timeZoneLetter,
    timeZoneOffset: offset
  };

  return getPlanTime();
}


/**
 * Pobiera aktualne ustawienie czasu.
 *
 * Zwracamy kopię Date, żeby inny moduł
 * przypadkiem nie zmodyfikował naszego stanu.
 */
export function getPlanTime() {
  return {
    start: planTime.start
      ? new Date(planTime.start.getTime())
      : null,

    timeZoneLetter: planTime.timeZoneLetter,
    timeZoneOffset: planTime.timeZoneOffset
  };
}


/**
 * Zwraca DTG czasu początkowego.
 */
export function getPlanStartDtg() {
  if (!planTime.start) {
    return "—";
  }

  return formatDtg(
    planTime.start,
    planTime.timeZoneLetter
  );
}


/**
 * Zwraca opis strefy.
 *
 * B -> "B — UTC+2"
 * Z -> "Z — UTC±0"
 * R -> "R — UTC−5"
 */
export function getTimeZoneLabel() {
  const {
    timeZoneLetter,
    timeZoneOffset
  } = planTime;

  if (timeZoneOffset === 0) {
    return `${timeZoneLetter} — UTC±0`;
  }

  if (timeZoneOffset > 0) {
    return `${timeZoneLetter} — UTC+${timeZoneOffset}`;
  }

  return `${timeZoneLetter} — UTC−${Math.abs(timeZoneOffset)}`;
}