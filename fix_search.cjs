const fs = require('fs');
let content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

content = content.replace(/activitySearch\.toLowerCase\(\)/g, "(activitySearch || '').toLowerCase()");
content = content.replace(/fileSearch\.toLowerCase\(\)/g, "(fileSearch || '').toLowerCase()");
content = content.replace(/reviewSearch\.toLowerCase\(\)/g, "(reviewSearch || '').toLowerCase()");
content = content.replace(/deliverySearch\.toLowerCase\(\)/g, "(deliverySearch || '').toLowerCase()");
content = content.replace(/f\.name\?\.toLowerCase\(\)/g, "(f.name || '').toLowerCase()");
content = content.replace(/f\.sender\?\.toLowerCase\(\)/g, "(f.sender || '').toLowerCase()");
content = content.replace(/f\.conferenceId\?\.toLowerCase\(\)/g, "(f.conferenceId || '').toLowerCase()");
content = content.replace(/d\.customerName\?\.toLowerCase\(\)/g, "(d.customerName || '').toLowerCase()");
content = content.replace(/d\.customerEmail\?\.toLowerCase\(\)/g, "(d.customerEmail || '').toLowerCase()");
content = content.replace(/d\.address\?\.toLowerCase\(\)/g, "(d.address || '').toLowerCase()");
content = content.replace(/d\.orderId\?\.toLowerCase\(\)/g, "(d.orderId || '').toLowerCase()");
content = content.replace(/d\.dispatchRiderName\?\.toLowerCase\(\)/g, "(d.dispatchRiderName || '').toLowerCase()");
content = content.replace(/d\.id\?\.toLowerCase\(\)/g, "(d.id || '').toLowerCase()");

fs.writeFileSync('src/components/AdminDashboard.tsx', content);
console.log('Fixed searches');
