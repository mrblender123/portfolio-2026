# Add a project in one batch

The layout is shared by every project. There is no need to design each page again or send individual elements one at a time.

## What to send

Put all the project's images/videos and one text document into a folder. Number media in display order. You can send an ordinary Word document or plain text; `copy.md` is the ready-to-fill format used by the importer.

```text
Torah Times/
  copy.md
  01-cover.png
  02-research.png
  03-pair-a.png
  03-pair-b.mp4
  04-gallery-01.png
  04-gallery-02.png
  04-gallery-03.png
  05-final.mp4
```

- `01` is the opening image or video. The complete cover is shown without cropping.
- One file with a number becomes a full-width visual.
- Two files with the same number and `-pair-a` / `-pair-b` become a desktop pair, stacked on mobile.
- Multiple files with the same number become a swipeable gallery with arrow and keyboard controls.
- A numbered text heading without media creates a text-only section.
- Images: PNG, JPG, WebP, AVIF, GIF, or SVG. Videos: MP4 or WebM. Videos play muted and loop, pause when out of view, and respect reduced motion.
- Keep website copy as text. Designed compositions, mockups, renders, and artwork can be exported as complete images.

## One text document

Use these headings. Leave any that do not apply empty; they will not appear on the page.

```markdown
# Torah Times

## Problem
What challenge did the project address?

## Solution
What is the idea behind your solution?

## My involvement
What did you do? Who else should be credited?

## Deliverables
- Brand identity
- Animation
- 3D design

## Type
Client project / personal project

## 02 — Research & rationale
Your explanation for media group 02.

## 03 — Design development
Your explanation for media group 03.

## 04 — Process
Your explanation for the gallery.

## 05 — Design & deliverables
Your explanation for the final work.
```

You only need to send the folder and document. The site configuration, build command, and card connection can be handled for you.

## Local implementation

- `templates/project.html`: shared page shell and navigation.
- `project-page.css`: shared reference-based layout, fonts, spacing, and breakpoints.
- `project-page.js`: accessible galleries. Shared `app.js` manages navigation and video playback.
- `projects/<slug>/project.json`: title, output filename, portfolio card id, optional fallback cover, and neighboring projects.
- `projects/<slug>/copy.md`: all project copy in one place.
- `projects/<slug>/media/`: numbered images and videos.
- `scripts/build-projects.py`: validates local file paths and builds static pages.

Build all projects:

```sh
python3 scripts/build-projects.py
```

Build only Torah Times:

```sh
python3 scripts/build-projects.py torah-times
```

Numbered cover media takes priority over the fallback cover in `project.json`. Additional layout control is available via a `sections` array in `project.json`, with `layout` (`stack`, `pair`, `gallery`, `text`), `heading`, `body`, and `media`. A media item can be a local path or an object containing `src`, `alt`, optional `caption`, and a video `poster` image. The HTML escapes project copy and creates fresh pages without modifying the homepage, About page, or source assets.

`project-template-preview.html` is an isolated layout demonstration with neutral sample content. The actual Torah Times page only displays supplied content. Its overview and further sections will appear when you provide them.

## Reference structure retained

The saved OOOOmami project supplies the title font (Real Head Pro Medium), section/copy fonts (PP Neue Montreal), 1200 px outer column, 80/40/24 px side padding, 48/40 px project titles, 20/18 px section headings, 18/16 px copy, desktop 2:1 overview, thin section dividers, 10 px media gutters, process gallery, and previous/next project navigation. The supplied Torah Times cover keeps its own aspect ratio so its magazines and display stand remain fully visible.


## Media edges and transparency

All images and videos use the shared 10 px media corner radius, including on mobile. Project media frames have transparent backgrounds. A cover can specify a `frame` in `project.json` to exclude transparent outer padding from its display; the original PNG and its alpha remain unchanged. This lets rounded corners follow the visible artwork. Keep this treatment for future media additions.


For a numbered video that needs a poster, soundtrack controls, or descriptive text, add its filename under `mediaOptions` in `project.json`. These options preserve automatic ordering when more files are added. Torah Times' main motion film uses this for its poster, native playback/audio/fullscreen controls, and 1920 × 1080 dimensions. Its soundtrack is preserved; it starts muted for autoplay.

For a portrait video, set `presentation` to `portrait` alongside its original `width` and `height` in `mediaOptions`. It displays centered at up to 400 px wide and 75% of the viewport height on desktop, and uses the available column width on mobile. The original aspect ratio and shared rounded corners are preserved.

Set `presentation` to `compact` for a centered media frame capped at 600 px wide on desktop. On mobile it uses the available page width. Section headings and dividers retain their full width.

Set `ambient` to `true` on a single video with a `poster` to add a subtle desktop glow. This uses a blurred, softly faded copy of the poster behind the player, with no extra video playback or opaque backdrop.
