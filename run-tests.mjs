import puppeteer from "puppeteer";
import { readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

(async () => {
  const browser = await puppeteer.launch({
    args: ["--disable-web-security"],
  });

  const testDir = join(__dirname, "tests");
  const testFiles = readdirSync(testDir).filter((file) =>
    file.endsWith(".html")
  );

  let totalTests = 0;
  let totalFailed = 0;

  for (const testFile of testFiles) {
    const page = await browser.newPage();
    const filePath = `file://${join(testDir, testFile)}`;

    console.log(`Running tests in: ${testFile}`);
    await page.goto(filePath);

    await page.waitForFunction(() => {
      return document
        .querySelector("#qunit-testresult")
        .innerText.includes("tests completed in");
    });

    const result = await page.evaluate(() => {
      return {
        total: QUnit.config.stats.all,
        failed: QUnit.config.stats.bad,
      };
    });

    console.log(`  Total: ${result.total}, Failed: ${result.failed}`);
    totalTests += result.total;
    totalFailed += result.failed;

    await page.close();
  }

  await browser.close();

  console.log(
    `\nAll tests completed. Total: ${totalTests}, Failed: ${totalFailed}`
  );

  process.exit(totalFailed > 0 || totalTests === 0 ? 1 : 0);
})();
