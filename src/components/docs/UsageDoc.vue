<template>
  <div class="card pa-6 mb-8 doc-container">
    <h2 class="text-h4 mb-4 text-primary">Tutoriel : Usage de base du formulaire</h2>

    <div class="doc-section">
      <h3 class="text-h5 mb-3">1. Sélectionner un modèle</h3>
      <p>
        En haut de la page, utilisez le menu déroulant <strong>"Choisir un modèle"</strong> pour charger un formulaire préconfiguré. Plusieurs modèles sont disponibles, par exemple :
      </p>
      <ul>
        <li>Évaluation Gériatrique Standardisée (EGS)</li>
        <li>Analyse Psychologique</li>
        <li>Coordonnées Personnelles</li>
      </ul>
      <p>
        Une fois sélectionné, le formulaire correspondant s'affiche automatiquement.
      </p>
    </div>

    <div class="doc-section">
      <h3 class="text-h5 mb-3">2. Remplir le formulaire</h3>
      <p>
        Parcourez les différentes sections du formulaire (souvent organisées en onglets ou en blocs extensibles) et remplissez les champs nécessaires.
        Vos données sont <strong>automatiquement sauvegardées localement</strong> dans votre navigateur. Vous ne perdrez pas vos informations si vous rafraîchissez la page.
      </p>
    </div>

    <div class="doc-section">
      <h3 class="text-h5 mb-3">3. Options d'exportation et de validation</h3>
      <p>
        En bas du formulaire, plusieurs actions s'offrent à vous :
      </p>
      <ul>
        <li><strong>Valider le formulaire :</strong> Vérifie que tous les champs obligatoires sont remplis et affiche un résumé des données soumises.</li>
        <li><strong>Presse-papier :</strong> Copie le contenu textuel complet du formulaire (questions et réponses) pour le coller facilement dans un e-mail ou un document.</li>
        <li><strong>PDF (Visuel) :</strong> Génère une capture au format PDF de l'état actuel de votre formulaire.</li>
        <li><strong>Export JSON :</strong> Télécharge un fichier technique (.json) contenant toutes vos réponses. Très utile pour faire des sauvegardes de dossiers.</li>
        <li><strong>Import JSON :</strong> Permet de recharger des réponses précédemment exportées via "Export JSON".</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
// Documentation component
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
</style>
