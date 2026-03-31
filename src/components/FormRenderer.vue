<template>
  <div class="form-renderer-wrapper">
    <transition name="fade-slide" mode="out-in">
      <div v-if="!isVisible && !forceShow" class="hidden-indicator" key="hidden">
        <div class="hidden-line"></div>
        <button type="button" class="btn-eye" @click="forceShow = true" title="Afficher ce champ masqué (Lecture seule)">
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
        </button>
        <div class="hidden-line"></div>
      </div>

      <div v-else class="form-renderer" key="visible">
        <div v-if="forceShow && !isVisible" class="force-show-header">
          <span class="force-show-label">Affichage forcé (Lecture seule)</span>
          <button type="button" class="btn-eye-close" @click="forceShow = false" title="Masquer à nouveau">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
          </button>
        </div>

        <template v-if="isBox(node)">
          <div :class="[
            'rounded-lg',
            node.title ? 'card' : ''
          ]">
            <div v-if="node.title" class="card-title bg-primary text-white font-weight-bold text-subtitle-1">
              {{ node.title }}
            </div>

            <div :class="[node.title ? 'pa-4' : 'pa-0', 'd-flex', 'flex-column']">
              <!-- Row Layout: Flexbox with gap -->
              <div v-if="node.direction === 'row'" class="d-flex flex-wrap" style="gap: 16px">
                <FormRenderer v-for="child in node.children" :key="child.id" :node="child" :root-data="rootData" class="flex-grow-1"
                  :style="{ minWidth: child.minWidth || '200px' }" />
              </div>

              <!-- Column Layout: Flexbox with gap -->
              <div v-else class="d-flex flex-column" style="gap: 16px">
                <div v-for="child in node.children" :key="child.id">
                  <FormRenderer :node="child" :root-data="rootData" />
                </div>
              </div>
            </div>
          </div>
        </template>

        <template v-else-if="isInput(node)">
          <InputWrapper :node="node" :readonly="forceShow && !isVisible" />
        </template>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { FormNode } from '../models/FormNode';
import { BoxNode } from '../models/BoxNode';
import { InputNode } from '../models/InputNode';
import InputWrapper from './InputWrapper.vue';

// Define props
const props = defineProps<{
  node: FormNode;
  rootData: Record<string, any>;
}>();

const forceShow = ref(false);

// Computed property to determine visibility based on showIf condition
const isVisible = computed(() => {
  if (!props.node.showIf) return true;

  const condition = props.node.showIf;
  const targetValue = props.rootData[condition.dependsOn];

  if (Array.isArray(condition.value)) {
    return condition.value.includes(targetValue);
  }
  return targetValue === condition.value;
});


// Type guards
function isBox(node: FormNode): node is BoxNode {
  return node.type === 'box';
}

function isInput(node: FormNode): node is InputNode {
  return node.type === 'input';
}

// Reset forceShow if visibility becomes strictly true again
watch(isVisible, (newVal) => {
  if (newVal) {
    forceShow.value = false;
  }
});
</script>

<script lang="ts">
export default {
  name: 'FormRenderer'
}
</script>

<style scoped>
.form-renderer-wrapper {
  margin-bottom: 0;
}

.hidden-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 0.5rem 0;
  opacity: 0.5;
  transition: opacity 0.3s ease;
}

.hidden-indicator:hover {
  opacity: 1;
}

.hidden-line {
  flex-grow: 1;
  height: 1px;
  background-color: var(--border-color, #ccc);
  border-radius: 1px;
}

.btn-eye, .btn-eye-close {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  border-radius: 50%;
  transition: background-color 0.2s, color 0.2s;
}

.btn-eye:hover, .btn-eye-close:hover {
  background-color: #eee;
  color: #333;
}

.force-show-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 8px;
  background-color: #fff3cd;
  border: 1px solid #ffe69c;
  border-radius: 4px;
  margin-bottom: 8px;
  color: #664d03;
  font-size: 0.8em;
}

.force-show-label {
  font-weight: bold;
}

/* Transitions */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s ease;
  overflow: hidden;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
