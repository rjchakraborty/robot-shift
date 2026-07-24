import assert from "node:assert/strict";
import test from "node:test";

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
