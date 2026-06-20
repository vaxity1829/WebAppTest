# Setting up the database

This site needs two free things from a Google account before sign-in and saving work: a Google Sheet (acting as the database) and an OAuth Client ID (for "Sign in with Google"). Both are one-time setup steps.

Until both are filled in, the site runs fine in **offline mode** — it just won't save anything permanently or share data between visitors.

## 1. Create the Sheet + Apps Script backend

1. Go to sheets.google.com and create a new blank spreadsheet (name it anything, e.g. "Faculty Room Database").
2. In the sheet, open **Extensions → Apps Script**.
3. Delete whatever's in `Code.gs`, then paste in the full contents of `database/apps-script/Code.gs` from this project.
4. Click **Deploy → New deployment**.
5. Click the gear icon next to "Select type" and choose **Web app**.
6. Set "Execute as" to **Me**, and "Who has access" to **Anyone**. (Not "Anyone with a Google account" — students need to add notes without signing in.)
7. Click **Deploy**, then authorize it. You'll see a Google warning screen since it's your own unverified script — click **Advanced → Go to [project name] (unsafe)** to continue. This is expected for personal scripts.
8. Copy the Web app URL (looks like `https://script.google.com/macros/s/AKfycb.../exec`).
9. Paste it into `database/config.js` as `SHEETS_API_URL`.

The script automatically creates "Teachers" and "Notes" tabs in your sheet the first time it runs — you don't need to set those up by hand.

## 2. Create a Google Sign-In Client ID

1. Go to console.cloud.google.com and create a new project (or use an existing one).
2. Go to **APIs & Services → OAuth consent screen** and fill in the basics (app name, support email). "Testing" publishing status is fine for a school site — just add your teachers as test users, or publish the app if you want anyone to be able to sign in without being added manually.
3. Go to **APIs & Services → Credentials → Create credentials → OAuth client ID**.
4. Choose **Web application**.
5. Under "Authorized JavaScript origins", add the URL you'll host this on, e.g. `https://yourusername.github.io`.
6. Click **Create**, then copy the Client ID (it ends in `.apps.googleusercontent.com`).
7. Paste it into `database/config.js` as `GOOGLE_CLIENT_ID`.

## 3. Deploy to GitHub Pages

1. Push this whole folder (`index.html`, `app.js`, `database/`) to a GitHub repository.
2. In the repo, go to **Settings → Pages**, and set the source to your main branch, root folder.
3. Your site goes live at `https://yourusername.github.io/your-repo-name/` within a minute or two.

## How it works

- Only signed-in teachers can add a faculty page (the Apps Script checks the Google sign-in token before writing).
- Anyone can add, edit, drag, or delete notes — no sign-in required for students.
- `database/fallback.json` is the starting data shown in offline mode, or if the live database can't be reached. Safe to leave as empty arrays.
