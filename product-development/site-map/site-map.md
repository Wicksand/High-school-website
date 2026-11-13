# Thunder Ridge Football Site Map

## Purpose

This folder documents the current and planned pages for the Thunder Ridge Football website. Each page has its own Markdown file describing its purpose, functionality, and visual design.

## Current Site Map

The site currently has one public-facing page. Its sections are organized as anchors within the homepage rather than as separate pages.

| Page | Status | Summary |
| --- | --- | --- |
| [Home](home.md) | Current | Main public page for announcements, schedules, programs, registration, and club information. |

The repository also contains `storefromt.html` and `gallary.html` with their related CSS and JavaScript files. These are not linked from the homepage and are not currently part of the public site navigation, so they are treated as inactive/unfinished page work rather than current public pages.

## Planned Pages

No additional pages have been approved yet. Potential future pages may include a dedicated merchandise reservation page, separate program or team pages, and an administrator content-management page. These should remain flexible until the school district confirms the final project scope.

## Organization Notes

- The homepage currently contains the sections for updates, schedules, programs, registration, and about/community information.
- The header's primary navigation links are currently commented out, so the visible navigation is the mobile menu control and the homepage's anchor-based quick-link strip.
- The updates section loads announcement content from a published Google Sheet through `script.js`.
- The schedules section embeds a Google Calendar and supports List and Calendar view toggles.
- Registration currently links to an external Google Form; the local registration form is commented out.
- Merchandise reservations and administrator content management are planned but are not currently active on the homepage.
- The site should remain mobile-friendly, consistent, and easy to expand if the project becomes a larger district site.
