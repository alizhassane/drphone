import { useState, useEffect } from 'react';
import { Modal } from '../ui/modal';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card } from '../ui/card';
import type { Product } from '../../types';
import { getProductBySku } from '../../../services/productService';
import * as inventoryService from '../../../services/inventoryService';
import type { DeviceCategoryData } from '../../../services/inventoryService';
import { ChevronRight, Box, Smartphone, ShieldCheck, Tag } from 'lucide-react';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (product: Omit<Product, 'id'>) => void;
  onEdit?: (id: string, product: Omit<Product, 'id'>) => void;
  productToEdit?: Product | null;
}

// Legacy constants for Accessories
const ACCESSORY_CATEGORIES = ['Coques', 'Chargeurs', 'Câbles', 'Écouteurs', 'Protection écran', 'Autres'];

const QUALITY_OPTIONS: Record<string, string[]> = {
  'Écran': ['TFT', 'OLED', 'Hard OLED', 'Soft OLED', 'OEM', 'Refurbished', 'Original'],
  'Batterie': ['Standard', 'Premium', 'Original', 'Haute Capacité'],
  'default': ['Standard', 'Premium', 'Original']
};

export function AddProductModal({ isOpen, onClose, onAdd, onEdit, productToEdit }: AddProductModalProps) {
  // Common State
  const [section, setSection] = useState<'Accessoires' | 'Pièces'>('Accessoires');

  // Dynamic Hierarchy State
  const [hierarchy, setHierarchy] = useState<DeviceCategoryData[]>([]);

  // Selection State for Parts
  const [selectedDeviceType, setSelectedDeviceType] = useState<string>('');
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [selectedPart, setSelectedPart] = useState<string>('');
  const [selectedQuality, setSelectedQuality] = useState<string>('');

  // Form State
  const [formData, setFormData] = useState({
    nom: '',
    categorie: '', // For parts, this comes from selectedPart
    codeBarres: '',
    prixAchat: '',
    prixVente: '',
    quantite: '',
    alerteStock: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isExisting, setIsExisting] = useState(false);
  const [loadingSku, setLoadingSku] = useState(false);

  useEffect(() => {
    loadHierarchy();
  }, []);

  const loadHierarchy = async () => {
    try {
      const data = await inventoryService.getHierarchy();
      setHierarchy(data);
    } catch (e) {
      console.error("Failed to load hierarchy in modal", e);
    }
  };

  useEffect(() => {
    if (productToEdit) {
      setSection(productToEdit.section || 'Accessoires');
      setFormData({
        nom: productToEdit.nom,
        categorie: productToEdit.categorie,
        codeBarres: productToEdit.codeBarres || '',
        prixAchat: productToEdit.prixAchat.toString(),
        prixVente: productToEdit.prixVente.toString(),
        quantite: productToEdit.quantite.toString(),
        alerteStock: (productToEdit.alerteStock || '').toString()
      });
      setIsExisting(false);
    } else {
      resetForm();
    }
  }, [productToEdit, isOpen]);

  // Effect to auto-generate name for Parts
  useEffect(() => {
    if (section === 'Pièces' && !productToEdit) {
      const deviceTypeObj = hierarchy.find(d => d.id === selectedDeviceType);
      const brandObj = deviceTypeObj?.brands.find(b => b.id === selectedBrand);

      if (brandObj && selectedModel && selectedPart) {
        let generatedName = `${brandObj.name} ${selectedModel} - ${selectedPart}`;
        if (selectedQuality) {
          generatedName += ` (${selectedQuality})`;
        }
        setFormData(prev => ({ ...prev, nom: generatedName, categorie: selectedPart }));
      }
    }
  }, [section, selectedDeviceType, selectedBrand, selectedModel, selectedPart, selectedQuality, productToEdit, hierarchy]);

  const resetForm = () => {
    setSection('Accessoires');
    setSelectedDeviceType('');
    setSelectedBrand('');
    setSelectedModel('');
    setSelectedPart('');
    setSelectedQuality('');
    setExistingId(null);
    setExistingQuantity(0);
    setFormData({
      nom: '',
      categorie: ACCESSORY_CATEGORIES[0],
      codeBarres: '',
      prixAchat: '',
      prixVente: '',
      quantite: '',
      alerteStock: ''
    });
    setErrors({});
    setIsExisting(false);
  };

  const [existingId, setExistingId] = useState<string | null>(null);
  const [existingQuantity, setExistingQuantity] = useState<number>(0);

  const handleBarcodeBlur = async () => {
    if (productToEdit || !formData.codeBarres.trim()) return;

    setLoadingSku(true);
    try {
      const existingProduct = await getProductBySku(formData.codeBarres.trim());
      if (existingProduct) {
        setIsExisting(true);
        setExistingId(existingProduct.id);
        setExistingQuantity(existingProduct.quantite);
        setSection(existingProduct.section || 'Accessoires');
        setFormData(prev => ({
          ...prev,
          nom: existingProduct.nom,
          categorie: existingProduct.categorie,
          prixAchat: existingProduct.prixAchat.toString(),
          prixVente: existingProduct.prixVente.toString(),
          alerteStock: (existingProduct.alerteStock || 5).toString(),
          quantite: ''
        }));
        setErrors({});
      } else {
        setIsExisting(false);
        setExistingId(null);
        setExistingQuantity(0);
      }
    } catch (err) {
      console.error("Error checking SKU", err);
    } finally {
      setLoadingSku(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    if (!formData.nom.trim()) newErrors.nom = 'Le nom du produit est requis';
    if (!formData.prixAchat || parseFloat(formData.prixAchat) < 0) newErrors.prixAchat = 'Prix invalide';
    if (!formData.prixVente || parseFloat(formData.prixVente) < 0) newErrors.prixVente = 'Prix invalide';
    if (!formData.quantite || parseInt(formData.quantite) < 0) newErrors.quantite = 'Quantité invalide';

    // Validate hierarchy if in Parts mode
    if (section === 'Pièces' && !isExisting && !productToEdit) {
      if (!selectedDeviceType) newErrors.device = 'Type requis';
      if (!selectedBrand) newErrors.brand = 'Marque requise';
      if (!selectedModel) newErrors.model = 'Modèle requis';
      if (!selectedPart) newErrors.part = 'Pièce requise';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const inputQuantity = parseInt(formData.quantite);

    // If existing, we add to current stock
    const finalQuantity = isExisting ? existingQuantity + inputQuantity : inputQuantity;

    const productData: Omit<Product, 'id'> = {
      nom: formData.nom.trim(),
      categorie: formData.categorie,
      section: section,
      quality: section === 'Pièces' ? selectedQuality : undefined,
      codeBarres: formData.codeBarres.trim(),
      prixAchat: parseFloat(formData.prixAchat),
      prixVente: parseFloat(formData.prixVente),
      quantite: finalQuantity,
      alerteStock: parseInt(formData.alerteStock || '5')
    };

    if (productToEdit && onEdit) {
      onEdit(productToEdit.id, productData);
    } else if (isExisting && existingId && onEdit) {
      // Use onEdit to update the existing product with new stock
      onEdit(existingId, productData);
    } else {
      onAdd(productData);
    }
    handleClose();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Helpers
  const getBrands = () => {
    const type = hierarchy.find(t => t.id === selectedDeviceType);
    return type ? type.brands : [];
  };

  const getModels = () => {
    const type = hierarchy.find(t => t.id === selectedDeviceType);
    if (!type) return [];
    const brand = type.brands.find(b => b.id === selectedBrand);
    return brand ? brand.models : [];
  };

  const getParts = () => {
    const type = hierarchy.find(t => t.id === selectedDeviceType);
    // Backend service added default parts list to response
    return type ? type.parts : [];
  };

  const getQualities = () => {
    const partKey = selectedPart as keyof typeof QUALITY_OPTIONS;
    if (QUALITY_OPTIONS[partKey]) {
      return QUALITY_OPTIONS[partKey];
    }
    return QUALITY_OPTIONS['default'];
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={productToEdit ? "Modifier le produit" : "Ajouter un produit"} size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {isExisting && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r">
            <p className="text-sm text-blue-700 font-medium">Produit existant trouvé. Vous ajoutez du stock.</p>
          </div>
        )}

        {/* Section Selector */}
        {!productToEdit && !isExisting && (
          <div className="flex gap-4 border-b border-gray-100 pb-4">
            <button
              type="button"
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 transition-all duration-200 ${section === 'Accessoires'
                ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold'
                : 'border-transparent bg-gray-50 text-gray-500 hover:bg-gray-100'
                }`}
              onClick={() => setSection('Accessoires')}
            >
              <Tag className="w-5 h-5" />
              Accessoires
            </button>
            <button
              type="button"
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 transition-all duration-200 ${section === 'Pièces'
                ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold'
                : 'border-transparent bg-gray-50 text-gray-500 hover:bg-gray-100'
                }`}
              onClick={() => setSection('Pièces')}
            >
              <Smartphone className="w-5 h-5" />
              Pièces
            </button>
          </div>
        )}

        {/* ACCESSORY CONFIGURATION */}
        {section === 'Accessoires' && !isExisting && !productToEdit && (
          <div className="space-y-4 animate-in fade-in zoom-in duration-300">
            <div className="space-y-2">
              <Label className="text-gray-700">Type d'accessoire</Label>
              <Select value={formData.categorie} onValueChange={(val) => setFormData({ ...formData, categorie: val })}>
                <SelectTrigger className="w-full bg-gray-50 border-gray-200 h-11">
                  <SelectValue placeholder="Sélectionner le type" />
                </SelectTrigger>
                <SelectContent>
                  {ACCESSORY_CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* PART CONFIGURATION WIZARD */}
        {section === 'Pièces' && !isExisting && !productToEdit && (
          <Card className="p-5 border-blue-100 bg-slate-50/50 shadow-none animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">1</div>
              Configuration de la pièce
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 1. Device Type */}
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Type</Label>
                <Select value={selectedDeviceType} onValueChange={(val) => {
                  setSelectedDeviceType(val);
                  setSelectedBrand('');
                  setSelectedModel('');
                  setSelectedPart('');
                }}>
                  <SelectTrigger className="bg-white border-gray-200">
                    <SelectValue placeholder="Choisir..." />
                  </SelectTrigger>
                  <SelectContent>
                    {hierarchy.map(d => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 2. Brand */}
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Marque</Label>
                <Select value={selectedBrand} onValueChange={(val) => {
                  setSelectedBrand(val);
                  setSelectedModel('');
                }} disabled={!selectedDeviceType}>
                  <SelectTrigger className="bg-white border-gray-200">
                    <SelectValue placeholder="Choisir..." />
                  </SelectTrigger>
                  <SelectContent>
                    {getBrands().sort((a, b) => a.name.localeCompare(b.name)).map(b => (
                      <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 3. Model */}
              <div className="md:col-span-2 space-y-1.5">
                <Label className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Modèle</Label>
                <Select value={selectedModel} onValueChange={setSelectedModel} disabled={!selectedBrand}>
                  <SelectTrigger className="bg-white border-gray-200">
                    <SelectValue placeholder="Sélectionner le modèle" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {getModels().sort((a, b) => b.localeCompare(a, undefined, { numeric: true })).map(m => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 4. Part Type - NOW DYNAMIC BASED ON DEVICE TYPE */}
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Pièce</Label>
                <Select value={selectedPart} onValueChange={(val) => {
                  setSelectedPart(val);
                  setSelectedQuality('');
                }} disabled={!selectedModel}>
                  <SelectTrigger className="bg-white border-gray-200">
                    <SelectValue placeholder="Choisir..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {getParts().map(p => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 5. Quality */}
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Qualité</Label>
                <Select value={selectedQuality} onValueChange={setSelectedQuality} disabled={!selectedPart}>
                  <SelectTrigger className="bg-white border-gray-200">
                    <SelectValue placeholder="Choisir..." />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedPart && getQualities().map((q: string) => (
                      <SelectItem key={q} value={q}>{q}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        )}

        {/* MAIN PRODUCT INFO */}
        <div className="space-y-4">
          {/* Code Barres always visible */}
          <div className="space-y-2">
            <Label htmlFor="codeBarres">Code-barres / SKU</Label>
            <div className="relative">
              <Input
                id="codeBarres"
                value={formData.codeBarres}
                onChange={(e) => setFormData({ ...formData, codeBarres: e.target.value })}
                onBlur={handleBarcodeBlur}
                placeholder="Scanner ou saisir le code..."
                disabled={!!productToEdit}
                className={`h-11 ${errors.codeBarres ? 'border-red-500' : ''}`}
              />
              {loadingSku && <span className="absolute right-3 top-3.5 text-xs text-gray-500 font-medium">Verification...</span>}
            </div>
            {errors.codeBarres && <p className="text-sm text-red-600 mt-1">{errors.codeBarres}</p>}
          </div>

          {/* Name Field (Auto-generated but editable) */}
          <div className="space-y-2">
            <Label htmlFor="nom">Nom du produit *</Label>
            <Input
              id="nom"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              className={`h-11 font-medium ${errors.nom ? 'border-red-500' : ''}`}
              disabled={isExisting}
              placeholder="Nom du produit"
            />
            {errors.nom && <p className="text-sm text-red-600 mt-1">{errors.nom}</p>}
          </div>

          {/* Pricing Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prixAchat">Prix d'achat ($) *</Label>
              <Input
                id="prixAchat"
                type="number"
                step="0.01"
                min="0"
                value={formData.prixAchat}
                onChange={(e) => setFormData({ ...formData, prixAchat: e.target.value })}
                className={`h-11 ${errors.prixAchat ? 'border-red-500' : ''}`}
                disabled={isExisting}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prixVente">Prix de vente ($) *</Label>
              <Input
                id="prixVente"
                type="number"
                step="0.01"
                min="0"
                value={formData.prixVente}
                onChange={(e) => setFormData({ ...formData, prixVente: e.target.value })}
                className={`h-11 ${errors.prixVente ? 'border-red-500' : ''}`}
                disabled={isExisting}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Quantity Alert Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className={`space-y-2 p-3 rounded-lg border ${isExisting ? 'bg-green-50 border-green-200' : 'border-transparent'}`}>
              <Label htmlFor="quantite" className={isExisting ? 'text-green-700 font-bold' : ''}>
                {isExisting ? 'Quantité à ajouter *' : 'Stock Initial *'}
              </Label>
              <Input
                id="quantite"
                type="number"
                min="0"
                value={formData.quantite}
                onChange={(e) => setFormData({ ...formData, quantite: e.target.value })}
                className={`h-11 ${errors.quantite ? 'border-red-500' : (isExisting ? 'border-green-500 focus-visible:ring-green-500' : '')}`}
                autoFocus={isExisting}
                placeholder="0"
              />
            </div>
            <div className="space-y-2 pt-3">
              <Label htmlFor="alerteStock">Alerte stock min</Label>
              <Input
                id="alerteStock"
                type="number"
                min="0"
                value={formData.alerteStock}
                onChange={(e) => setFormData({ ...formData, alerteStock: e.target.value })}
                className="h-11"
                disabled={isExisting}
                placeholder="5"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 mt-6">
          <Button type="button" variant="outline" onClick={handleClose} className="h-11 px-6">
            Annuler
          </Button>
          <Button type="submit" className="h-11 px-8 bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all">
            {productToEdit ? "Enregistrer" : (isExisting ? "Ajouter Stock" : "Créer le produit")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
