const fs = require('fs');
const file = 'src/app/layout.tsx';
let content = fs.readFileSync(file, 'utf8');

// The html tag already has suppressHydrationWarning
// Add it to body tag
content = content.replace(
  '<body className="min-h-full flex flex-col" style={{ fontFamily: "var(--font-inter, \'Inter\', sans-serif)" }}>',
  '<body className="min-h-full flex flex-col" style={{ fontFamily: "var(--font-inter, \'Inter\', sans-serif)" }} suppressHydrationWarning>'
);
fs.writeFileSync(file, content);
console.log('Fixed hydration warnings in src/app/layout.tsx');
