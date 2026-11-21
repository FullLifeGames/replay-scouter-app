# PROTOTYPE: mockups for the new Tournament Teams view

Throwaway code. It answered one question: what should the Tournament Teams view look like after reviewing Replay Bank? Nothing here is production code and nothing in `src/` uses it.

## Run

    python3 scripts/serve.py .

Then open http://localhost:5191/index.html. The bar at the bottom switches between the views (keys ← and →).

## Views

| Key | View |
|---|---|
| R | Replay Bank review (screenshots and notes) |
| 0 | Today's Tournament Teams view (screenshots) |
| A | Match bank: filters on the left, one row per Match |
| B | Tournament browser |
| C | Format dashboard |
| D | Matchup heatmap |
| E | One search box |
| F | Combined draft: the answer |

## Verdict

View F is the design to build: A as the page, with 0 to n Formats, the search box on top, the tabs Matches, Teams, Stats and Tournaments, C's stats and text exports. B became the Tournaments tab and the Round grouping. D's heatmap is left out of the first version. The full list of decisions is in the issue that points to this branch.

Decided but not in the mockup: Table and JSON in the Teams tab, Combos of 2 to 6 with a Leads switch, Items by Pokémon and Moves by Pokémon tables, Usage over time with several lines, sorting, "or" groups in "Team has", Fill Build, and CSV as a file download.

## Data

`data/` holds a sample of real data: 12 Formats, 6,034 Games, 5,046 Matches, and an index of 27,492 Tournament Threads grouped into 5,991 Tournaments. The grouping, the Round labels, the categories and which Alt belongs to which Player are rough guesses made by `scripts/build_data.py` for this mockup only.

The inputs of `build_data.py` are not in this branch (about 260 MB): the live `output.json` of TournamentTeams and the matches from TournamentParser's output. `scripts/icons.mjs` writes `data/icons.json` from the app's `@pkmn/img`. The check scripts expect Playwright at a path on the machine they were written on.
