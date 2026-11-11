import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
export const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'sim-klinik-files';
export const publicDomain = process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL || '';

// S3 Client configured for Cloudflare R2
export const r2Client = new S3Client({
  region: 'auto',
  endpoint: accountId ? `https://${accountId}.r2.cloudflarestorage.com` : undefined,
  credentials:
    accessKeyId && secretAccessKey
      ? {
          accessKeyId,
          secretAccessKey,
        }
      : undefined,
});

export const isR2Configured = Boolean(accountId && accessKeyId && secretAccessKey && !accountId.includes('placeholder'));

/**
 * Generate a pre-signed URL for direct browser-to-R2 upload
 */
export async function generatePresignedUploadUrl(
  fileName: string,
  contentType: string,
  expiresInSeconds: number = 3600
): Promise<{ uploadUrl: string; fileKey: string; publicUrl: string }> {
  const fileKey = `medical-attachments/${Date.now()}-${fileName.replace(/\s+/g, '_')}`;

  if (!isR2Configured) {
    // Return mock configuration for development when R2 is not yet linked
    return {
      uploadUrl: `/api/upload/mock`,
      fileKey,
      publicUrl: `https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80`,
    };
  }

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: fileKey,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: expiresInSeconds });
  const publicUrl = publicDomain ? `${publicDomain}/${fileKey}` : uploadUrl.split('?')[0];

  return {
    uploadUrl,
    fileKey,
    publicUrl,
  };
}

/**
 * Direct server-side upload to R2
 */
export async function uploadBufferToR2(
  buffer: Buffer,
  fileKey: string,
  contentType: string
): Promise<string> {
  if (!isR2Configured) {
    // Demo fallback URL
    return `https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&q=80`;
  }

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: fileKey,
    Body: buffer,
    ContentType: contentType,
  });

  await r2Client.send(command);

  return publicDomain ? `${publicDomain}/${fileKey}` : fileKey;
}

