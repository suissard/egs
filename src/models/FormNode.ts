import type { FormElement, ShowIfCondition } from "../types/FormConfig";

export abstract class FormNode {
	id: string;
	type: "box" | "input";
	minWidth?: string;
	showIf?: ShowIfCondition;

	constructor(config: FormElement) {
		this.type = config.type;
		this.id = config.id || generateId();
		this.minWidth = config.minWidth;
		this.showIf = config.showIf;
	}

	abstract validate(): boolean;
}

function generateId(): string {
	return Math.random().toString(36).substr(2, 9);
}
