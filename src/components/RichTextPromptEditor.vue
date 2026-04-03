<template>
  <div class="rich-text-editor-wrapper" style="position: relative;">
    <div
      ref="editor"
      class="editor-content input-field"
      contenteditable="true"
      @input="handleInput"
      @keydown="handleKeyDown"
      @blur="updateValue"
      @click="updateCaretContext"
      @keyup="updateCaretContext"
      spellcheck="false"
      style="min-height: 150px; white-space: pre-wrap; overflow-y: auto;"
    ></div>

    <!-- Autocomplete Dropdown -->
    <ul v-if="showAutocomplete" class="autocomplete-list" :style="{ top: autocompleteY + 'px', left: autocompleteX + 'px' }">
      <li
        v-for="(key, index) in filteredKeys"
        :key="key"
        :class="{ 'active': index === selectedAutocompleteIndex }"
        @click="selectAutocomplete(key)"
        @mouseenter="selectedAutocompleteIndex = index"
      >
        {{ key }}
      </li>
      <li v-if="filteredKeys.length === 0" class="text-muted" style="padding: 4px 8px; font-size: 0.9em;">Aucun ID correspondant</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue';
import { formAvailableKeys, currentFormData } from '../utils/promptEditorState';

const props = defineProps<{
  modelValue: string;
}>();

const emit = defineEmits(['update:modelValue']);

const editor = ref<HTMLElement | null>(null);

// Autocomplete State
const showAutocomplete = ref(false);
const filteredKeys = ref<string[]>([]);
const selectedAutocompleteIndex = ref(0);
const autocompleteX = ref(0);
const autocompleteY = ref(0);
const currentSearchText = ref('');
const searchStartNode = ref<Node | null>(null);
const searchStartOffset = ref(0);

const SPECIAL_KEY = 'ALL';

// Utility to get current valid keys including ALL
const getValidKeys = () => [SPECIAL_KEY, ...formAvailableKeys.value];

function renderHtmlFromText(text: string): string {
    const regex = /\{\{\s*([^}]+?)\s*\}\}/g;
    let html = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const validKeys = getValidKeys();

    html = html.replace(regex, (_match, innerKey) => {
        const key = innerKey.trim();
        const isValid = validKeys.includes(key);
        const className = isValid ? 'prompt-var valid' : 'prompt-var invalid';

        let tooltipText = '';
        if (key === SPECIAL_KEY) {
            tooltipText = 'Toutes les données du formulaire';
        } else if (isValid) {
            const val = currentFormData.value[key];
            tooltipText = val !== undefined && val !== null && val !== '' ? String(val) : 'undefined';
        } else {
            tooltipText = 'ID Invalide';
        }

        // Use a simple span. Tooltip is handled via CSS and title attribute
        return `<span class="${className}" title="${tooltipText}" contenteditable="false">{{ ${key} }}</span>`;
    });
    return html;
}

function updateEditorContent(text: string) {
    if (!editor.value) return;
    const newHtml = renderHtmlFromText(text);
    if (editor.value.innerHTML !== newHtml) {
        editor.value.innerHTML = newHtml;
    }
}

// Convert HTML back to plain text
function extractTextFromHtml(html: string): string {
    if (!editor.value) return '';
    const temp = document.createElement('div');
    temp.innerHTML = html;

    // Replace spans with their text content (which includes the {{ }})
    const spans = temp.querySelectorAll('.prompt-var');
    spans.forEach(span => {
        span.replaceWith(document.createTextNode(span.textContent || ''));
    });

    return temp.textContent || '';
}

onMounted(() => {
    updateEditorContent(props.modelValue);
});

watch(() => props.modelValue, (newVal) => {
    if (editor.value && extractTextFromHtml(editor.value.innerHTML) !== newVal) {
        updateEditorContent(newVal);
    }
});

function handleInput() {
    if (!editor.value) return;
    const currentText = extractTextFromHtml(editor.value.innerHTML);
    emit('update:modelValue', currentText);
    checkAutocomplete();
}

function updateValue() {
    if (!editor.value) return;
    const currentText = extractTextFromHtml(editor.value.innerHTML);
    emit('update:modelValue', currentText);
    // Re-render to format any newly completed {{}} tags
    updateEditorContent(currentText);
}

function updateCaretContext() {
    checkAutocomplete();
}

