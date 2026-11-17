# Website update guide

Keep this open when you edit the site. Every task below says which file to open and what to change.

## 1. How editing works (read once)

1. Go to your repository on github.com.
2. Click the file, then the **pencil icon** (Edit).
3. Change the text, then click **Commit changes**.
4. Wait 1 to 2 minutes and refresh your site. If nothing changes, see section 6.

**Rules for the `_data` files (they end in `.yml`):**
- Keep the **spaces at the start of each line** exactly as they are. Indentation is what the site reads. Use spaces, never the Tab key.
- Keep text inside **"double quotes"**.
- Each item starts with a dash (`-`). To add an item, copy a whole block (every line from one `-` to the next) and edit the copy.
- Lines starting with `#` are notes to you. The site ignores them.

## 2. Which file controls what

| I want to change | Open this file |
|---|---|
| Name, email, phone, office, bio, my photo, profile links | `_data/profile.yml` |
| News on the home page | `_data/news.yml` |
| Research themes (text, bullet points, pictures, videos) | `_data/research.yml` |
| Papers and patents | `_data/publications.yml` |
| Students, alumni, their photos | `_data/team.yml` |
| Courses | `_data/teaching.yml` |
| Talks and workshops | `_data/talks.yml` |
| Menu at the top | `_data/navigation.yml` |
| "Join us" page text | `join.md` |
| CV page | `cv.md` |
| Home page headline and buttons | `index.html` |
| Colours and fonts | `assets/css/style.css` (top of the file) |

## 3. Everyday updates

### Change my details or bio
Open `_data/profile.yml` and edit the text inside the quotes. Fill in `google_scholar`, `linkedin`, `github` or `orcid` with full URLs (starting with `https://`). Empty ones stay hidden.

### Add my photo
1. Open the repository, go to the folder `assets/img/`.
2. Click **Add file → Upload files**, drag in your photo, name it `profile.jpg` first, then Commit.
3. In `_data/profile.yml` set: `photo: "/assets/img/profile.jpg"`

Best size: portrait, about 800 × 1000 pixels, under 500 KB.

### Add a news item
Open `_data/news.yml` and paste this block **at the top**:
```yaml
- date: "Nov 2026"
  text: "One sentence about the news."
  link: "https://optional-link.example"
```
Delete the `link:` line if there is no link. The home page shows the newest 5.

### Add a paper
Open `_data/publications.yml`. Find the right section (preprints, journal, conference, patent) and paste at the **top of that section**:
```yaml
- type: journal              # preprint, journal, conference or patent
  year: 2026
  title: "Paper title"
  authors: "A. Student, **A. Tiwari**, B. Coauthor"
  venue: "Journal or conference name"
  doi: "10.1109/XXXX.2026.1234567"   # optional, no https://doi.org/ in front
  link: "https://arxiv.org/abs/XXXX" # optional
  themes: [manipulation]     # one or more: manipulation, coordination, warehouses, networks
  featured: true             # optional: also shows on the home page
```
Put `**` around your name so it appears in bold. The `themes` line lists the paper under that research theme on the Research page.

### Add a team member
Open `_data/team.yml`, find the right group (for example "Ph.D. students"), and paste inside its `members:` list:
```yaml
    - name: "New Student"
      topic: "Their research topic"
      years: "2026–"
```
To add a **photo**: upload a square-ish photo (about 400 × 400 pixels) to `assets/img/team/`, for example `new-student.jpg`, then add a line:
```yaml
    - name: "New Student"
      topic: "Their research topic"
      years: "2026–"
      photo: "/assets/img/team/new-student.jpg"
```
Without a `photo:` line the site shows their initials.

### Move a student to Alumni
Cut the whole block (from `- name:` to its last line) and paste it under the `Alumni` group. Change `years` to the final range, for example `"2022–26"`.

### Add a new group (for example "Postdoctoral researchers")
At the right place in `_data/team.yml`:
```yaml
- group: "Postdoctoral researchers"
  members:
    - name: "Dr. Name"
      topic: "Topic"
      years: "2026–"
```

### Edit a research theme
Open `_data/research.yml`. `title`, `summary` (home page card), `body` (paragraph on Research page) and `points` (bullets) are all plain text.

### Add a course or talk
Copy an existing block in `_data/teaching.yml` or `_data/talks.yml`, newest first, and edit it.

### Edit the Join us page or CV
Open `join.md` or `cv.md`. These are written in Markdown: `##` is a heading, `**bold**`, `- ` starts a bullet, `[text](https://link)` is a link. Do not delete the lines between the `---` markers at the very top.

## 4. Pictures and videos on research themes

### Step 1: upload the picture
1. In your repository, open the folder `assets/img/`.
2. Click **Add file → Create new file**. In the name box type `research/` and then any name such as `placeholder.txt`. This creates the `research` folder. Commit.
3. Open the new folder, click **Add file → Upload files**, drag in your pictures, and commit.

File names: lowercase, no spaces, use dashes, for example `assembly-cell.jpg`. Keep each under 500 KB (resize large photos first).

