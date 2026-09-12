import { NextRequest, NextResponse } from "next/server";

import { getAvailableSlots } from "@/lib/availability";
import { availabilityConfig } from "@/lib/availability-config";
import {
  calendar,
  GOOGLE_CALENDAR_ID,
} from "@/lib/google-calendar";

type BusyPeriod = {
  start: Date;
  end: Date;
};

export async function GET(request: NextRequest) {
  try {
    const date = request.nextUrl.searchParams.get("date");

    if (!date) {
      return NextResponse.json(
        {
          ok: false,
          message: "Debes enviar una fecha.",
        },
        { status: 400 }
      );
    }

    const baseSlots = getAvailableSlots(date);

    const dayStart = new Date(`${date}T00:00:00-05:00`);
    const dayEnd = new Date(`${date}T23:59:59-05:00`);

    const response = await calendar.freebusy.query({
      requestBody: {
        timeMin: dayStart.toISOString(),
        timeMax: dayEnd.toISOString(),
        timeZone: availabilityConfig.timezone,
        items: [
          {
            id: GOOGLE_CALENDAR_ID,
          },
        ],
      },
    });

    const googleBusy =
      response.data.calendars?.[GOOGLE_CALENDAR_ID]?.busy ?? [];

    const travelBuffer = availabilityConfig.travelBufferMinutes;
    const sessionDuration = availabilityConfig.sessionDurationMinutes;

    const blockedPeriods: BusyPeriod[] = googleBusy
      .filter((period) => period.start && period.end)
      .map((period) => {
        const start = new Date(period.start as string);
        const end = new Date(period.end as string);

        return {
          start: new Date(start.getTime() - travelBuffer * 60_000),
          end: new Date(end.getTime() + travelBuffer * 60_000),
        };
      });

    const slots = baseSlots.map((slot) => {
      const slotStart = new Date(`${date}T${slot.time}:00-05:00`);

      const slotEnd = new Date(
        slotStart.getTime() + sessionDuration * 60_000
      );

      const conflicts = blockedPeriods.some((blocked) => {
        return slotStart < blocked.end && slotEnd > blocked.start;
      });

      return {
        time: slot.time,
        available: !conflicts,
      };
    });

    return NextResponse.json({
      ok: true,
      date,
      timezone: availabilityConfig.timezone,
      sessionDurationMinutes: sessionDuration,
      travelBufferMinutes: travelBuffer,
      slots,
    });
  } catch (error) {
    console.error("Error calculando disponibilidad:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "No se pudo calcular la disponibilidad.",
      },
      { status: 500 }
    );
  }
}