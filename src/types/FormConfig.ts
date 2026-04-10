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
	| "time"
	| "table";


export interface ActionReport {
	targetKey: string;
	valueToReport: any;
	triggerValue: any | any[]; // A single value or an array of values it can equal to trigger
}

export interface ShowIfCondition {
	dependsOn: string;
	value: any | any[]; // A single value or an array of values it can equal
}

export interface FormElement {
	type: "box" | "input";
	id?: string;
	minWidth?: string;
	showIf?: ShowIfCondition;
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
	columns?: string[]; // For table
	actionReports?: ActionReport[];
	aiPrompt?: string;
}

export type FormConfig = BoxElement;
