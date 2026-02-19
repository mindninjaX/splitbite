/* OCR utility using Tesseract.js */
import { createWorker } from 'tesseract.js';

/**
 * Extract text from an image file using Tesseract.js OCR
 * @param {File} imageFile - The image file to process
 * @param {function} onProgress - Progress callback (0-100)
 * @returns {Promise<string>} Extracted text
 */
export async function extractTextFromImage(imageFile, onProgress = () => {}) {
  const worker = await createWorker('eng', 1, {
    logger: (m) => {
      if (m.status === 'recognizing text') {
        onProgress(Math.round(m.progress * 100));
      }
    },
  });

  const { data: { text } } = await worker.recognize(imageFile);
  await worker.terminate();

  return text;
}
