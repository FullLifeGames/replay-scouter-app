# Replay Scouter

The Replay Scouter shows the teams Pokémon Showdown players brought, scouted from their replays: for one player through the Scouter, and for Smogon tournaments through the tournament views.

## Language

### Tournaments

**Tournament**:
One Smogon tournament event as a whole, such as PTPL V or SPL XVI, made of one or more Tournament Threads.
_Avoid_: Tour (as a term in the UI or code), event

**Tournament Thread**:
One Smogon forum thread in which a Tournament posts its pairings and results, usually for one Round or week, sometimes for several or for the whole Tournament.
_Avoid_: Tournament (for a single thread), topic

**Round**:
One stage of a Tournament, such as Week 6, Top 8 or Grand Finals.
_Avoid_: Stage, phase

**Category**:
The kind of Tournament, taken from the Smogon forum its Tournament Threads sit in: Official, Team Tournament, Ladder, Side or Other.
_Avoid_: Type, tier, Team (for the Team Tournament category)

**Match**:
The pairing of two Players in a Tournament Thread, with its winner once it is played. The thread's result decides who won the Match; each Game's replay decides who won that Game, and the two can disagree.
_Avoid_: Set, battle, pairing

**Game**:
One battle of a Match, recorded as one Showdown replay; a best-of-three Match has two or three Games.
_Avoid_: Replay (for the battle itself), battle

### Players and teams

**Player**:
A Smogon forum user who plays Matches.
_Avoid_: User, account

**Alt**:
A Pokémon Showdown name a Player used for a Game.
_Avoid_: PS name, username, showdown account

**Team**:
Six Pokémon brought to one or more Games, with the sets seen for them merged across those Games; in the tournament views the same six brought by different Alts is one Team.
_Avoid_: Paste, set (for the whole six)

**Set**:
What was seen of one Pokémon on a Team: its item, ability, Tera type and the moves it used.
_Avoid_: Build, moveset

**Format**:
The Pokémon Showdown format a Game was played in, such as [Gen 9] OU. The Format belongs to the Game, not the Match: a best-of-three across generations is one Match with a Game in each Format.
_Avoid_: Tier (for the Showdown format), metagame

### Views

**Representation**:
One way of showing a set of Teams: a list, a table, a text export or a statistic.
_Avoid_: View (for a single one), visualization

**Classic view**:
The way the app has shown Teams so far, with one Representation picked at a time; it stays available while the new view is introduced.
_Avoid_: Old view, legacy view
