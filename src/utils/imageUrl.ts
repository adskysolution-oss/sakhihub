export const getProxiedImageUrl = (url?: string): string => {
  if (!url) return '';
  if (url.includes('amazonaws.com')) {
    return `/api/file/preview?url=${encodeURIComponent(url)}`;
  }
  return url;
};
