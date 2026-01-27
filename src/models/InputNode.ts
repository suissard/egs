import { FormNode } from "./FormNode";
import type { InputElement, InputType } from "../types/FormConfig";

export class InputNode extends FormNode {
	inputType: InputType;
	label: string;
	key: string;
	required: boolean;
	options: string[];
	placeholder: string;
	value: any = null; // To hold the user input

	constructor(config: InputElement) {
		super(config);
		this.inputType = config.inputType;
		this.label = config.label;
		this.key = config.key;
		this.required = config.required || false;
		this.options = config.options || [];
		this.placeholder = config.placeholder || "";
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
