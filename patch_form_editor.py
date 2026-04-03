import re

file_path = "src/components/editor/FormEditor.vue"
with open(file_path, "r") as f:
    content = f.read()

# Remove Right Sidebar component from template
search_template = """    <!-- Right Sidebar: Properties -->
    <EditorProperties
      :selected-node="selectedNode"
      @delete-node="deleteNodeGlobally"
    />
  </div>"""
replace_template = """  </div>"""
content = content.replace(search_template, replace_template)

# Remove import
search_import = """import EditorProperties from './EditorProperties.vue';"""
replace_import = """// EditorProperties removed"""
content = content.replace(search_import, replace_import)

with open(file_path, "w") as f:
    f.write(content)
