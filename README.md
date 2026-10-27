# Yitzchok Cheshin — Portfolio

A static design portfolio with project pages, video thumbnails, and responsive layouts.

## Preview locally

Run `python3 -m http.server 5173 --bind 127.0.0.1` and open `http://127.0.0.1:5173/`.

## Edit the portfolio

- `content.js` contains the name, contact details, biography, and project thumbnails.
- `app.js` contains navigation, video playback, and shared interactions.
- `styles.css` contains custom styles and shared rounded media treatment.
- `projects/<slug>/project.json`, `copy.md`, and numbered `media/` files contain project content.
- `templates/project.html` and `project-page.css` define the shared project layout.

After changing project content, run `python3 scripts/build-projects.py`.
Python 3 and Node.js are required. See `PROJECT_UPLOAD_GUIDE.md` for the content workflow.

## Build for hosting

Run `python3 scripts/build-hosted.py` to prepare public pages and assets in `dist/` and check local asset links.
Large videos should be web-optimized before publishing. If a video exceeds 24 MiB, the script can optimize the hosted copy when FFmpeg is installed.

## Publish on GitHub Pages

The workflow in `.github/workflows/pages.yml` builds and publishes on pushes to `main`.
In the repository's **Settings → Pages**, set **Source** to **GitHub Actions**.
Then run the **Publish portfolio** workflow or push an update to `main`.
All site paths are relative so the portfolio can be hosted beneath `/portfolio-2026/`.

Original media masters, replaced assets, temporary files, and preview screenshots are excluded from the publish-ready repository copy.
