import { NextRequest, NextResponse } from 'next/server';
import { uploadBufferToR2, isR2Configured, generatePresignedUploadUrl } from '@/lib/r2';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';

    // If client asks for presigned URL (JSON request)
    if (contentType.includes('application/json')) {
      const { fileName, fileType } = await req.json();

      if (!fileName || !fileType) {
        return NextResponse.json(
          { error: 'fileName dan fileType wajib diisi' },
          { status: 400 }
        );
      }

      const presigned = await generatePresignedUploadUrl(fileName, fileType);
      return NextResponse.json({
        success: true,
        ...presigned,
        isR2Configured,
      });
    }

    // Direct multipart form upload
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Tidak ada berkas yang diunggah' }, { status: 400 });
    }

    // Validation
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf',
      'image/svg+xml',
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipe file tidak didukung. Harap unggah gambar (JPG, PNG, WebP) atau PDF.' },
        { status: 400 }
      );
    }

    const maxSize = 10 * 1024 * 1024; // 10 MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Ukuran file melebihi batas maksimum 10MB.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileKey = `medical/${Date.now()}-${safeName}`;

    const fileUrl = await uploadBufferToR2(buffer, fileKey, file.type);

    return NextResponse.json({
      success: true,
      fileKey,
      fileUrl,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      isR2Configured,
      message: isR2Configured
        ? 'Berkas berhasil disimpan ke Cloudflare R2'
        : 'Berkas berhasil diproses (Modus Pengujian Demo)',
    });
  } catch (error: unknown) {
    console.error('Upload error:', error);
    const message = error instanceof Error ? error.message : 'Gagal mengunggah berkas';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

