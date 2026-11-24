// Direct-to-S3 upload via presigned URLs. The API only signs; the file goes
// straight to the bucket (fast, scalable, KYC-safe).
import { api } from "./api";

export async function presignUpload({ name, type, folder }) {
  const { data } = await api.post("/uploads/presign", { fileName: name, contentType: type, folder });
  return data.data ?? data;
}
export function putToS3(uploadUrl, file, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl);
    if (file.type) xhr.setRequestHeader("Content-Type", file.type);
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress?.(Math.round((e.loaded / e.total) * 100));
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error("Upload failed")));
    xhr.onerror = () => reject(new Error("Upload failed"));
    xhr.send(file);
  });
}
export async function signGet(key) {
  const { data } = await api.get("/uploads/sign-get", { params: { key } });
  return (data.data ?? data).url;
}
export async function uploadFile(file, folder, onProgress) {
  const p = await presignUpload({ name: file.name, type: file.type, folder });
  await putToS3(p.uploadUrl, file, onProgress);
  return { key: p.key, name: file.name, publicUrl: p.publicUrl || null };
}
