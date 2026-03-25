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
export async function copyToClipboard(rootNode: FormNode): Promise<void> {
	const data = extractExportData(rootNode);
	const text = data.map((item) => `${item.label}: ${item.value}`).join("\n");

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
 * Generates a Visual PDF by capturing the HTML element.
 */
export async function generateVisualPdf(
	element: HTMLElement,
	filename: string = "formulaire.pdf",
) {
	const canvas = await html2canvas(element, {
		scale: 2, // Higher resolution
		useCORS: true,
		logging: false,
	});

	const imgData = canvas.toDataURL("image/png");
	const pdf = new jsPDF({
		orientation: "p",
		unit: "mm",
		format: "a4",
	});

	const pdfWidth = pdf.internal.pageSize.getWidth();
	const imgWidth = canvas.width;
	const imgHeight = canvas.height;

	// Simple fit to width:
	const finalWidth = pdfWidth;
	const finalHeight = (imgHeight * pdfWidth) / imgWidth;

	pdf.addImage(imgData, "PNG", 0, 0, finalWidth, finalHeight);
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
