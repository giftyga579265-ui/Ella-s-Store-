const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const target = `                      layout={homepageSettings.productLayout as any}
                      onViewDetail={handleViewDetail}
                    />`;
const replacement = `                      layout={homepageSettings.productLayout as any}
                      onViewDetail={handleViewDetail}
                      isWishlisted={customers.find(c => (c.email || '').toLowerCase() === (currentUserEmail || '').toLowerCase())?.wishlist?.includes(prod.id)}
                      onToggleWishlist={toggleWishlist}
                    />`;
content = content.replace(target, replacement);

fs.writeFileSync('src/App.tsx', content);
console.log('Patched App.tsx with ProductCard wishlist props');
