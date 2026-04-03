const fs = require('fs');

let content = fs.readFileSync('src/components/RichTextPromptEditor.vue', 'utf8');

// The error is probably at `selectAutocomplete(filteredKeys.value[selectedAutocompleteIndex.value])` which might return `string | undefined`.
content = content.replace(
    /selectAutocomplete\(filteredKeys\.value\[selectedAutocompleteIndex\.value\]\);/g,
    `const selectedKey = filteredKeys.value[selectedAutocompleteIndex.value];\n                if (selectedKey) selectAutocomplete(selectedKey);`
);

fs.writeFileSync('src/components/RichTextPromptEditor.vue', content);
