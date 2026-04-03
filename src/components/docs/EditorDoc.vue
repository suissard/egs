<template>
  <div class="card pa-6 mb-8 doc-container">
    <h2 class="text-h4 mb-4 text-warning">Tutoriel : Mode Édition</h2>

    <div class="alert alert-warning mb-6">
      <strong>Attention :</strong> Le mode édition permet de modifier la structure même du formulaire (ajouter, supprimer ou modifier des questions).
    </div>

    <div class="doc-section">
      <h3 class="text-h5 mb-3">1. Activer le mode édition</h3>
      <p>
        Pour entrer en mode édition, cochez l'interrupteur <strong>"Mode Édition"</strong> situé en haut à droite de l'écran principal.
        L'interface changera pour afficher l'arborescence du formulaire actuel.
      </p>
    </div>

    <div class="doc-section">
      <h3 class="text-h5 mb-3">2. Comprendre la structure</h3>
      <p>
        Un formulaire est composé de différents éléments emboîtés :
      </p>
      <ul>
        <li><strong>Conteneurs (Layouts/Tabs/Rows) :</strong> Ce sont des boîtes qui organisent l'affichage. Par exemple, un système d'onglets (Tabs) ou une grille.</li>
        <li><strong>Champs de saisie (Inputs) :</strong> Ce sont les éléments où l'utilisateur tape ses réponses (Texte, Nombre, Case à cocher, Liste déroulante, etc.).</li>
      </ul>
    </div>

    <div class="doc-section">
      <h3 class="text-h5 mb-3">3. Manipuler les éléments</h3>
      <p>Dans l'éditeur, chaque élément possède plusieurs boutons d'action :</p>
      <ul>
        <li><strong>Glisser-déposer (Drag & Drop) :</strong> Utilisez l'icône de "poignée" (≡) pour déplacer un élément vers le haut ou le bas, ou pour le glisser à l'intérieur d'un autre conteneur.</li>
        <li><strong>Éditer (Crayon) :</strong> Ouvre une fenêtre pour modifier les propriétés de l'élément (Label, Type, Obligatoire, Options pour les listes...).</li>
        <li><strong>Ajouter (+) :</strong> Sur un conteneur, permet d'ajouter un nouveau champ ou un nouveau sous-conteneur à l'intérieur.</li>
        <li><strong>Supprimer (Poubelle) :</strong> Retire l'élément définitivement.</li>
      </ul>
    </div>

    <div class="doc-section">
      <h3 class="text-h5 mb-3">4. Configuration IA (Avancé)</h3>
      <p>
        Si vous avez configuré votre clé API OpenRouter dans les Préférences, vous pouvez générer automatiquement de nouveaux éléments (comme des échelles médicales) en utilisant le bouton <strong>"Générer avec IA"</strong> (icône étincelles). Décrivez ce que vous voulez, et l'IA créera la structure correspondante.
      </p>
    </div>

    <div class="doc-section">
      <h3 class="text-h5 mb-3">5. Sauvegarder vos modifications</h3>
      <p>
        Une fois vos changements terminés, cliquez sur le grand bouton vert <strong>"Sauvegarder les modifications"</strong> en haut de l'éditeur.
        Vous basculerez automatiquement vers le formulaire mis à jour.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
// Editor documentation component
</script>

<style scoped>
.doc-container {
  line-height: 1.6;
}
.doc-section {
  margin-bottom: 2rem;
}
.doc-section h3 {
  color: var(--text-color);
  border-bottom: 2px solid var(--border-color);
  padding-bottom: 0.5rem;
}
.doc-section ul {
  padding-left: 2rem;
  margin-top: 0.5rem;
  margin-bottom: 1rem;
}
.doc-section li {
  margin-bottom: 0.5rem;
}
.alert-warning {
  background-color: var(--warning);
  color: black;
  padding: 1rem;
  border-radius: 4px;
}
</style>
