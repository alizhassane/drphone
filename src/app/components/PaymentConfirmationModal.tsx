import { CheckCircle2, Printer, X } from 'lucide-react';
import { Button } from './ui/button';

interface PaymentConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionNumber: string;
  amount: number;
  paymentMethod: string;
  onPrint: () => void;
}

export function PaymentConfirmationModal({
  isOpen,
  onClose,
  transactionNumber,
  amount,
  paymentMethod,
  onPrint
}: PaymentConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">Paiement réussi!</h2>
          <p className="text-gray-500 mb-6">La transaction a été complétée avec succès</p>

          <div className="bg-gray-50 rounded-lg p-6 mb-6 space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Transaction</span>
              <span className="font-semibold text-gray-900">{transactionNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Montant</span>
              <span className="font-semibold text-gray-900">{amount.toFixed(2)} $</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Méthode</span>
              <span className="font-semibold text-gray-900">{paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date</span>
              <span className="font-semibold text-gray-900">
                {new Date().toLocaleDateString('fr-CA')}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Button
              onClick={onPrint}
              className="w-full gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Printer className="w-4 h-4" />
              Imprimer le reçu
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="w-full"
            >
              Fermer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
