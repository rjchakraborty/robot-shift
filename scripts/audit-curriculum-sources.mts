import { loadAllChapterContent } from "../app/chapter-content/index";

type SourceRecord = {
  labels: Set<string>;
  url: string;
  weeks: Set<number>;
};

type AuditResult = {
  error?: string;
  labels: string[];
  ok: boolean;
  status?: number;
  statusText?: string;
  url: string;
  weeks: number[];
};

const REQUEST_TIMEOUT_MS = 15_000;
const CONCURRENCY = 8;

async function checkSource(source: SourceRecord): Promise<AuditResult> {
  const shared = {
    labels: [...source.labels].sort(),
    url: source.url,
    weeks: [...source.weeks].sort((left, right) => left - right),
  };

  try {
    const response = await fetch(source.url, {
      headers: {
        Accept: "text/html,application/pdf;q=0.9,*/*;q=0.8",
        Range: "bytes=0-0",
        "User-Agent": "RobotShift-Curriculum-Audit/1.0",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    await response.body?.cancel();
    return {
      ...shared,
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
    };
  } catch (error) {
    return {
      ...shared,
      error: error instanceof Error ? error.message : String(error),
      ok: false,
    };
  }
}

const chapters = await loadAllChapterContent();
const uniqueSources = new Map<string, SourceRecord>();

for (const chapter of chapters) {
  for (const source of chapter.sources) {
    const existing = uniqueSources.get(source.url) ?? {
      labels: new Set<string>(),
      url: source.url,
      weeks: new Set<number>(),
    };
    existing.labels.add(source.label);
    existing.weeks.add(chapter.week);
    uniqueSources.set(source.url, existing);
  }
}

const queue = [...uniqueSources.values()].sort((left, right) =>
  left.url.localeCompare(right.url)
);
const results: AuditResult[] = [];
let cursor = 0;

async function worker() {
  while (cursor < queue.length) {
    const index = cursor;
    cursor += 1;
    results[index] = await checkSource(queue[index]);
  }
}

await Promise.all(
  Array.from(
    { length: Math.min(CONCURRENCY, queue.length) },
    () => worker(),
  ),
);

const sourceEntries = chapters.reduce(
  (count, chapter) => count + chapter.sources.length,
  0,
);
const reachable = results.filter((result) => result.ok).length;
const payload = {
  checkedAt: new Date().toISOString(),
  request: {
    concurrency: CONCURRENCY,
    method: "GET",
    range: "bytes=0-0",
    timeoutMs: REQUEST_TIMEOUT_MS,
  },
  summary: {
    sourceEntries,
    uniqueUrls: results.length,
    reachable,
    unreachable: results.length - reachable,
  },
  results,
};

if (process.argv.includes("--summary")) {
  console.log(JSON.stringify({
    ...payload.summary,
    failures: results.filter((result) => !result.ok),
  }, null, 2));
} else {
  console.log(JSON.stringify(payload, null, 2));
}
