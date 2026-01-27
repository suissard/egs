<template>
  <div class="form-renderer" style="width: 100%">
    <template v-if="isBox(node)">
       <component :is="node.title ? 'v-card' : 'div'" :class="node.title ? 'mb-4 pa-4' : 'mb-2'" :variant="node.title ? 'tonal' : undefined">
         <v-card-title v-if="node.title">{{ node.title }}</v-card-title>
         <v-card-text :class="{'pa-0': !node.title}">
           
           <!-- Row Layout: render children in columns -->
           <v-row v-if="node.direction === 'row'" dense>
             <v-col 
               v-for="child in node.children" 
               :key="child.id" 
               cols="12" 
               md="6"
             >
               <FormRenderer :node="child" />
             </v-col>
           </v-row>

           <!-- Column Layout: render children stacked -->
           <div v-else class="d-flex flex-column">
             <div v-for="child in node.children" :key="child.id" class="mb-2">
                <FormRenderer :node="child" />
             </div>
           </div>

         </v-card-text>
       </component>
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
