/**
 * SimpleChart - Temporary replacement for recharts
 * Displays data in a simple table format until recharts compatibility is fixed
 */

type SimpleChartProps = {
	data: any[];
	dataKey?: string;
	xAxisKey?: string;
	title?: string;
	type?: 'line' | 'area' | 'bar' | 'pie';
};

export function SimpleChart({
	data,
	dataKey: _dataKey,
	xAxisKey = 'date',
	title,
	type: _type = 'line',
}: SimpleChartProps) {
	if (!data || data.length === 0) {
		return (
			<div className="py-12 text-center text-muted-foreground">
				<div className="mb-4 text-4xl">📊</div>
				<p>Нет данных для отображения</p>
			</div>
		);
	}

	// Get all numeric keys from data
	const numericKeys = Object.keys(data[0] || {}).filter(
		(key) => key !== xAxisKey && typeof data[0][key] === 'number'
	);

	return (
		<div className="w-full" data-testid="chart">
			{title && <h3 className="mb-4 font-semibold text-lg">{title}</h3>}

			<div className="overflow-x-auto">
				<table className="w-full border-collapse">
					<thead>
						<tr className="border-border border-b">
							<th className="p-2 text-left font-medium text-muted-foreground text-sm">
								{xAxisKey}
							</th>
							{numericKeys.map((key) => (
								<th className="p-2 text-right font-medium text-muted-foreground text-sm" key={key}>
									{key}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{data.map((row, index) => (
							<tr className="border-border border-b hover:bg-muted/50" key={index}>
								<td className="p-2 text-sm">{row[xAxisKey]}</td>
								{numericKeys.map((key) => (
									<td className="p-2 text-right font-mono text-sm" key={key}>
										{typeof row[key] === 'number' ? row[key].toLocaleString() : row[key]}
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>

			<div className="mt-4 rounded-lg bg-muted/30 p-4">
				<p className="text-muted-foreground text-xs">
					⚠️ Временное отображение данных в виде таблицы. Графики будут восстановлены после
					исправления совместимости recharts с Vite.
				</p>
			</div>
		</div>
	);
}
