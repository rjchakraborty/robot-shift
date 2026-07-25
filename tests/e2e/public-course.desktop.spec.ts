import { expect, test } from "@playwright/test";
import {
  captureEvidence,
  collectBrowserFailures,
  expectNoHorizontalOverflow,
} from "./browser-evidence";

test("public curriculum and complete account entry flow render cleanly", async ({
  page,
}, testInfo) => {
  const browserFailures = collectBrowserFailures(page);

  await page.goto("/");
  await expect(page).toHaveTitle("Robot/Shift — 180-Day Robotics Field Manual");
  await expect(page.getByText("Robot/Shift", { exact: true }).first()).toBeVisible();
  await expect(page.getByRole("main")).toContainText("Robot anatomy");
  await expectNoHorizontalOverflow(page);

  await page.getByRole("button", { name: "Curriculum", exact: true }).first().click();
  await expect(page.getByRole("heading", { name: "Curriculum" })).toBeVisible();
  await expect(page.getByText("A focused 180-day path")).toBeVisible();

  const accountTrigger = page.getByRole("button", {
    name: "Sign in or create an account",
  });
  await accountTrigger.click();
  const dialog = page.getByRole("dialog", { name: "Sign in to Robot/Shift" });
  await expect(dialog).toBeVisible();
  await expect(
    dialog.getByRole("button", { name: "Continue with Google" }),
  ).toBeVisible();

  await dialog.getByRole("button", { name: "Forgot password?" }).click();
  await expect(
    page.getByRole("dialog", { name: "Reset your password" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Back to sign in" }).click();
  await page.getByRole("button", { name: "Create an account" }).click();

  const signUpDialog = page.getByRole("dialog", {
    name: "Create your Robot/Shift account",
  });
  await expect(signUpDialog.getByLabel("Name")).toBeVisible();
  await expect(signUpDialog.getByLabel("Email")).toBeVisible();
  await expect(signUpDialog.getByText("Use 12–128 characters")).toBeVisible();
  await captureEvidence(page, testInfo, "desktop-account-flow.png");

  await page.keyboard.press("Escape");
  await expect(signUpDialog).toBeHidden();
  await expect(accountTrigger).toBeFocused();
  browserFailures.assertClean();
});
