import sys

def modify_model():
    with open('src/models/InputNode.ts', 'r') as f:
        content = f.read()

    # Add property to class
    if "step?: number;" in content:
        content = content.replace("step?: number;", "step?: number;\n\thasActionReport: boolean;")

    # Add assignment in constructor
    if "this.step = config.step;" in content:
        content = content.replace("this.step = config.step;", "this.step = config.step;\n\t\tthis.hasActionReport = config.hasActionReport || false;")

    with open('src/models/InputNode.ts', 'w') as f:
        f.write(content)

if __name__ == '__main__':
    modify_model()
