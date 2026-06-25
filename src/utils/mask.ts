/**
 * Reusable utility to mask public IDs (e.g. Employee ID, Vendor Code)
 * to protect user privacy in public-facing listings.
 * 
 * Example input: "EMP889877" -> output: "EMP88****"
 * Example input: "FDR000001" -> output: "FDR00****"
 */
export function maskPublicId(id?: string): string {
  if (!id) return '';
  const str = String(id).trim();
  if (str.length <= 4) {
    return str + '****';
  }
  // Mask the last 4 characters
  return str.slice(0, -4) + '****';
}
