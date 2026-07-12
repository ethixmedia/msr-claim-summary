# MSR Claim Summary

Public, read-only guarantee claim summary for MEIN SCHIFF RELAX crew.
No editing, no login password — just an @meinschiffrelax.com email check
before viewing.

## Weekly data update

Every week, send Claude the new "Weekly_Guarantee_Claim_Summary.xlsx"
export. Claude will regenerate a single file: `src/claimsData.js`.

To publish the update:
1. Open the repo on github.com
2. Open `src/claimsData.js`
3. Click the pencil (edit) icon
4. Delete all content, paste in the new content Claude gives you
5. Commit directly to `main`
6. Vercel redeploys automatically within a minute or two

No other file needs to change for a normal weekly data refresh.
