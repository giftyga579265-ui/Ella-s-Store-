const fs = require('fs');

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

  // We should make sure we don't duplicate if already replaced
  const replaceSafe = (regex, replacement) => {
    content = content.replace(regex, replacement);
  };

  content = content.replace(/bg-white(?!\/)(?!\s+dark:bg-slate-900)/g, 'bg-white dark:bg-slate-900');
  content = content.replace(/bg-neutral-50(?!\/)(?!\s+dark:bg-slate-950)/g, 'bg-neutral-50 dark:bg-slate-950');
  content = content.replace(/bg-neutral-100(?!\/)(?!\s+dark:bg-slate-800)/g, 'bg-neutral-100 dark:bg-slate-800');
  content = content.replace(/bg-neutral-150(?!\/)(?!\s+dark:bg-slate-800)/g, 'bg-neutral-150 dark:bg-slate-800');
  
  content = content.replace(/text-black(?!\s+dark:text-white)/g, 'text-black dark:text-white');
  content = content.replace(/text-neutral-900(?!\s+dark:text-slate-100)/g, 'text-neutral-900 dark:text-slate-100');
  content = content.replace(/text-neutral-800(?!\s+dark:text-slate-200)/g, 'text-neutral-800 dark:text-slate-200');
  content = content.replace(/text-neutral-700(?!\s+dark:text-slate-300)/g, 'text-neutral-700 dark:text-slate-300');
  content = content.replace(/text-neutral-600(?!\s+dark:text-slate-400)/g, 'text-neutral-600 dark:text-slate-400');
  content = content.replace(/text-neutral-500(?!\s+dark:text-slate-400)/g, 'text-neutral-500 dark:text-slate-400');

  content = content.replace(/border-neutral-200(?!\/)(?!\s+dark:border-slate-700)/g, 'border-neutral-200 dark:border-slate-700');
  content = content.replace(/border-neutral-150(?!\/)(?!\s+dark:border-slate-800)/g, 'border-neutral-150 dark:border-slate-800');
  content = content.replace(/border-neutral-100(?!\/)(?!\s+dark:border-slate-800)/g, 'border-neutral-100 dark:border-slate-800');

  fs.writeFileSync(file, content);
});
console.log('Replaced colors with dark utilities');
