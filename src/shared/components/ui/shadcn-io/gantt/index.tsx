import React from 'react';
import { cn } from '../../utils';

interface GanttProps {
  className?: string;
}

export const Gantt: React.FC<GanttProps> = ({ className }) => {
  return (
    <div className={cn('p-4 bg-muted rounded-lg', className)}>
      <div className="text-sm text-muted-foreground mb-2">Расписание задач</div>
      <div className="space-y-2">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="w-20 text-xs text-muted-foreground">Задача {i + 1}</div>
            <div className="flex-1 bg-muted rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: `${20 + i * 15}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