### Step 2: list it under the theme
Open `_data/research.yml`. Under the theme you want, add a `media:` list at the **same indentation as `points:`** (two spaces from the left). Example for the first theme:

```yaml
- id: manipulation
  tag: "Robotic manipulation"
  title: "Learning and control for contact-rich manipulation"
  summary: "..."
  body: >-
    ...
  points:
    - "Failure detection and recovery for assembly under task uncertainty"
    - "..."
  media:
    - type: image
      src: "/assets/img/research/assembly-cell.jpg"
      caption: "Dual-arm assembly cell at IIT Madras"
    - type: image
      src: "/assets/img/research/peg-insertion.jpg"
      caption: "Peg-in-hole insertion experiment"
```
`src` must start with `/assets/` and match the file name **exactly, including capital letters and the .jpg ending**.

### Add a YouTube video
```yaml
    - type: youtube
      id: "dQw4w9WgXcQ"
      caption: "Robots carrying a plank together"
```
The `id` is the part of the YouTube link after `v=`. For `https://www.youtube.com/watch?v=dQw4w9WgXcQ` it is `dQw4w9WgXcQ`. This is the best option for long or large videos.

### Add an MP4 video file
Upload the `.mp4` to `assets/video/` (keep it under about 25 MB), then:
```yaml
    - type: video
      src: "/assets/video/transport.mp4"
      poster: "/assets/img/research/transport-poster.jpg"   # optional preview picture
      caption: "Decentralized transport experiment"
```

To also show an item on the **home page** (in an "In the lab" section), add `home: true` to it, for example:
```yaml
    - type: image
      src: "/assets/img/research/assembly-cell.jpg"
      caption: "Dual-arm assembly cell"
      home: true
```
The "In the lab" section appears only when at least one item has `home: true`.

You can mix images and videos in one `media:` list. They appear in a grid under the theme's bullet points.

## 5. Site-wide changes

### Colours and fonts
Open `assets/css/style.css`. The block at the top (`:root`) holds all colours and fonts:
```css
--floor: #EEF0F1;   /* page background */
--ink:   #1D232A;   /* text and dark sections */
--tape:  #F0B323;   /* accent (yellow) */
--steel: #2F5D7C;   /* links */
```
Change a colour code and every page follows. Colour codes can be picked at any online colour picker (they look like `#2E86DE`).

Ready-made palettes:
- Blue: `--floor:#F4F7FB; --ink:#0F2A47; --tape:#2E86DE; --steel:#1B5FA8`
- Green: `--floor:#F2F5F1; --ink:#16301F; --tape:#6BBF59; --steel:#2D6A3E`
- Orange: `--floor:#F6F3EF; --ink:#2A2118; --tape:#E8742A; --steel:#9C4A12`

The home-page animation (robots on a lab floor and a robot arm stacking boxes) is drawn in `assets/js/site.js`. Its yellow is `TAPE` near the top of that file. Change it to match your new accent.

To change fonts, replace the font names in the Google Fonts link in `_layouts/default.html` and the `--display` and `--body` lines in `style.css`.

### Home page headline and buttons
Open `index.html`. The headline is the line starting `<h1>` inside the `hero-copy` block. Change only the words, not the `<` `>` tags.

### Add a menu item
Add a block to `_data/navigation.yml`:
```yaml
- title: Awards
  url: /awards/
```

### Add a whole new page (for example Awards)
1. Create a new file `awards.md` in the main folder with this at the top:
```
---
layout: page
title: Awards
permalink: /awards/
eyebrow: "Recognition"
lede: "One sentence introducing the page."
---

## 2026
- Award name, organisation
```
2. Add it to the menu as shown above.

### Remove a page from the menu
Delete its block from `_data/navigation.yml`. The page itself can stay.

## 6. When something goes wrong

| Problem | What to check |
|---|---|
| My change doesn't show | Wait 2 minutes and hard refresh (Ctrl+Shift+R). Then open the repository's **Actions** tab. A red cross means the last edit has a mistake; click it to see the line. |
| Site shows a build error or blank sections after editing a `.yml` file | Almost always a missing quote, a Tab character, or wrong indentation. Compare your block with the one above it. If stuck, click **History** on the file, open the previous version, and copy it back. |
| An image does not appear | The path in `src:` must start with `/assets/`, and the name and capital letters must match the uploaded file exactly. |
| The site is at the wrong address or has no styling | Repository must be named `<username>.github.io`. For any other repo name set `baseurl: "/<repo-name>"` in `_config.yml`. |
| A paper shows with no authors | `authors:` is empty or missing for that block. |
| I want to undo a change | On the file page click **History**, open the earlier version, **Edit** it and commit. |

## 7. Folder map
```
_config.yml          site title and description
_data/               all the content files (section 2)
_layouts/ _includes/ page templates (leave alone)
assets/css/          colours and styling
assets/js/           menu and home-page animation
assets/img/          your pictures (profile, team/, research/)
assets/video/        MP4 files, if any
index.html  research.html  publications.html  people.html
teaching.html  contact.html  join.md  cv.md      the pages
```
