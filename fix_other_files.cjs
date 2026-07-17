const fs = require('fs');

function fixFile(file) {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');

    content = content.replace(/n\.customerEmail\.toLowerCase\(\)/g, "(n.customerEmail || '').toLowerCase()");
    content = content.replace(/currentUserEmail\.toLowerCase\(\)/g, "(currentUserEmail || '').toLowerCase()");
    content = content.replace(/order\.customer\.toLowerCase\(\)/g, "(order.customer || '').toLowerCase()");
    content = content.replace(/currentUser\.toLowerCase\(\)/g, "(currentUser || '').toLowerCase()");
    content = content.replace(/payment\.customer\.toLowerCase\(\)/g, "(payment.customer || '').toLowerCase()");
    content = content.replace(/c\.name\.toLowerCase\(\)/g, "(c.name || '').toLowerCase()");
    content = content.replace(/c\.email\.toLowerCase\(\)/g, "(c.email || '').toLowerCase()");
    content = content.replace(/product\.category\.toLowerCase\(\)/g, "(product.category || '').toLowerCase()");
    content = content.replace(/item\.category\.toLowerCase\(\)/g, "(item.category || '').toLowerCase()");
    content = content.replace(/searchQuery\.toLowerCase\(\)/g, "(searchQuery || '').toLowerCase()");
    content = content.replace(/donor\.name\.toLowerCase\(\)/g, "(donor.name || '').toLowerCase()");
    content = content.replace(/donor\.email\.toLowerCase\(\)/g, "(donor.email || '').toLowerCase()");
    content = content.replace(/p\.category\.toLowerCase\(\)/g, "(p.category || '').toLowerCase()");

    fs.writeFileSync(file, content);
}

fixFile('src/components/NotificationInbox.tsx');
fixFile('src/components/OrderHistory.tsx');
fixFile('src/components/ProductDetailModal.tsx');
fixFile('src/components/CharityManager.tsx');
fixFile('src/components/ProductCard.tsx');

console.log('Fixed');
