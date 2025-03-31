import { NextResponse } from 'next/server';
import { Document } from 'llamaindex';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Create a buffer from the file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save the file temporarily
    const uploadDir = join(process.cwd(), 'uploads');
    const filePath = join(uploadDir, file.name);
    await writeFile(filePath, buffer);

    // Process the file with LlamaIndex
    const document = new Document({
      text: buffer.toString(),
      metadata: {
        filename: file.name,
      },
    });

    // Here you can add more LlamaIndex processing logic
    // For example, creating an index, querying the document, etc.

    return NextResponse.json({
      message: 'File processed successfully',
      filename: file.name,
    });
  } catch (error) {
    console.error('Error processing file:', error);
    return NextResponse.json(
      { error: 'Error processing file' },
      { status: 500 }
    );
  }
} 