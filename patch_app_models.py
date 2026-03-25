import sys

def modify_app_models():
    with open('src/App.vue', 'r') as f:
        content = f.read()

    # Need to load the egs data when selectedModelKey is 'egs'
    if "if (selectedModelKey.value === 'full') {" in content:
        content = content.replace(
            "if (selectedModelKey.value === 'full') {",
            "if (selectedModelKey.value === 'egs') {\n    config = egs;\n  } else if (selectedModelKey.value === 'full') {"
        )

    # Need to remove the default selectedModelKey ref('personal') and change it to egs since our previous patch missed replacing the correct instance.
    content = content.replace("const selectedModelKey = ref('personal');", "const selectedModelKey = ref('egs');")

    with open('src/App.vue', 'w') as f:
        f.write(content)

if __name__ == '__main__':
    modify_app_models()
