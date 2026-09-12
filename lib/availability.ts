import {
    availabilityConfig,
    type DaySchedule,
  } from "./availability-config";
  
  type WeekDay =
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
    | "sunday";
  
  export type AvailableSlot = {
    time: string;
    available: boolean;
  };
  
  function getWeekDay(date: Date): WeekDay {
    const days: WeekDay[] = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
  
    return days[date.getDay()];
  }
  
  function timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(":").map(Number);
  
    return hours * 60 + minutes;
  }
  
  function minutesToTime(totalMinutes: number): string {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
  
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}`;
  }
  
  function generateSlotsForDay(schedule: DaySchedule): AvailableSlot[] {
    if (!schedule.enabled) {
      return [];
    }
  
    const startMinutes = timeToMinutes(schedule.start);
    const endMinutes = timeToMinutes(schedule.end);
  
    const sessionDuration = availabilityConfig.sessionDurationMinutes;
    const interval = availabilityConfig.slotIntervalMinutes;
  
    const slots: AvailableSlot[] = [];
  
    for (
      let current = startMinutes;
      current + sessionDuration <= endMinutes;
      current += interval
    ) {
      slots.push({
        time: minutesToTime(current),
        available: true,
      });
    }
  
    return slots;
  }
  
  export function getAvailableSlots(dateString: string): AvailableSlot[] {
    const date = new Date(`${dateString}T12:00:00`);
  
    if (Number.isNaN(date.getTime())) {
      return [];
    }
  
    const weekDay = getWeekDay(date);
  
    const schedule = availabilityConfig.weeklySchedule[weekDay];
  
    return generateSlotsForDay(schedule);
  }