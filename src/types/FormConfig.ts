export type InputType =
	| "text"
	| "email"
	| "tel"
	| "number"
	| "date"
	| "select"
	| "checkbox"
	| "textarea";

export interface FormElement {
	type: "box" | "input";
	id?: string;
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
	options?: string[]; // For select
	placeholder?: string;
}

export type FormConfig = BoxElement;
