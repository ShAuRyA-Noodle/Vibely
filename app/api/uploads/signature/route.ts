import { ensureUserProfile } from "@/lib/actions/users";
import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

export async function POST() {
  const user = await ensureUserProfile();
  if (!user || !user.onboardingComplete) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.CLOUD_NAME || !process.env.API_KEY || !process.env.API_SECRET) {
    return NextResponse.json(
      { error: "Cloudinary is not configured." },
      { status: 500 }
    );
  }

  const timestamp = Math.round(Date.now() / 1000);
  const folder = "vibely/posts";
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    process.env.API_SECRET
  );

  return NextResponse.json({
    timestamp,
    folder,
    signature,
    cloudName: process.env.CLOUD_NAME,
    apiKey: process.env.API_KEY,
  });
}
