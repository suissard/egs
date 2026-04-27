import type { FormElement, ShowIfCondition } from "../types/FormConfig";

export abstract class FormNode {
	id: string;
	type: "box" | "input";
	minWidth?: string;
	showIf?: ShowIfCondition;
	pageBreakBefore?: boolean;

	constructor(config: FormElement) {
		this.type = config.type;
		this.id = config.id || generateId();
		this.minWidth = config.minWidth;
		this.showIf = config.showIf;
		this.pageBreakBefore = config.pageBreakBefore || false;
	}

	abstract validate(): boolean;
}

function generateId(): string {
	return Math.random().toString(36).substr(2, 9);
}
