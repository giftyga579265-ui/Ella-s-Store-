const fs = require('fs');

function safeguardFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  content = content.replace(/revenue\.toFixed/g, '(revenue || 0).toFixed');
  content = content.replace(/foodRevenue\.toFixed/g, '(foodRevenue || 0).toFixed');
  content = content.replace(/total\.toFixed/g, '(total || 0).toFixed');
  content = content.replace(/selectedPin\.lat\.toFixed/g, '(selectedPin.lat || 0).toFixed');
  content = content.replace(/selectedPin\.lng\.toFixed/g, '(selectedPin.lng || 0).toFixed');
  content = content.replace(/p\.currentLat\.toFixed/g, '(p.currentLat || 0).toFixed');
  content = content.replace(/p\.currentLng\.toFixed/g, '(p.currentLng || 0).toFixed');
  content = content.replace(/subtotal\.toFixed/g, '(subtotal || 0).toFixed');
  content = content.replace(/delivery\.toFixed/g, '(delivery || 0).toFixed');
  content = content.replace(/discountAmount\.toFixed/g, '(discountAmount || 0).toFixed');
  content = content.replace(/pointsDiscountAmount\.toFixed/g, '(pointsDiscountAmount || 0).toFixed');
  content = content.replace(/momoFee\.toFixed/g, '(momoFee || 0).toFixed');
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed', filePath);
  }
}

const files = [
  'src/components/AdminDashboard.tsx',
  'src/components/CustomerLiveMap.tsx',
  'src/components/DeliveryPage.tsx',
  'src/components/CheckoutModal.tsx',
  'src/App.tsx'
];

files.forEach(safeguardFile);
