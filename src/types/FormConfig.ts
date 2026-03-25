export type InputType =
	| "text"
	| "email"
	| "tel"
	| "number"
	| "date"
	| "select"
	| "checkbox"
	| "textarea"
	| "radio"
	| "switch"
	| "slider"
	| "file"
	| "time";

export interface FormElement {
	type: "box" | "input";
	id?: string;
	minWidth?: string;
}

export interface BoxElement extends FormElement {
	type: "box";
	direction?: "row" | "column";
	children: (BoxElement | InputElement)[];
	title?: string;
}

export interface InputElement extends FormElement {
	type: "input";
	inputType: InputType;
	label: string;
	key: string;
	required?: boolean;
	options?: string[]; // For select, radio
	placeholder?: string;
	multiple?: boolean; // For select (QCM)
	min?: number;
	max?: number;
	step?: number;
}

export type FormConfig = BoxElement;
