import { useState } from 'react';
import { Modal } from '../ui/modal';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { AlertCircle } from 'lucide-react';

interface AddManualItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: { nom: string; prix: number; categorie: string }) => void;
}

const categories = ['Coques', 'Chargeurs', 'Câbles', 'Services', 'Accessoires', 'Batteries', 'Écrans', 'Autres'];

export function AddManualItemModal({ isOpen, onClose, onAdd }: AddManualItemModalProps) {
  const [formData, setFormData] = useState({
    nom: '',
    prix: '',
    categorie: categories[0]
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Record<string, string> = {};
    
    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom du produit/service est requis';
    }
    if (!formData.prix || parseFloat(formData.prix) <= 0) {
      newErrors.prix = 'Le prix doit être supérieur à 0';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Create manual item
    const newItem = {
      nom: formData.nom.trim(),
      prix: parseFloat(formData.prix),
      categorie: formData.categorie
    };

    onAdd(newItem);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      nom: '',
      prix: '',
      categorie: categories[0]
    });
    setErrors({});
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Produit / Service manuel" size="md">
      <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex gap-2">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800">
          <strong>Note:</strong> Cet article ne sera pas enregistré dans l'inventaire. Il s'applique uniquement à cette vente.
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nom du produit/service */}
        <div>
          <Label htmlFor="nom">Nom du produit / service *</Label>
          <Input
            id="nom"
            value={formData.nom}
            onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
            placeholder="Ex: Réparation express, Film protecteur, etc."
            className={errors.nom ? 'border-red-500' : ''}
          />
          {errors.nom && <p className="text-sm text-red-600 mt-1">{errors.nom}</p>}
        </div>

        {/* Prix */}
        <div>
          <Label htmlFor="prix">Prix ($) *</Label>
          <Input
            id="prix"
            type="number"
            step="0.01"
            min="0"
            value={formData.prix}
            onChange={(e) => setFormData({ ...formData, prix: e.target.value })}
            placeholder="0.00"
            className={errors.prix ? 'border-red-500' : ''}
          />
          {errors.prix && <p className="text-sm text-red-600 mt-1">{errors.prix}</p>}
        </div>

        {/* Catégorie */}
        <div>
          <Label htmlFor="categorie">Catégorie</Label>
          <select
            id="categorie"
            value={formData.categorie}
            onChange={(e) => setFormData({ ...formData, categorie: e.target.value })}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button type="button" variant="outline" onClick={handleClose}>
            Annuler
          </Button>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
            Ajouter au panier
          </Button>
        </div>
      </form>
    </Modal>
  );
}
