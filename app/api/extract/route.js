import { NextResponse } from 'next/server';
import { extractText } from 'unpdf';
import mammoth from 'mammoth';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    }

    const fileName = file.name.toLowerCase();
    const buffer = Buffer.from(await file.arrayBuffer());
    let text = '';

    if (fileName.endsWith('.pdf')) {
      const { text: pdfText } = await extractText(new Uint8Array(buffer));
      return Array.isArray(pdfText) ? pdfText.join(' ').trim() : pdfText.trim();
    } else if (fileName.endsWith('.docx')) {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else {
      return NextResponse.json(
        { error: 'Unsupported file format. Please upload a PDF or DOCX.' },
        { status: 400 }
      );
    }

    if (!text || text.trim().length < 50) {
      return NextResponse.json(
        { error: 'Could not extract readable text from this file. Try a different file.' },
        { status: 422 }
      );
    }

    return NextResponse.json({ text: text.trim() });
  } catch (err) {
    console.error('Extraction error:', err);
    return NextResponse.json(
      { error: 'File extraction failed. Please try again.' },
      { status: 500 }
    );
  }
}