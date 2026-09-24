import { recordPostImpression } from "@/lib/actions/analytics";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { postId } = await request.json();
    if (postId) {
      await recordPostImpression(postId);
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
