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

	// Clone the element to avoid mutating the live page
	const clone = element.cloneNode(true) as HTMLElement;

	// Copy input values because cloneNode doesn't preserve them
	const originalInputs = Array.from(element.querySelectorAll("input, select, textarea"));
	const clonedInputs = Array.from(clone.querySelectorAll("input, select, textarea"));

	clonedInputs.forEach((clonedInput, index) => {
		const originalInput = originalInputs[index] as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
		if (originalInput && clonedInput) {
			if (clonedInput.tagName === "SELECT") {
				(clonedInput as HTMLSelectElement).value = (originalInput as HTMLSelectElement).value;
			} else if (clonedInput.tagName === "TEXTAREA") {
				(clonedInput as HTMLTextAreaElement).value = (originalInput as HTMLTextAreaElement).value;
			} else {
				(clonedInput as HTMLInputElement).value = (originalInput as HTMLInputElement).value;
				if ((clonedInput as HTMLInputElement).type === "checkbox" || (clonedInput as HTMLInputElement).type === "radio") {
					(clonedInput as HTMLInputElement).checked = (originalInput as HTMLInputElement).checked;
				}
			}
		}
	});

	// Remove all elements with 'no-print' class, buttons, and action reports from the clone
	const noPrintElements = Array.from(clone.querySelectorAll(".no-print, button, .badge-action-report"));
	noPrintElements.forEach(el => el.parentNode?.removeChild(el));

	// Remove the last column of any table (the 'X' column and header) to make it clean
	const tables = Array.from(clone.querySelectorAll("table"));
	tables.forEach((table) => {
		const rows = Array.from(table.querySelectorAll("tr"));
		rows.forEach((row) => {
			const children = Array.from(row.children);
			if (children.length > 0) {
				const lastChild = children[children.length - 1];
				if (lastChild && (lastChild.tagName === "TH" || lastChild.querySelector("button") || lastChild.textContent?.trim() === "X")) {
					lastChild.parentNode?.removeChild(lastChild);
				}
			}
		});
	});

	// Replace textareas with div elements to preserve formatting and allow html2canvas to render text wrap correctly
	const clonedTextareas = Array.from(clone.querySelectorAll("textarea"));
	clonedTextareas.forEach((clonedTextarea) => {
		const originalTextarea = originalInputs[clonedInputs.indexOf(clonedTextarea)] as HTMLTextAreaElement;

		const replacementDiv = document.createElement("div");
		replacementDiv.className = clonedTextarea.className;

		// Copy inline style attribute
		const styleAttr = clonedTextarea.getAttribute("style") || "";
		replacementDiv.setAttribute("style", styleAttr);

		// Apply styles so it resembles a textarea but wraps properly
		replacementDiv.style.whiteSpace = "pre-wrap";
		replacementDiv.style.wordBreak = "break-word";
		
		if (clonedTextarea.classList.contains("cell-textarea")) {
			replacementDiv.style.minHeight = "2rem";
		} else {
			replacementDiv.style.minHeight = "4.5rem"; // default for cols/rows
		}
		replacementDiv.style.display = "block";

		if (originalTextarea && originalTextarea.style.height) {
			replacementDiv.style.height = originalTextarea.style.height;
		} else {
			replacementDiv.style.height = "auto";
		}

		// Transfer text content preserving formatting (newlines)
		replacementDiv.innerText = clonedTextarea.value;

		// Replace in cloned DOM tree
		clonedTextarea.parentNode?.replaceChild(replacementDiv, clonedTextarea);
	});

	// Temporarily append clone to active DOM body so html2canvas can measure and capture it properly
	clone.style.position = "absolute";
	clone.style.left = "-99999px";
	clone.style.top = "0";
	clone.style.width = `${element.offsetWidth}px`;
	document.body.appendChild(clone);

	try {
		// Capture the ENTIRE cloned form in a single canvas
		const canvas = await html2canvas(clone, {
			scale: 2,
			useCORS: true,
			logging: false
		});

		// Now we calculate safe split boundaries using the layout in the DOM
		const containerRect = clone.getBoundingClientRect();
		
		// Unbreakable elements: input wrappers, tables, card titles
		const unbreakables = Array.from(clone.querySelectorAll(".input-group, .input-wrapper, .card-title, .table-responsive, .force-show-header"));
		const unbreakableRects = unbreakables.map(el => {
			const rect = el.getBoundingClientRect();
			return {
				top: rect.top - containerRect.top,
				bottom: rect.bottom - containerRect.top
			};
		});

		// Manual page breaks
		const manualBreaks = Array.from(clone.querySelectorAll(".page-break"));
		const manualBreakPoints = manualBreaks.map(el => {
			const rect = el.getBoundingClientRect();
			return rect.top - containerRect.top;
		});

		const finalWidth = pdfWidth - margin * 2;
		const pxToMm = finalWidth / element.offsetWidth; // Conversion ratio from CSS pixels to mm on A4
		const pageContentHeightPx = (pdfHeight - margin * 2) / pxToMm; // Max height of a page in CSS pixels

		let currentSliceStart = 0;
		const totalHeightPx = element.offsetHeight;
		const canvasScale = canvas.width / element.offsetWidth;

		while (currentSliceStart < totalHeightPx) {
			let targetSliceEnd = currentSliceStart + pageContentHeightPx;
			
			// Adjust if it's the last page
			if (targetSliceEnd > totalHeightPx) {
				targetSliceEnd = totalHeightPx;
			}

			let sliceEnd = targetSliceEnd;

			// 1. Honor manual page breaks first
			for (const breakPoint of manualBreakPoints) {
				if (breakPoint > currentSliceStart && breakPoint < sliceEnd) {
					sliceEnd = breakPoint;
					break; // Respect the first manual page break in this range
				}
			}

			// 2. Adjust sliceEnd so it doesn't split any unbreakable elements
			if (sliceEnd < totalHeightPx) {
				let adjusted = true;
				while (adjusted) {
					adjusted = false;
					for (const rect of unbreakableRects) {
						if (rect.top < sliceEnd && rect.bottom > sliceEnd) {
							sliceEnd = rect.top;
							adjusted = true;
							break; // Re-evaluate with the new sliceEnd
						}
					}
				}

				// Safety fallback: if an element is taller than a page, do not push sliceEnd back to start
				if (sliceEnd <= currentSliceStart) {
					sliceEnd = targetSliceEnd;
				}
			}

			// Crop the canvas for this slice
			const sliceHeightPx = sliceEnd - currentSliceStart;
			const tempCanvas = document.createElement("canvas");
			
			const srcX = 0;
			const srcY = currentSliceStart * canvasScale;
			const srcWidth = canvas.width;
			const srcHeight = sliceHeightPx * canvasScale;

			tempCanvas.width = srcWidth;
			tempCanvas.height = srcHeight;

			const ctx = tempCanvas.getContext("2d");
			if (ctx) {
				ctx.drawImage(
					canvas,
					srcX,
					srcY,
					srcWidth,
					srcHeight,
					0,
					0,
					srcWidth,
					srcHeight
				);
			}

			const sliceHeightMm = sliceHeightPx * pxToMm;
			const imgData = tempCanvas.toDataURL("image/png");

			if (currentSliceStart > 0) {
				pdf.addPage();
			}

			pdf.addImage(imgData, "PNG", margin, margin, finalWidth, sliceHeightMm);
			
			// Advance to next slice
			currentSliceStart = sliceEnd;
		}

		// Add page numbers at the bottom right of each page
		const totalPages = pdf.getNumberOfPages();
		for (let i = 1; i <= totalPages; i++) {
			pdf.setPage(i);
			pdf.setFontSize(9);
			pdf.setTextColor(120, 120, 120);
			pdf.text(
				`Page ${i} / ${totalPages}`,
				pdfWidth - margin - 20,
				pdfHeight - 6
			);
		}

	} finally {
		// Ensure cleanup of the cloned element from the DOM
		document.body.removeChild(clone);
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
