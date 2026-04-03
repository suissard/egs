import re

file_path = "src/components/InputWrapper.vue"
with open(file_path, "r") as f:
    content = f.read()

# Update textarea to bind input event for auto-resize
search_textarea = """      <textarea v-model="node.value" :required="node.required" class="input-field" rows="3" :disabled="readonly || isLoadingAI"></textarea>"""
replace_textarea = """      <textarea v-model="node.value" :required="node.required" class="input-field" rows="3" :disabled="readonly || isLoadingAI" @input="autoResize" ref="textareaRef" style="overflow:hidden;"></textarea>"""
content = content.replace(search_textarea, replace_textarea)

# Add autoResize logic and ref in script setup
search_script = """const isLoadingAI = ref(false);"""
replace_script = """const isLoadingAI = ref(false);
const textareaRef = ref<HTMLTextAreaElement | null>(null);

function autoResize(event: Event) {
  const target = event.target as HTMLTextAreaElement;
  target.style.height = 'auto'; // Reset height to recalculate
  target.style.height = target.scrollHeight + 'px';
}

import { onMounted, nextTick } from 'vue';
onMounted(() => {
  nextTick(() => {
     if(textareaRef.value) {
         // trigger resize on load if there's initial value
         textareaRef.value.style.height = 'auto';
         textareaRef.value.style.height = textareaRef.value.scrollHeight + 'px';
     }
  });
});
"""
content = content.replace(search_script, replace_script)


with open(file_path, "w") as f:
    f.write(content)
