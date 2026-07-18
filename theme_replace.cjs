const fs = require('fs');
const glob = require('glob'); // Not available? I'll use simple fs reads

const files = [
  'src/App.tsx',
  'src/components/AdminDashboard.tsx',
  'src/components/CharityDonations.tsx',
  'src/components/CharityManager.tsx',
  'src/components/CheckoutModal.tsx',
  'src/components/ConferenceRoom.tsx',
  'src/components/CustomerLiveMap.tsx',
  'src/components/DeliveryMap.tsx',
  'src/components/DeliveryPage.tsx',
  'src/components/GarmentExtractor.tsx',
  'src/components/HaiasiChatbot.tsx',
  'src/components/MediaGallery.tsx',
  'src/components/NotificationInbox.tsx',
  'src/components/OrderHistory.tsx',
  'src/components/ProductCard.tsx',
  'src/components/ProductDetailModal.tsx',
  'src/components/ReviewModal.tsx',
  'src/components/SmsWidget.tsx'
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');

  // Replace background colors
  content = content.replace(/bg-white([^/])/g, 'bg-white dark:bg-slate-900$1');
  content = content.replace(/bg-neutral-50([^/])/g, 'bg-neutral-50 dark:bg-slate-950$1');
  content = content.replace(/bg-neutral-100([^/])/g, 'bg-neutral-100 dark:bg-slate-800$1');
  content = content.replace(/bg-neutral-150([^/])/g, 'bg-neutral-150 dark:bg-slate-800$1');
  
  // Replace text colors
  content = content.replace(/text-black/g, 'text-black dark:text-white');
  content = content.replace(/text-neutral-900/g, 'text-neutral-900 dark:text-slate-100');
  content = content.replace(/text-neutral-800/g, 'text-neutral-800 dark:text-slate-200');
  content = content.replace(/text-neutral-700/g, 'text-neutral-700 dark:text-slate-300');
  content = content.replace(/text-neutral-600/g, 'text-neutral-600 dark:text-slate-400');
  // keep neutral-500 the same or mapped
  content = content.replace(/text-neutral-500/g, 'text-neutral-500 dark:text-slate-400');

  // Replace border colors
  content = content.replace(/border-neutral-200/g, 'border-neutral-200 dark:border-slate-700');
  content = content.replace(/border-neutral-150/g, 'border-neutral-150 dark:border-slate-800');
  content = content.replace(/border-neutral-100/g, 'border-neutral-100 dark:border-slate-800');

  // Fix multiple dark: mappings that might happen if script is run multiple times
  content = content.replace(/dark:bg-slate-900\s+dark:bg-slate-900/g, 'dark:bg-slate-900');
  content = content.replace(/dark:text-white\s+dark:text-white/g, 'dark:text-white');

  fs.writeFileSync(file, content);
});
console.log('Replaced colors with dark utilities');
