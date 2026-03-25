<template>
  <div class="form-renderer">
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
            <FormRenderer v-for="child in node.children" :key="child.id" :node="child" class="flex-grow-1"
              :style="{ minWidth: child.minWidth || '200px' }" />
          </div>

          <!-- Column Layout: Flexbox with gap -->
          <div v-else class="d-flex flex-column" style="gap: 16px">
            <div v-for="child in node.children" :key="child.id">
              <FormRenderer :node="child" />
            </div>
          </div>
        </div>
      </div>
    </template>

    <template v-else-if="isInput(node)">
      <InputWrapper :node="node" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { FormNode } from '../models/FormNode';
import { BoxNode } from '../models/BoxNode';
import { InputNode } from '../models/InputNode';
import InputWrapper from './InputWrapper.vue';

// Define props
defineProps<{
  node: FormNode;
}>();

// Type guards
function isBox(node: FormNode): node is BoxNode {
  return node.type === 'box';
}

function isInput(node: FormNode): node is InputNode {
  return node.type === 'input';
}
</script>

<script lang="ts">
export default {
  name: 'FormRenderer'
}
</script>
