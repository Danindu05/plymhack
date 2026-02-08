import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
});

export async function createPresignedUpload(
  fileName: string,
  contentType: string
) {
  const safeName = fileName.replace(/\s+/g, "-");

  const key = `uploads/${Date.now()}-${crypto.randomUUID()}-${safeName}`;

  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET!,
    Key: key,
    ContentType: contentType
  });

  const uploadUrl = await getSignedUrl(s3, command, {
    expiresIn: 60 * 5
  });

  const publicUrl = `${process.env.S3_PUBLIC_BASE_URL}/${key}`;

  return {
    uploadUrl,
    publicUrl,
    key
  };
}
