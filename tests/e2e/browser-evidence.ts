import { expect, test, type Page, type TestInfo } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  const debugToken = process.env.FIREBASE_APPCHECK_DEBUG_TOKEN;
  if (!debugToken) return;

  await page.addInitScript((token) => {
    (
      globalThis as typeof globalThis & {
        FIREBASE_APPCHECK_DEBUG_TOKEN?: string;
      }
    ).FIREBASE_APPCHECK_DEBUG_TOKEN = token;
  }, debugToken);
});

export function collectBrowserFailures(page: Page) {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];

  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));

  return {
    assertClean(options?: { allowedConsoleErrors?: RegExp[] }) {
      const unexpectedConsoleErrors = consoleErrors.filter((message) =>
        !(options?.allowedConsoleErrors ?? []).some((pattern) =>
          pattern.test(message)
        )
      );
      expect(pageErrors, "uncaught browser errors").toEqual([]);
      expect(unexpectedConsoleErrors, "browser console errors").toEqual([]);
    },
  };
}

export async function captureEvidence(
  page: Page,
  testInfo: TestInfo,
  name: string,
) {
  await page.screenshot({
    path: testInfo.outputPath(name),
    fullPage: false,
    animations: "disabled",
  });
}

export async function expectNoHorizontalOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1);
}
