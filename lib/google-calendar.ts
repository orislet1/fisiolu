import { google } from "googleapis";

const calendarId = process.env.GOOGLE_CALENDAR_ID;
const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!calendarId) {
  throw new Error("Falta GOOGLE_CALENDAR_ID en .env.local");
}

if (!clientEmail) {
  throw new Error("Falta GOOGLE_SERVICE_ACCOUNT_EMAIL en .env.local");
}

if (!privateKey) {
  throw new Error("Falta GOOGLE_PRIVATE_KEY en .env.local");
}

const auth = new google.auth.JWT({
  email: clientEmail,
  key: privateKey,
  scopes: ["https://www.googleapis.com/auth/calendar"],
});

export const calendar = google.calendar({
  version: "v3",
  auth,
});

export const GOOGLE_CALENDAR_ID = calendarId;