const fs = require("node:fs");
const path = require("node:path");

const calendarUrl =
  process.env.CALENDAR_ICS_URL ||
  "https://calendar.google.com/calendar/ical/46n8rnvi72qkqhpktso1nb0a5g%40group.calendar.google.com/public/basic.ics";

const outputPath = path.join(__dirname, "..", "public", "calendar-events.json");

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

async function main() {
  const response = await fetch(calendarUrl);
  if (!response.ok) {
    throw new Error(`Calendar request failed: ${response.status}`);
  }

  const ics = await response.text();
  const events = parseCalendar(ics)
    .filter((event) => event.end ? new Date(event.end) >= startOfToday() : new Date(event.start) >= startOfToday())
    .sort((left, right) => new Date(left.start) - new Date(right.start))
    .slice(0, 40);

  fs.writeFileSync(
    outputPath,
    JSON.stringify(
      {
        updatedAt: new Date().toISOString(),
        events
      },
      null,
      2
    ) + "\n"
  );
}

function parseCalendar(ics) {
  return unfoldLines(ics)
    .join("\n")
    .split("BEGIN:VEVENT")
    .slice(1)
    .map((block) => block.split("END:VEVENT")[0])
    .map(parseEvent)
    .filter((event) => event.title && event.start);
}

function parseEvent(block) {
  const fields = {};

  for (const line of block.split(/\r?\n/)) {
    const separator = line.indexOf(":");
    if (separator === -1) {
      continue;
    }

    const rawName = line.slice(0, separator);
    const value = decodeIcsText(line.slice(separator + 1));
    const [name, ...params] = rawName.split(";");
    const key = name.toUpperCase();
    fields[key] = fields[key] || [];
    fields[key].push({ value, params });
  }

  const startField = first(fields.DTSTART);
  const endField = first(fields.DTEND);

  return {
    title: valueOf(fields.SUMMARY) || "Untitled event",
    start: parseIcsDate(startField),
    end: parseIcsDate(endField),
    allDay: isAllDay(startField),
    location: valueOf(fields.LOCATION)
  };
}

function unfoldLines(ics) {
  return ics.replace(/\r\n[ \t]/g, "").replace(/\n[ \t]/g, "").split(/\r?\n/);
}

function first(values) {
  return values && values[0];
}

function valueOf(values) {
  return values && values[0] ? values[0].value : "";
}

function isAllDay(field) {
  return Boolean(field && field.params.some((param) => param.toUpperCase() === "VALUE=DATE"));
}

function parseIcsDate(field) {
  if (!field || !field.value) {
    return "";
  }

  if (isAllDay(field)) {
    const value = field.value;
    return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}T00:00:00`;
  }

  const value = field.value;
  if (value.endsWith("Z")) {
    return new Date(
      `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}T${value.slice(9, 11)}:${value.slice(11, 13)}:${value.slice(13, 15)}Z`
    ).toISOString();
  }

  return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}T${value.slice(9, 11)}:${value.slice(11, 13)}:${value.slice(13, 15)}`;
}

function decodeIcsText(value) {
  return value
    .replace(/\\n/g, " ")
    .replace(/\\,/g, ",")
    .replace(/\\;/g, ";")
    .replace(/\\\\/g, "\\")
    .trim();
}

function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}
