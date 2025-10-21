import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';

/**
 * Тестовый компонент для проверки ErrorBoundary
 * ВРЕМЕННЫЙ - удалить после тестирования
 */
export function TestErrorComponent() {
  const [shouldThrow, setShouldThrow] = useState(false);

  if (shouldThrow) {
    // Намеренно выбрасываем ошибку для тестирования ErrorBoundary
    throw new Error('🧪 TEST ERROR: ErrorBoundary test - this is intentional!');
  }

  return (
    <Card className="border-orange-500 bg-orange-50 dark:bg-orange-950">
      <CardHeader>
        <CardTitle className="text-orange-700 dark:text-orange-300">
          🧪 ErrorBoundary Test
        </CardTitle>
        <CardDescription>
          Нажмите кнопку ниже чтобы намеренно вызвать ошибку и протестировать ErrorBoundary
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={() => setShouldThrow(true)}
          variant="destructive"
          className="w-full"
        >
          🔥 Вызвать тестовую ошибку
        </Button>
        <p className="mt-4 text-sm text-muted-foreground">
          После нажатия вы должны увидеть fallback UI ErrorBoundary, а ошибка должна отправиться в Sentry.
        </p>
      </CardContent>
    </Card>
  );
}

