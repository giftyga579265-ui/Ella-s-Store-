const fs = require('fs');

const file = 'src/components/NotificationInbox.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = `<div className="space-y-3.5">
                  {filteredNotifications.map((n) => (`;
const replacement = `<div className="space-y-3.5">
                  <AnimatePresence>
                  {filteredNotifications.map((n) => (`;

content = content.replace(target, replacement);

const target2 = `                    </motion.div>
                  ))}
                </div>`;
const replacement2 = `                    </motion.div>
                  ))}
                  </AnimatePresence>
                </div>`;

content = content.replace(target2, replacement2);

fs.writeFileSync(file, content);
console.log('Fixed notification animations');
