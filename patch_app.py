import sys

def modify_app():
    with open('src/App.vue', 'r') as f:
        content = f.read()

    # Import the new JSON file
    if "import egs from './data/egs.json';" not in content:
        content = content.replace(
            "import fullFormExample from './data/fullFormExample.json';",
            "import fullFormExample from './data/fullFormExample.json';\nimport egs from './data/egs.json';"
        )

    # Add it to the available models list
    if "{ key: 'egs', title: 'Évaluation Gériatrique Standardisée (EGS)', data: egs }" not in content:
        content = content.replace(
            "const availableModels = [",
            "const availableModels = [\n  { key: 'egs', title: 'Évaluation Gériatrique Standardisée (EGS)', data: egs },"
        )

    # Also set default model to EGS
    if "const selectedModelKey = ref('geriatricAssessment');" in content:
        content = content.replace(
            "const selectedModelKey = ref('geriatricAssessment');",
            "const selectedModelKey = ref('egs');"
        )

    with open('src/App.vue', 'w') as f:
        f.write(content)

if __name__ == '__main__':
    modify_app()
