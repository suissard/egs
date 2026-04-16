const fs = require('fs');

const pathEditor = 'src/components/editor/FormEditor.vue';
let editorContent = fs.readFileSync(pathEditor, 'utf8');

editorContent = editorContent.replace(
  `const data = await importFromJson(file);`,
  `const data = await importFromJson(file!);`
);

fs.writeFileSync(pathEditor, editorContent);
