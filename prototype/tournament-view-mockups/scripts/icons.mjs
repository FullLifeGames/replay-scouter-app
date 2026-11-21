// PROTOTYPE helper: icon sheet offsets for the species in the mockup data, via the app's own @pkmn/img.
import { createRequire } from "node:module";
import fs from "node:fs";
const require = createRequire("/home/bene/code/replay-scouter-app/package.json");
const { Icons } = require("@pkmn/img");
const [bankPath, outPath] = process.argv.slice(2);
const bank = JSON.parse(fs.readFileSync(bankPath, "utf8"));
const out = {};
for (const s of bank.species) {
  const i = Icons.getPokemon(s);
  const m = /(-?\d+)px (-?\d+)px/.exec(i.style);
  out[s] = m ? [Number(m[1]), Number(m[2])] : [0, 0];
}
console.log(Icons.getPokemon("Kingambit"));
fs.writeFileSync(outPath, JSON.stringify(out));
console.log(Object.keys(out).length);
