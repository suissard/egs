import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { FormNode } from "../models/FormNode";
import { BoxNode } from "../models/BoxNode";
import { InputNode } from "../models/InputNode";

interface ExportItem {
	label: string;
	value: string;
}

/**
 * Recursively extracts labels and values from the form tree.
 */
export function extractExportData(node: FormNode): ExportItem[] {
	const items: ExportItem[] = [];

	if (node instanceof InputNode) {
		if (node.value !== null && node.value !== undefined && node.value !== "") {
			items.push({ label: node.label, value: String(node.value) });
		}
	} else if (node instanceof BoxNode) {
		for (const child of node.children) {
			items.push(...extractExportData(child));
		}
	}

	return items;
}

/**
 * Formats data as a string and copies to clipboard.
 */

export function extractClipboardLines(node: FormNode, depth: number = 0): string[] {
	const lines: string[] = [];
	const prefix = "+ ".repeat(depth);

	if (node instanceof InputNode) {
		let valueStr = "";
		let isEmpty = false;

		if (node.value === null || node.value === undefined || node.value === "") {
			isEmpty = true;
		} else if (Array.isArray(node.value)) {
			if (node.value.length === 0) {
				isEmpty = true;
			} else {
				// Handle table or multiple select array
				if (node.inputType === 'table') {
					// Check if all rows are essentially empty
					const isTableEmpty = node.value.every((row: any[]) => row.every(cell => cell === "" || cell === null || cell === undefined));
					if (isTableEmpty) {
						isEmpty = true;
					} else {
						// Format table nicely
						const tableLines = node.value
							.filter((row: any[]) => !row.every(cell => cell === "" || cell === null || cell === undefined))
							.map((row: any[]) => row.join(" | "));
						valueStr = "\n" + tableLines.map(line => prefix + "  - " + line).join("\n");
					}
				} else {
					valueStr = node.value.join(", ");
				}
			}
		} else if (typeof node.value === 'boolean' && !node.value) {
            // Optionnel : ne pas exporter les checkbox 'false' (à confirmer selon le comportement souhaité)
            if (node.inputType === 'checkbox') {
                isEmpty = true;
            } else {
                valueStr = String(node.value);
            }
        } else {
			valueStr = String(node.value);
		}

		if (!isEmpty) {
			if (node.inputType === 'table') {
				lines.push(`${prefix}${node.label}:${valueStr}`);
			} else {
				lines.push(`${prefix}${node.label}: ${valueStr}`);
			}
		}
	} else if (node instanceof BoxNode) {
		const childLines: string[] = [];
		const newDepth = node.title ? depth + 1 : depth;
		for (const child of node.children) {
			childLines.push(...extractClipboardLines(child, newDepth));
		}

		if (childLines.length > 0) {
			if (node.title) {
				lines.push(`${prefix}${node.title}`);
			}
			lines.push(...childLines);
		}
	}

	return lines;
}

export async function copyToClipboard(rootNode: FormNode): Promise<void> {
	const lines = extractClipboardLines(rootNode);
	const text = lines.join("\n");

	try {
		await navigator.clipboard.writeText(text);
	} catch (err) {
		console.error("Failed to copy to clipboard", err);
		throw err;
	}
}

/**
 * Generates a PDF from the form data (Text based).
 * @deprecated Use generateVisualPdf for WYSIWYG
 */
export function generatePdf(rootNode: FormNode) {
	const data = extractExportData(rootNode);
	const doc = new jsPDF();

	let y = 10;
	const lineHeight = 10;
	const pageHeight = doc.internal.pageSize.height;

	doc.setFontSize(16);
	doc.text("Récapitulatif du Formulaire", 10, y);
	y += 15;

	doc.setFontSize(12);
	for (const item of data) {
		if (y > pageHeight - 10) {
			doc.addPage();
			y = 10;
		}
		const text = `${item.label}: ${item.value}`;
		doc.text(text, 10, y);
		y += lineHeight;
	}

	doc.save("formulaire_text.pdf");
}

/**
 * Generates a Visual PDF by capturing the entire form and slicing it across pages.
 */
export async function generateVisualPdf(
	element: HTMLElement,
	filename: string = "formulaire.pdf",
) {
	const pdf = new jsPDF({
		orientation: "p",
		unit: "mm",
		format: "a4",
	});

	const pdfWidth = pdf.internal.pageSize.getWidth();
	const pdfHeight = pdf.internal.pageSize.getHeight();
	const margin = 10;

	// Create a single canvas of the entire element
	const canvas = await html2canvas(element, {
		scale: 2,
		useCORS: true,
		logging: false
	});

	const imgWidth = canvas.width;
	const imgHeight = canvas.height;

	// Calculate the width and height of the image on the PDF
	const finalWidth = pdfWidth - margin * 2;
	const finalHeight = (imgHeight * finalWidth) / imgWidth;

	// Available height on a single PDF page
	const pageHeight = pdfHeight - margin * 2;

	let heightLeft = finalHeight;
	let position = 0; // The Y coordinate on the image to start clipping

	// First page
	const imgData = canvas.toDataURL("image/png");
	pdf.addImage(imgData, "PNG", margin, margin, finalWidth, finalHeight);
	heightLeft -= pageHeight;

	// Subsequent pages
	while (heightLeft > 0) {
		position = heightLeft - finalHeight; // Move image up
		pdf.addPage();
		pdf.addImage(imgData, "PNG", margin, position + margin, finalWidth, finalHeight);
		heightLeft -= pageHeight;
	}

	pdf.save(filename);
}

/**
 * Exports data to a JSON file.
 */
export function exportToJson(data: any, filename: string = "form_data.json") {
	const jsonStr = JSON.stringify(data, null, 2);
	const blob = new Blob([jsonStr], { type: "application/json" });
	const url = URL.createObjectURL(blob);

	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}

/**
 * Reads JSON data from a file.
 */
export function importFromJson(file: File): Promise<any> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = (e) => {
			try {
				const json = JSON.parse(e.target?.result as string);
				resolve(json);
			} catch (err) {
				reject(err);
			}
		};
		reader.onerror = reject;
		reader.readAsText(file);
	});
}
