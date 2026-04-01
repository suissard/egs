import re

with open("src/App.vue", "r") as f:
    content = f.read()

# Import the new JSON
import_pattern = r"(import geriatricAssessment from '\./data/geriatricAssessment\.json';)"
import_replacement = r"\1\nimport psychologicalAnalysis from './data/psychologicalAnalysis.json';"
content = re.sub(import_pattern, import_replacement, content)

# Add to availableModels
models_pattern = r"(const availableModels = \[\n.*?\{ title: 'Évaluation Gériatrique Standardisée', key: 'geriatric' \}\n)(];)"
models_replacement = r"\1  , { title: 'Analyse Psychologique', key: 'psychological' }\n\2"
content = re.sub(models_pattern, models_replacement, content, flags=re.DOTALL)

# Update loadSelectedModel
load_pattern = r"(\} else if \(selectedModelKey\.value === 'geriatric'\) \{\n    config = geriatricAssessment;\n  \})"
load_replacement = r"\1 else if (selectedModelKey.value === 'psychological') {\n    config = psychologicalAnalysis;\n  }"
content = re.sub(load_pattern, load_replacement, content)

with open("src/App.vue", "w") as f:
    f.write(content)
