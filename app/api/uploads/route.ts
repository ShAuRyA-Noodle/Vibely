import { ensureUserProfile } from "@/lib/actions/users";
import { IPostMedia } from "@/models/post.model";
import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const MAX_IMAGES = 4;
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;

function isImage(file: File) {
  return file.type.startsWith("image/");
}

function isVideo(file: File) {
  return file.type.startsWith("video/");
}

function validateFiles(files: File[]) {
  if (files.length === 0) {
    throw new Error("Choose at least one image or video.");
  }

  if (files.length > MAX_IMAGES) {
    throw new Error("Choose up to 4 images or 1 video.");
  }

  const imageFiles = files.filter(isImage);
  const videoFiles = files.filter(isVideo);

  if (imageFiles.length + videoFiles.length !== files.length) {
    throw new Error("Only image and video files are supported.");
  }

  if (videoFiles.length > 1 || (videoFiles.length === 1 && files.length > 1)) {
    throw new Error("Choose either 1 video or up to 4 images.");
  }

  for (const file of imageFiles) {
    if (file.size > MAX_IMAGE_BYTES) {
      throw new Error("Images must be 8MB or smaller.");
    }
  }

  for (const file of videoFiles) {
    if (file.size > MAX_VIDEO_BYTES) {
      throw new Error("Videos must be 50MB or smaller.");
    }
  }
}

async function uploadFile(file: File): Promise<IPostMedia> {
  const resourceType = isVideo(file) ? "video" : "image";
  const buffer = Buffer.from(await file.arrayBuffer());

  const result = await new Promise<any>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "vibely/posts",
        resource_type: resourceType,
      },
      (error, uploadResult) => {
        if (error || !uploadResult) {
          reject(error || new Error("Cloudinary upload failed."));
          return;
        }

        resolve(uploadResult);
      }
    );

    stream.end(buffer);
  });

  return {
    type: resourceType,
    resourceType,
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
    duration: result.duration,
    bytes: result.bytes,
    format: result.format,
  };
}

async function destroyUploaded(media: IPostMedia[]) {
  await Promise.allSettled(
    media.map((item) =>
      cloudinary.uploader.destroy(item.publicId, {
        resource_type: item.resourceType,
      })
    )
  );
}

export async function POST(request: Request) {
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

  const formData = await request.formData();
  const files = formData
    .getAll("files")
    .filter((file): file is File => file instanceof File);
  const uploaded: IPostMedia[] = [];

  try {
    validateFiles(files);

    for (const file of files) {
      uploaded.push(await uploadFile(file));
    }

    return NextResponse.json({ media: uploaded });
  } catch (error) {
    await destroyUploaded(uploaded);
    const message = error instanceof Error ? error.message : "Upload failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
