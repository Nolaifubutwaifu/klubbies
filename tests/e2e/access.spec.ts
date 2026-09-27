import { expect, test } from "@playwright/test";
import { admin, createWorld, destroyWorld, signIn, type World } from "./fixtures";

let world: World;

test.beforeAll(async () => {
  world = await createWorld();
});

test.afterAll(async () => {
  if (world) await destroyWorld(world);
});

test("non-member is refused", async ({ page, context, request }) => {
  // The request_code response must not reveal whether an email is on a roster.
  const known = await request.post("/api/auth/request_code", { data: { fullName: "Mara Lindqvist", email: world.memberEmail } });
  const unknown = await request.post("/api/auth/request_code", { data: { fullName: "Nobody", email: world.outsiderEmail } });
  expect(known.status()).toBe(unknown.status());
  expect(await known.json()).toEqual(await unknown.json());

  // Even with a verified session, someone on no roster sees nothing.
  await signIn(context, request, world.outsiderEmail, "Nobody");
  const res = await page.goto(`/c/${world.clubA.handle}`);
  expect(res?.status()).toBe(404);
  const signed = await context.request.post("/api/media/sign", { data: { mediaIds: [world.clubA.mediaId] } });
  expect((await signed.json()).urls).toEqual({});
});

test("member sees only their club", async ({ page, context, request }) => {
  const { redirectTo } = await signIn(context, request, world.memberEmail, "Mara Lindqvist");
  expect(redirectTo).toBe(`/c/${world.clubA.handle}`);

  // First visit: the invitation is the whole page until they accept (decision 148).
  await page.goto(redirectTo);
  await expect(page.getByRole("heading", { level: 1, name: `Join E2E a ${world.runId}` })).toBeVisible();
  await expect(page.getByText("Album a")).toHaveCount(0);
  // Every new club has face recognition on (decision 121), so the face notice
  // sits in the invitation and has to be ticked first.
  const notice = page.getByRole("checkbox");
  if (await notice.count()) await notice.check();
  await page.getByRole("button", { name: "Accept" }).click();
  await expect(page.getByRole("heading", { level: 1, name: `E2E a ${world.runId}` })).toBeVisible();
  await expect(page.getByText("Album a")).toBeVisible();

  const other = await page.goto(`/c/${world.clubB.handle}`);
  expect(other?.status()).toBe(404);

  const signed = await context.request.post("/api/media/sign", { data: { mediaIds: [world.clubA.mediaId, world.clubB.mediaId] } });
  const { urls } = await signed.json();
  expect(Object.keys(urls)).toEqual([world.clubA.mediaId]);

  // A single download hands over a signed link to the original (decision 154).
  const own = await context.request.get(`/api/media/${world.clubA.mediaId}/download`, { maxRedirects: 0 });
  expect(own.status()).toBe(303);
  const theirs = await context.request.get(`/api/media/${world.clubB.mediaId}/download`, { maxRedirects: 0 });
  expect(theirs.status()).toBe(404);
  const originals = await context.request.post("/api/media/originals", { data: { mediaIds: [world.clubA.mediaId, world.clubB.mediaId] } });
  expect(Object.keys((await originals.json()).urls)).toEqual([world.clubA.mediaId]);
});

test("a password sign-in lands where a code sign-in does", async ({ context }) => {
  const db = admin();
  const password = `e2e-${world.runId}-Password!`;
  const { data: users } = await db.auth.admin.listUsers({ perPage: 1000 });
  const user = users?.users.find((u) => u.email === world.memberEmail);
  if (!user) throw new Error("member has not signed in yet");
  await db.auth.admin.updateUserById(user.id, { password });

  // One club: straight to it, the same as the code route above.
  const one = await context.request.post("/api/auth/password_signin", { data: { email: world.memberEmail, password } });
  expect((await one.json()).redirectTo).toBe(`/c/${world.clubA.handle}`);

  // Two clubs: the club list, unless they came through one club's link.
  await db.from("memberships").insert({ club_id: world.clubB.id, roster_email: world.memberEmail, roster_name: "Mara Lindqvist", user_id: user.id, status: "active" });
  const two = await context.request.post("/api/auth/password_signin", { data: { email: world.memberEmail, password } });
  expect((await two.json()).redirectTo).toBe("/clubs");
  const viaLink = await context.request.post("/api/auth/password_signin", { data: { email: world.memberEmail, password, club: world.clubB.handle } });
  expect((await viaLink.json()).redirectTo).toBe(`/c/${world.clubB.handle}`);

  await db.from("memberships").delete().eq("club_id", world.clubB.id).eq("roster_email", world.memberEmail);
});

test("revoked member loses access", async ({ page, context, request }) => {
  await signIn(context, request, world.memberEmail, "Mara Lindqvist");
  await page.goto(`/c/${world.clubA.handle}`);
  await expect(page.getByText("Album a")).toBeVisible();

  await admin().from("memberships").update({ status: "revoked" }).eq("club_id", world.clubA.id).eq("roster_email", world.memberEmail);

  const res = await page.goto(`/c/${world.clubA.handle}`);
  expect(res?.status()).toBe(404);
  const signed = await context.request.post("/api/media/sign", { data: { mediaIds: [world.clubA.mediaId] } });
  expect((await signed.json()).urls).toEqual({});

  await admin().from("memberships").update({ status: "active" }).eq("club_id", world.clubA.id).eq("roster_email", world.memberEmail);
});

test("signed URL expires", async ({ context, request }) => {
  await signIn(context, request, world.memberEmail, "Mara Lindqvist");
  const signed = await context.request.post("/api/media/sign", { data: { mediaIds: [world.clubA.mediaId], variant: "thumb" } });
  const url: string = (await signed.json()).urls[world.clubA.mediaId];
  expect(url).toBeTruthy();

  expect((await request.get(url)).status()).toBe(200);
  await new Promise((resolve) => setTimeout(resolve, 6000));
  expect((await request.get(url)).status()).toBeGreaterThanOrEqual(400);
});
