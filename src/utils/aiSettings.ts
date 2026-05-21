import { ref, watch } from 'vue';

const API_KEY_STORAGE_KEY = 'openrouter-api-key';
const MODEL_STORAGE_KEY = 'openrouter-model';

export const openRouterApiKey = ref(localStorage.getItem(API_KEY_STORAGE_KEY) || '');
export const openRouterModel = ref(localStorage.getItem(MODEL_STORAGE_KEY) || 'nvidia/nemotron-3-super-120b-a12b:free');

watch(openRouterApiKey, (newValue) => {
  localStorage.setItem(API_KEY_STORAGE_KEY, newValue);
});

watch(openRouterModel, (newValue) => {
  localStorage.setItem(MODEL_STORAGE_KEY, newValue);
});

export interface AIErrorDetails {
  message: string;
  fieldLabel: string;
  prompt: string;
  responseStatus?: number;
  rawResponse?: string;
  timestamp: string;
}

export const lastAIError = ref<AIErrorDetails | null>(null);
export const isErrorDrawerOpen = ref(false);

export function triggerAIError(details: AIErrorDetails) {
  lastAIError.value = details;
  isErrorDrawerOpen.value = true;
}
