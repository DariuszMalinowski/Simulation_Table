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


// ==================================================
// STATE
// ==================================================

let planTime = {
  start: null,

  timeZoneLetter: "B",
  timeZoneOffset: 2,

  operationalTime: {
    code: "D",
    offset: 0
  }
};


// ==================================================
// DATE
// ==================================================

/**
 * Tworzy lokalną datę z pól formularza.
 */
function createDate(
  dateValue,
  timeValue
) {
  if (
    !dateValue ||
    !timeValue
  ) {
    return null;
  }

  const [
    year,
    month,
    day
  ] = dateValue
    .split("-")
    .map(Number);

  const [
    hours,
    minutes
  ] = timeValue
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

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null;
  }

  return date;
}


// ==================================================
// OPERATIONAL TIME
// ==================================================

function normalizeOperationalCode(
  code
) {
  if (
    typeof code !== "string"
  ) {
    return "D";
  }

  const normalized =
    code
      .trim()
      .toUpperCase()
      .slice(0, 5);

  return normalized || "D";
}


/**
 * Formatuje numer doby operacyjnej.
 *
 * D + 0  -> D
 * D + 1  -> D+1
 * D - 2  -> D-2
 */
export function formatOperationalDay(
  code,
  offset = 0
) {
  const normalizedCode =
    normalizeOperationalCode(
      code
    );

  const numericOffset =
    Number(offset);

  if (
    !Number.isFinite(
      numericOffset
    )
  ) {
    return normalizedCode;
  }

  const wholeOffset =
    Math.trunc(
      numericOffset
    );

  if (
    wholeOffset === 0
  ) {
    return normalizedCode;
  }

  if (
    wholeOffset > 0
  ) {
    return (
      `${normalizedCode}+${wholeOffset}`
    );
  }

  return (
    `${normalizedCode}${wholeOffset}`
  );
}


/**
 * Oblicza różnicę DOB KALENDARZOWYCH
 * pomiędzy dwiema datami.
 *
 * Godzina nie ma znaczenia.
 *
 * Przykład:
 *
 * start:
 * 26.09 06:00
 *
 * current:
 * 26.09 23:00 -> 0
 * 27.09 00:00 -> 1
 * 28.09 00:00 -> 2
 *
 * Używamy Date.UTC, aby przejście czasu
 * letniego / zimowego nie zaburzało
 * liczby dób kalendarzowych.
 */
function getCalendarDayDifference(
  startDate,
  currentDate
) {
  const startDay =
    Date.UTC(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate()
    );

  const currentDay =
    Date.UTC(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate()
    );

  const millisecondsPerDay =
    24 * 60 * 60 * 1000;

  return Math.round(
    (
      currentDay -
      startDay
    ) /
    millisecondsPerDay
  );
}


/**
 * Zwraca oznaczenie doby operacyjnej
 * dla wskazanego momentu.
 *
 * WAŻNE:
 *
 * Doba operacyjna zmienia się wraz
 * z dobą kalendarzową o godzinie 00:00.
 *
 * Nie liczymy kolejnych 24 godzin
 * od czasu rozpoczęcia symulacji.
 *
 * Przykład:
 *
 * start:
 * 26.09 06:00
 *
 * czas operacyjny startu:
 * D+2
 *
 * 26.09 06:00 -> D+2
 * 26.09 23:59 -> D+2
 * 27.09 00:00 -> D+3
 * 27.09 23:59 -> D+3
 * 28.09 00:00 -> D+4
 */
export function getOperationalDayLabel(
  date
) {
  if (
    !planTime.start ||
    !(date instanceof Date) ||
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  const dayDifference =
    getCalendarDayDifference(
      planTime.start,
      date
    );

  const offset =
    planTime.operationalTime.offset +
    dayDifference;

  return formatOperationalDay(
    planTime.operationalTime.code,
    offset
  );
}


// ==================================================
// SET PLAN TIME
// ==================================================

/**
 * Ustawia czas początkowy symulacji.
 */
export function setPlanTime({
  dateValue,
  timeValue,
  timeZoneLetter,

  operationalCode = "D",
  operationalOffset = 0
}) {
  const start =
    createDate(
      dateValue,
      timeValue
    );

  if (!start) {
    return null;
  }

  const offset =
    TIME_ZONES[
      timeZoneLetter
    ];

  if (
    offset === undefined
  ) {
    return null;
  }

  const parsedOperationalOffset =
    Number(
      operationalOffset
    );

  if (
    !Number.isFinite(
      parsedOperationalOffset
    )
  ) {
    return null;
  }

  planTime = {
    start,

    timeZoneLetter,
    timeZoneOffset: offset,

    operationalTime: {
      code:
        normalizeOperationalCode(
          operationalCode
        ),

      offset:
        Math.trunc(
          parsedOperationalOffset
        )
    }
  };

  return getPlanTime();
}


// ==================================================
// GET PLAN TIME
// ==================================================

/**
 * Pobiera aktualne ustawienie czasu.
 *
 * Zwracamy kopię Date, żeby inny moduł
 * przypadkiem nie zmodyfikował naszego stanu.
 */
export function getPlanTime() {
  return {
    start:
      planTime.start
        ? new Date(
            planTime.start.getTime()
          )
        : null,

    timeZoneLetter:
      planTime.timeZoneLetter,

    timeZoneOffset:
      planTime.timeZoneOffset,

    operationalTime: {
      ...planTime.operationalTime
    }
  };
}


// ==================================================
// DTG
// ==================================================

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


// ==================================================
// TIME ZONE LABEL
// ==================================================

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

  if (
    timeZoneOffset === 0
  ) {
    return (
      `${timeZoneLetter} — UTC±0`
    );
  }

  if (
    timeZoneOffset > 0
  ) {
    return (
      `${timeZoneLetter} — UTC+${timeZoneOffset}`
    );
  }

  return (
    `${timeZoneLetter} — UTC−${Math.abs(
      timeZoneOffset
    )}`
  );
}