const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('./src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  content = content.replace(/order\.total\.toFixed/g, '(order.total || 0).toFixed');
  content = content.replace(/prod\.price\.toFixed/g, '(prod.price || 0).toFixed');
  content = content.replace(/product\.price\.toFixed/g, '(product.price || 0).toFixed');
  content = content.replace(/comp\.price\.toFixed/g, '(comp.price || 0).toFixed');
  content = content.replace(/pay\.amount\.toFixed/g, '(pay.amount || 0).toFixed');
  content = content.replace(/loc\.lat\.toFixed/g, '(loc.lat || 0).toFixed');
  content = content.replace(/loc\.lng\.toFixed/g, '(loc.lng || 0).toFixed');
  content = content.replace(/customer\.totalSpent\.toFixed/g, '(customer.totalSpent || 0).toFixed');
  content = content.replace(/item\.price\.toFixed/g, '(item.price || 0).toFixed');
  content = content.replace(/finalOrderDetails\.total\.toFixed/g, '(finalOrderDetails.total || 0).toFixed');
  content = content.replace(/parseFloat\(donationAmount\)\.toFixed/g, '(parseFloat(donationAmount) || 0).toFixed');
  
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed', file);
  }
});
