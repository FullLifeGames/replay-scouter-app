// PROTOTYPE helper: screenshots of today's Tournament Teams view for the mockup page.
const { chromium } = require('/home/bene/code/ingame-replay-viewer/node_modules/playwright');
const OUT = process.argv[2];
const BASE = "http://localhost:5180/#/tournaments";

async function load(page) {
  await page.goto(BASE);
  await page.waitForFunction(() => !document.querySelector("button.btn-secondary")?.disabled === false || true);
  await page.waitForTimeout(4000);
}

async function pick(page, text) {
  const input = page.locator(".vs__search").first();
  await input.click();
  await input.fill(text);
  await page.waitForTimeout(800);
  await page.keyboard.press("Enter");
  await page.keyboard.press("Escape");
}

(async () => {
  const browser = await chromium.launch();
  for (const [name, vp, dsf] of [["desktop", { width: 1440, height: 900 }, 2], ["phone", { width: 390, height: 844 }, 2]]) {
    const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: dsf });
    const page = await ctx.newPage();
    await load(page);
    await page.screenshot({ path: `${OUT}/current-${name}-1-empty.jpg`, quality: 78 });
    await pick(page, "PTPL VI - Week 1");
    await pick(page, "PTPL VI - Week 2");
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${OUT}/current-${name}-2-picked.jpg`, quality: 78 });
    await page.getByRole("button", { name: "Visualize Smogon Tournaments" }).click();
    await page.waitForTimeout(6000);
    await page.locator("#collapse-search").evaluate((el) => el.scrollIntoView()).catch(() => {});
    const sel = page.locator("select").first();
    await sel.scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollBy(0, -20));
    await page.screenshot({ path: `${OUT}/current-${name}-3-visual.jpg`, quality: 78 });
    // open first accordion item
    await page.locator(".accordion-button").first().click().catch(() => {});
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${OUT}/current-${name}-4-team-open.jpg`, quality: 78 });
    await sel.selectOption("PokemonStatistics");
    await page.waitForTimeout(2500);
    await sel.scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollBy(0, -20));
    await page.screenshot({ path: `${OUT}/current-${name}-5-stats.jpg`, quality: 78 });
    if (name === "desktop") {
      const opts = await sel.evaluate((s) => [...s.options].map((o) => o.text));
      require("fs").writeFileSync(`${OUT}/current-options.json`, JSON.stringify(opts));
    }
    await ctx.close();
  }
  await browser.close();
})();
