import { ref, watch } from 'vue';

const API_KEY_STORAGE_KEY = 'openrouter-api-key';
const MODEL_STORAGE_KEY = 'openrouter-model';

export const openRouterApiKey = ref(localStorage.getItem(API_KEY_STORAGE_KEY) || '');
export const openRouterModel = ref(localStorage.getItem(MODEL_STORAGE_KEY) || 'google/gemma-4-31b-it:free');
export const freeModels = ref<string[]>([]);
export const isLoadingModels = ref(false);

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

export interface OpenRouterModel {
  id: string;
  name: string;
  description?: string;
  pricing?: {
    prompt: string;
    completion: string;
  };
}

export async function fetchFreeModels(): Promise<void> {
  isLoadingModels.value = true;
  try {
    const response = await fetch('https://openrouter.ai/api/v1/models');
    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.statusText}`);
    }
    const data = await response.json();
    
    // Filter for free models (those with :free in the id)
    const free = (data.data || [])
      .filter((model: OpenRouterModel) => 
        model.id.includes(':free') || 
        (model.pricing && model.pricing.prompt === '0' && model.pricing.completion === '0')
      )
      .map((model: OpenRouterModel) => model.id)
      .sort();
    
    freeModels.value = free;
  } catch (error) {
    console.error('Error fetching models from OpenRouter:', error);
    freeModels.value = [];
  } finally {
    isLoadingModels.value = false;
  }
}
