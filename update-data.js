const fs = require('fs');
const file = 'src/lib/data.ts';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(
  'if (!filters.years.some((y) => org.years.includes(y))) return false;',
  'if (!filters.years.every((y) => org.years.includes(y))) return false;'
);
fs.writeFileSync(file, content);
console.log('Fixed year filter logic in src/lib/data.ts');
