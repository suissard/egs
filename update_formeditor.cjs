const fs = require('fs');

let content = fs.readFileSync('src/components/editor/FormEditor.vue', 'utf8');

// The buttons are:
// <button class="btn btn-secondary mr-2" @click="clearForm">Vider</button>
// <button class="btn btn-primary" @click="saveForm">Enregistrer JSON</button>

content = content.replace(
  '<button class="btn btn-secondary mr-2" @click="clearForm">Vider</button>',
  '<button class="btn btn-error mr-2" @click="clearForm">Vider</button>'
);

content = content.replace(
  '<button class="btn btn-primary" @click="saveForm">Enregistrer JSON</button>',
  '<button class="btn btn-success" @click="saveForm">Enregistrer JSON</button>'
);

fs.writeFileSync('src/components/editor/FormEditor.vue', content);
