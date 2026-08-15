import fs from 'fs';

async function run() {
  // Generate a high-res PNG of QR code
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <defs>
    <linearGradient id="fireGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FA5D29" />
      <stop offset="100%" stop-color="#E04818" />
    </linearGradient>
  </defs>
  <!-- Rounded Gradient Tile -->
  <rect width="32" height="32" rx="7" fill="url(#fireGrad)" />
  <!-- Crisp White QR Code Shape -->
  <g stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none" transform="translate(4, 4)">
    <rect x="2" y="2" width="7" height="7" rx="1.5" />
    <rect x="15" y="2" width="7" height="7" rx="1.5" />
    <rect x="2" y="15" width="7" height="7" rx="1.5" />
    <path d="M15 15h3v3" />
    <path d="M22 15v.01" />
    <path d="M22 22v.01" />
    <path d="M18 22v.01" />
  </g>
</svg>`;

  // Write app/icon.svg and public/favicon.svg
  fs.writeFileSync('app/icon.svg', svgContent);
  fs.writeFileSync('app/apple-icon.svg', svgContent);
  fs.writeFileSync('public/favicon.svg', svgContent);
  console.log("Successfully created app/icon.svg, app/apple-icon.svg, public/favicon.svg");

  // Remove old vercel favicon if exists
  if (fs.existsSync('app/favicon.ico')) {
    fs.unlinkSync('app/favicon.ico');
    console.log("Removed default vercel app/favicon.ico");
  }
  if (fs.existsSync('app/icon.tsx')) {
    fs.unlinkSync('app/icon.tsx');
    console.log("Removed app/icon.tsx to allow app/icon.svg to take precedence");
  }
}

run();
