import { Badge } from './ui/badge';
import type { PaymentStatus } from '../types';

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
}

export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  const statusConfig = {
    payé: { 
      label: 'Payé', 
      className: 'bg-green-100 text-green-800 border-green-200' 
    },
    partiel: { 
      label: 'Paiement partiel', 
      className: 'bg-orange-100 text-orange-800 border-orange-200' 
    },
    non_payé: { 
      label: 'Non payé', 
      className: 'bg-red-100 text-red-800 border-red-200' 
    },
  };

  const config = statusConfig[status];
  return <Badge className={config.className}>{config.label}</Badge>;
}
