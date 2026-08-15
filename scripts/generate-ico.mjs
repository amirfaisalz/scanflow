import fs from 'fs';
import QRCode from 'qrcode';

async function generatePng() {
  // Generate high quality PNG buffer with fiery color
  const pngBuffer = await QRCode.toBuffer('https://scanflow.dev', {
    width: 64,
    margin: 1,
    color: {
      dark: '#FA5D29',
      light: '#ffffff'
    },
    errorCorrectionLevel: 'H'
  });

  fs.writeFileSync('public/icon.png', pngBuffer);
  fs.writeFileSync('public/apple-touch-icon.png', pngBuffer);
  
  // Also create a minimal standard ICO file containing the PNG buffer
  // An ICO header for 1 PNG image:
  // 6 bytes ICONDIR + 16 bytes ICONDIRENTRY + PNG data
  const iconDir = Buffer.from([0, 0, 1, 0, 1, 0]);
  const iconEntry = Buffer.alloc(16);
  iconEntry.writeUInt8(64, 0); // width (0 or 64)
  iconEntry.writeUInt8(64, 1); // height (0 or 64)
  iconEntry.writeUInt8(0, 2);  // color palette
  iconEntry.writeUInt8(0, 3);  // reserved
  iconEntry.writeUInt16LE(1, 4); // color planes
  iconEntry.writeUInt16LE(32, 6); // bits per pixel
  iconEntry.writeUInt32LE(pngBuffer.length, 8); // image data size
  iconEntry.writeUInt32LE(22, 12); // image data offset (6 + 16 = 22)

  const icoBuffer = Buffer.concat([iconDir, iconEntry, pngBuffer]);
  fs.writeFileSync('public/favicon.ico', icoBuffer);
  fs.writeFileSync('app/favicon.ico', icoBuffer);
  console.log("Successfully generated public/favicon.ico, app/favicon.ico and icon.png");
}

generatePng();
