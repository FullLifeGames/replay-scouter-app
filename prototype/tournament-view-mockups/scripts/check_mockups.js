// PROTOTYPE helper: one smoke pass over every mockup variant (console errors, overflow, a few screenshots).
const { chromium } = require("/home/bene/code/ingame-replay-viewer/node_modules/playwright");
const OUT = process.argv[2];
const BASE = "http://localhost:5191/index.html";
const IDS = ["replay-bank", "current", "match-bank", "tournaments", "format", "matchup", "search"];
(async () => {
  const browser = await chromium.launch();
  for (const [name, vp, scheme] of [["desk", { width: 1440, height: 900 }, "light"], ["phone", { width: 390, height: 844 }, "dark"]]) {
    const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 1, colorScheme: scheme });
    const page = await ctx.newPage();
    const errs = [];
    page.on("pageerror", (e) => errs.push("pageerror " + e.message));
    page.on("console", (m) => { if (m.type() === "error") errs.push("console " + m.text()); });
    for (const id of IDS) {
      await page.goto(BASE + "#" + id);
      await page.waitForTimeout(id === "replay-bank" ? 2500 : 3500);
      const ow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      console.log(name, id, "overflow", ow);
      await page.screenshot({ path: `${OUT}/${name}-${id}.png` });
    }
    // interactions on A: open stats, click a mon name, open a match
    await page.goto(BASE + "#match-bank");
    await page.waitForTimeout(3000);
    await page.locator(".mrow").first().click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${OUT}/${name}-a-open.png` });
    await page.getByRole("button", { name: "Stats" }).click();
    await page.waitForTimeout(500);
    await page.locator(".monname").first().click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${OUT}/${name}-a-stats-click.png` });
    // B: open a tournament in the mockup
    await page.goto(BASE + "#tournaments");
    await page.waitForTimeout(2500);
    await page.selectOption("#b-only", "mock");
    await page.waitForTimeout(400);
    await page.locator(".trow:not(.head)").first().click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${OUT}/${name}-b-page.png`, fullPage: false });
    // E: example query
    await page.goto(BASE + "#search");
    await page.waitForTimeout(2500);
    await page.getByRole("button", { name: "Kingambit vs Gholdengo" }).click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${OUT}/${name}-e-example.png` });
    console.log(name, "errors", JSON.stringify(errs.slice(0, 10)));
    await ctx.close();
  }
  await browser.close();
})();
