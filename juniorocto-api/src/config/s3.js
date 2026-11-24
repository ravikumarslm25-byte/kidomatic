export const S3 = {
  region: process.env.AWS_REGION || "",
  bucket: process.env.S3_BUCKET || "",
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  publicBase: process.env.S3_PUBLIC_BASE || "",   // set only if the bucket/CDN is public
};
export const s3Enabled = () => !!(S3.region && S3.bucket && S3.accessKeyId && S3.secretAccessKey);
