import { NextRequest, NextResponse } from "next/server";

import { availabilityConfig } from "@/lib/availability-config";
import {
  calendar,
  GOOGLE_CALENDAR_ID,
} from "@/lib/google-calendar";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      nombre,
      telefono,
      distrito,
      direccion,
      area,
      semanas,
      servicio,
      motivo,
      fecha,
      hora,
      mensaje,
    } = body;

    if (
      !nombre ||
      !telefono ||
      !distrito ||
      !direccion ||
      !area ||
      !servicio ||
      !motivo ||
      !fecha ||
      !hora
    ) {
      return NextResponse.json(
        {
          ok: false,
          message: "Faltan datos obligatorios.",
        },
        { status: 400 }
      );
    }

    const sessionDuration =
      availabilityConfig.sessionDurationMinutes;

    const travelBuffer =
      availabilityConfig.travelBufferMinutes;

    const requestedStart = new Date(
      `${fecha}T${hora}:00-05:00`
    );

    const requestedEnd = new Date(
      requestedStart.getTime() +
        sessionDuration * 60_000
    );

    const checkStart = new Date(
      requestedStart.getTime() -
        travelBuffer * 60_000
    );

    const checkEnd = new Date(
      requestedEnd.getTime() +
        travelBuffer * 60_000
    );

    const freeBusyResponse =
      await calendar.freebusy.query({
        requestBody: {
          timeMin: checkStart.toISOString(),
          timeMax: checkEnd.toISOString(),
          timeZone: availabilityConfig.timezone,
          items: [
            {
              id: GOOGLE_CALENDAR_ID,
            },
          ],
        },
      });

    const busy =
      freeBusyResponse.data.calendars?.[
        GOOGLE_CALENDAR_ID
      ]?.busy ?? [];

    if (busy.length > 0) {
      return NextResponse.json(
        {
          ok: false,
          conflict: true,
          message:
            "Ese horario acaba de ocuparse. Elige otra hora disponible.",
        },
        { status: 409 }
      );
    }

    const description = `
Paciente: ${nombre}
WhatsApp: ${telefono}
Distrito: ${distrito}
Dirección: ${direccion}
Área: ${area}
${area === "Embarazo" ? `Semanas de embarazo: ${semanas || "No indicado"}\n` : ""}
Servicio: ${servicio}
Motivo: ${motivo}

Mensaje adicional:
${mensaje || "Sin mensaje adicional"}
    `.trim();

    const event =
      await calendar.events.insert({
        calendarId: GOOGLE_CALENDAR_ID,
        requestBody: {
          summary: `FISIOLU - ${nombre}`,
          description,
          location: `${direccion}, ${distrito}`,
          start: {
            dateTime: `${fecha}T${hora}:00-05:00`,
            timeZone: availabilityConfig.timezone,
          },
          end: {
            dateTime: new Date(
              requestedEnd
            ).toISOString(),
            timeZone: availabilityConfig.timezone,
          },
        },
      });

    return NextResponse.json({
      ok: true,
      message: "Reserva creada correctamente.",
      eventId: event.data.id,
    });
  } catch (error) {
    console.error(
      "Error creando reserva:",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        message:
          "No se pudo crear la reserva.",
      },
      { status: 500 }
    );
  }
}