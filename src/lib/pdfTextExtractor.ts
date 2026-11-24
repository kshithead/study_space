import * as pdfjsLib from "pdfjs-dist";

// Configure worker for Vite and browser environments
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

// In-memory / session cache for extracted document text
const textCache = new Map<string, string>();

/**
 * Extract clean, structured text from an ArrayBuffer, File, or remote PDF URL
 */
export async function extractPdfText(
  source: string | File | ArrayBuffer,
  maxPages = 20
): Promise<string> {
  const cacheKey = typeof source === "string" ? source : (source as File).name || "buffer";
  if (textCache.has(cacheKey)) {
    return textCache.get(cacheKey)!;
  }

  // Check sessionStorage
  try {
    const stored = sessionStorage.getItem(`ss.pdfText.${encodeURIComponent(cacheKey)}`);
    if (stored) {
      textCache.set(cacheKey, stored);
      return stored;
    }
  } catch {}

  try {
    let data: ArrayBuffer | Uint8Array;

    if (typeof source === "string") {
      const res = await fetch(source);
      if (!res.ok) throw new Error(`HTTP ${res.status} fetching PDF`);
      data = await res.arrayBuffer();
    } else if (source instanceof File) {
      data = await source.arrayBuffer();
    } else {
      data = source;
    }

    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(data),
      useSystemFonts: true,
      standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/standard_fonts/`,
    });

    const doc = await loadingTask.promise;
    const pageLimit = Math.min(doc.numPages, maxPages);
    const pagesText: string[] = [];

    for (let pageNum = 1; pageNum <= pageLimit; pageNum++) {
      const page = await doc.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageStrings = textContent.items
        .map((item: any) => item.str || "")
        .filter(Boolean);
      const joined = pageStrings.join(" ");
      if (joined.trim()) {
        pagesText.push(`[Page ${pageNum}]: ${joined}`);
      }
    }

    const fullText = pagesText.join("\n\n");
    if (fullText.trim()) {
      textCache.set(cacheKey, fullText);
      try {
        sessionStorage.setItem(
          `ss.pdfText.${encodeURIComponent(cacheKey)}`,
          fullText.slice(0, 40000)
        );
      } catch {}
      return fullText;
    }
  } catch (err) {
    console.warn("pdfjs text extraction warning:", err);
  }

  return "";
}

/**
 * Retrieve cached text if already extracted
 */
export function getCachedPdfText(key: string): string {
  if (textCache.has(key)) return textCache.get(key)!;
  try {
    const stored = sessionStorage.getItem(`ss.pdfText.${encodeURIComponent(key)}`);
    if (stored) {
      textCache.set(key, stored);
      return stored;
    }
  } catch {}
  return "";
}
