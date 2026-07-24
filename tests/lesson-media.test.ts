import assert from "node:assert/strict";
import test from "node:test";

import { curriculumDays } from "../app/curriculum";
import {
  hasReviewedFoundationTopicMedia,
  REVIEWED_FOUNDATION_MEDIA_DAY_IDS,
} from "../app/lesson-media-days";
import { resolveLessonMedia } from "../app/lesson-media-catalog";

test("official optional media covers all 26 weeks within the quiet UI limit", () => {
  for (let week = 1; week <= 26; week += 1) {
    const firstDay = Math.min((week - 1) * 7 + 1, 180);
    const media = resolveLessonMedia(week, firstDay);

    assert.ok(
      media.video || media.explore.length > 0,
      `week ${week} needs at least one useful official media item`,
    );
    assert.ok(media.explore.length <= 2, `week ${week} exceeds the explore-link limit`);

    if (media.video) {
      assert.match(media.video.youtubeId, /^[A-Za-z0-9_-]{11}$/);
      assert.match(media.video.sourceUrl, /^https:\/\//);
      assert.ok(media.video.publisher.length > 4);
      assert.ok(media.video.why.length > 30);
    }

    for (const item of media.explore) {
      assert.match(item.url, /^https:\/\//);
      assert.ok(item.publisher.length > 2);
      assert.ok(item.why.length > 30);
    }
  }
});

test("media resolver is stable and never generates an autoplay URL", () => {
  const first = resolveLessonMedia(1, 1);
  const second = resolveLessonMedia(1, 1);

  assert.deepEqual(first, second);
  assert.doesNotMatch(JSON.stringify(first), /autoplay/i);
});

test("the first 14 topic titles resolve only to explicitly reviewed videos", () => {
  const expectedVideoByTitle = new Map<string, string | undefined>([
    ["Robot anatomy: sense, think, act, links, and actuators", undefined],
    ["Joints, allowed motion, and degrees of freedom", "Degrees of freedom of a rigid body"],
    ["Configuration, C-space, workspace, limits, and topology", "Configuration-space topology"],
    ["Number lines, coordinates, scalars, variables, and physical units", undefined],
    ["Vectors from arrows: components, add, subtract, norm, and dot product", undefined],
    ["Coordinate frames, axes, origins, and handedness", undefined],
    ["Matrices from grids: inputs, outputs, and simple actions", undefined],
    ["2D rotation, translation, transforms, degrees, radians, sine, and cosine", "Rotation matrices"],
    ["Compose and invert transforms through a frame tree", "Homogeneous transformation matrices"],
    ["SO(3): safe 3D rotation matrices", "Rotation matrices"],
    ["Euler angles, quaternions, and representation singularities", undefined],
    ["SE(3): one 3D pose matrix", "Homogeneous transformation matrices"],
    ["Forward kinematics for a serial arm", "Forward kinematics example"],
    ["Jacobian intuition and bounded numerical inverse kinematics", "The space Jacobian"],
  ]);

  const foundationDays = curriculumDays.slice(0, 14);
  assert.equal(foundationDays.length, expectedVideoByTitle.size);

  for (const day of foundationDays) {
    assert.ok(expectedVideoByTitle.has(day.title), `unreviewed foundation title: ${day.title}`);
    const media = resolveLessonMedia(day.week, day.id);
    assert.equal(
      media.video?.title,
      expectedVideoByTitle.get(day.title),
      `day ${day.id} media does not match “${day.title}”`,
    );
  }
});

test("every reviewed foundation media item is reachable on its exact lesson", () => {
  const expectedReachableDays: number[] = [];

  for (const day of curriculumDays.slice(0, 14)) {
    const media = resolveLessonMedia(day.week, day.id);
    const hasMedia = Boolean(media.video || media.explore.length > 0);
    assert.equal(
      hasReviewedFoundationTopicMedia(day.id),
      hasMedia,
      `day ${day.id} reachability must match its reviewed media`,
    );
    if (hasMedia) expectedReachableDays.push(day.id);
  }

  assert.deepEqual(
    REVIEWED_FOUNDATION_MEDIA_DAY_IDS,
    expectedReachableDays,
  );
});
