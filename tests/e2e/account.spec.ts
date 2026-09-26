import { expect, test, type Page } from "@playwright/test";
import { admin, createWorld, destroyWorld, signIn, type World } from "./fixtures";

// Deleting your own account from the profile page: what Apple requires every
// app with sign-in to offer. See lib/account/delete.ts for the rules.

let world: World;

test.beforeAll(async () => {
  world = await createWorld();
});

test.afterAll(async () => {
  if (!world) return;
  await admin().from("clubs").delete().like("handle", `e2e_${world.runId}_%`);
  await destroyWorld(world);
});

async function userIdFor(email: string): Promise<string | null> {
  const { data } = await admin().auth.admin.listUsers({ perPage: 1000 });
  return data?.users.find((user) => user.email === email)?.id ?? null;
}

async function openDeletePanel(page: Page) {
  await page.goto("/account");
  await page.getByRole("button", { name: "Delete my account" }).click();
  await expect(page.getByRole("heading", { name: "Delete your account" })).toBeVisible();
}

test("a member deletes their account", async ({ page, context, request }) => {
  const email = `leaver.${world.runId}@e2e.klubbies.test`;
  const db = admin();
  await db.from("memberships").insert({ club_id: world.clubA.id, roster_email: email, roster_name: "Lena Leaver" });
  await signIn(context, request, email, "Lena Leaver");
  const userId = (await userIdFor(email))!;

  // Things that must go with the account.
  await db.from("favourites").insert({ club_id: world.clubA.id, user_id: userId, media_id: world.clubA.mediaId });
  await db.from("push_devices").insert({ user_id: userId, token: `ab${world.runId}`.padEnd(64, "0"), environment: "sandbox" });

  await openDeletePanel(page);
  const button = page.locator("form").getByRole("button", { name: "Delete my account" });
  await expect(button).toBeDisabled();
  await page.getByLabel("I understand my account is deleted for good.").check();
  await button.click();
  await expect(page).toHaveURL(/\/account-deleted$/);

  expect(await userIdFor(email)).toBeNull();
  const { count: favourites } = await db.from("favourites").select("*", { count: "exact", head: true }).eq("user_id", userId);
  expect(favourites).toBe(0);
  const { count: devices } = await db.from("push_devices").select("*", { count: "exact", head: true }).eq("user_id", userId);
  expect(devices).toBe(0);

  // The club's list keeps them, as someone who hasn't signed in yet.
  const { data: row } = await db.from("memberships").select("user_id, status, claimed_name").eq("roster_email", email).single();
  expect(row).toEqual({ user_id: null, status: "pending", claimed_name: null });

  // And the session is gone.
  const res = await page.goto("/account");
  expect(page.url()).not.toContain("/account");
  expect(res?.ok()).toBeTruthy();
});

test("the only admin of a club with members must hand it over first", async ({ page, context, request }) => {
  const email = `owner.${world.runId}@e2e.klubbies.test`;
  const other = `stayer.${world.runId}@e2e.klubbies.test`;
  const db = admin();
  await db.from("memberships").insert({ club_id: world.clubB.id, roster_email: email, roster_name: "Olive Owner", role: "club_admin" });
  // Someone else has signed in to club B.
  const { data: created } = await db.auth.admin.createUser({ email: other, email_confirm: true });
  await db
    .from("memberships")
    .insert({ club_id: world.clubB.id, roster_email: other, roster_name: "Sam Stayer", user_id: created.user!.id, status: "active" });

  await signIn(context, request, email, "Olive Owner");
  await openDeletePanel(page);
  await expect(page.getByText(/You.re the only admin of/)).toBeVisible();
  await expect(page.getByRole("link", { name: `Hand over E2E b ${world.runId}` })).toBeVisible();
  await expect(page.getByLabel("I understand my account is deleted for good.")).toHaveCount(0);
  expect(await userIdFor(email)).not.toBeNull();
});

test("a club nobody else joined closes with its only admin", async ({ page, context, request }) => {
  const email = `solo.${world.runId}@e2e.klubbies.test`;
  const db = admin();
  const { data: club } = await db
    .from("clubs")
    .insert({ handle: `e2e_${world.runId}_solo`, name: `E2E solo ${world.runId}` })
    .select("id")
    .single();
  await db.from("memberships").insert({ club_id: club!.id, roster_email: email, roster_name: "Sol Solo", role: "club_admin" });

  await signIn(context, request, email, "Sol Solo");
  await openDeletePanel(page);
  await expect(page.getByText(/closes with your account/)).toBeVisible();
  await page.getByLabel("I understand my account is deleted for good.").check();
  await page.locator("form").getByRole("button", { name: "Delete my account" }).click();
  await expect(page).toHaveURL(/\/account-deleted$/);

  const { count } = await db.from("clubs").select("*", { count: "exact", head: true }).eq("id", club!.id);
  expect(count).toBe(0);
  expect(await userIdFor(email)).toBeNull();
});
