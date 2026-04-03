import re

with open('src/App.vue', 'r') as f:
    content = f.read()

# 1. Add imports
import_statement = "import UsageDoc from './components/docs/UsageDoc.vue';\nimport EditorDoc from './components/docs/EditorDoc.vue';"
content = re.sub(r"(import FormEditor from './components/editor/FormEditor.vue';)", r"\1\n" + import_statement, content)

# 2. Add showDocumentation ref state
state_statement = "const showDocumentation = ref(false);\nconst isEditMode = ref(false);"
content = re.sub(r"const isEditMode = ref\(false\);", state_statement, content)

# 3. Update template to handle showDocumentation
template_replace = """
          <div v-if="showDocumentation">
            <div class="mb-4 d-flex justify-start">
               <button class="btn btn-secondary" @click="showDocumentation = false">
                  &larr; Retour au formulaire
               </button>
            </div>
            <UsageDoc v-if="!isEditMode" />
            <EditorDoc v-else />
          </div>
          <div v-else-if="isEditMode && currentConfigData">
"""
content = re.sub(r'<div v-if="isEditMode && currentConfigData">', template_replace, content)

# 4. Add handleOpenDoc method and update AISettingsDrawer binding
content = re.sub(r'<AISettingsDrawer />', r'<AISettingsDrawer @open-doc="handleOpenDoc" />', content)

handle_open_doc_func = """
function handleOpenDoc(mode: 'usage' | 'editor') {
  showDocumentation.value = true;
  isEditMode.value = mode === 'editor';
}
"""

content = re.sub(r"function loadSelectedModel\(\) \{", handle_open_doc_func + "\nfunction loadSelectedModel() {", content)


with open('src/App.vue', 'w') as f:
    f.write(content)
