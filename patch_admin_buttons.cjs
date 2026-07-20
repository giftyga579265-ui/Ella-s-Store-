const fs = require('fs');
let content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const target = `                  <button
                    type="button"
                    onClick={onClearAllData}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 transition-colors cursor-pointer"
                  >
                    Clear All Firestore Collections
                  </button>
                  {onDeleteCustomersAndActivities && (
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Users className="w-3.5 h-3.5 text-rose-500" />
                      Delete All Customers & Activities
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onSeedDemoData}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500 text-neutral-900 dark:text-slate-100 hover:bg-neutral-900 hover:text-white transition-all shadow cursor-pointer"
                  >
                    Seed Elegant Boutique Demo Data
                  </button>`;
const replacement = `                  {/* Danger Zone functions removed to ensure data permanence */}`;
content = content.replace(target, replacement);

fs.writeFileSync('src/components/AdminDashboard.tsx', content);
console.log('Patched AdminDashboard.tsx to remove danger zone buttons');
