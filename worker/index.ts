/// <reference types="@cloudflare/workers-types" />

/**
 * AquaSpain Worker
 *
 * Responsibilities:
 * - Serve the Vite build (static assets) for all regular pages.
 * - Serve the reservoir dataset (`/datos_embalses_optimizado.json`) from KV,
 *   falling back to the build-time copy when KV is empty.
 * - Accept dataset uploads from the GitHub Actions ETL via `POST /api/upload`
 *   (authenticated with a shared secret).
 * - Expose dataset freshness info via `GET /api/status`.
 * - Run a daily scheduled check that flags stale datasets in KV.
 */

const DATA_KEY = "datos_embalses_optimizado.json";
const DATA_PATH = `/${DATA_KEY}`;
const STALE_KEY = "status/stale-alert";
const STALE_ALERT_DAYS = 12;

interface Env {
  DATOS_KV: KVNamespace;
  ASSETS: Fetcher;
  UPLOAD_TOKEN: string;
}

interface DataRecord {
  f?: string | null;
}

interface UploadMetadata {
  uploadedAt: string;
  recordCount: number;
  dataDate: string | null;
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

function isAuthorized(request: Request, env: Env): boolean {
  const header = request.headers.get("Authorization") ?? "";
  const expected = `Bearer ${env.UPLOAD_TOKEN}`;
  return header === expected;
}

function computeDataDate(records: DataRecord[]): string | null {
  let latest: string | null = null;
  for (const record of records) {
    const value = record?.f;
    if (typeof value === "string" && (!latest || value > latest)) {
      latest = value;
    }
  }
  return latest;
}

async function handleUpload(request: Request, env: Env): Promise<Response> {
  if (!isAuthorized(request, env)) {
    return jsonResponse({ ok: false, error: "unauthorized" }, 401);
  }

  const raw = await request.text();

  // Strict validation: JSON.parse also rejects non-standard tokens such as NaN,
  // which previously broke the site (invalid JSON served to browsers).
  let data: { metadatos?: unknown; datos?: DataRecord[] };
  try {
    data = JSON.parse(raw);
  } catch {
    return jsonResponse({ ok: false, error: "invalid JSON payload" }, 400);
  }

  if (!data || !Array.isArray(data.datos)) {
    return jsonResponse({ ok: false, error: "unexpected payload shape" }, 400);
  }

  const metadata: UploadMetadata = {
    uploadedAt: new Date().toISOString(),
    recordCount: data.datos.length,
    dataDate: computeDataDate(data.datos),
  };

  await env.DATOS_KV.put(DATA_KEY, JSON.stringify(data), { metadata });
  return jsonResponse({ ok: true, ...metadata });
}

async function handleStatus(env: Env): Promise<Response> {
  const { metadata } = await env.DATOS_KV.getWithMetadata<UploadMetadata>(DATA_KEY);
  if (!metadata) {
    return jsonResponse({ ok: false, reason: "no dataset stored yet" }, 404);
  }

  const ageDays = Math.max(
    0,
    Math.floor((Date.now() - Date.parse(metadata.uploadedAt)) / 86_400_000),
  );
  const staleAlert = await env.DATOS_KV.get(STALE_KEY);

  return jsonResponse({
    ok: true,
    ...metadata,
    ageDays,
    stale: ageDays >= STALE_ALERT_DAYS,
    staleAlert: staleAlert ? JSON.parse(staleAlert) : null,
  });
}

async function handleDataRequest(request: Request, env: Env): Promise<Response> {
  const { value, metadata } = await env.DATOS_KV.getWithMetadata<UploadMetadata>(DATA_KEY);

  if (value) {
    return new Response(value, {
      headers: {
        "content-type": "application/json; charset=utf-8",
        "access-control-allow-origin": "*",
        "cache-control": "public, max-age=300",
        "x-data-uploaded-at": metadata?.uploadedAt ?? "",
      },
    });
  }

  // Fallback: serve the copy bundled with the current deployment
  return env.ASSETS.fetch(request);
}

async function checkFreshness(env: Env): Promise<void> {
  const { metadata } = await env.DATOS_KV.getWithMetadata<UploadMetadata>(DATA_KEY);
  if (!metadata) {
    console.error("[freshness] no dataset stored in KV");
    return;
  }

  const ageDays = Math.max(
    0,
    Math.floor((Date.now() - Date.parse(metadata.uploadedAt)) / 86_400_000),
  );

  if (ageDays >= STALE_ALERT_DAYS) {
    console.error(`[freshness] dataset is stale (${ageDays} days old, uploadedAt=${metadata.uploadedAt})`);
    await env.DATOS_KV.put(
      STALE_KEY,
      JSON.stringify({ detectedAt: new Date().toISOString(), uploadedAt: metadata.uploadedAt, ageDays }),
    );
  } else {
    await env.DATOS_KV.delete(STALE_KEY);
  }
}

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/upload") {
      if (request.method !== "POST") {
        return jsonResponse({ ok: false, error: "method not allowed" }, 405);
      }
      return handleUpload(request, env);
    }

    if (url.pathname === "/api/status") {
      return handleStatus(env);
    }

    if (url.pathname === DATA_PATH) {
      return handleDataRequest(request, env);
    }

    return env.ASSETS.fetch(request);
  },

  async scheduled(_event, env, ctx): Promise<void> {
    ctx.waitUntil(checkFreshness(env));
  },
} satisfies ExportedHandler<Env>;
