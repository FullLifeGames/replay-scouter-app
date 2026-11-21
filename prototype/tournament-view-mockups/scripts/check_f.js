// PROTOTYPE helper: smoke pass over the combined view.
const { chromium } = require("/home/bene/code/ingame-replay-viewer/node_modules/playwright");
const OUT = process.argv[2];
const BASE = "http://localhost:5191/index.html";
(async () => {
  const browser = await chromium.launch();
  for (const [name, vp, scheme] of [["desk", { width: 1440, height: 900 }, "light"], ["phone", { width: 390, height: 844 }, "dark"]]) {
    const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 1, colorScheme: scheme });
    const page = await ctx.newPage();
    const errs = [];
    page.on("pageerror", (e) => errs.push("pageerror " + e.message));
    page.on("console", (m) => { if (m.type() === "error") errs.push("console " + m.text()); });
    const shot = async (n) => { const ow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth); console.log(name, n, "overflow", ow); await page.screenshot({ path: `${OUT}/f-${name}-${n}.png` }); };
    await page.goto(BASE + "#combined");
    await page.waitForTimeout(4000);
    await shot("1-matches");
    const tab = (t) => page.locator(".tabs button", { hasText: t }).click();
    await tab("Stats"); await page.waitForTimeout(600); await shot("2-stats-overview");
    await page.locator(".seg button", { hasText: /^Pokémon$/ }).click(); await page.waitForTimeout(400);
    await page.locator(".seg button", { hasText: /^Text$/ }).click(); await page.waitForTimeout(400); await shot("3-stats-text");
    console.log(name, "matchups tab present:", await page.locator(".seg button", { hasText: /^Matchups$/ }).count());
    await tab("Teams"); await page.waitForTimeout(500);
    await page.locator(".seg button", { hasText: /^Text$/ }).click(); await page.waitForTimeout(500); await shot("6-teams-text");
    await tab("Tournaments"); await page.waitForTimeout(600); await shot("7-tours");
    await page.locator(".trow:not(.head)").first().click(); await page.waitForTimeout(800); await shot("8-tour-matches");
    // remove all formats -> narrowing note / tournament w/o format
    if (name === "desk") {
      await page.fill("#f-q", "adpl 8"); await page.waitForTimeout(500); await page.keyboard.press("Enter"); await page.waitForTimeout(800); await shot("9-adpl8");
      await tab("Stats"); await page.waitForTimeout(600); await shot("10-adpl8-stats");
    }
    // a Match across Formats: [Gen 8] OU only, Tours Plaza Premier IV, open the first Match
    await page.locator("button", { hasText: "Clear filters" }).click({ force: true }).catch(() => {});
    await page.evaluate(() => document.querySelectorAll("details").forEach((d) => (d.open = true)));
    await page.locator("button", { hasText: "Clear filters" }).click(); await page.waitForTimeout(600);
    const head = await page.locator(".rhead").first().innerText(); console.log(name, "head", JSON.stringify(head));
    console.log(name, "stats-for chips with one Format:", await page.locator("text=Stats for").count());
    await page.locator('button[aria-label^="Remove [Gen 9] OU"]').click(); await page.waitForTimeout(500); await shot("11-no-format");
    await page.fill("#f-fmt", "gen 8"); await page.waitForTimeout(400); await page.keyboard.press("Enter"); await page.waitForTimeout(600);
    await page.fill("#f-tour", "Tours Plaza Premier IV"); await page.waitForTimeout(500); await page.keyboard.press("Enter"); await page.waitForTimeout(900);
    await page.locator(".mrow").first().click(); await page.waitForTimeout(500);
    await page.locator(".mrow").first().scrollIntoViewIfNeeded(); await shot("12-mixed-match");
    console.log(name, "errors", JSON.stringify(errs.slice(0, 10)));
    await ctx.close();
  }
  await browser.close();
})();
