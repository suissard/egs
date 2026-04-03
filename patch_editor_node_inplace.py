import re

file_path = "src/components/editor/EditorNode.vue"
with open(file_path, "r") as f:
    content = f.read()

# Add the in-place editor block right after the header
search_header = """      <div class="actions d-flex gap-2">
        <button class="btn-icon bg-warning text-white rounded-circle d-flex align-center justify-center" style="width: 28px; height: 28px; border: none; cursor: pointer;" @click.stop="toggleEdit" title="Éditer">
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
        </button>
        <button class="btn-icon bg-error text-white rounded-circle d-flex align-center justify-center" style="width: 28px; height: 28px; border: none; cursor: pointer;" @click.stop="deleteNode" title="Supprimer">
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
        </button>
      </div>
    </div>"""

replace_header = search_header + """

    <!-- In-place Editor Form -->
    <div v-if="isEditing" class="in-place-editor pa-3 mt-2 bg-white rounded border border-grey-lighten-2 shadow-sm" @click.stop>
      <h4 class="text-subtitle-2 mb-3">Éditer les propriétés</h4>

      <div class="row d-flex flex-wrap gap-3">
        <!-- Box Properties -->
        <template v-if="isBox">
          <div class="input-group flex-1 min-w-200">
            <label class="input-label text-caption font-weight-bold">Titre</label>
            <input v-model="node.title" type="text" class="input-field py-1 px-2 text-body-2" />
          </div>
          <div class="input-group flex-1 min-w-200">
            <label class="input-label text-caption font-weight-bold">Direction</label>
            <select v-model="node.direction" class="input-field py-1 px-2 text-body-2">
              <option value="column">Colonne (Vertical)</option>
              <option value="row">Ligne (Horizontal)</option>
            </select>
          </div>
        </template>

        <!-- Input Properties -->
        <template v-else>
          <div class="input-group flex-1 min-w-200">
            <label class="input-label text-caption font-weight-bold">Label</label>
            <input v-model="node.label" type="text" class="input-field py-1 px-2 text-body-2" />
          </div>
          <div class="input-group flex-1 min-w-200">
            <label class="input-label text-caption font-weight-bold">Type de champ</label>
            <select v-model="node.inputType" class="input-field py-1 px-2 text-body-2">
              <option value="text">Texte Court</option>
              <option value="textarea">Texte Long</option>
              <option value="number">Nombre</option>
              <option value="checkbox">Case à cocher</option>
              <option value="radio">Boutons Radio</option>
              <option value="select">Liste Déroulante</option>
              <option value="date">Date</option>
            </select>
          </div>
          <div class="input-group flex-1 min-w-200">
            <label class="input-label text-caption font-weight-bold">Clé JSON</label>
            <input v-model="node.key" type="text" class="input-field py-1 px-2 text-body-2" />
          </div>

          <div class="w-100 d-flex gap-4 align-center mt-2">
            <label class="d-flex align-center gap-1 cursor-pointer">
              <input type="checkbox" v-model="node.required" />
              <span class="text-caption">Obligatoire</span>
            </label>
            <label class="d-flex align-center gap-1 cursor-pointer">
              <input type="checkbox" v-model="node.hasActionReport" />
              <span class="text-caption d-flex align-center gap-1">Report d'action <span class="badge-help rounded-circle bg-info text-white d-inline-flex align-center justify-center" style="width: 14px; height: 14px; font-size: 10px;" title="Cocher cette case permet de reporter l'information saisie vers un autre élément du formulaire.">?</span></span>
            </label>
            <div class="d-flex align-center gap-1">
              <button class="btn btn-sm btn-secondary d-flex align-center gap-1 py-1" @click="editAiPrompt">
                <span class="text-caption">Prompt IA</span>
                <span class="badge-help rounded-circle bg-info text-white d-inline-flex align-center justify-center" style="width: 14px; height: 14px; font-size: 10px;" title="Configurer un prompt d'Intelligence Artificielle pour pré-remplir ce champ.">?</span>
              </button>
            </div>
          </div>

          <div class="input-group w-100 mt-2" v-if="['select', 'radio', 'checkbox'].includes(node.inputType)">
            <label class="input-label text-caption font-weight-bold">Options (Une par ligne)</label>
            <textarea
              :value="node.options ? node.options.join('\\n') : ''"
              @input="updateOptions($event)"
              class="input-field py-1 px-2 text-body-2"
              rows="3"
            ></textarea>
          </div>

          <div class="input-group w-100 mt-2" v-if="node.aiPrompt !== undefined && node.aiPrompt !== ''">
             <label class="input-label text-caption font-weight-bold text-primary">Aperçu du Prompt IA:</label>
             <div class="text-caption bg-grey-lighten-4 pa-2 rounded text-truncate" :title="node.aiPrompt">{{ node.aiPrompt }}</div>
          </div>
        </template>
      </div>

      <div class="d-flex justify-end mt-3">
        <button class="btn btn-sm btn-primary" @click="toggleEdit">Terminer l'édition</button>
      </div>
    </div>"""

content = content.replace(search_header, replace_header)


# Add updateOptions and editAiPrompt to script
search_script = """const toggleEdit = () => {
  isEditing.value = !isEditing.value;
};"""

replace_script = """const toggleEdit = () => {
  isEditing.value = !isEditing.value;
};

const updateOptions = (event: Event) => {
  const target = event.target as HTMLTextAreaElement;
  props.node.options = target.value.split('\\n').filter(o => o.trim() !== '');
};

// Assuming openPromptEditor is available globally or we import it
import { openPromptEditor } from '../../utils/promptEditorState';

const editAiPrompt = () => {
    // If it's undefined, initialize it to empty string so it's reactive
    if (props.node.aiPrompt === undefined) {
        props.node.aiPrompt = '';
    }
    openPromptEditor(props.node);
};"""

content = content.replace(search_script, replace_script)

with open(file_path, "w") as f:
    f.write(content)
