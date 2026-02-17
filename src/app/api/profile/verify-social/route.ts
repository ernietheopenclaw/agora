import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { platform, handle } = body;

  if (!platform || !handle) {
    return NextResponse.json({ error: "Missing platform or handle" }, { status: 400 });
  }

  // v1/MVP: always return success
  // TODO: wire up real verification (check bio for code)
  return NextResponse.json({ verified: true, platform, handle });
}
