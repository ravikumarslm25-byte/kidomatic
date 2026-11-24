import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";
import { S3, s3Enabled } from "../../config/s3.js";
import { asyncHandler, AppError } from "../../core/errors.js";

const client = () => new S3Client({ region: S3.region, credentials: { accessKeyId: S3.accessKeyId, secretAccessKey: S3.secretAccessKey }, requestChecksumCalculation: "WHEN_REQUIRED", responseChecksumValidation: "WHEN_REQUIRED" });

// Browser uploads directly to S3 using this short-lived PUT URL.
export const presignPut = asyncHandler(async (req, res) => {
  if (!s3Enabled()) throw new AppError("File storage is not configured. Add AWS keys + S3_BUCKET to the server .env.", 503);
  const { fileName, contentType, folder = "uploads" } = req.body || {};
  if (!fileName) throw new AppError("fileName is required", 400);
  const safe = String(fileName).replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = `${req.user?.schoolId || "public"}/${folder}/${randomUUID()}-${safe}`;
  const uploadUrl = await getSignedUrl(client(), new PutObjectCommand({ Bucket: S3.bucket, Key: key, ContentType: contentType }), { expiresIn: 300 });
  res.json({ data: { uploadUrl, key, publicUrl: S3.publicBase ? `${S3.publicBase}/${key}` : null } });
});

// Short-lived GET URL to view a private object.
export const presignGet = asyncHandler(async (req, res) => {
  if (!s3Enabled()) throw new AppError("File storage is not configured.", 503);
  const key = req.query.key;
  if (!key) throw new AppError("key is required", 400);
  const url = await getSignedUrl(client(), new GetObjectCommand({ Bucket: S3.bucket, Key: key }), { expiresIn: 300 });
  res.json({ data: { url } });
});
