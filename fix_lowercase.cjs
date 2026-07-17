const fs = require('fs');

function fixFile(file) {
    let content = fs.readFileSync(file, 'utf8');

    // AdminDashboard fixes
    content = content.replace(/p\.name\.toLowerCase\(\)/g, "(p.name || '').toLowerCase()");
    content = content.replace(/item\.toLowerCase\(\)/g, "(item || '').toLowerCase()");
    content = content.replace(/log\.username\.toLowerCase\(\)/g, "(log.username || '').toLowerCase()");
    content = content.replace(/log\.description\.toLowerCase\(\)/g, "(log.description || '').toLowerCase()");
    content = content.replace(/o\.customer\.toLowerCase\(\)/g, "(o.customer || '').toLowerCase()");
    content = content.replace(/selectedCustomer\.name\.toLowerCase\(\)/g, "(selectedCustomer?.name || '').toLowerCase()");
    content = content.replace(/l\.customerName\.toLowerCase\(\)/g, "(l.customerName || '').toLowerCase()");
    content = content.replace(/p\.customer\.toLowerCase\(\)/g, "(p.customer || '').toLowerCase()");
    content = content.replace(/rev\.customerName\.toLowerCase\(\)/g, "(rev.customerName || '').toLowerCase()");
    content = content.replace(/rev\.customerEmail\.toLowerCase\(\)/g, "(rev.customerEmail || '').toLowerCase()");
    content = content.replace(/rev\.feedback\.toLowerCase\(\)/g, "(rev.feedback || '').toLowerCase()");
    content = content.replace(/rev\.request\.toLowerCase\(\)/g, "(rev.request || '').toLowerCase()");

    // App fixes
    content = content.replace(/admin\.toLowerCase\(\)/g, "(admin || '').toLowerCase()");
    content = content.replace(/currentUser\.trim\(\)\.toLowerCase\(\)/g, "(currentUser || '').trim().toLowerCase()");
    content = content.replace(/currentUserEmail\.trim\(\)\.toLowerCase\(\)/g, "(currentUserEmail || '').trim().toLowerCase()");
    content = content.replace(/email\.toLowerCase\(\)/g, "(email || '').toLowerCase()");
    content = content.replace(/currentUserEmail\.toLowerCase\(\)/g, "(currentUserEmail || '').toLowerCase()");
    content = content.replace(/c\.email\.toLowerCase\(\)/g, "(c.email || '').toLowerCase()");
    content = content.replace(/emailToUse\.toLowerCase\(\)/g, "(emailToUse || '').toLowerCase()");
    content = content.replace(/c\.name\.toLowerCase\(\)/g, "(c.name || '').toLowerCase()");
    content = content.replace(/nameToUse\.toLowerCase\(\)/g, "(nameToUse || '').toLowerCase()");
    content = content.replace(/finalName\.toLowerCase\(\)/g, "(finalName || '').toLowerCase()");
    content = content.replace(/loginUsername\.trim\(\)\.toLowerCase\(\)/g, "(loginUsername || '').trim().toLowerCase()");
    content = content.replace(/loginUsername\.toLowerCase\(\)/g, "(loginUsername || '').toLowerCase()");
    content = content.replace(/customerName\.toLowerCase\(\)/g, "(customerName || '').toLowerCase()");
    content = content.replace(/userEmail\.toLowerCase\(\)/g, "(userEmail || '').toLowerCase()");
    content = content.replace(/userName\.toLowerCase\(\)/g, "(userName || '').toLowerCase()");
    content = content.replace(/user\.email\.toLowerCase\(\)/g, "(user?.email || '').toLowerCase()");
    content = content.replace(/e\.toLowerCase\(\)/g, "(e || '').toLowerCase()");
    content = content.replace(/f\.name\.toLowerCase\(\)/g, "(f.name || '').toLowerCase()");
    content = content.replace(/f\.category\.toLowerCase\(\)/g, "(f.category || '').toLowerCase()");
    content = content.replace(/f\.description\.toLowerCase\(\)/g, "(f.description || '').toLowerCase()");
    content = content.replace(/t\.toLowerCase\(\)/g, "(t || '').toLowerCase()");
    content = content.replace(/p\.category\.toLowerCase\(\)/g, "(p.category || '').toLowerCase()");
    content = content.replace(/p\.description\.toLowerCase\(\)/g, "(p.description || '').toLowerCase()");
    content = content.replace(/n\.customerEmail\.toLowerCase\(\)/g, "(n.customerEmail || '').toLowerCase()");
    content = content.replace(/currentUser\.toLowerCase\(\)/g, "(currentUser || '').toLowerCase()");
    content = content.replace(/searchQuery\.toLowerCase\(\)/g, "(searchQuery || '').toLowerCase()");
    content = content.replace(/customerNameDefault\.toLowerCase\(\)/g, "(customerNameDefault || '').toLowerCase()");
    content = content.replace(/c\.name\.toLowerCase\(\)/g, "(c.name || '').toLowerCase()");

    fs.writeFileSync(file, content);
}

fixFile('src/App.tsx');
fixFile('src/components/AdminDashboard.tsx');
fixFile('src/components/CheckoutModal.tsx');
console.log('Fixed');
