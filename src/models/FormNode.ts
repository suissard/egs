import type { FormElement } from "../types/FormConfig";

export abstract class FormNode {
	id: string;
	type: "box" | "input";

	constructor(config: FormElement) {
		this.type = config.type;
		this.id = config.id || generateId();
	}

	abstract validate(): boolean;
}

function generateId(): string {
	return Math.random().toString(36).substr(2, 9);
}
