"""PROTOTYPE data builder for the tournament-view mockups. Throwaway.

Reads tt-data/output.json (live TournamentTeams output, 927 threads with teams) and
tt-data/matches.jsonl (all matches from TournamentParser's output) and writes compact JSON
for the mockup page into mockups/data/.
"""
import collections
import html
import json
import re
import sys
from datetime import datetime, timezone

BASE = sys.argv[1]
TT = f"{BASE}/tt-data"
OUT = f"{BASE}/mockups/data"
FOCUS = ["gen9ou", "gen7ou", "gen9nationaldex", "gen8ou", "gen9monotype", "gen9ubers", "gen9uu", "gen9doublesou", "gen9ru", "gen6ou", "gen1ou", "gen9lc"]
FORMAT_NAMES = {}

REPLAY_ID = re.compile(r"pokemonshowdown\.com/((?:[a-z0-9]+-)+\d+)")


def to_id(s):
    return re.sub(r"[^a-z0-9]", "", (s or "").lower())


def day(dt_str):
    # "2017-01-24T17:58:00" -> days since epoch
    try:
        dt = datetime.fromisoformat(dt_str).replace(tzinfo=timezone.utc)
        return int(dt.timestamp() // 86400)
    except Exception:
        return None


# ---------------------------------------------------------------- tournament heuristics
NOTE = re.compile(
    r"\s*[\[(][^\])]*(won|winner|replay|loser|sub|read post|announce|accepting|custom|prize|update|edit|#\d)[^\])]*[\])]",
    re.I,
)
ROUND = re.compile(
    r"\s*[-:–|,.]?\s*[\[(]?\s*\b(round|rd\.?|week|wk|finals?|semi-?finals?|semis|quarter-?finals?|quarters|grand finals?|top \d+|playoffs?|losers?'?|winners?'?|day \d+|group stage|final stage|swiss|tiebreak(er)?s?|bracket|r\d+|primeira|segunda|terceira|quarta|quinta|sexta|ronda|rodada|manager signups|signups|replays|usage stats|pools)\b.*$",
    re.I,
)
TRAIL = re.compile(r"[\s\-:–|,.!(\[]+$")


def split_name(name):
    name = html.unescape(name).strip()
    m = re.match(r"^(Season \d+)\s*\((Week \d+)", name)  # Smogon Tour "Season 23 (Week 4 [SM OU #2]) Won by X"
    if m:
        return "Smogon Tour " + m.group(1), m.group(2)
    base = NOTE.sub("", name)
    rm = ROUND.search(base)
    if rm and rm.start() > 3:
        tour = base[: rm.start()]
        rnd = base[rm.start():]
    else:
        tour, rnd = base, ""
    tour = TRAIL.sub("", tour).strip()
    rnd = re.sub(r"^[\s\-:–|,.\[(]+|[\s\])]+$", "", rnd).strip()
    rnd = re.sub(r"\s*\(won by.*$", "", rnd, flags=re.I)
    return tour or name, rnd


def category(tour_name):
    n = tour_name.lower()
    if re.search(r"smogon tour|ladder tour|ladder tournament", n):
        return "Ladder"
    if re.search(r"\b[a-z0-9]*pl\b|\b[a-z]*wc\b|premier league|world cup|wcop|team tour|snake|draft|auction|\bcup of\b|tour wars|league|showdown|bowl", n) and "tours plaza premier" not in n:
        return "Team"
    if re.search(r"tours plaza|minitour|room|plaza|portuguese|juegos|unofficial", n):
        return "Side"
    if re.search(r"seasonal|circuit|\bopen\b|last chance|classic|grand slam|masters|official smogon tournament|\bost\b|championship|invitational|majors?\b|kickoff|homefield|\bcup\b", n):
        return "Official"
    return "Other"


GEN_WORDS = [
    (r"\[gen (\d)\]", None), (r"\brby\b", 1), (r"\bgsc\b", 2), (r"\badv\b", 3), (r"\bdpp\b", 4), (r"\bbw2?\b", 5),
    (r"\boras\b|\bxy\b", 6), (r"\busum\b|\bsm\b", 7), (r"\bss\b|swsh|\bbdsp\b", 8), (r"\bsv\b|\bgen ?9\b", 9),
]


def gen_guess(name):
    n = name.lower()
    for pat, g in GEN_WORDS:
        m = re.search(pat, n)
        if m:
            return int(m.group(1)) if g is None else g
    return None


# ---------------------------------------------------------------- matches (all of TournamentParser)
threads = {}  # id -> dict
match_by_replay = {}
matches_raw = []
for line in open(f"{TT}/matches.jsonl"):
    try:
        m = json.loads(line)
    except Exception:
        continue
    t = m.get("t") or {}
    tid = t.get("i")
    if not tid:
        continue
    th = threads.setdefault(tid, {"name": t.get("n") or "", "locked": t.get("l"), "matches": 0, "rep": 0, "d0": None, "d1": None})
    th["matches"] += 1
    rids = [mm.group(1) for r in m.get("r") or [] for mm in [REPLAY_ID.search(r)] if mm]
    if rids:
        th["rep"] += 1
    dd = day(m.get("p") or "")
    if dd:
        th["d0"] = dd if th["d0"] is None else min(th["d0"], dd)
        th["d1"] = dd if th["d1"] is None else max(th["d1"], dd)
    if rids:
        idx = len(matches_raw)
        matches_raw.append({"tid": tid, "f": m.get("f"), "s": m.get("s"), "w": m.get("w"), "d": dd, "rids": rids})
        for rid in rids:
            match_by_replay.setdefault((tid, rid), idx)

# ---------------------------------------------------------------- live teams (927 threads)
live = json.load(open(f"{TT}/output.json"))
fmt_games = collections.Counter()
fmt_by_thread = collections.defaultdict(collections.Counter)
games = {}  # rid -> game
species_t, item_t, abil_t, tera_t, move_t = {}, {}, {}, {}, {}


def idx(table, v):
    if v is None:
        return -1
    if v not in table:
        table[v] = len(table)
    return table[v]


teams_out = []
team_key_idx = {}
for tid, t in live.items():
    if tid not in threads:
        threads[tid] = {"name": t["n"], "locked": t["l"], "matches": 0, "rep": 0, "d0": None, "d1": None}
    for team in t["Teams"]:
        reps = team.get("Replays") or []
        mons = team.get("Pokemon") or []
        if not reps or not mons:
            continue
        for r in reps:
            fmt_by_thread[tid][r.get("FormatId")] += 1
        if not any(r.get("FormatId") in FOCUS for r in reps):
            continue
        enc = []
        for p in mons:
            enc.append([
                idx(species_t, p.get("Name")), idx(item_t, p.get("Item")), idx(abil_t, p.get("Ability")),
                idx(tera_t, p.get("TeraType")), sorted(idx(move_t, mv) for mv in p.get("Moves") or []), 1 if p.get("Lead") else 0,
            ])
        key = json.dumps(enc)
        if key not in team_key_idx:
            team_key_idx[key] = len(teams_out)
            teams_out.append(enc)
        ti = team_key_idx[key]
        for r in reps:
            f = r.get("FormatId")
            if f not in FOCUS:
                continue
            FORMAT_NAMES.setdefault(f, r.get("Format") or f)
            rid = r["Id"]
            g = games.setdefault(rid, {"rid": rid, "f": f, "t": r.get("UploadTime"), "tid": tid, "players": r.get("Players") or [], "winner": r.get("Winner"), "teams": {}})
            pi = r.get("PlayerInfo") or {}
            side = pi.get("PlayerValue")
            if side in ("p1", "p2"):
                g["teams"][side] = (pi.get("PlayerName"), ti)

for g in games.values():
    fmt_games[g["f"]] += 1

# ---------------------------------------------------------------- alts -> players
alt_votes = collections.defaultdict(collections.Counter)
game_match = {}
for rid, g in games.items():
    mi = match_by_replay.get((g["tid"], rid))
    if mi is None:
        continue
    game_match[rid] = mi
    m = matches_raw[mi]
    users = [u for u in (m["f"], m["s"]) if u]
    alts = [a for a in g["players"] if a]
    for a in alts:
        for u in users:
            if to_id(a) == to_id(u):
                alt_votes[a][u] += 5
    if len(alts) == 2 and len(users) == 2:
        a1, a2 = alts
        u1, u2 = users
        # pair by name similarity first, otherwise both pairings get a weak vote
        if to_id(a1) == to_id(u1) or to_id(a2) == to_id(u2):
            alt_votes[a2][u2] += 2
            alt_votes[a1][u1] += 2
        elif to_id(a1) == to_id(u2) or to_id(a2) == to_id(u1):
            alt_votes[a2][u1] += 2
            alt_votes[a1][u2] += 2
        else:
            for a in alts:
                for u in users:
                    alt_votes[a][u] += 1

alt_player = {}
for a, votes in alt_votes.items():
    (u, c), *rest = votes.most_common()
    if rest and rest[0][1] == c:
        continue
    alt_player[a] = u

# ---------------------------------------------------------------- build matches for focus games
match_out = []
match_key = {}
for rid, g in sorted(games.items(), key=lambda kv: (kv[1]["t"] or 0)):
    mi = game_match.get(rid)
    if mi is not None:
        key = ("m", mi)
    else:
        key = ("p", g["tid"], tuple(sorted(to_id(p) for p in g["players"])))
    if key not in match_key:
        match_key[key] = len(match_out)
        if mi is not None:
            m = matches_raw[mi]
            match_out.append({"tid": g["tid"], "a": m["f"], "b": m["s"], "w": m["w"], "d": m["d"], "games": []})
        else:
            ps = g["players"] + [None, None]
            match_out.append({"tid": g["tid"], "a": alt_player.get(ps[0], ps[0]), "b": alt_player.get(ps[1], ps[1]), "w": None, "d": (g["t"] or 0) // 86400, "games": []})
    match_out[match_key[key]]["games"].append(rid)

player_alts = collections.defaultdict(set)
for a, u in alt_player.items():
    player_alts[u].add(a)

# ---------------------------------------------------------------- tournaments (group threads)
by_name = collections.defaultdict(list)
for tid, th in threads.items():
    tour, rnd = split_name(th["name"])
    th["tour"], th["round"] = tour, rnd
    by_name[re.sub(r"[^a-z0-9]", "", tour.lower())].append(tid)

tournaments = []
thread_tour = {}
for key, tids in by_name.items():
    tids.sort(key=lambda i: (threads[i]["d0"] or 0, int(i)))
    clusters, cur, last = [], [], None
    for i in tids:
        d0 = threads[i]["d0"]
        if cur and d0 is not None and last is not None and d0 - last > 150:
            clusters.append(cur)
            cur = []
        cur.append(i)
        if d0 is not None:
            last = max(last or d0, threads[i]["d1"] or d0)
    clusters.append(cur)
    for cl in clusters:
        name = threads[cl[0]]["tour"]
        d0s = [threads[i]["d0"] for i in cl if threads[i]["d0"]]
        year = datetime.fromtimestamp(min(d0s) * 86400, timezone.utc).year if d0s else None
        fm = collections.Counter()
        for i in cl:
            fm.update(fmt_by_thread.get(i, {}))
        gen = gen_guess(name) or next((gen_guess(threads[i]["name"]) for i in cl if gen_guess(threads[i]["name"])), None)
        ti = len(tournaments)
        tournaments.append({
            "n": html.unescape(name), "y": year, "c": category(name), "g": gen,
            "f": [f for f, _ in fm.most_common(4)],
            "th": [[i, threads[i]["round"] or html.unescape(threads[i]["name"]), threads[i]["d0"], threads[i]["matches"], threads[i]["rep"], 1 if i in live else 0] for i in cl],
        })
        for i in cl:
            thread_tour[i] = ti

# disambiguate duplicate tournament names by year
name_count = collections.Counter(t["n"] for t in tournaments)
for t in tournaments:
    if name_count[t["n"]] > 1 and t["y"]:
        t["n"] = f"{t['n']} ({t['y']})"

# ---------------------------------------------------------------- write
inv = lambda table: [k for k, _ in sorted(table.items(), key=lambda kv: kv[1])]
game_list = []
game_index = {}
for mi, m in enumerate(match_out):
    for rid in m["games"]:
        g = games[rid]
        game_index[rid] = len(game_list)
        p1 = g["teams"].get("p1")
        p2 = g["teams"].get("p2")
        ps = g["players"] + [None, None]
        wside = 1 if g["winner"] and to_id(g["winner"]) == to_id(ps[0]) else (2 if g["winner"] and to_id(g["winner"]) == to_id(ps[1]) else 0)
        game_list.append([rid, FOCUS.index(g["f"]), g["t"], mi, ps[0], ps[1], wside, p1[1] if p1 else -1, p2[1] if p2 else -1])

bank = {
    "formats": FOCUS,
    "formatNames": [FORMAT_NAMES.get(f, f) for f in FOCUS],
    "species": inv(species_t), "items": inv(item_t), "abilities": inv(abil_t), "teras": inv(tera_t), "moves": inv(move_t),
    "teams": teams_out,
    "games": game_list,
    "matches": [[m["tid"], thread_tour.get(m["tid"], -1), m["a"], m["b"], m["w"], m["d"], [game_index[r] for r in m["games"]]] for m in match_out],
    "alts": {a: u for a, u in alt_player.items()},
}
json.dump(bank, open(f"{OUT}/bank.json", "w"), separators=(",", ":"))
json.dump({"tournaments": tournaments, "liveFormats": fmt_games.most_common()}, open(f"{OUT}/tournaments.json", "w"), separators=(",", ":"))

all_live_formats = collections.Counter()
for tid, c in fmt_by_thread.items():
    all_live_formats.update(c)
json.dump(sorted(all_live_formats.items(), key=lambda kv: -kv[1]), open(f"{OUT}/formats.json", "w"), separators=(",", ":"))

print("threads", len(threads), "tournaments", len(tournaments))
print("focus games", len(game_list), "matches", len(match_out), "teams", len(teams_out))
print("games linked to parser match", len(game_match), "alts mapped", len(alt_player), "players with >1 alt", sum(1 for v in player_alts.values() if len(v) > 1))
print("cats", collections.Counter(t["c"] for t in tournaments))
print("species", len(species_t))
