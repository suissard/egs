const fs = require('fs');

let content = fs.readFileSync('src/components/RichTextPromptEditor.vue', 'utf8');

// Fix searchStr
content = content.replace(
    /currentSearchText\.value = searchStr \|\| '';/g,
    `currentSearchText.value = searchStr;`
);

content = content.replace(
    /filteredKeys\.value = keys\.filter\(k => k\.toLowerCase\(\)\.includes\(searchStr\.toLowerCase\(\)\)\);/g,
    `filteredKeys.value = keys.filter(k => k.toLowerCase().includes((searchStr || '').toLowerCase()));`
);

// Fix unused spans
content = content.replace(
    /const spans = editor\.value\.querySelectorAll\('\.prompt-var'\);/g,
    `// @ts-ignore\n            const spans = editor.value.querySelectorAll('.prompt-var');`
);

fs.writeFileSync('src/components/RichTextPromptEditor.vue', content);
