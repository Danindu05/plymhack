import { NextResponse } from "next/server";
import { createPresignedUpload } from "@/lib/s3";

export async function POST(req: Request) {
  try {
    const { fileName, contentType } = await req.json();

    if (!fileName || !contentType) {
      return NextResponse.json(
        { error: "fileName + contentType required" },
        { status: 400 }
      );
    }

    const data = await createPresignedUpload(fileName, contentType);

    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to sign S3 URL" }, { status: 500 });
  }
}
