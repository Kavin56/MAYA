import { createOpencodeClient } from "@opencode-ai/sdk/v2/client";
import { fetch as tauriFetch } from "@tauri-apps/plugin-http";

import { isTauriRuntime } from "../utils";
import { hydrateOpenworkServerTokenFromRemote } from "./openwork-server";

type FieldsResult<T> =
  | ({ data: T; error?: undefined } & { request: Request; response: Response })
  | ({ data?: undefined; error: unknown } & { request: Request; response: Response });

export type OpencodeAuth = {
  username?: string;
  password?: string;
  token?: string;
  mode?: "basic" | "openwork";
};

const DEFAULT_OPENCODE_REQUEST_TIMEOUT_MS = 300_000;

async function fetchWithTimeout(
  fetchImpl: typeof globalThis.fetch,
  input: RequestInfo | URL,
  init: RequestInit | undefined,
  timeoutMs: number,
) {
  const urlString = typeof input === "string" ? input : (input instanceof URL ? input.toString() : (input as Request).url || "");
  const mergedInit = { ...init, keepalive: true };
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0 || urlString.includes("/event/subscribe")) {
    return fetchImpl(input, mergedInit);
  }

  const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
  const signal = controller?.signal;
  const initWithSignal = signal && !mergedInit.signal ? { ...(mergedInit ?? {}), signal } : mergedInit;

  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      try {
        controller?.abort();
      } catch {
        // ignore
      }
      reject(new Error("Request timed out."));
    }, timeoutMs);
  });

  try {
    return await Promise.race([fetchImpl(input, initWithSignal), timeoutPromise]);
  } catch (error) {
    const name = (error && typeof error === "object" && "name" in error ? (error as any).name : "") as string;
    if (name === "AbortError") {
      throw new Error("Request timed out.");
    }
    throw error;
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

const encodeBasicAuth = (auth?: OpencodeAuth) => {
  if (!auth?.username || !auth?.password) return null;
  const token = `${auth.username}:${auth.password}`;
  if (typeof btoa === "function") return btoa(token);
  const buffer = (globalThis as { Buffer?: { from: (input: string, encoding: string) => { toString: (encoding: string) => string } } })
    .Buffer;
  return buffer ? buffer.from(token, "utf8").toString("base64") : null;
};

const resolveAuthHeader = (auth?: OpencodeAuth) => {
  if (auth?.mode === "openwork" && auth.token) {
    return `Bearer ${auth.token}`;
  }
  const encoded = encodeBasicAuth(auth);
  return encoded ? `Basic ${encoded}` : null;
};

const serializeHeaders = (headers: HeadersInit | undefined): Record<string, string> => {
  if (!headers) return {};
  if (headers instanceof Headers) {
    const obj: Record<string, string> = {};
    headers.forEach((value, key) => {
      obj[key] = value;
    });
    return obj;
  }
  if (Array.isArray(headers)) {
    const obj: Record<string, string> = {};
    for (const [key, value] of headers) {
      obj[key] = value;
    }
    return obj;
  }
  return headers as Record<string, string>;
};

const createTauriFetch = (auth?: OpencodeAuth, getToken?: () => string | undefined) => {
  const authHeader = resolveAuthHeader(auth);
  const useRequestTimeToken = Boolean(getToken && auth?.mode === "openwork");
  const addAuth = (headers: Record<string, string>) => {
    const authKey = Object.keys(headers).find(k => k.toLowerCase() === "authorization");
    if (authKey) return;
    const h = useRequestTimeToken
      ? (getToken?.()?.trim() ? `Bearer ${getToken?.()?.trim()}` : null)
      : authHeader;
    if (h) headers["Authorization"] = h;
  };

  const run401Refresh = async (urlString: string, res: Response) => {
    if (res.status !== 401 || auth?.mode !== "openwork") return;
    try {
      const origin = new URL(urlString).origin;
      await hydrateOpenworkServerTokenFromRemote(origin);
    } catch {
      // ignore
    }
  };

  return async (input: RequestInfo | URL, init?: RequestInit) => {
    if (input instanceof Request) {
      const headers = serializeHeaders(input.headers);
      addAuth(headers);

      const newInit: RequestInit = {
        method: input.method,
        headers,
        cache: input.cache,
        credentials: input.credentials,
        integrity: input.integrity,
        mode: input.mode,
        redirect: input.redirect,
        referrer: input.referrer,
        referrerPolicy: input.referrerPolicy,
      };

      if (input.method !== "GET" && input.method !== "HEAD" && input.body) {
        try {
          // Read streaming Request bodies into a solid byte array (Uint8Array)
          // to completely sidestep 'duplex: half' and ArrayBuffer IPC limitations
          newInit.body = new Uint8Array(await input.clone().arrayBuffer());
        } catch {
          newInit.body = input.body;
        }
      }

      // Rebuilding a Request instance drops the object, so we must invoke globalThis.fetch directly with URL + init
      const timeoutOverride = input.url.includes("/event/subscribe") ? 0 : DEFAULT_OPENCODE_REQUEST_TIMEOUT_MS;
      const res = await fetchWithTimeout(
        globalThis.fetch,
        input.url,
        newInit,
        timeoutOverride,
      );
      await run401Refresh(input.url, res);
      return res;
    }

    const headers = serializeHeaders(init?.headers);
    addAuth(headers);

    const urlString = typeof input === "string" ? input : (input instanceof Request ? input.url : input.toString());
    const timeoutOverride = urlString.includes("/event/subscribe") ? 0 : DEFAULT_OPENCODE_REQUEST_TIMEOUT_MS;

    const res = await fetchWithTimeout(
      globalThis.fetch,
      input,
      {
        ...init,
        headers,
      },
      timeoutOverride,
    );
    await run401Refresh(urlString, res);
    return res;
  };
};

export function unwrap<T>(result: FieldsResult<T>): NonNullable<T> {
  if (result.data !== undefined) {
    return result.data as NonNullable<T>;
  }
  const message =
    result.error instanceof Error
      ? result.error.message
      : typeof result.error === "string"
        ? result.error
        : JSON.stringify(result.error);
  throw new Error(message || "Unknown error");
}

export function createClient(
  baseUrl: string,
  directory?: string,
  auth?: OpencodeAuth,
  options?: { getToken?: () => string | undefined; headers?: Record<string, string>; [k: string]: unknown }
) {
  const getToken = options?.getToken;
  const useRequestTimeToken = Boolean(getToken && auth?.mode === "openwork");
  const headers: Record<string, string> = {
    "ngrok-skip-browser-warning": "1",
  };
  if (!isTauriRuntime() && !useRequestTimeToken) {
    const authHeader = resolveAuthHeader(auth);
    if (authHeader) {
      headers.Authorization = authHeader;
    }
  }
  // #region agent log
  try {
    const hasAuth = Boolean(auth?.token && auth?.mode === "openwork");
    fetch('http://127.0.0.1:7242/ingest/c88f07d5-0f01-46c3-ba3e-034808f0bae7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'opencode.ts:createClient',message:'createClient',data:{hasAuth,baseUrlPrefix:(baseUrl||'').slice(0,60)},timestamp:Date.now(),hypothesisId:'H2'})}).catch(()=>{});
  } catch (_) {}
  // #endregion

  const fetchImpl = isTauriRuntime()
    ? createTauriFetch(auth, getToken)
    : async (input: RequestInfo | URL, init?: RequestInit) => {
        let mergedInit = init;
        if (useRequestTimeToken && getToken) {
          const token = getToken()?.trim();
          const h = init?.headers ? new Headers(init.headers) : new Headers();
          if (token) h.set("Authorization", `Bearer ${token}`);
          mergedInit = { ...init, headers: h };
        }
        const res = await fetchWithTimeout(globalThis.fetch, input, mergedInit, DEFAULT_OPENCODE_REQUEST_TIMEOUT_MS);
        if (res.status === 401 && typeof window !== "undefined" && auth?.mode === "openwork") {
          try {
            const urlString = typeof input === "string" ? input : (input instanceof URL ? input.toString() : (input as Request).url ?? "");
            const origin = new URL(urlString).origin;
            await hydrateOpenworkServerTokenFromRemote(origin);
          } catch {
            // ignore
          }
        }
        return res;
      };
  const { getToken: _gt, ...restOptions } = options ?? {};
  return createOpencodeClient({
    baseUrl,
    directory,
    headers: Object.keys(headers).length ? Object.assign(headers, restOptions?.headers) : restOptions?.headers,
    fetch: fetchImpl,
    ...restOptions,
  });
}

export async function waitForHealthy(
  client: ReturnType<typeof createClient>,
  options?: { timeoutMs?: number; pollMs?: number },
) {
  const timeoutMs = options?.timeoutMs ?? 10_000;
  const pollMs = options?.pollMs ?? 250;

  const start = Date.now();
  let lastError: string | null = null;

  while (Date.now() - start < timeoutMs) {
    try {
      const health = unwrap(await client.global.health());
      if (health.healthy) {
        return health;
      }
      lastError = "Server reported unhealthy";
    } catch (error) {
      lastError = error instanceof Error ? error.message : "Unknown error";
    }
    await new Promise((resolve) => setTimeout(resolve, pollMs));
  }

  throw new Error(lastError ?? "Timed out waiting for server health");
}
