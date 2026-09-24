import { getUnreadCount } from "@/lib/actions/notifications";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const count = await getUnreadCount();
    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
