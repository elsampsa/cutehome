# CuteHome

This is CuteHome - your modular content manager / homepage engine.

It looks like [this](https://www.iki.fi/sampsa.riikonen)

It's frontend-only (no backends, databases and whatnots) and is built using [CuteFront](https://elsampsa.github.io/cutefront/_build/html/index.html) - the pure Javascript frontend framework.

Hack as you wish, remove my personal stuff, put in place yours instead and just run `deploy.sh` -> you will get a nice homepage in github pages.

## Features

- Write markdown `.md` files only 🎉
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

## Deploy to Github pages

*can be clunky and slow and sometimes deployment stalls*

To deploy your version of the homepage, do this:
```bash
deploy.sh # removes docs/, then copies app/ -> docs/
git add docs
```

After that you still need to push into github and in github web UI activate the github page.

## Deploy to Cloudflare 

*excellent, fast and free!*  💥

- Open an account at `cloudflare.com`
- When choosing the web-framework, choose "none" 😀
- Deployment command: `./deploy.sh`
- Build output directory: `docs`
- All automagic: always when you push to your repo, the new version is deployed 🚀

## Copyright

(c) 2026 Sampsa Riikonen

## License

WTFPL
