import { ref } from 'vue';
import type { InputNode } from '../models/InputNode';

export const isPromptEditorOpen = ref(false);
export const activePromptNode = ref<InputNode | null>(null);
export const formAvailableKeys = ref<string[]>([]);
export const currentFormData = ref<Record<string, any>>({});

export function openPromptEditor(node: InputNode) {
    if (!node.aiPrompt) {
        node.aiPrompt = "Tu est assistant et tu doit faire un synthèse de ces éléments {{ ALL }}";
    }
    activePromptNode.value = node;
    isPromptEditorOpen.value = true;
}

export function closePromptEditor() {
    isPromptEditorOpen.value = false;
    activePromptNode.value = null;
}
