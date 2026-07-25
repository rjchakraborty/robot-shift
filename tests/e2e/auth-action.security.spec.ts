import { expect, test } from "@playwright/test";
import { collectBrowserFailures } from "./browser-evidence";

test("account action codes are removed from browser history before provider use", async ({
  page,
}) => {
  const browserFailures = collectBrowserFailures(page);
  const failedResponses: Array<{ status: number; url: string }> = [];
  page.on("response", (response) => {
    if (response.status() >= 400) {
      failedResponses.push({ status: response.status(), url: response.url() });
    }
  });

  await page.goto(
    "/auth/action/?mode=resetPassword&oobCode=not-a-real-code&apiKey=not-a-real-key",
  );
  await expect(page).toHaveURL(/\/auth\/action\/$/);
  await expect(
    page.getByRole("heading", { name: /request a new account email/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Robot\/Shift/i }).first(),
  ).toBeVisible();
  expect(failedResponses).toHaveLength(1);
  expect(failedResponses[0]).toMatchObject({ status: 400 });
  expect(failedResponses[0].url).toMatch(
    /^https:\/\/identitytoolkit\.googleapis\.com\/v1\/accounts:resetPassword/,
  );

  browserFailures.assertClean({
    allowedConsoleErrors: [
      /^Failed to load resource: the server responded with a status of 400/,
    ],
  });
});
