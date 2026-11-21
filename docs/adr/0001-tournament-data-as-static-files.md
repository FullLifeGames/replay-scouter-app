# Tournament data as static files, filtered in the browser

The Tournament Teams view searches Matches, Teams and Players across all Smogon tournaments, an estimated 270,000 Games once the collector covers every Tournament Thread. We decided that the collector writes static JSON files each night (one per Format, one per Tournament, a Tournament index and a Player table) and that the browser loads the files a search needs and filters them locally, instead of asking a search API. The site stays plain file hosting with nothing to operate, as it has been for the per-thread files so far.

## Considered Options

- **A search API with a database.** It could search all Formats at once and send small answers, but it is a server process to run, secure and keep up for a tool that has only ever needed file hosting.
- **Static files, filtered in the browser (chosen).**

## Consequences

- A search needs at least one Format, or a Tournament or Player that narrows it: all Formats together are too large to load at once.
- A whole Format is downloaded before it can be searched. The largest, [Gen 9] OU, is estimated at 6.7 MB, or 1.6 MB compressed, so the site has to serve JSON compressed.
- The file layout is a contract between the collector and the app: changing it means changing both.
- The data is as fresh as the last nightly run.
