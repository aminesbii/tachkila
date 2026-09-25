import { GameError } from "@/lib/server/room";

export function bearerToken(req: Request): string | null {
  const auth = req.headers.get("authorization") ?? "";
  if (!auth.startsWith("Bearer ")) return null;
  const token = auth.slice("Bearer ".length).trim();
  return token.length > 0 ? token : null;
}

export async function parseBody<T>(req: Request): Promise<T> {
  try {
    return (await req.json()) as T;
  } catch {
    throw new GameError("bad_request", "Invalid JSON body.");
  }
}

export function errorStatus(code: string): number {
  switch (code) {
    case "not_found":
      return 404;
    case "forbidden":
      return 403;
    case "conflict":
    case "room_full":
    case "room_started":
      return 409;
    case "code_exhausted":
      return 500;
    default:
      return 400;
  }
}

export function handleError(err: unknown, fallback = "Something went wrong."): Response {
  if (err instanceof GameError) {
    return Response.json(
      { error: err.code, message: err.message },
      { status: errorStatus(err.code) }
    );
  }
  console.error("[api]", err);
  return Response.json({ error: "internal", message: fallback }, { status: 500 });
}

export const ok = () => Response.json({ ok: true } as const);