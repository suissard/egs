# EGS (Évaluation Gériatrique Standardisée) - Form Builder

Ce projet est un constructeur de formulaires dynamiques développé avec **Vue 3** et **Vite**, conçu spécifiquement pour la création et la gestion d'Évaluations Gériatriques Standardisées (EGS). L'application offre une approche visuelle pour construire des questionnaires complexes tout en intégrant des fonctionnalités d'Intelligence Artificielle.

---

## 🚀 Guide Développeur

### Prérequis
- [Node.js](https://nodejs.org/) (version 18+ recommandée)
- `npm`

### Installation
1. Clonez le dépôt
2. Installez les dépendances :
   ```bash
   npm install
   ```

### Lancement en mode développement
```bash
npm run dev &
```
L'application sera accessible localement via le serveur Vite.

### Build pour la production
```bash
npm run build
```
Le build est configuré (via le plugin Vite `vite-plugin-singlefile`) pour générer un fichier `index.html` unique dans le dossier `dist/`, contenant tout le code inliné (HTML, CSS, JS).

### Architecture Technique

L'application est structurée autour d'un système de **Modèles de Données Typés** (`TypeScript`) situés dans `src/models/` et `src/types/` :

*   **`FormNode.ts`** : Classe de base abstraite représentant un élément du formulaire.
*   **`BoxNode.ts`** : Conteneur de layout (flexbox row/column) pouvant héberger d'autres `BoxNode` ou des `InputNode`.
*   **`InputNode.ts`** : Représente un champ de formulaire spécifique (texte, nombre, checkbox, radio, etc.).
*   **`FormFactory.ts`** : Factory pour l'instanciation des modèles à partir des configurations JSON (`src/data/`).

#### Composants Principaux :
*   `App.vue` : Point d'entrée, gère l'état global (vue courante : lecteur de formulaire, mode édition, ou documentation).
*   `FormRenderer.vue` : Moteur de rendu récursif qui prend une arborescence de `FormNode` et l'affiche.
*   `InputWrapper.vue` : Composant responsable du rendu individuel de chaque type d'input et de l'intégration IA.

---

## 👤 Guide Utilisateur

L'application permet d'afficher et de remplir des formulaires prédéfinis.

### IA & OpenRouter
L'application propose des fonctionnalités d'assistance par Intelligence Artificielle pour pré-remplir ou analyser certains champs.
1.  Ouvrez le panneau **Préférences** via la barre latérale.
2.  Saisissez votre clé d'API [OpenRouter](https://openrouter.ai/).
3.  Sélectionnez le modèle désiré (ex: Gemini 3 Pro, Claude, etc.).
Ces paramètres sont sauvegardés localement dans votre navigateur (`localStorage`).

### Formulaires inclus
Des modèles de formulaires JSON prédéfinis sont fournis (ex: `egs.json`, `geriatricAssessment.json`) et peuvent être chargés directement via l'interface.

---

## 🛠️ Le Mode Édition (Constructeur Visuel)

Le mode édition (`FormEditor.vue`) est le cœur du constructeur. Il permet de créer et modifier la structure JSON des formulaires via une interface "Drag and Drop" intuitive.

### Côté Fonctionnel (Pour l'utilisateur)

### Mécaniques de Formulaire (Mode Édition)

Le constructeur de formulaires inclut des mécaniques avancées pour rendre vos questionnaires plus intelligents et réactifs. Dans le mode Édition, ces mécaniques sont indiquées par des petites icônes colorées à côté du nom de l'élément lorsqu'elles sont configurées.

#### 1. Remplissage par IA (AI Prompts)
**Identifiant visuel :** Icône bleue (étincelles) `✨` à côté du nom du champ.

Cette fonctionnalité permet de pré-remplir ou de générer du contenu pour un champ spécifique en utilisant l'Intelligence Artificielle.

**Comment l'utiliser :**
1. Cliquez sur l'icône d'édition (crayon vert) d'un champ d'entrée (texte, textarea, etc.).
2. Dans les propriétés du champ, cliquez sur le bouton "Prompt IA".
3. Saisissez votre instruction (prompt) pour l'IA.
4. **Système de Template :** Vous pouvez utiliser des variables dynamiques en utilisant la syntaxe moustache `{{ cle_du_champ }}`. L'IA remplacera cette variable par la valeur saisie par l'utilisateur dans le champ correspondant avant de générer sa réponse.
   * *Exemple :* "Résume les symptômes suivants en une phrase : {{ symptomes_patient }}"

#### 2. Mécanique de Report (Action Reports)
**Identifiant visuel :** Icône orange (éclair) `⚡` à côté du nom du champ.

Les Action Reports permettent de reporter automatiquement des valeurs ou des données dans un autre champ du formulaire, en fonction des saisies de l'utilisateur.

**Comment l'utiliser :**
1. Cliquez sur l'icône d'édition d'un champ.
2. Cliquez sur le bouton "⚡ Report".
3. L'éditeur de rapport JSON s'ouvrira. Vous devez y définir un tableau de règles.
4. **Structure d'une règle JSON :**
La configuration se fait via l'interface d'édition, où vous définissez :
   *   **Trigger Value (Valeur déclenchante) :** La valeur qui, si elle est sélectionnée ou saisie, va déclencher le report.
   *   **Target Key (Clé cible) :** L'identifiant (clé JSON) du champ où la valeur doit être reportée.
   *   **Value to Report (Valeur à reporter) :** La donnée spécifique qui sera injectée dans le champ cible.

**Note sur les icônes :**
Dans le mode Édition, dès que vous avez configuré l'une de ces mécaniques sur un champ, la petite icône correspondante (bleue pour l'IA, orange pour le Report) apparaîtra à droite du nom du composant dans la vue principale du constructeur, vous permettant d'identifier rapidement les champs disposant de comportements avancés.

