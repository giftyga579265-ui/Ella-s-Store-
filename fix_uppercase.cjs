const fs = require('fs');

function fixFile(file) {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');

    content = content.replace(/order\.status\.toUpperCase\(\)/g, "(order.status || '').toUpperCase()");
    content = content.replace(/payment\.method\.toUpperCase\(\)/g, "(payment.method || '').toUpperCase()");
    content = content.replace(/payment\.status\.toUpperCase\(\)/g, "(payment.status || '').toUpperCase()");
    content = content.replace(/payment\.id\.toUpperCase\(\)/g, "(payment.id || '').toUpperCase()");
    content = content.replace(/product\.name\.toUpperCase\(\)/g, "(product.name || '').toUpperCase()");
    content = content.replace(/p\.status\.toUpperCase\(\)/g, "(p.status || '').toUpperCase()");
    content = content.replace(/payment\.orderId\.toUpperCase\(\)/g, "(payment.orderId || '').toUpperCase()");

    fs.writeFileSync(file, content);
}

fixFile('src/components/OrderHistory.tsx');
fixFile('src/components/ProductDetailModal.tsx');
fixFile('src/components/DeliveryPage.tsx');
fixFile('src/components/AdminDashboard.tsx');

console.log('Fixed');
