import * as JSZip from "jszip";
import TurndownService from 'turndown';
import {normalizePath} from "./utils.ts";

export enum BookFormat {
  Epub = 'application/epub+zip',
}

const SUPPORTED_FORMATS = [BookFormat.Epub];

interface Resources {
  [key: string]: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  cover: string;
  chapters: Chapter[];
  resources: Resources;
  format: BookFormat;
  hash: string;
}

export interface Chapter {
  title: string;
  mdContent: string;
  htmlContent: string;
}

async function getEPUBMetadata(zip: any): Promise<Omit<Book, 'chapters' | 'format'>> {
  const containerXml = await zip.file('META-INF/container.xml')?.async('text');
  if (!containerXml) throw new Error('container.xml not found');

  const rootFilePath = getRootFilePath(containerXml);
  const opfContent = await zip.file(rootFilePath)?.async('text');
  if (!opfContent) throw new Error('OPF file not found');

  const parser = new DOMParser();
  const opfDoc = parser.parseFromString(opfContent, 'application/xml');

  const title = getMetadataValue(opfDoc, 'dc:title') || '';
  const author = getMetadataValue(opfDoc, 'dc:creator') || '';
  const description = getMetadataValue(opfDoc, 'dc:description') || '';
  const coverPath = getCoverPath(opfDoc, rootFilePath);

  let cover = '';
  if (coverPath) {
    const coverData = await zip.file(coverPath)?.async('base64');
    if (coverData) {
      const mimeType = getMimeType(coverPath);
      cover = `data:${mimeType};base64,${coverData}`;
    }
  }

  // TODO: Calculate and implement hash
  return {title, hash: "", author, description, cover, id: Math.random().toString()} as any;
}

function getRootFilePath(containerXml: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(containerXml, 'application/xml');
  const rootFilePath = doc.getElementsByTagName('rootfile')[0]?.getAttribute('full-path');
  if (!rootFilePath) throw new Error('Root file path not found in container.xml');
  return rootFilePath;
}

function getMetadataValue(doc: Document, tagName: string): string | null {
  const element = doc.getElementsByTagName(tagName)[0];
  return element ? element.textContent : null;
}

function getCoverPath(opfDoc: Document, rootFilePath: string): string | null {
  const metaElements = opfDoc.getElementsByTagName('meta');
  let coverId = null;

  for (let i = 0; i < metaElements.length; i++) {
    const meta = metaElements[i];
    if (meta.getAttribute('name') === 'cover') {
      coverId = meta.getAttribute('content');
      break;
    }
  }

  const manifestItems = opfDoc.getElementsByTagName('item');
  for (let i = 0; i < manifestItems.length; i++) {
    const item = manifestItems[i];
    if (item.getAttribute('id') === coverId || item.getAttribute('properties') === 'cover-image') {
      const href = item.getAttribute('href');
      if (href) {
        const rootDir = rootFilePath.substring(0, rootFilePath.lastIndexOf('/') + 1);
        return rootDir + href;
      }
    }
  }

  return null;
}

function getMimeType(filePath: string): string {
  const extension = filePath.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    default:
      return 'application/octet-stream';
  }
}

export const parseEpub = async (buffer: ArrayBuffer): Promise<Book> => {
  const zip = await JSZip.loadAsync(buffer);
  console.log(Object.keys(zip.files)); // Print the contents of the zip file
  const metadata = await getEPUBMetadata(zip);

  const opfFile = Object.values(zip.files).find(file => file.name.endsWith('.opf'));
  if (!opfFile) throw new Error('OPF file not found');

  const opfContent = await opfFile.async('text');
  const parser = new DOMParser();
  const opfDoc = parser.parseFromString(opfContent, 'application/xml');

  const chapters: Chapter[] = [];
  const spine = opfDoc.getElementsByTagName('spine')[0];
  const itemrefs = spine.getElementsByTagName('itemref');

  // we save all the images from the zip inside a resources array which
  // key is the path and the value is a base64 of the file
  const resources: Resources = {};
  const resourcesPromises: Promise<void>[] = [];

  zip.forEach((relativePath, zipEntry) => {
    if (zipEntry.dir) return;
    resourcesPromises.push(zipEntry.async('base64').then((base64) => {
      const mimeType = getMimeType(relativePath);

      const normalizedPath = normalizePath(relativePath);
      resources[normalizedPath] = `data:${mimeType};base64,${base64}`;
    }));
  })

  await Promise.all(resourcesPromises);

  // Initialize Turndown
  const turndownService = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    emDelimiter: '_',
    strongDelimiter: '**',
    linkStyle: 'inlined',
  });

  for (let i = 0; i < itemrefs.length; i++) {
    const idref = itemrefs[i].getAttribute('idref');
    const manifestItem = opfDoc.querySelector(`manifest item[id="${idref}"]`);
    if (manifestItem) {
      const href = manifestItem.getAttribute('href');
      if (href) {
        let chapterFile = zip.file(`OEBPS/${href}`);
        if (!chapterFile) {
          chapterFile = zip.file(href);
        }
        if (chapterFile) {
          const chapterContent = await chapterFile.async('text');

          // Convert HTML to Markdown
          const markdownContent = turndownService.turndown(chapterContent);

          chapters.push({
            title: href,
            mdContent: markdownContent,
            htmlContent: chapterContent,
          });
        } else {
          console.warn(`Chapter with href ${href} not found in zip`);
        }
      } else {
        console.warn(`Chapter with idref ${idref} has no href`);
      }
    } else {
      console.warn(`Item with idref ${idref} not found in manifest`);
    }
  }

  return {
    ...metadata,
    chapters,
    format: BookFormat.Epub,
    resources,
  };
}

function getFileArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(reader.error);
  });
}

export const parseBook = async (file: File, formats: BookFormat[] = SUPPORTED_FORMATS): Promise<Book> => {
  if (!formats.includes(file.type as BookFormat)) {
    throw new Error('Unsupported format');
  }

  const buffer = await getFileArrayBuffer(file);

  if (file.type === BookFormat.Epub) {
    return parseEpub(buffer);
  } else {
    throw new Error('Unsupported format');
  }
}