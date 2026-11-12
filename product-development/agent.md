# Product Development Agent Guide

This file explains how an AI agent should navigate the `product-development` folder when working on the Thunder Ridge High School Football Booster Club website.

## Mandatory Change-Response Rule

Whenever any file or folder inside `product-development/` is created, edited, moved, or removed, the AI must immediately reread this `agent.md` file before taking the next product-development action. This rule applies even when the change is small or the AI has already read this guide earlier in the task.

After rereading this guide, the AI must:

1. Identify which product-development area was changed.
2. Read the relevant instructions and source documents for that area.
3. Check whether the change affects related requirements, meeting notes, site-map documentation, tests, demos, or schedules.
4. Keep this guide and any affected navigation guides accurate when the folder structure or workflow changes.

The AI should not rely on memory of an earlier reading of this guide when continuing work after a product-development change.

## Start Here

Read the files in this order when broad project context is needed:

1. `about-product/about-product.md` — overall product purpose, audiences, client context, and goals.
2. `site-requirements/site-requirements.md` — functional, usability, security, and acceptance requirements.
3. `product-schedule/product-schedule.md` — project timeline, development phases, milestones, and testing requirement.
4. `meeting-notes/` — client and team discussions. Read `meeting-notes/AI-NAVIGATION.md` first, then the relevant dated or numbered notes.
5. `site-map/site-map.md` — current and planned page structure. Read the linked page document when working on a specific page.
6. `tests/` — usability-testing records and summaries for each project phase. Read `tests/README.md` first.
7. `demos/` — prototype implementations and design briefs. Read the relevant `design.md` before changing a demo, then inspect its `index.html`, `styles.css`, and `script.js`.

## Folder Guide

- `about-product/`: stable project background and product direction.
- `site-requirements/`: requirements that implementation and testing should satisfy.
- `product-schedule/`: schedule, phases, presentation milestones, and cross-phase testing expectations.
- `meeting-notes/`: source notes from client and team meetings.
- `site-map/`: current and planned page documentation, including page functionality, visual design, and mobile/organization priorities.
- `tests/`: one test Markdown file per project phase, plus testing-folder instructions.
- `demos/`: presentation prototypes, design briefs, QR codes, and demo assets.

## Working Rules

- Treat the requirements and client-confirmed meeting notes as the source of truth for scope.
- Check the schedule before interpreting a phase or milestone.
- Read the applicable test file before changing a feature that has already received tester feedback.
- Keep sample/demo behavior distinct from production functionality. The current demos do not send forms or provide a real secured admin system.
- Do not treat sample events, merchandise, or copy as confirmed client content.
- When changing the homepage or planning a new page, update the corresponding document in `site-map/` so the sitemap and page specifications remain current.
- The current site has one public-facing page, documented in `site-map/home.md`; its sections are organized as homepage anchors rather than separate pages.
- When new evidence conflicts with older notes, preserve the history and record the newer information in the appropriate note or test file.
- Avoid placing implementation code or unrelated drafts in this folder.
