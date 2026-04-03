const fs = require('fs');

let content = fs.readFileSync('src/components/editor/EditorSidebar.vue', 'utf8');

// There is a duplicate `    </draggable>\n  </div>\n</template>`
content = content.replace(/<\/draggable>\s*<\/div>\s*<\/template>\s*<\/draggable>\s*<\/div>\s*<\/template>/, '</draggable>\n  </div>\n</template>');

fs.writeFileSync('src/components/editor/EditorSidebar.vue', content);
