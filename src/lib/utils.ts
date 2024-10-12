import JSZip from 'jszip';

export async function loadImageFromZip(zip: JSZip, src: string): Promise<string> {
  const file = zip.file(src);
  if (!file) {
    throw new Error(`File ${src} not found in zip`);
  }
  const blob = await file.async('blob');
  return URL.createObjectURL(blob);
}

export const normalizePath = (path: string) => {
  // a normalized path is a path that can be used to be loaded from the resources object.
  // a normalized path should not start with 'OEBPS/' and should be lowercase, also, shouldn't be relative, so
  // it should not start with './' or '../'
  let normalizedPath = path.startsWith('OEBPS/') ? path.slice(6) : path;
  normalizedPath = normalizedPath.toLowerCase();

  if (normalizedPath.startsWith('./')) {
    normalizedPath = normalizedPath.slice(2);
  }

  if (normalizedPath.startsWith('../')) {
    normalizedPath = normalizedPath.slice(3);
  }

  return normalizedPath;
}