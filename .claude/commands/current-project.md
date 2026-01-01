---
description: Load project context
---
We're building a home-page engine.
This is javascript only - no backend.
We want to host this for free in github as plain javascript code.
The framework we are using is CuteFront.  Please read cute-frontend.md in this very directory for more information.
That file refers to a layout.html where we use sidebarwidget whose signals are connected to a containerwidget to show different parts of the SPA.  Lets use the same scheme.

The idea is that its easy to add more sections and subsections, etc.

Each subpage should be an markdown file, so we'd be using "marked.js" from the base library.  In the markdown files we'd like to refer images that
reside in the server.  Not totally sure how this will work.

Our first objective is to create a simple page with just two main sections: "About me" and "OpenSource".  Both should render a different md file.

Lets read some code and plan first. :)

We can keep on developing the app in the landing.html file.

## Status Update

**COMPLETED**: Router pattern implemented with explicit widget architecture!

### Working Features:
- Updated `MarkedWidget` ([lib/render/marked.js](lib/render/marked.js:1)) to use `autoElement()` and support dynamic creation
- Created generic `MarkdownSection` widget ([app/lib/sections/markdownsection.js](app/lib/sections/markdownsection.js:1)) that uses `MarkedWidget` as a subwidget
- **NEW**: Implemented `SiteRouter` ([app/lib/siterouter.js](app/lib/siterouter.js:1)) for centralized navigation management
- **NEW**: Enhanced `MarkdownSection` with navigation link support (nav: prefix in markdown)
- Updated [landing.html](app/landing.html:1) to use router pattern - no more manual signal wiring!
- Router automatically builds sidebar hierarchy from config
- Router creates flat map of all sections for quick lookup
- Router wires all signals bidirectionally (sidebar clicks + markdown nav links)
- Two sections working: "About Me" and "OpenSource", both rendering from .md files
- Content files in app/content/ directory
- Tested successfully via HTTP server

### Architecture:
- **Explicit widget definition**: All widgets are created explicitly and passed in config (no auto-creation from content paths)
- **Recursive configuration**: Uniform "sections" key at all nesting levels for arbitrary depth
- **Centralized navigation**: `router.navigate(id)` can be called from anywhere
- **Infinite loop protection**: Router prevents redundant navigation to same section

**Next steps**: Add hierarchical subsections, create more content with nav links, test image support in markdown files.




