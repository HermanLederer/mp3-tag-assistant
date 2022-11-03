import * as path from 'path';
import { loadTag, TagCarrier } from 'native-addon';

interface ISuppotedFile {
  name: string;
  path: string;
  location: string;
  tag: TagCarrier | null;
}

function getSupportedFileFomPath(filePath: string): ISuppotedFile {
  const supportedFile: ISuppotedFile = {
    name: path.basename(filePath, path.extname(filePath)),
    location: path.dirname(filePath),
    path: filePath,
    tag: null,
  };

  // Metadata
  try {
    const tag = loadTag(filePath);
    supportedFile.tag = tag;
  } catch (_) { /* */ }

  return supportedFile;
}

export type { ISuppotedFile };
export { getSupportedFileFomPath };
