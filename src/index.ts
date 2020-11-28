import { loadICal, ICal, EventInstance } from "./iCal";
export { ICal, EventInstance }

export function readICal(icalText: string) {
  return loadICal(icalText)
}