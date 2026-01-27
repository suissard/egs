import type { FormConfig, BoxElement, InputElement } from "../types/FormConfig";
import { FormNode } from "./FormNode";
import { BoxNode } from "./BoxNode";
import { InputNode } from "./InputNode";

export class FormFactory {
	static create(config: FormConfig | InputElement): FormNode {
		if (config.type === "box") {
			const boxConfig = config as BoxElement;
			const children = boxConfig.children.map((child) => FormFactory.create(child));
			return new BoxNode(boxConfig, children);
		} else if (config.type === "input") {
			return new InputNode(config as InputElement);
		} else {
			throw new Error(`Unknown type: ${(config as any).type}`);
		}
	}
}
