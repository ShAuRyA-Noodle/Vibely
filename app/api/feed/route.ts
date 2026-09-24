import { getFeedPosts } from "@/lib/actions/posts";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const cursor = request.nextUrl.searchParams.get("cursor") || undefined;

  try {
    const feed = await getFeedPosts(cursor);
    return NextResponse.json(feed);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load feed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
