/**
 * SimpleChart - Temporary replacement for recharts
 * Displays data in a simple table format until recharts compatibility is fixed
 */

interface SimpleChartProps {
  data: any[];
  dataKey?: string;
  xAxisKey?: string;
  title?: string;
  type?: 'line' | 'area' | 'bar' | 'pie';
}

export function SimpleChart({ data, dataKey, xAxisKey = 'date', title, type = 'line' }: SimpleChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <div className="text-4xl mb-4">📊</div>
        <p>Нет данных для отображения</p>
      </div>
    );
  }

  // Get all numeric keys from data
  const numericKeys = Object.keys(data[0] || {}).filter(key => 
    key !== xAxisKey && typeof data[0][key] === 'number'
  );

  return (
    <div className="w-full" data-testid="chart">
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-2 text-sm font-medium text-muted-foreground">
                {xAxisKey}
              </th>
              {numericKeys.map(key => (
                <th key={key} className="text-right p-2 text-sm font-medium text-muted-foreground">
                  {key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index} className="border-b border-border hover:bg-muted/50">
                <td className="p-2 text-sm">{row[xAxisKey]}</td>
                {numericKeys.map(key => (
                  <td key={key} className="text-right p-2 text-sm font-mono">
                    {typeof row[key] === 'number' ? row[key].toLocaleString() : row[key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 p-4 bg-muted/30 rounded-lg">
        <p className="text-xs text-muted-foreground">
          ⚠️ Временное отображение данных в виде таблицы. Графики будут восстановлены после исправления совместимости recharts с Vite.
        </p>
      </div>
    </div>
  );
}

