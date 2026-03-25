import sys

def modify_types():
    with open('src/types/FormConfig.ts', 'r') as f:
        content = f.read()

    # Find where InputElement is defined
    # We'll add hasActionReport?: boolean;
    search_string = "step?: number;"
    if search_string in content:
        content = content.replace(search_string, "step?: number;\n\thasActionReport?: boolean;")

    with open('src/types/FormConfig.ts', 'w') as f:
        f.write(content)

if __name__ == '__main__':
    modify_types()
