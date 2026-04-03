const fs = require('fs');

let content = fs.readFileSync('src/style.css', 'utf8');

// Add btn-info
content = content.replace('.btn-warning {', '.btn-info {\n\tbackground-color: #38bdf8;\n\tcolor: white;\n}\n.btn-warning {');

fs.writeFileSync('src/style.css', content);
