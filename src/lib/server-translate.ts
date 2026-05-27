/**
 * Utility for Server-Side Dynamic Data Translation using Google Cloud Translation API.
 * Keeps English as default fallback and preserves non-translatable structures.
 */

// Simple in-memory cache to prevent redundant translations across requests.
// In production, consider Redis or LRU cache for high traffic.
const translationCache = new Map<string, string>();

/**
 * Calls the Google Translate REST API for an array of strings.
 */
async function fetchGoogleTranslations(texts: string[], targetLang: string): Promise<string[] | null> {
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    console.warn("GOOGLE_TRANSLATE_API_KEY is not defined. Skipping translation.");
    return null;
  }

  try {
    const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: texts,
        target: targetLang,
        format: 'html' // Preserve HTML/JSX tags if present
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Google Translate API Error (${response.status}):`, errorText);
      return null; // Return null on failure to prevent caching fallbacks
    }

    const json = await response.json();
    return json.data.translations.map((t: any) => t.translatedText);
  } catch (error) {
    console.error("Failed to fetch from Google Translate API:", error);
    return null; // Fallback
  }
}

/**
 * Recursively extracts texts for specific fields, translates them, and injects them back.
 * 
 * @param data The array or object (e.g. Mongoose document or lean object)
 * @param targetLang Target language code (e.g. 'mr', 'hi')
 * @param fieldsToTranslate Array of object keys that should be translated (e.g. ['title', 'description'])
 * @returns A deep clone of the data with translated fields.
 */
export async function translateDynamicData(data: any, targetLang: string, fieldsToTranslate: string[]): Promise<any> {
  // Always return original if English or invalid input
  if (!data || !targetLang || targetLang === 'en' || fieldsToTranslate.length === 0) {
    return data;
  }

  // Ensure data is plain object to avoid Mongoose Document mutations
  const clone = JSON.parse(JSON.stringify(data));
  
  // 1. Traverse and collect all strings that need translation
  const textQueue: { ref: any; key: string; text: string }[] = [];

  function traverse(obj: any, parentKey?: string) {
    if (!obj || typeof obj !== 'object') return;
    
    if (Array.isArray(obj)) {
      obj.forEach((item, index) => {
        if (typeof item === 'string' && item.trim() !== '' && parentKey && fieldsToTranslate.includes(parentKey)) {
          textQueue.push({ ref: obj, key: index.toString(), text: item });
        } else if (typeof item === 'object') {
          traverse(item, parentKey);
        }
      });
    } else {
      for (const key of Object.keys(obj)) {
        if (fieldsToTranslate.includes(key) && typeof obj[key] === 'string' && obj[key].trim() !== '') {
          textQueue.push({ ref: obj, key, text: obj[key] });
        } else if (typeof obj[key] === 'object') {
          traverse(obj[key], key);
        }
      }
    }
  }

  traverse(clone);

  if (textQueue.length === 0) {
    return clone;
  }

  // 2. Map texts, check cache, prepare for API
  const textsToTranslate: string[] = [];
  const queueIndexesToApiIndexes = new Map<number, number>();

  for (let i = 0; i < textQueue.length; i++) {
    const { text } = textQueue[i];
    const cacheKey = `${targetLang}:${text}`;
    
    if (translationCache.has(cacheKey)) {
      // Already cached, inject immediately
      textQueue[i].ref[textQueue[i].key] = translationCache.get(cacheKey);
    } else {
      // Needs translation
      const newApiIndex = textsToTranslate.length;
      textsToTranslate.push(text);
      queueIndexesToApiIndexes.set(i, newApiIndex);
    }
  }

  // 3. Batch API Call
  if (textsToTranslate.length > 0) {
    const translatedTexts = await fetchGoogleTranslations(textsToTranslate, targetLang);
    
    // If translation failed, translatedTexts will be null. Fallback to original without caching.
    const hasTranslations = translatedTexts !== null && translatedTexts.length === textsToTranslate.length;

    // 4. Re-inject and cache
    for (const [queueIndex, apiIndex] of queueIndexesToApiIndexes.entries()) {
      const originalText = textQueue[queueIndex].text;
      const translated = hasTranslations ? translatedTexts[apiIndex] : originalText;
      
      // Inject back into object
      textQueue[queueIndex].ref[textQueue[queueIndex].key] = translated;
      
      // Save to cache ONLY if successful and actually translated
      if (hasTranslations) {
        translationCache.set(`${targetLang}:${originalText}`, translated);
      }
    }
  }

  return clone;
}
