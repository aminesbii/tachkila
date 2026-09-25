import { serializeRoom } from "@/lib/game";
import { getRoomsCollection } from "@/lib/mongodb";
import { bearerToken, handleError } from "@/lib/server/http";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await ctx.params;
    const token = bearerToken(_req);
    const rooms = await getRoomsCollection();
    const room = await rooms.findOne({ _id: code.toUpperCase() });
    if (!room) {
      return Response.json({ error: "not_found", message: "Room not found." }, { status: 404 });
    }
    return Response.json(serializeRoom(room, token));
  } catch (err) {
    return handleError(err);
  }
}