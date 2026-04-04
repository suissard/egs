const fs = require('fs');

let content = fs.readFileSync('src/components/editor/EditorNode.vue', 'utf8');

// Change Prompt IA button to info color and ensure the delete/edit ones are clear
// It's currently `<button class="btn btn-sm btn-secondary d-flex align-center gap-1 py-1" @click="editAiPrompt">`
content = content.replace(
  '<button class="btn btn-sm btn-secondary d-flex align-center gap-1 py-1" @click="editAiPrompt">',
  '<button class="btn btn-sm btn-info d-flex align-center gap-1 py-1" @click="editAiPrompt">'
);

// Add bg-info for buttons
if (!content.includes('.btn-info')) {
    content = content.replace('</style>', `
.btn-info { background-color: #38bdf8; color: white; }
.btn-info:hover { background-color: #0284c7; }
</style>`);
}

fs.writeFileSync('src/components/editor/EditorNode.vue', content);
