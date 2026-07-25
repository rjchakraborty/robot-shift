import { expect, test } from "@playwright/test";
import {
  captureEvidence,
  collectBrowserFailures,
  expectNoHorizontalOverflow,
} from "./browser-evidence";

test("mobile curriculum and account dialog stay inside the viewport", async ({
  page,
}, testInfo) => {
  const browserFailures = collectBrowserFailures(page);

  await page.goto("/");
  await expect(page.getByRole("main")).toContainText("Robot anatomy");
  await expectNoHorizontalOverflow(page);

  const mobileNavigation = page.getByRole("navigation", {
    name: "Mobile navigation",
  });
  await mobileNavigation.getByRole("button", { name: "Curriculum" }).click();
  await expect(page.getByRole("heading", { name: "Curriculum" })).toBeVisible();

  await page.getByRole("button", {
    name: "Sign in or create an account",
  }).click();
  const dialog = page.getByRole("dialog", { name: "Sign in to Robot/Shift" });
  await expect(dialog).toBeVisible();
  const box = await dialog.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.width).toBeLessThanOrEqual(testInfo.project.use.viewport!.width);
  await expectNoHorizontalOverflow(page);
  await captureEvidence(page, testInfo, "mobile-account-flow.png");

  browserFailures.assertClean();
});
