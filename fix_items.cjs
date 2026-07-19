const fs = require('fs');

function safeguardItems(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/order\.items\.join/g, '(order.items || []).join');
  content = content.replace(/order\.items\.map/g, '(order.items || []).map');
  fs.writeFileSync(filePath, content);
}

safeguardItems('src/components/AdminDashboard.tsx');
safeguardItems('src/components/OrderHistory.tsx');
console.log("Fixed items array access");
