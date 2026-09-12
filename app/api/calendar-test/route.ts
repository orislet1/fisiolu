import { NextResponse } from "next/server";
import {
  calendar,
  GOOGLE_CALENDAR_ID,
} from "@/lib/google-calendar";

export async function GET() {
  try {
    const now = new Date();

    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(now.getDate() + 7);

    const response = await calendar.freebusy.query({
      requestBody: {
        timeMin: now.toISOString(),
        timeMax: sevenDaysLater.toISOString(),
        timeZone: "America/Lima",
        items: [
          {
            id: GOOGLE_CALENDAR_ID,
          },
        ],
      },
    });

    const busy =
      response.data.calendars?.[GOOGLE_CALENDAR_ID]?.busy ?? [];

    return NextResponse.json({
      ok: true,
      message: "Conexión con Google Calendar funcionando",
      busy,
    });
  } catch (error) {
    console.error("Error conectando con Google Calendar:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "No se pudo consultar Google Calendar",
      },
      { status: 500 }
    );
  }
}