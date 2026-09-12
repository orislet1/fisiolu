export type DaySchedule = {
    enabled: boolean;
    start: string;
    end: string;
  };
  
  export type WeeklySchedule = {
    monday: DaySchedule;
    tuesday: DaySchedule;
    wednesday: DaySchedule;
    thursday: DaySchedule;
    friday: DaySchedule;
    saturday: DaySchedule;
    sunday: DaySchedule;
  };
  
  export type AvailabilityConfig = {
    timezone: string;
  
    // Duración real de una sesión
    sessionDurationMinutes: number;
  
    // Tiempo máximo reservado para desplazarse
    travelBufferMinutes: number;
  
    // Cuánto dura cada intervalo que mostraremos al paciente
    slotIntervalMinutes: number;
  
    // Anticipación mínima para poder reservar
    minimumBookingNoticeHours: number;
  
    // Cuántos días hacia adelante puede reservar una persona
    bookingWindowDays: number;
  
    // ¿Se puede atender en feriados?
    allowHolidays: boolean;
  
    weeklySchedule: WeeklySchedule;
  };
  
  export const availabilityConfig: AvailabilityConfig = {
    timezone: "America/Lima",
  
    sessionDurationMinutes: 60,
  
    travelBufferMinutes: 60,
  
    slotIntervalMinutes: 60,
  
    minimumBookingNoticeHours: 3,
  
    bookingWindowDays: 30,
  
    allowHolidays: false,
  
    weeklySchedule: {
      monday: {
        enabled: true,
        start: "08:00",
        end: "20:00",
      },
  
      tuesday: {
        enabled: true,
        start: "08:00",
        end: "20:00",
      },
  
      wednesday: {
        enabled: true,
        start: "08:00",
        end: "20:00",
      },
  
      thursday: {
        enabled: true,
        start: "08:00",
        end: "20:00",
      },
  
      friday: {
        enabled: true,
        start: "08:00",
        end: "20:00",
      },
  
      saturday: {
        enabled: true,
        start: "08:00",
        end: "20:00",
      },
  
      sunday: {
        enabled: true,
        start: "08:00",
        end: "20:00",
      },
    },
  };