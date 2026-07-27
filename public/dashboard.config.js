window.TalleyDashboardConfig = {
  locationLabel: "HCSO Range",
  weather: {
    latitude: 34.2979,
    longitude: -83.8241,
    timezone: "America/New_York",
    temperatureUnit: "fahrenheit",
    windSpeedUnit: "mph"
  },
  refreshMinutes: 15,
  calendar: {
    title: "HCSO Training",
    dataUrl: "./calendar-events.json",
    maxEvents: 6
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
