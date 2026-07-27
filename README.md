# HCSO Range Calendar

A static smart-display page for an Amazon Fire TV or Fire Stick. The dashboard shows a large clock, current weather, a short forecast, and a rolling Monday-Friday training calendar.

Live dashboard:

`https://theroberttalley.github.io/HCSORange-Calendar/`

Short Fire TV entry link:

`https://theroberttalley.github.io/r/`

## Current Display

- 24-hour clock and date
- Current weather
- Three-day forecast
- Three rolling work weeks of public calendar events
- HCSO patch on a black fullscreen background
- Auto-refresh every hour, plus weather/calendar refreshes every 15 minutes
- Wake Lock and fullscreen request on click/tap where the browser supports it
- Subtle pixel shift for long-running TV display

## Privacy Model

Everything published to GitHub Pages is public. Anyone can view the dashboard and download files from `public/`.

Only people with write access to the repository can change what gets published. Do not put secrets, private calendar edit links, admin URLs, private notes, or credentials in `public/`.

The calendar updater publishes only display-safe fields into `public/calendar-events.json`: title, start, end, all-day state, and location.

## Clone This For Your Own Calendar

Use this path when another group wants the same kind of display in their own GitHub account.

1. Create a GitHub account or organization that should own the calendar display.
2. Fork this repository, or create a new repository and copy these files into it.
3. Clone the repository locally:

   ```powershell
   git clone https://github.com/YOUR-ACCOUNT/YOUR-REPO.git
   cd YOUR-REPO
   ```

4. Edit `public/dashboard.config.js`:

   - `locationLabel`: label above the clock.
   - `weather.latitude` and `weather.longitude`: forecast location.
   - `calendar.title`: title shown above the calendar.
   - `calendar.dataUrl`: usually `./calendar-events.json`.

5. Replace the default calendar source in `scripts/build-calendar.js` if you are using a different public `.ics` feed. You can also set the `CALENDAR_ICS_URL` environment variable in a workflow if you do not want to edit the script.
6. Commit and push:

   ```powershell
   git add .
   git commit -m "Configure calendar display"
   git push
   ```

## Enable GitHub Pages

This project deploys the `public/` folder with GitHub Actions.

1. Open the repository on GitHub.
2. Go to Settings > Pages.
3. Under Build and deployment, set Source to GitHub Actions.
4. Save the setting.
5. Push to `main`, or manually run the `Deploy GitHub Pages` workflow.

The page will publish at:

`https://YOUR-ACCOUNT.github.io/YOUR-REPO/`

If the repository is renamed, the URL changes with the repository name.

## Fire TV / Fire Stick Setup

1. Install or open Amazon Silk.
2. Type the short link or full GitHub Pages URL.
3. Bookmark the page in Silk.
4. Click or tap the dashboard once. The page requests fullscreen on click/tap, which hides the normal browser navigation when Silk allows it.
5. Use Silk fullscreen mode if the toolbar is still visible.
6. Leave the display on that page. The dashboard auto-refreshes, and the app also asks the browser for a screen wake lock where supported.

Fire TV power settings can still override a web page. If the screen goes inactive, check Fire TV display/sleep settings and any TV-level sleep timer.

## Handoff Notes

An organization is cleaner than a shared personal account for long-term ownership. Transfer or fork the repository into the organization, give range staff maintainer access, and keep GitHub Pages public while repository write access stays controlled.

To hand this off:

- Give the next maintainer the GitHub repository URL.
- Give them the public calendar `.ics` feed URL.
- Confirm GitHub Pages is set to GitHub Actions.
- Confirm the Fire TV bookmark points to the current Pages URL or short redirect.
