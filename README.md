# MSR Claim Summary

Public, read-only guarantee claim summary for MEIN SCHIFF RELAX crew.
No editing, no login password — just an @meinschiffrelax.com email check
before viewing.

Installable as an offline app ("Add to Home Screen") — works without
internet after the first visit, and shows a "New data available" banner
when you publish a weekly update.

## Publishing this offline-app update (one-time, bigger than usual)

This update adds new files (app icons, offline support code), not just
one file like a normal weekly refresh. To publish it:

1. Open your repo on github.com
2. Click "Add file" > "Upload files"
3. Unzip the file Claude gave you, then drag in **everything inside**
   the msr-claim-summary folder — including the new `public` folder —
   into the GitHub upload box (this will add new files and overwrite
   changed ones; nothing is deleted)
4. Commit directly to `main`
5. Vercel redeploys automatically

## Weekly data update (after this one-time update)

Every week, send Claude the new "Weekly_Guarantee_Claim_Summary.xlsx"
export. Claude will regenerate a single file: `src/claimsData.js`.

To publish it:
1. Open the repo on github.com
2. Open `src/claimsData.js`
3. Click the pencil (edit) icon
4. Delete all content, paste in the new content Claude gives you
5. Commit directly to `main`
6. Vercel redeploys automatically within a minute or two

Anyone who has the app open (online or offline) will see a "New data
available — Refresh" banner appear once their device checks in with the
internet, or they can tap the refresh icon in the header to check right
away.

No other file needs to change for a normal weekly data refresh.

## Installing on a phone ("Add to Home Screen")

- **iPhone (Safari)**: open the site, tap the Share icon, tap "Add to
  Home Screen"
- **Android (Chrome)**: open the site, tap the three-dot menu, tap
  "Add to Home Screen" or "Install app"

After that first visit, the app works fully offline.