function checkAutocomplete() {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount || !editor.value) {
        showAutocomplete.value = false;
        return;
    }

    const range = selection.getRangeAt(0);
    const node = range.startContainer;
    const offset = range.startOffset;

    if (node.nodeType === Node.TEXT_NODE) {
        const textBeforeCaret = node.textContent?.substring(0, offset) || '';

        // Find the last occurrence of {{
        const lastMatch = textBeforeCaret.lastIndexOf('{{');

        // Ensure there's no closing }} after the {{ before the caret
        const closingMatch = textBeforeCaret.indexOf('}}', lastMatch);

        if (lastMatch !== -1 && (closingMatch === -1 || closingMatch < lastMatch)) {
            const searchStr = textBeforeCaret.substring(lastMatch + 2).trimStart();
            if (searchStr === undefined) return;
            currentSearchText.value = searchStr;
            searchStartNode.value = node;
            searchStartOffset.value = lastMatch;

            const keys = getValidKeys();
            filteredKeys.value = keys.filter(k => k.toLowerCase().includes((searchStr || '').toLowerCase()));

            if (filteredKeys.value.length > 0 || searchStr.length > 0) {
                 showAutocomplete.value = true;
                 updateAutocompletePosition(range);
            } else {
                 showAutocomplete.value = false;
            }
        } else {
            showAutocomplete.value = false;
        }
    } else {
        showAutocomplete.value = false;
    }
}

function updateAutocompletePosition(range: Range) {
    if (!editor.value) return;
    const rect = range.getBoundingClientRect();
    const editorRect = editor.value.getBoundingClientRect();

    // Relative to editor
    autocompleteX.value = rect.left - editorRect.left;
    autocompleteY.value = rect.bottom - editorRect.top + 5;
}

function handleKeyDown(e: KeyboardEvent) {
    if (showAutocomplete.value) {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedAutocompleteIndex.value = (selectedAutocompleteIndex.value + 1) % filteredKeys.value.length;
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedAutocompleteIndex.value = (selectedAutocompleteIndex.value - 1 + filteredKeys.value.length) % filteredKeys.value.length;
        } else if (e.key === 'Enter' || e.key === 'Tab') {
            if (filteredKeys.value.length > 0) {
                e.preventDefault();
                const selectedKey = filteredKeys.value[selectedAutocompleteIndex.value];
                if (selectedKey) selectAutocomplete(selectedKey);
            }
        } else if (e.key === 'Escape') {
            showAutocomplete.value = false;
        }
    }
}

function selectAutocomplete(key: string) {
    if (!searchStartNode.value || searchStartNode.value.nodeType !== Node.TEXT_NODE) return;

    const node = searchStartNode.value as Text;
    const text = node.textContent || '';

    // Replace from the start of {{ up to the current caret with the selected key
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const endOffset = range.endOffset;

    const before = text.substring(0, searchStartOffset.value);
    const after = text.substring(endOffset);

    node.textContent = `${before}{{ ${key} }}${after}`;

    showAutocomplete.value = false;

    // Update value and re-render
    if (editor.value) {
        const currentText = extractTextFromHtml(editor.value.innerHTML);
        emit('update:modelValue', currentText);
        updateEditorContent(currentText);

        // Try to place caret after the newly inserted span
        nextTick(() => {
            if (!editor.value) return;
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            // @ts-ignore
            const spans = editor.value.querySelectorAll('.prompt-var');
            // This is a naive caret positioning, might just put it at the end
            const sel = window.getSelection();
            const r = document.createRange();
            r.selectNodeContents(editor.value);
            r.collapse(false);
            sel?.removeAllRanges();
            sel?.addRange(r);
        });
    }
}
</script>

<style>
.editor-content {
    outline: none;
    border: 1px solid var(--border-color);
    padding: 0.5rem;
    border-radius: 4px;
    background-color: white;
}

.editor-content:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.2);
}

.prompt-var {
    display: inline-block;
    padding: 0 4px;
    border-radius: 4px;
    margin: 0 2px;
    font-weight: bold;
    cursor: help;
    filter: blur(0.5px);
    transition: filter 0.2s ease;
}

.prompt-var:hover {
    filter: blur(0);
}

.prompt-var.valid {
    background-color: #e8f5e9; /* Pale green */
    color: #2e7d32;
    border: 1px solid #c8e6c9;
}

.prompt-var.invalid {
    background-color: #ffebee; /* Pale red */
    color: #c62828;
    border: 1px solid #ffcdd2;
}

.autocomplete-list {
    position: absolute;
    background: white;
    border: 1px solid #ccc;
    border-radius: 4px;
    list-style: none;
    padding: 0;
    margin: 0;
    max-height: 150px;
    overflow-y: auto;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    z-index: 1000;
    min-width: 150px;
}

.autocomplete-list li {
    padding: 6px 12px;
    cursor: pointer;
    font-size: 0.9em;
}

.autocomplete-list li.active,
.autocomplete-list li:hover {
    background-color: var(--primary);
    color: white;
}
</style>
