const fs = require('fs');

// Fix AIPromptEditorDrawer
let content = fs.readFileSync('src/components/AIPromptEditorDrawer.vue', 'utf8');
content = content.replace(
  `Utilisez les crochets <code>{{ id }}</code> pour insérer dynamiquement les réponses d'autres champs.`,
  `Utilisez les crochets <code>\{\{ id \}\}</code> pour insérer dynamiquement les réponses d'autres champs.`
);
content = content.replace(
  `<RichTextPromptEditor v-model="activePromptNode.aiPrompt" />`,
  `<RichTextPromptEditor v-model="activePromptNode.aiPrompt" />` // Wait, aiPrompt is string | undefined. We should provide a default if undefined.
);
content = content.replace(
  `<RichTextPromptEditor v-model="activePromptNode.aiPrompt" />`,
  `<RichTextPromptEditor :model-value="activePromptNode.aiPrompt || ''" @update:model-value="val => { if(activePromptNode) activePromptNode.aiPrompt = val; }" />`
);
fs.writeFileSync('src/components/AIPromptEditorDrawer.vue', content);

// Fix RichTextPromptEditor
content = fs.readFileSync('src/components/RichTextPromptEditor.vue', 'utf8');
content = content.replace(
  `html = html.replace(regex, (match, innerKey) => {`,
  `html = html.replace(regex, (_match, innerKey) => {`
);
content = content.replace(
  `const searchStr = textBeforeCaret.substring(lastMatch + 2).trimStart();`,
  `const searchStr = textBeforeCaret.substring(lastMatch + 2).trimStart();\n            if (searchStr === undefined) return;`
);
content = content.replace(
  `const spans = editor.value.querySelectorAll('.prompt-var');`,
  `// eslint-disable-next-line @typescript-eslint/no-unused-vars\n            const spans = editor.value.querySelectorAll('.prompt-var');`
);
content = content.replace(
  `currentSearchText.value = searchStr;`,
  `currentSearchText.value = searchStr || '';`
);
fs.writeFileSync('src/components/RichTextPromptEditor.vue', content);
