import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Badge } from './ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import type { RepairStatus } from '../types';

interface RepairStatusBadgeProps {
  status: RepairStatus;
  onChange?: (newStatus: RepairStatus) => void;
  editable?: boolean;
}

export function RepairStatusBadge({ status, onChange, editable = false }: RepairStatusBadgeProps) {
  const [currentStatus, setCurrentStatus] = useState(status);

  const statusConfig: Record<RepairStatus, { label: string; className: string }> = {
    reçue: { label: 'Reçue', className: 'bg-gray-100 text-gray-800 border-gray-300' },
    en_cours: { label: 'En cours', className: 'bg-orange-100 text-orange-800 border-orange-300' },
    en_attente_pieces: { label: 'En attente de pièces', className: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
    réparée: { label: 'Réparée', className: 'bg-blue-100 text-blue-800 border-blue-300' },
    payée_collectée: { label: 'Payée / Collectée', className: 'bg-green-100 text-green-800 border-green-300' },
    annulé: { label: 'Annulé', className: 'bg-red-100 text-red-800 border-red-300' },
  };

  const config = statusConfig[currentStatus] || { label: currentStatus || 'Inconnu', className: 'bg-gray-100 text-gray-800' };

  const handleStatusChange = (newStatus: RepairStatus) => {
    setCurrentStatus(newStatus);
    onChange?.(newStatus);
  };

  if (!editable) {
    return <Badge className={config.className}>{config.label}</Badge>;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md">
          <Badge className={`${config.className} cursor-pointer hover:opacity-80 flex items-center gap-1`}>
            {config.label}
            <ChevronDown className="w-3 h-3" />
          </Badge>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-56">
        {(Object.keys(statusConfig) as RepairStatus[]).map((statusKey) => (
          <DropdownMenuItem
            key={statusKey}
            onClick={() => handleStatusChange(statusKey)}
            className="cursor-pointer"
          >
            <Badge className={`${statusConfig[statusKey].className} w-full justify-center`}>
              {statusConfig[statusKey].label}
            </Badge>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
