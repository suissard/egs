<template>
  <v-app>
    <v-main class="bg-grey-lighten-4">
      <v-container>
        <v-row justify="center">
          <v-col cols="12" md="10" lg="8">
            <h1 class="text-h3 mb-4 text-center">Formulaire Dynamique</h1>
            
            <div v-if="formRoot" class="my-4">
              <v-form ref="form" v-model="valid">
                <FormRenderer :node="formRoot" />
                
                <v-btn 
                  color="primary" 
                  size="large" 
                  block 
                  class="mt-4"
                  @click="submitForm"
                >
                  Valider
                </v-btn>
              </v-form>
            </div>
            
            <v-alert v-if="submittedData" type="info" title="Données soumises" class="mt-4">
              <pre>{{ submittedData }}</pre>
            </v-alert>

          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { FormFactory } from './models/FormFactory';
import { FormNode } from './models/FormNode';
import { BoxNode } from './models/BoxNode';
import FormRenderer from './components/FormRenderer.vue';
import rawConfig from './data/personalCoordinates.json';
import type { FormConfig } from './types/FormConfig'; // Ensure this type is exported or just cast

const formRoot = ref<FormNode | null>(null);
const valid = ref(false);
const submittedData = ref<string | null>(null);

onMounted(() => {
  // Load configuration
  // The rawConfig import might interpret it as generic object, cast to FormConfig
  formRoot.value = FormFactory.create(rawConfig as unknown as FormConfig);
});

function submitForm() {
  if (formRoot.value && formRoot.value instanceof BoxNode) {
    if (formRoot.value.validate()) {
      const data = formRoot.value.getData();
      console.log('Form Data:', data);
      submittedData.value = JSON.stringify(data, null, 2);
    } else {
      alert('Veuillez remplir tous les champs obligatoires.');
    }
  }
}
</script>
