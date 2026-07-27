window.TalleyDashboardConfig = {
  locationLabel: "HCSO Range",
  clock: {
    hour12: false
  },
  weather: {
    latitude: 34.2979,
    longitude: -83.8241,
    timezone: "America/New_York",
    temperatureUnit: "fahrenheit",
    windSpeedUnit: "mph"
  },
  refreshMinutes: 15,
  pageReloadMinutes: 60,
  calendar: {
    title: "HCSO Training",
    dataUrl: "./calendar-events.json",
    maxEvents: 6,
    maxEventsPerDay: 3,
    visibleWeeks: 5
  },
  screen: {
    enableFullscreen: true,
    enableWakeLock: true,
    enablePixelShift: true,
    dimNightMode: true,
    dimStartHour: 22,
    dimEndHour: 6
  }
};
