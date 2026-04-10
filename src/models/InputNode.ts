import { FormNode } from "./FormNode";
import type { InputElement, InputType, ActionReport } from "../types/FormConfig";

export class InputNode extends FormNode {
	inputType: InputType;
	label: string;
	key: string;
	required: boolean;
	options: string[];
	placeholder: string;
	multiple: boolean;
	min?: number;
	max?: number;
	step?: number;
	columns: string[];
	actionReports: ActionReport[];
	aiPrompt?: string;
	value: any = null; // To hold the user input

	constructor(config: InputElement) {
		super(config);
		this.inputType = config.inputType;
		this.label = config.label;
		this.key = config.key;
		this.required = config.required || false;
		this.options = config.options || [];
		this.placeholder = config.placeholder || "";
		this.multiple = config.multiple || false;
		this.min = config.min;
		this.max = config.max;
		this.step = config.step;
		this.columns = config.columns || [];
		this.actionReports = config.actionReports || [];
		this.aiPrompt = config.aiPrompt;

		if (this.inputType === "checkbox" && this.options.length > 0) {
			this.value = [];
		}

		if (this.inputType === "table") {
			this.value = [];
		}
	}

	validate(): boolean {
		if (
			this.required &&
			(this.value === null || this.value === "" || this.value === undefined)
		) {
			return false;
		}
		// Add specific validation logic based on inputType (email, etc.) if needed
		if (this.inputType === "email" && this.value) {
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			return emailRegex.test(this.value);
		}
		return true;
	}
}
