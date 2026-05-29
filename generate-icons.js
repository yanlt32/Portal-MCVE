const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const input = path.join(__dirname, 'public', 'logo.jpeg');
const outDir = path.join(__dirname, 'public', 'icons');

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

async function generateIcons() {
  for (const size of sizes) {
    // Ícone normal (sem safe zone)
    await sharp(input)
      .resize(size, size, { fit: 'cover', position: 'centre' })
      .png()
      .toFile(path.join(outDir, `icon-${size}x${size}.png`));

    // Ícone maskable (com safe zone de 10% = fundo branco com padding)
    const padding = Math.floor(size * 0.12);
    const innerSize = size - padding * 2;
    await sharp(input)
      .resize(innerSize, innerSize, { fit: 'cover', position: 'centre' })
      .png()
      .toBuffer()
      .then(buf =>
        sharp({
          create: {
            width: size,
            height: size,
            channels: 4,
            background: { r: 37, g: 99, b: 235, alpha: 1 }
          }
        })
          .composite([{ input: buf, gravity: 'centre' }])
          .png()
          .toFile(path.join(outDir, `icon-${size}x${size}-maskable.png`))
      );

    console.log(`✓ icon-${size}x${size}.png e maskable gerados`);
  }

  // Copiar como apple-touch-icon
  fs.copyFileSync(
    path.join(outDir, 'icon-192x192.png'),
    path.join(__dirname, 'public', 'apple-touch-icon.png')
  );
  console.log('✓ apple-touch-icon.png atualizado');
  console.log('\nÍcones gerados com sucesso em public/icons/');
}

generateIcons().catch(console.error);
