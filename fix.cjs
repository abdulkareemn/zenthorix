const fs = require('fs');
const path = require('path');
const dir = 'src/pages/student';

fs.readdirSync(dir).filter(f => f.endsWith('.jsx')).forEach(f => {
  const p = path.join(dir, f);
  let cont = fs.readFileSync(p, 'utf8');
  cont = cont.replace(/\.\.\/components/g, '../../components');
  cont = cont.replace(/\.\.\/utils/g, '../../utils');
  cont = cont.replace(/\.\.\/layouts/g, '../../layouts');
  fs.writeFileSync(p, cont);
});

console.log('Fixed imports for student pages!');
