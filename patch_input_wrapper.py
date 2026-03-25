import sys

def modify_vue():
    with open('src/components/InputWrapper.vue', 'r') as f:
        content = f.read()

    # We want to add an indicator or maybe a small visual queue when node.hasActionReport is true
    # Let's add a small badge next to the label.

    badge_html = '''<span v-if="node.hasActionReport" class="badge-action-report" title="Ce champ peut déclencher un plan d'action">⚡ Rapport</span>'''

    # For text, email, etc.
    content = content.replace(
        '''{{ node.label }} <span v-if="node.required" class="text-error">*</span>''',
        f'''{{{{ node.label }}}} <span v-if="node.required" class="text-error">*</span> {badge_html}'''
    )

    # For switch
    content = content.replace(
        '''<span class="font-weight-bold">{{ node.label }}</span>''',
        f'''<span class="font-weight-bold">{{{{ node.label }}}}</span> {badge_html}'''
    )

    # For checkbox
    content = content.replace(
        '''<span>{{ node.label }} <span v-if="node.required" class="text-error">*</span></span>''',
        f'''<span>{{{{ node.label }}}} <span v-if="node.required" class="text-error">*</span> {badge_html}</span>'''
    )

    # For slider
    content = content.replace(
        '''{{ node.label }}: {{ node.value }}''',
        f'''{{{{ node.label }}}}: {{{{ node.value }}}} {badge_html}'''
    )

    style_to_add = '''
.badge-action-report {
  background-color: #ff9800;
  color: white;
  font-size: 0.7em;
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: 8px;
  vertical-align: middle;
  cursor: help;
}
'''
    content = content.replace('</style>', style_to_add + '</style>')

    with open('src/components/InputWrapper.vue', 'w') as f:
        f.write(content)

if __name__ == '__main__':
    modify_vue()
