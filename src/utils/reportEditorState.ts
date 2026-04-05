import { ref } from 'vue';
import type { InputNode } from '../models/InputNode';

export const isReportEditorOpen = ref(false);
export const activeReportNode = ref<InputNode | null>(null);

export function openReportEditor(node: InputNode) {
    if (!node.actionReports) {
        node.actionReports = [];
    }
    activeReportNode.value = node;
    isReportEditorOpen.value = true;
}

export function closeReportEditor() {
    isReportEditorOpen.value = false;
    activeReportNode.value = null;
}
