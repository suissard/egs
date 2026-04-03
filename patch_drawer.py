import re

with open('src/components/AISettingsDrawer.vue', 'r') as f:
    content = f.read()

# Replace title
content = content.replace('title="Paramètres IA"', 'title="Préférences"')
content = content.replace('Paramètres OpenRouter', 'Préférences')

# Inject defineEmits and buttons
emits_str = """
const emit = defineEmits(['open-doc']);

function openDoc(mode: 'usage' | 'editor') {
  emit('open-doc', mode);
  toggleDrawer();
}
"""

content = re.sub(r'const isOpen = ref\(false\);', emits_str + '\nconst isOpen = ref(false);', content)

buttons_str = """
        <div class="doc-links mt-6 mb-4">
          <h3 class="text-h6 mb-3 border-bottom pb-2">Documentation</h3>
          <button class="btn btn-secondary btn-block mb-2" @click="openDoc('usage')">Tutoriel : Usage de base</button>
          <button class="btn btn-warning btn-block mb-4" @click="openDoc('editor')" style="color: black;">Tutoriel : Mode Édition</button>
        </div>

        <h3 class="text-h6 mb-3 border-bottom pb-2">Intelligence Artificielle</h3>
"""

content = content.replace('<div class="drawer-content">', '<div class="drawer-content">\n' + buttons_str)

with open('src/components/AISettingsDrawer.vue', 'w') as f:
    f.write(content)
