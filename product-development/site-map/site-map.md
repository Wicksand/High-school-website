# Thunder Ridge Football Site Map

## Purpose

This folder documents the current and planned pages for the Thunder Ridge Football website. Each page has its own Markdown file describing its purpose, functionality, and visual design.

## Current Site Map

The site currently has three public-facing pages. The home page contains anchor-based sections; the storefront and gallery are separate pages.

| Page | Status | Summary |
| --- | --- | --- |
| [Home](home.md) | Current | Main public page for announcements, schedules, programs, registration, and club information. |
| Storefront (`storefront.html`) | Current | Spiritwear catalog and reservation request dialog. |
| Gallery (`gallary.html`) | Current | Photo gallery with an enlarged photo viewer. |

All three pages load their shared header, navigation, and footer from `all.js`, with shared styling in `all.css`.

## Planned Pages

Potential future pages may include separate program or team pages and an administrator content-management page. These should remain flexible until the school district confirms the final project scope.

## Organization Notes

- The homepage currently contains the sections for updates, schedules, programs, registration, and about/community information.
- The shared header links to Home, Storefront, and Gallery; the homepage also has its anchor-based Page Menu.
- The updates section loads announcement content from a published Google Sheet through `script.js`.
- The schedules section embeds a Google Calendar and supports List and Calendar view toggles.
- Registration currently links to an external Google Form; the local registration form is commented out.
- Merchandise reservations are active on the Storefront page; administrator content management is not currently active.
- The site should remain mobile-friendly, consistent, and easy to expand if the project becomes a larger district site.
