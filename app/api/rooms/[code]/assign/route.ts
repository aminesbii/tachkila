import { assignPlayer } from "@/lib/server/room";
import { bearerToken, handleError, ok, parseBody } from "@/lib/server/http";

export async function POST(_req: Request, ctx: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await ctx.params;
    const body = await parseBody<{ entryId?: string; seat?: number; bid?: number }>(_req);
    await assignPlayer(code, bearerToken(_req), {
      entryId: body.entryId ?? "",
      seat: typeof body.seat === "number" ? body.seat : 0,
      bid: typeof body.bid === "number" ? body.bid : 0,
    });
    return ok();
  } catch (err) {
    return handleError(err);
  }
}