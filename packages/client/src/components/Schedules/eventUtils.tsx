import { EventInput } from "@fullcalendar/react";

let eventGuid = 0;
let todayStr = new Date(2021, 10, 21).toISOString().replace(/T.*$/, ""); // 2021-11-21

export const INITIAL_EVENTS: EventInput[] = [
  {
    id: createEventId(),
    title: "All-day event",
    start: todayStr,
  },
  {
    id: createEventId(),
    title: "Timed event",
    start: todayStr + "T12:00:00",
  },
];

export function createEventId() {
  return String(eventGuid++);
}
