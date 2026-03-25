import { FormNode } from "./FormNode";
import type { BoxElement } from "../types/FormConfig";
import { InputNode } from "./InputNode";

export class BoxNode extends FormNode {
	direction: "row" | "column";
	children: FormNode[];
	title?: string;

	constructor(config: BoxElement, children: FormNode[]) {
		super(config);
		this.direction = config.direction || "column";
		this.children = children;
		this.title = config.title;
	}

	validate(): boolean {
		return this.children.every((child) => child.validate());
	}

	/**
	 * Recursive method to gather all data from inputs
	 */
	getData(): Record<string, any> {
		let data: Record<string, any> = {};
		for (const child of this.children) {
			if (child instanceof InputNode) {
				data[child.key] = child.value;
			} else if (child instanceof BoxNode) {
				Object.assign(data, child.getData());
			}
		}
		return data;
	}
}