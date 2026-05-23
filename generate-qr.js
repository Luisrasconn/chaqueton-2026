const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

const tools = [
  { id: 'T-102', name: 'Taladro Industrial' },
  { id: 'P-045', name: 'Pulidora Angular' },
  { id: 'L-203', name: 'Llave de Impacto' },
  { id: 'M-089', name: 'Multímetro Digital' },
  { id: 'S-117', name: 'Sierra Circular' },
  { id: 'C-056', name: 'Compresor de Aire' },
  { id: 'E-034', name: 'Esmeril de Banco' },
  { id: 'T-208', name: 'Taladro Percutor' },
];

const outputDir = path.join(__dirname, 'assets', 'qr');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

(async () => {
  for (const tool of tools) {
    const filePath = path.join(outputDir, tool.id + '.png');
    await QRCode.toFile(filePath, tool.id, {
      type: 'png',
      width: 300,
      margin: 2,
      color: { dark: '#0f172a', light: '#ffffff' },
    });
    console.log('QR generado: ' + tool.id + ' -> ' + filePath);
  }
  console.log('\nTodos los QR generados en assets/qr/');
})();
