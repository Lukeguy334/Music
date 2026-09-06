# Home Recordings

A single-page music portfolio: a "now playing" panel plus a tracklist,
built with plain HTML/CSS/JS so it runs on GitHub Pages with no build step.

## Adding your own songs

1. Drop an mp3 into the `audio/` folder.
2. Open `script.js` and add an entry to the `tracks` array near the top:

   ```js
   {
     title: "Song Title",
     file: "audio/your-file.mp3",
     note: "One line about it — what it's about, when you recorded it, etc."
   }
   ```

3. That's it. Duration is read from the file automatically, so you don't
   need to type it in.

Keep mp3s at a reasonable bitrate (128–192kbps is plenty for a demo and
keeps file sizes small — usually 3–6MB per song). GitHub blocks any single
file over 100MB, and a repo gets unwieldy well before then, so there's no
need to compress hard, just don't upload raw WAVs.

## Deploying to GitHub Pages

1. Create a new repository on GitHub (public, so Pages can serve it for
   free) and push this folder to it:

   ```bash
   cd music-portfolio
   git init
   git add .
   git commit -m "Initial site"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
   git push -u origin main
   ```

2. On GitHub, go to the repo's **Settings → Pages**.
3. Under "Build and deployment", set **Source** to "Deploy from a branch",
   branch `main`, folder `/ (root)`, then save.
4. GitHub gives you a URL like `https://YOUR-USERNAME.github.io/YOUR-REPO/`
   within a minute or two.

## Customizing

- `index.html` — page structure and copy (your name, tagline, footer link).
- `style.css` — all design tokens are CSS custom properties at the top of
  the file (`:root { ... }`), so palette and type changes start there.
- `script.js` — track data and all player behavior.

No frameworks, no npm, no build step — just static files.
