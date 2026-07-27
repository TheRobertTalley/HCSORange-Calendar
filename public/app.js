(function () {
  "use strict";

  var config = window.TalleyDashboardConfig || {};
  var weatherLoadedAt = null;
  var calendarLoadedAt = null;
  var wakeLock = null;

  var nodes = {
    screen: document.getElementById("screen"),
    locationLabel: document.getElementById("locationLabel"),
    clock: document.getElementById("clock"),
    dateLine: document.getElementById("dateLine"),
    weatherTemp: document.getElementById("weatherTemp"),
    weatherLabel: document.getElementById("weatherLabel"),
    weatherMeta: document.getElementById("weatherMeta"),
    forecastList: document.getElementById("forecastList"),
    calendarTitle: document.getElementById("calendarTitle"),
    calendarStatus: document.getElementById("calendarStatus"),
    eventList: document.getElementById("eventList"),
    refreshStatus: document.getElementById("refreshStatus")
  };

  var weatherCodes = {
    0: "Clear",
    1: "Mostly clear",
    2: "Partly cloudy",
    3: "Cloudy",
    45: "Fog",
    48: "Icy fog",
    51: "Light drizzle",
    53: "Drizzle",
    55: "Heavy drizzle",
    61: "Light rain",
    63: "Rain",
    65: "Heavy rain",
    71: "Light snow",
    73: "Snow",
    75: "Heavy snow",
    80: "Light showers",
    81: "Showers",
    82: "Heavy showers",
    95: "Thunderstorms"
  };

  function start() {
    nodes.locationLabel.textContent = config.locationLabel || "Home";
    updateClock();
    updateScreenMode();
    requestWakeLock();
    refreshWeather();
    refreshCalendar();

    setInterval(updateClock, 1000);
    setInterval(updateScreenMode, 60 * 1000);
    setInterval(refreshWeather, Math.max(config.refreshMinutes || 15, 5) * 60 * 1000);
    setInterval(refreshCalendar, Math.max(config.refreshMinutes || 15, 5) * 60 * 1000);
    setInterval(pixelShift, 5 * 60 * 1000);

    window.addEventListener("keydown", function (event) {
      if (event.key.toLowerCase() === "r") {
        refreshWeather();
        refreshCalendar();
      }
    });

    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "visible") {
        requestWakeLock();
      }
    });
  }

  function updateClock() {
    var now = new Date();
    nodes.clock.textContent = now.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit"
    });
    nodes.dateLine.textContent = now.toLocaleDateString([], {
      weekday: "long",
      month: "long",
      day: "numeric"
    });
  }

  function refreshWeather() {
    var weather = config.weather || {};
    if (!Number.isFinite(weather.latitude) || !Number.isFinite(weather.longitude)) {
      renderWeatherError("Weather location missing");
      return;
    }

    var params = new URLSearchParams({
      latitude: weather.latitude,
      longitude: weather.longitude,
      timezone: weather.timezone || "auto",
      temperature_unit: weather.temperatureUnit || "fahrenheit",
      wind_speed_unit: weather.windSpeedUnit || "mph",
      current: "temperature_2m,apparent_temperature,weather_code,wind_speed_10m",
      daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max"
    });

    fetch("https://api.open-meteo.com/v1/forecast?" + params.toString())
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Weather request failed");
        }
        return response.json();
      })
      .then(renderWeather)
      .catch(function () {
        renderWeatherError("Weather unavailable");
      });
  }

  function renderWeather(data) {
    var current = data.current || {};
    var daily = data.daily || {};
    var unit = (data.current_units && data.current_units.temperature_2m) || "";
    var windUnit = (data.current_units && data.current_units.wind_speed_10m) || "";

    weatherLoadedAt = new Date();
    nodes.weatherTemp.textContent = Math.round(current.temperature_2m) + unit;
    nodes.weatherLabel.textContent = weatherCodes[current.weather_code] || "Current conditions";
    nodes.weatherMeta.textContent =
      "Feels " + Math.round(current.apparent_temperature) + unit +
      " / Wind " + Math.round(current.wind_speed_10m || 0) + " " + windUnit;

    nodes.forecastList.innerHTML = "";
    (daily.time || []).slice(0, 5).forEach(function (day, index) {
      var item = document.createElement("article");
      item.className = "forecast-day";
      item.innerHTML =
        '<p class="forecast-name">' + escapeHtml(dayName(day, index)) + "</p>" +
        '<strong>' + Math.round(daily.temperature_2m_max[index]) + "/" +
        Math.round(daily.temperature_2m_min[index]) + unit + "</strong>" +
        '<span>' + escapeHtml(weatherCodes[daily.weather_code[index]] || "Forecast") + "</span>" +
        '<span>' + Math.round(daily.precipitation_probability_max[index] || 0) + "% rain</span>";
      nodes.forecastList.appendChild(item);
    });

    nodes.refreshStatus.textContent = "Updated " + weatherLoadedAt.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit"
    });
  }

  function renderWeatherError(message) {
    nodes.weatherTemp.textContent = "--";
    nodes.weatherLabel.textContent = message;
    nodes.weatherMeta.textContent = "Clock is still running";
    nodes.refreshStatus.textContent = message;
  }

  function refreshCalendar() {
    var calendar = config.calendar || {};
    nodes.calendarTitle.textContent = calendar.title || "Upcoming";

    fetch(calendar.dataUrl || "./calendar-events.json", { cache: "no-store" })
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Calendar request failed");
        }
        return response.json();
      })
      .then(function (data) {
        calendarLoadedAt = new Date(data.updatedAt || Date.now());
        renderCalendar(data.events || []);
      })
      .catch(function () {
        nodes.calendarStatus.textContent = "Calendar unavailable";
        nodes.eventList.innerHTML = '<li class="empty-event">Waiting for calendar data</li>';
      });
  }

  function renderCalendar(events) {
    var calendar = config.calendar || {};
    var now = new Date();
    var limit = calendar.maxEvents || 6;
    var upcoming = events
      .map(function (event) {
        return Object.assign({}, event, {
          startDate: new Date(event.start),
          endDate: event.end ? new Date(event.end) : null
        });
      })
      .filter(function (event) {
        return !Number.isNaN(event.startDate.getTime()) && (!event.endDate || event.endDate >= now);
      })
      .sort(function (left, right) {
        return left.startDate - right.startDate;
      })
      .slice(0, limit);

    nodes.eventList.innerHTML = "";
    if (!upcoming.length) {
      nodes.calendarStatus.textContent = "No events";
      nodes.eventList.innerHTML = '<li class="empty-event">Nothing scheduled</li>';
      return;
    }

    upcoming.forEach(function (event) {
      var item = document.createElement("li");
      item.className = "event-item";
      item.innerHTML =
        '<time class="event-date">' + escapeHtml(formatEventDate(event)) + "</time>" +
        '<div class="event-copy">' +
        '<strong>' + escapeHtml(event.title || "Untitled event") + "</strong>" +
        '<span>' + escapeHtml(event.location || formatEventTime(event)) + "</span>" +
        "</div>";
      nodes.eventList.appendChild(item);
    });

    nodes.calendarStatus.textContent = calendarLoadedAt
      ? "Updated " + calendarLoadedAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
      : String(upcoming.length) + " events";
  }

  function formatEventDate(event) {
    return event.startDate.toLocaleDateString([], {
      weekday: "short",
      month: "short",
      day: "numeric"
    });
  }

  function formatEventTime(event) {
    if (event.allDay) {
      return "All day";
    }

    var start = event.startDate.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    if (!event.endDate) {
      return start;
    }

    var end = event.endDate.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    return start + " - " + end;
  }

  function updateScreenMode() {
    var screen = config.screen || {};
    var hour = new Date().getHours();
    var night =
      screen.dimNightMode &&
      (screen.dimStartHour > screen.dimEndHour
        ? hour >= screen.dimStartHour || hour < screen.dimEndHour
        : hour >= screen.dimStartHour && hour < screen.dimEndHour);

    document.body.classList.toggle("night-mode", Boolean(night));
  }

  function pixelShift() {
    if (!config.screen || !config.screen.enablePixelShift) {
      return;
    }

    var x = Math.round(Math.random() * 8 - 4);
    var y = Math.round(Math.random() * 8 - 4);
    nodes.screen.style.transform = "translate(" + x + "px, " + y + "px)";
  }

  function requestWakeLock() {
    if (!config.screen || !config.screen.enableWakeLock || !navigator.wakeLock) {
      return;
    }
    if (wakeLock && !wakeLock.released) {
      return;
    }

    navigator.wakeLock.request("screen")
      .then(function (lock) {
        wakeLock = lock;
        wakeLock.addEventListener("release", function () {
          wakeLock = null;
        });
      })
      .catch(function () {
        wakeLock = null;
      });
  }

  function dayName(day, index) {
    if (index === 0) {
      return "Today";
    }
    if (index === 1) {
      return "Tomorrow";
    }
    return new Date(day + "T12:00:00").toLocaleDateString([], { weekday: "long" });
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  start();
})();
