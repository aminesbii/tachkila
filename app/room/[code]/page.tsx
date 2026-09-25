import { RoomView } from "@/components/room/room-view";

export default async function RoomPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const normalized = code.toUpperCase();
  return <RoomView code={normalized} />;
}