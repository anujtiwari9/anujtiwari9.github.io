# Faculty and lab website (GitHub Pages)

Everything you edit is plain text. You never touch the design files.

## Publish it
1. Create a **public** GitHub repository named `<your-username>.github.io`.
2. Upload everything in this folder (unzip first, then drag the files and folders in), including `_config.yml`, `_data`, `_layouts`, `_includes` and `assets`. Commit.
3. Settings → Pages → Source: *Deploy from a branch* → `main` / root → Save.
4. After 1–2 minutes the site is live at `https://<your-username>.github.io`.

If the repo has any other name, set `baseurl: "/<repo-name>"` in `_config.yml`.

## Where to edit what
| To change | Edit |
|---|---|
| Name, email, office, bio, photo, profile links | `_data/profile.yml` |
| News on the home page | `_data/news.yml` (add at the top) |
| Research themes | `_data/research.yml` |
| Papers and patents | `_data/publications.yml` (add at the top of its type) |
| Students and alumni | `_data/team.yml` |
| Courses | `_data/teaching.yml` |
| Talks and workshops | `_data/talks.yml` |
| Menu items | `_data/navigation.yml` |
| Join us page | `join.md` |
| CV page | `cv.md` (same Markdown as your CV file) |
| Colours and fonts | top of `assets/css/style.css` |

Edit on github.com: open the file, click the pencil, change, then *Commit changes*. The site updates in about a minute.

## Adding a paper
Copy an existing block in `_data/publications.yml`:

```yaml
- type: journal          # preprint | journal | conference | patent
  year: 2026
  title: "Paper title"
  authors: "A. Student, **A. Tiwari**"
  venue: "Journal name"
  doi: "10.xxxx/xxxxx"   # optional
  themes: [manipulation] # manipulation | coordination | warehouses | networks
  featured: true         # optional: also shown on the home page
```
Keep the quotation marks around text.

## Photos
Put your photo at `assets/img/profile.jpg` and set `photo: "/assets/img/profile.jpg"` in `profile.yml`. For students, set `photo:` in `team.yml` the same way.
