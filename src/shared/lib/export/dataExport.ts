/**
 * Data Export Utilities
 *
 * Provides functions to export data to CSV, Excel, and PDF formats
 */

/**
 * Generic data type for export functions
 */
type ExportData = Record<string, string | number | boolean | null | undefined>;

/**
 * Convert data to CSV format
 */
export function exportToCSV(data: ExportData[], filename: string) {
	if (!data || data.length === 0) {
		console.warn('[Export] No data to export');
		return;
	}

	// Get headers from first object
	const headers = Object.keys(data[0]);

	// Create CSV content
	const csvContent = [
		headers.join(','), // Header row
		...data.map((row) =>
			headers
				.map((header) => {
					const value = row[header];
					// Escape commas and quotes
					if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
						return `"${value.replace(/"/g, '""')}"`;
					}
					return value ?? '';
				})
				.join(',')
		),
	].join('\n');

	// Create blob and download
	const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
	downloadBlob(blob, `${filename}.csv`);
}

/**
 * Convert data to Excel format (using CSV with .xlsx extension)
 * Note: This creates a CSV file with .xlsx extension for simplicity
 * For true Excel format, would need a library like xlsx
 */
export function exportToExcel(data: ExportData[], filename: string) {
	if (!data || data.length === 0) {
		console.warn('[Export] No data to export');
		return;
	}

	// For now, use CSV format with .xlsx extension
	// In production, consider using SheetJS (xlsx) library
	const headers = Object.keys(data[0]);

	const csvContent = [
		headers.join('\t'), // Tab-separated for Excel
		...data.map((row) =>
			headers
				.map((header) => {
					const value = row[header];
					if (typeof value === 'string' && (value.includes('\t') || value.includes('"'))) {
						return `"${value.replace(/"/g, '""')}"`;
					}
					return value ?? '';
				})
				.join('\t')
		),
	].join('\n');

	const blob = new Blob([csvContent], { type: 'application/vnd.ms-excel' });
	downloadBlob(blob, `${filename}.xls`);
}

/**
 * Convert data to PDF format
 * Note: This creates a simple text-based PDF
 * For advanced PDF features, consider using jsPDF library
 */
export function exportToPDF(data: ExportData[], filename: string, title?: string) {
	if (!data || data.length === 0) {
		console.warn('[Export] No data to export');
		return;
	}

	// Create simple HTML table
	const headers = Object.keys(data[0]);

	const htmlContent = `
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<title>${title || filename}</title>
	<style>
		body { font-family: Arial, sans-serif; margin: 20px; }
		h1 { color: #333; }
		table { border-collapse: collapse; width: 100%; margin-top: 20px; }
		th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
		th { background-color: #4CAF50; color: white; }
		tr:nth-child(even) { background-color: #f2f2f2; }
	</style>
</head>
<body>
	<h1>${title || filename}</h1>
	<table>
		<thead>
			<tr>
				${headers.map((h) => `<th>${h}</th>`).join('')}
			</tr>
		</thead>
		<tbody>
			${data
				.map(
					(row) => `
				<tr>
					${headers.map((h) => `<td>${row[h] ?? ''}</td>`).join('')}
				</tr>
			`
				)
				.join('')}
		</tbody>
	</table>
	<script>
		// Auto-print on load
		window.onload = function() {
			window.print();
		};
	</script>
</body>
</html>
	`;

	// Open in new window for printing
	const printWindow = window.open('', '_blank');
	if (printWindow) {
		printWindow.document.write(htmlContent);
		printWindow.document.close();
	}
}

/**
 * Helper function to download blob
 */
function downloadBlob(blob: Blob, filename: string) {
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}
