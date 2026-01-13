# CuteHome

This is CuteHome - your modular content manager / homepage engine.

It looks like [this](https://elsampsa.github.io/cutehome)

It's frontend-only (no backends, databases and whatnots) and is built using [CuteFront](https://elsampsa.github.io/cutefront/_build/html/index.html) - the pure Javascript frontend framework.

Hack as you wish, remove my personal stuff, put in place yours instead and just run `deploy.sh` -> you will get a nice homepage in github pages.

## Features

- Write markdown `.md` files only
- You can cross-reference/hyperlink your md files
- A photo gallery
- Create a hierarchical directory structure with sections, subsections, etc.
- Mobile friendly

## Instructions

- Clone this repository
- Initialize git submodules (CuteFront library):
  ```bash
  git submodule update --init --recursive
  ```
- Set this folder as your project folder in vscode.
- Edit [app/landing.html](app/landing.html).  That's about it.  The code is so obvious that no documentation is needed :)
- If you want to visualize your work-in-progress, choose as an active file [app/landing.html](app/landing.html) and launch a debug session with the target `Cutefront HTML file://`.

To copy stuff from `app/` -> into `docs/` and so that it deploys as a github page, run `deploy.sh`

After that you still need to commit `docs/`, push into github and in github web UI activate the github page.

## Copyright

(c) 2026 Sampsa Riikonen

## License

WTFPL
