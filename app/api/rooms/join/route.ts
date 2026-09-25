import { joinRoom } from "@/lib/server/room";
import { handleError, parseBody } from "@/lib/server/http";

export async function POST(req: Request) {
  try {
    const body = await parseBody<{ code?: string; name?: string }>(req);
    const { participant } = await joinRoom({
      code: body.code ?? "",
      name: body.name ?? "",
    });
    const code = (body.code ?? "").trim().toUpperCase();
    return Response.json({ code, token: participant.token });
  } catch (err) {
    return handleError(err);
  }
}