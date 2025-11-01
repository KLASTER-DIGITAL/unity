import { Database, HardDrive, Monitor, Server } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';

interface SystemStatus {
	database: 'online' | 'offline' | 'checking';
	api: 'online' | 'offline' | 'checking';
	storage: 'online' | 'offline' | 'checking';
}

interface StatusCardProps {
	systemStatus: SystemStatus;
}

export function StatusCard({ systemStatus }: StatusCardProps) {
	const getStatusBadge = (status: 'online' | 'offline' | 'checking') => {
		switch (status) {
			case 'online':
				return <Badge className="bg-green-500">Online</Badge>;
			case 'offline':
				return <Badge className="bg-red-500">Offline</Badge>;
			case 'checking':
				return <Badge className="bg-yellow-500">Checking...</Badge>;
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Monitor className="h-5 w-5" />
					Статус системы
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Database className="h-4 w-4 text-muted-foreground" />
						<span>База данных</span>
					</div>
					{getStatusBadge(systemStatus.database)}
				</div>

				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Server className="h-4 w-4 text-muted-foreground" />
						<span>API</span>
					</div>
					{getStatusBadge(systemStatus.api)}
				</div>

				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<HardDrive className="h-4 w-4 text-muted-foreground" />
						<span>Storage</span>
					</div>
					{getStatusBadge(systemStatus.storage)}
				</div>
			</CardContent>
		</Card>
	);
}
