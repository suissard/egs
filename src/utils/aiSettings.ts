import { ref, watch } from 'vue';

const API_KEY_STORAGE_KEY = 'openrouter-api-key';
const MODEL_STORAGE_KEY = 'openrouter-model';

export const openRouterApiKey = ref(localStorage.getItem(API_KEY_STORAGE_KEY) || '');
export const openRouterModel = ref(localStorage.getItem(MODEL_STORAGE_KEY) || 'openrouter/free');

watch(openRouterApiKey, (newValue) => {
  localStorage.setItem(API_KEY_STORAGE_KEY, newValue);
});

watch(openRouterModel, (newValue) => {
  localStorage.setItem(MODEL_STORAGE_KEY, newValue);
});
