const fs = require('fs');

let content = fs.readFileSync('src/components/InputWrapper.vue', 'utf8');

// Replace the generic aiPrompt button structure to include the gear icon
const searchStrText = `<button v-if="node.aiPrompt && openRouterApiKey" @click.prevent="generateAI" class="btn btn-secondary btn-sm" :disabled="isLoadingAI || readonly" type="button">
          <span v-if="isLoadingAI" class="spinner"></span>
          <span v-else>✨ Générer par IA</span>
        </button>`;

const replacementStrText = `<div v-if="node.aiPrompt !== undefined && openRouterApiKey" class="d-flex align-center gap-1">
          <button @click.prevent="generateAI" class="btn btn-secondary btn-sm" :disabled="isLoadingAI || readonly" type="button" title="Générer avec l'IA">
            <span v-if="isLoadingAI" class="spinner"></span>
            <span v-else>✨ Générer par IA</span>
          </button>
          <button @click.prevent="openPromptEditor(node)" class="btn btn-secondary btn-sm px-2" :disabled="readonly" type="button" title="Configurer le prompt">
            ⚙️
          </button>
        </div>`;

content = content.replaceAll(searchStrText, replacementStrText);

// Add imports
content = content.replace(
  `import { openRouterApiKey, openRouterModel } from '../utils/aiSettings';`,
  `import { openRouterApiKey, openRouterModel } from '../utils/aiSettings';\nimport { openPromptEditor } from '../utils/promptEditorState';`
);

fs.writeFileSync('src/components/InputWrapper.vue', content);
