import { useState } from 'react';
import { Modal } from '../ui/modal';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { AlertCircle } from 'lucide-react';

interface EditPriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemName: string;
  currentPrice: number;
  originalPrice?: number;
  onSave: (newPrice: number) => void;
}

export function EditPriceModal({ 
  isOpen, 
  onClose, 
  itemName, 
  currentPrice, 
  originalPrice,
  onSave 
}: EditPriceModalProps) {
  const [price, setPrice] = useState(currentPrice.toString());
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newPrice = parseFloat(price);
    
    if (!price || newPrice <= 0) {
      setError('Le prix doit être supérieur à 0');
      return;
    }

    onSave(newPrice);
    handleClose();
  };

  const handleClose = () => {
    setPrice(currentPrice.toString());
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Modifier le prix" size="sm">
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">Article:</p>
        <p className="font-medium text-gray-900">{itemName}</p>
      </div>

      {originalPrice && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Prix original:</strong> {originalPrice.toFixed(2)} $
          </p>
        </div>
      )}

      <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex gap-2">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800">
          <strong>Note:</strong> La modification du prix s'applique uniquement à cette vente. Le prix en inventaire ne sera pas modifié.
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="price">Nouveau prix ($) *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.00"
            className={error ? 'border-red-500' : ''}
            autoFocus
          />
          {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button type="button" variant="outline" onClick={handleClose}>
            Annuler
          </Button>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
            Confirmer
          </Button>
        </div>
      </form>
    </Modal>
  );
}
