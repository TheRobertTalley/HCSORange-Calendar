# HCSO Range Calendar

A static smart-display page for Fire TV. The current version shows a large clock, weather, and upcoming public range calendar events.

## Current Display

- Clock and date
- Current weather
- Five-day forecast
- Upcoming calendar events
- Night dimming
- Subtle pixel shift for long-running TV display

## Privacy Model

This repository is private so random internet users cannot edit source files, workflows, or update logic.

The website itself is public once GitHub Pages is enabled. Anything placed in `public/` can be downloaded by a visitor, so do not put secrets, edit links, admin URLs, private notes, or hidden calendar fields there.

The calendar updater publishes only the display-safe fields into `public/calendar-events.json`: title, start, end, all-day state, and location.

## GitHub Pages

This repo follows the same static Pages pattern as `Stingray-Web-Flasher`, but deploys only the `public/` folder as the site artifact.

Enable Pages once in the repository settings:

1. Go to Settings > Pages.
2. Under Build and deployment, choose GitHub Actions.
3. Save.
4. Run the `Deploy GitHub Pages` workflow, or push a change to `main`.

After GitHub finishes publishing, the dashboard opens at:

`https://theroberttalley.github.io/HCSORange-Calendar/`

## Fire TV

Open the Pages URL in the Fire TV Silk browser, bookmark it, and use the browser full-screen view.

## Handoff

For long-term handoff, an organization is cleaner than a shared personal account. Transfer this private repo to the organization, give range staff maintainer access, and keep the Pages site public while source/edit access stays controlled.
