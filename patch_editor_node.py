import re

file_path = "src/components/editor/EditorNode.vue"
with open(file_path, "r") as f:
    content = f.read()

# Replace the text delete button with icons
search = """      <div class="actions d-flex gap-2">
        <button class="btn btn-sm btn-error py-1 px-2 text-caption" @click.stop="deleteNode">Supprimer</button>
      </div>"""
replace = """      <div class="actions d-flex gap-2">
        <button class="btn-icon bg-warning text-white rounded-circle d-flex align-center justify-center" style="width: 28px; height: 28px; border: none; cursor: pointer;" @click.stop="toggleEdit" title="Éditer">
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
        </button>
        <button class="btn-icon bg-error text-white rounded-circle d-flex align-center justify-center" style="width: 28px; height: 28px; border: none; cursor: pointer;" @click.stop="deleteNode" title="Supprimer">
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
        </button>
      </div>"""
content = content.replace(search, replace)

# Add isEditing ref and toggleEdit function
search_script = """const isSelected = computed(() => props.selectedNode === props.node);"""
replace_script = """const isSelected = computed(() => props.selectedNode === props.node);

const isEditing = ref(false);

const toggleEdit = () => {
  isEditing.value = !isEditing.value;
};"""
content = content.replace(search_script, replace_script)

search_import = """import { computed } from 'vue';"""
replace_import = """import { computed, ref } from 'vue';"""
content = content.replace(search_import, replace_import)


with open(file_path, "w") as f:
    f.write(content)
