# Home Page

## Status

Current public-facing page: `index.html`

## Purpose

Provide a clear, welcoming starting point for Thunder Ridge football families, players, supporters, and contributors. The homepage should make the most important actions easy to find on both mobile and desktop screens.

## Page Layout From Top to Bottom

The homepage is currently a single page made of vertically ordered sections. The following describes the page from the top of the screen to the bottom:

1. **Site header and navigation** — Loaded with the shared footer from `all.js` and styled with `all.css`. It displays the Thunder Ridge Football brand, a mobile “Site Menu” control, and links to Home, Storefront, and Gallery.
2. **Hero area** — Introduces the football program with the primary message “One Team. One Ridge.” and establishes the team-focused visual identity.
3. **Quick-link strip** — Provides fast access to the main portions of the page: latest update, calendars, teams, registration, and about. It appears below the hero on desktop and above the hero on mobile, where it collapses into a sticky “Page Menu” control after scrolling.
4. **Booster Club updates** — Presents the latest announcement for families and supporters. The current headline and text can be loaded from a published Google Sheet by `script.js`.
5. **Schedules and events** — Displays the Google Calendar embed with List and Calendar viewing options for games and other events.
6. **Programs and teams** — Introduces the High School Football and Grid Kids programs, including their grade ranges and team groupings.
7. **Registration** — Explains the registration process and links users to the current external Google Form. The local registration form markup is currently commented out, so the page does not collect or save registration data itself. This area is one of the page’s primary calls to action.
8. **Merchandise reservations** — Planned section for reserving spiritwear. It is currently inactive/commented out and must remain reservation-only rather than functioning as an online checkout.
9. **About and community section** — Provides a broader message about the football community and supports the public-facing identity of the booster club.
10. **Footer** — Loaded from `all.js` and styled through `all.css`. It closes the page with Thunder Ridge Football Booster Club branding, a link back to the homepage, and external links to the official Thunder Ridge school website and Bonneville School District 93 PowerSchool portal.

The administrator content-management area is also planned, but it is not currently visible as a public homepage section. It should be treated as a future administrative feature rather than part of the current visitor flow.

## Current Functionality

- Displays the Thunder Ridge Football identity and a welcoming hero message.
- Provides quick navigation to updates, calendars, teams, registration, and the About section.
- Shows booster club announcements or general updates, with content loaded from a published Google Sheet when available.
- Embeds a Google Calendar for games and events and allows List/Calendar view switching.
- Introduces the High School Football and Grid Kids programs.
- Links users to the current external Google registration form.
- Includes an about/community section.
- Links to the booster club's Facebook and Instagram profiles.
- Links to the official Thunder Ridge High School website and Bonneville School District 93 PowerSchool portal from the footer.

## Planned Functionality

- Add an active merchandise reservation workflow that is clearly non-transactional.
- Improve schedule navigation for multiple teams and programs.
- Replace or supplement the external registration form with a confirmed, maintained workflow if required.
- Connect announcements and other content to an administrator-managed workflow.
- Keep the page structure flexible if the school district expands the project.

## Visual Design

- Use a consistent Thunder Ridge football identity with strong team-oriented typography and colors.
- Organize content into clearly separated sections with predictable headings and calls to action.
- Prioritize registration and schedules as the active primary actions; merchandise reservations remain planned.
- Use responsive layouts that work comfortably on small mobile screens.
- Keep navigation concise and easy to use, including a mobile menu.
- Maintain consistent spacing, button styles, typography, and visual hierarchy across all sections.

## Mobile and Organization Priorities

- Make the most important links visible without excessive scrolling or visual clutter.
- Ensure buttons, navigation links, and form controls are large enough to use on touchscreens.
- Stack multi-column sections cleanly on narrow screens.
- Keep headings, labels, and calls to action consistent across sections.
- Preserve a clear content order: announcements, schedules, programs, registration, and supporting information.
