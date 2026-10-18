# Cheer Empire (Stages 1-2: foundation, teams, traits, chemistry, coaches)
Incremental cheerleading gym game. Static HTML/CSS/JS, no backend.
Files: index.html, style.css, data.js (balance + content), game.js (engine), README.md.
Run locally: open index.html, or run `python3 -m http.server` in this folder and visit localhost:8000.
GitHub Pages: create a repo, upload these files to the root, Settings > Pages > Deploy from branch (main, / root). Your game lives at https://USERNAME.github.io/REPO/.
Saves: localStorage, autosaved every 15s and on actions. Progression tab: Save, Export (JSON), Import (validated, with confirmation), Reset (double confirmation).
Offline progress: up to 8h at 50% efficiency (improved by Auto-Run Gym).
Balance: edit BAL, FACILITIES, UPGRADES in data.js.
Currencies: only Cash exists in Stage 1. Prestige/Legacy/Dynasty are not implemented yet.

## Stage 3 added
Competitions (level 12): per-team Difficulty/Risk routine sliders, shared scoring for you and rivals, 4 event tiers gated by reputation, 6 simulated rival gyms with saved win/loss/streak records, reputation (boosts tuition) and fame, 8-event seasons with bonus payouts. Rival strength grows with total simulated play time and is capped per gym.

## Stage 5 added: reset layers
Prestige (lvl 20, Prestige Points), Ascension (lvl 40 + one Prestige, Legacy Points), Rebirth (lvl 80 + one Ascension, Dynasty Points). Each has its own 8-node tree in the Skill Tree tab with bulk buying and prerequisites. Currencies are only grantable after their layer unlocks (see giveReward in game.js; locked currency converts to cash). Preservation: Ascension keeps a % of Prestige ranks (Legacy tree), Rebirth keeps % of Prestige and Legacy ranks (Dynasty tree). Level, reputation, fame, rival records and seasons persist through all resets.
Balance: tree node costs/effects live in NODES (data.js); gain formulas in LAYER (game.js).

## Stage 6 added
250+ data-driven achievements (28 tracked metrics x tiers; points give up to +50% tuition) and six quest types (daily/weekly regenerate by local date, career, rivalry, event per season, reset). Rewards go through giveReward, so locked reset currencies convert to cash.

## Stages 4+7 added
Cards (12 specialties x 5 rarities, 3 packs with pity, fragments, upgrades, equip slots), sponsorships (lvl 25), World Tour with 6 boss gyms x 3 tiers and scoring modifiers (unlocks after Rebirth, pays Dynasty Points), Hall of Fame records/history, gym rename and colour themes (unlocked by achievement points).

## Tutorial, help, balance
Tip banner (auto-advances as you play, can be hidden), Help section under Progression, 22 nodes per reset tree (66 total). Rival and boss strengths retuned (data.js RIVALS, game.js BOSSES).

## Debug panel
A hidden developer panel exists in Progression once unlocked with a secret code (typed on a keyboard, or tapping the title 7 times and entering it). The code is stored only as a hash in game.js (DBG_H). It never appears in saves or exports.

## Debug panel
A hidden developer panel exists in Progression once unlocked with a secret code (typed on a keyboard, or tapping the title 7 times and entering it). The code is stored only as a hash in game.js (DBG_H). It never appears in saves or exports.
