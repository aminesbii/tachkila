import { createRoom } from "@/lib/server/room";
import { handleError, parseBody } from "@/lib/server/http";

export async function POST(req: Request) {
  try {
    const body = await parseBody<{
      name?: string;
      formationKey?: string;
      blindMode?: boolean;
    }>(req);
    const { code, participant } = await createRoom({
      name: body.name ?? "",
      formationKey: body.formationKey ?? "4-4-2",
      blindMode: body.blindMode ?? true,
    });
    return Response.json({ code, token: participant.token });
  } catch (err) {
    return handleError(err);
  }
}