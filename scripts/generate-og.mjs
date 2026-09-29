import sharp from 'sharp';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const width = 1200;
const height = 630;
const logoSize = 240;

const logoSvg = readFileSync(join(root, 'public/icon.svg'), 'utf8');

const scaledLogo = logoSvg.replace(
  'viewBox="0 0 32 32"',
  `viewBox="0 0 32 32" width="${logoSize}" height="${logoSize}"`
);

const background = `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="#f1f5f9"/>
</svg>
`;

async function generate() {
  const bg = sharp(Buffer.from(background));
  
  const logo = await sharp(Buffer.from(scaledLogo))
    .resize(logoSize, logoSize)
    .png()
    .toBuffer();
  
  await bg
    .composite([{
      input: logo,
      left: Math.round((width - logoSize) / 2),
      top: Math.round((height - logoSize) / 2),
    }])
    .png()
    .toFile(join(root, 'public/og.png'));
  
  console.log('Generated public/og.png (1200x630)');
}

generate().catch(console.error);
