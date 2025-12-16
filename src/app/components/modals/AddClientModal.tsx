import { useState } from 'react';
import { Modal } from '../ui/modal';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import type { Customer } from '../../types';

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (client: Omit<Customer, 'id' | 'dateCreation'>) => void;
}

export function AddClientModal({ isOpen, onClose, onAdd }: AddClientModalProps) {
  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    telephone: '',
    email: '',
    adresse: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validatePhone = (phone: string): boolean => {
    // Quebec phone format: 514-123-4567 or 5141234567
    const phoneRegex = /^(\d{3}[-.\s]?\d{3}[-.\s]?\d{4}|\d{10})$/;
    return phoneRegex.test(phone);
  };

  const validateEmail = (email: string): boolean => {
    if (!email) return true; // Email is optional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Record<string, string> = {};
    
    if (!formData.prenom.trim()) {
      newErrors.prenom = 'Le prénom est requis';
    }
    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom est requis';
    }
    if (!formData.telephone.trim()) {
      newErrors.telephone = 'Le téléphone est requis';
    } else if (!validatePhone(formData.telephone)) {
      newErrors.telephone = 'Format de téléphone invalide (ex: 514-123-4567)';
    }
    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Create client
    const newClient: Omit<Customer, 'id' | 'dateCreation'> = {
      prenom: formData.prenom.trim(),
      nom: formData.nom.trim(),
      telephone: formData.telephone.trim(),
      email: formData.email.trim(),
      adresse: formData.adresse.trim() || undefined
    };

    onAdd(newClient);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      prenom: '',
      nom: '',
      telephone: '',
      email: '',
      adresse: ''
    });
    setErrors({});
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Ajouter un client" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Prénom */}
          <div>
            <Label htmlFor="prenom">Prénom *</Label>
            <Input
              id="prenom"
              value={formData.prenom}
              onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
              placeholder="Jean"
              className={errors.prenom ? 'border-red-500' : ''}
            />
            {errors.prenom && <p className="text-sm text-red-600 mt-1">{errors.prenom}</p>}
          </div>

          {/* Nom */}
          <div>
            <Label htmlFor="nom">Nom *</Label>
            <Input
              id="nom"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              placeholder="Tremblay"
              className={errors.nom ? 'border-red-500' : ''}
            />
            {errors.nom && <p className="text-sm text-red-600 mt-1">{errors.nom}</p>}
          </div>
        </div>

        {/* Téléphone */}
        <div>
          <Label htmlFor="telephone">Téléphone *</Label>
          <Input
            id="telephone"
            type="tel"
            value={formData.telephone}
            onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
            placeholder="514-123-4567"
            className={errors.telephone ? 'border-red-500' : ''}
          />
          {errors.telephone && <p className="text-sm text-red-600 mt-1">{errors.telephone}</p>}
        </div>

        {/* Email */}
        <div>
          <Label htmlFor="email">Email (optionnel)</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="jean.tremblay@email.com"
            className={errors.email ? 'border-red-500' : ''}
          />
          {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
        </div>

        {/* Adresse */}
        <div>
          <Label htmlFor="adresse">Adresse (optionnel)</Label>
          <Input
            id="adresse"
            value={formData.adresse}
            onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
            placeholder="123 Rue Principale, Montréal, QC"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button type="button" variant="outline" onClick={handleClose}>
            Annuler
          </Button>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
            Ajouter le client
          </Button>
        </div>
      </form>
    </Modal>
  );
}
