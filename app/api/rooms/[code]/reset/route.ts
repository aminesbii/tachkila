import { resetRoom } from "@/lib/server/room";
import { bearerToken, handleError, ok } from "@/lib/server/http";

export async function POST(_req: Request, ctx: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await ctx.params;
    await resetRoom(code, bearerToken(_req));
    return ok();
  } catch (err) {
    return handleError(err);
  }
}