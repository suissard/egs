import { ref } from 'vue';
import type { InputNode } from '../models/InputNode';

export const isPromptEditorOpen = ref(false);
export const activePromptNode = ref<InputNode | null>(null);
export const formAvailableKeys = ref<string[]>([]);
export const currentFormData = ref<Record<string, any>>({});

export function openPromptEditor(node: InputNode) {
    if (!node.aiPrompt || !node.aiPrompt.trim()) {
        if (node.inputType === 'table') {
            node.aiPrompt = `Tu es un assistant médical. Remplis le tableau "${node.label}" (colonnes : ${node.columns.join(', ')}) sous forme d'un tableau JSON (un tableau de tableaux de chaînes de caractères, ex: [["ligne1_col1", "ligne1_col2"]]). Rédige uniquement le JSON en te basant sur les informations suivantes :\n{{ ALL_ANONYMOUS }}`;
        } else if (node.inputType === 'radio' || node.inputType === 'select') {
            node.aiPrompt = `Tu es un assistant médical. Sélectionne une seule option pour le champ "${node.label}" parmi les options suivantes : [${node.options.join(', ')}]. Rédige uniquement l'option choisie en te basant sur les informations suivantes :\n{{ ALL_ANONYMOUS }}`;
        } else {
            node.aiPrompt = `Tu es un assistant médical. Rédige une synthèse professionnelle pour le champ "${node.label}" en te basant sur les informations suivantes :\n{{ ALL_ANONYMOUS }}`;
        }
    }
    activePromptNode.value = node;
    isPromptEditorOpen.value = true;
}

export function closePromptEditor() {
    isPromptEditorOpen.value = false;
    activePromptNode.value = null;
}
