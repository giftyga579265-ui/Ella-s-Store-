const fs = require('fs');

const appFile = 'src/App.tsx';
let appContent = fs.readFileSync(appFile, 'utf8');
appContent = appContent.replace(
  /import Logo from "\.\/assets\/images\/ellas_store_logo_[0-9]+\.jpg";/,
  'import Logo from "./assets/images/ellas_store_logo_1784345363330.jpg";'
);
fs.writeFileSync(appFile, appContent);

const adminFile = 'src/components/AdminDashboard.tsx';
let adminContent = fs.readFileSync(adminFile, 'utf8');
adminContent = adminContent.replace(
  /import Logo from "\.\.\/assets\/images\/ellas_store_logo_[0-9]+\.jpg";/,
  'import Logo from "../assets/images/ellas_store_logo_1784345363330.jpg";'
);
fs.writeFileSync(adminFile, adminContent);

console.log('Fixed image import');