*   **Interface divisée en deux parties :**
    *   À gauche : Une barre d'outils (**Composants**) contenant les éléments disponibles (Conteneurs Box, Texte, Nombre, Cases à cocher, etc.).
    *   Au centre : Le **Canvas**, la zone de travail où l'on construit le formulaire.
*   **Drag & Drop :** Glissez un composant depuis la barre de gauche et déposez-le dans le Canvas.
*   **Paramétrage des éléments :** Cliquez sur l'icône "Éditer" (le crayon vert) d'un élément déposé dans le Canvas. Cela ouvre un panneau de propriétés directement dans le composant (édition "in-place") permettant de modifier :
    *   **Identifiant (Clé) :** Crucial pour la collecte de données.
    *   **Label :** Le texte affiché à l'utilisateur.
    *   **Options :** Pour les listes déroulantes, boutons radio, QCM.
*   **Fonctionnalités Avancées :**
    *   **Action Reports :** Permet de déclencher l'affichage d'alertes ou d'informations en fonction de la valeur saisie (par exemple, si le score MMSE est inférieur à un seuil).
    *   **Prompts IA (AI Prompts) :** Chaque champ de saisie peut embarquer une instruction IA personnalisée. Vous pouvez utiliser le système de template moustache `{{ key }}` pour injecter dynamiquement la valeur d'un autre champ du formulaire dans le prompt. *(ex: "Résume les symptômes suivants : {{ symptomes_id }}")*.
*   **Sauvegarde :** Le bouton "Enregistrer JSON" permet de générer le code source du formulaire créé pour pouvoir l'utiliser ou le sauvegarder côté système de fichiers.

### Côté Technique (Pour le développeur)

Le fonctionnement sous-jacent de l'éditeur repose sur plusieurs mécanismes :

*   **`vuedraggable` :** Utilisé massivement pour la mécanique de Drag & Drop (`EditorSidebar.vue` vers `FormEditor.vue` et `EditorNode.vue` pour la réorganisation interne). Il est couplé au système de réactivité de Vue pour mettre à jour l'arborescence des objets.
*   **Arborescence JSON :** L'état en cours est un objet JSON réactif représentant l'arbre. Les modifications dans l'éditeur (titre, label, options) affectent directement cet état.
*   **`EditorNode.vue` :** Composant récursif. Il représente une ligne dans l'éditeur. Si le nœud est de type `box`, il instancie un composant `draggable` imbriqué permettant de déposer d'autres `EditorNode` à l'intérieur.
*   **Édition In-place :** Contrairement à un panneau de propriétés latéral classique, l'édition des paramètres d'un nœud (modals de configuration, ajout d'options, configuration IA) se fait en développant le composant `EditorNode.vue` de manière contextuelle (grâce à un état `isEditing` localisé).

#### Comment mettre en place une nouvelle mécanique d'édition ?
Si vous devez ajouter une nouvelle fonctionnalité à l'éditeur (ex: paramétrer les couleurs d'une Box) :
1.  **Modèle :** Ajoutez d'abord la propriété dans `src/types/FormConfig.ts` (Interface `BoxElement`).
2.  **Vue (Éditeur) :** Dans `src/components/editor/EditorNode.vue`, localisez la section conditionnelle correspondant au type concerné (`v-if="isBox"`). Ajoutez le champ d'interface (input, select) lié en `v-model` à la propriété (`v-model="node.maNouvelleProp"`).
3.  **Rendu (Lecteur) :** Allez dans `FormRenderer.vue` (ou le composant enfant concerné) pour exploiter cette nouvelle propriété visuellement lorsque le formulaire est utilisé hors de l'éditeur.
