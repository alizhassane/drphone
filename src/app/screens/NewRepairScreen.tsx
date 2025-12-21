import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, X, Package, Check, RefreshCw, ChevronsUpDown, FileText } from 'lucide-react';
import { cn } from '../components/ui/utils';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../components/ui/popover';
import { AddClientModal } from '../components/modals/AddClientModal';
import type { Screen, Customer, Repair, RepairStatus, Product } from '../types';
import * as clientService from '../../services/clientService';
import * as repairService from '../../services/repairService';
import * as inventoryService from '../../services/inventoryService';
import type { DeviceCategoryData } from '../../services/inventoryService';
import { getProducts } from '../../services/productService';
// import { INVENTORY_HIERARCHY } from '../data/inventoryHierarchy'; // REMOVED
import { printRepairLabel } from '../utils/printRepairLabel';
import { ConfirmationModal } from '../components/modals/ConfirmationModal';
import { PrintOptionsModal } from '../components/modals/PrintOptionsModal';
import { printRepairReceipt } from '../utils/printRepairReceipt';

interface NewRepairScreenProps {
  onNavigate: (screen: Screen) => void;
  customers?: Customer[];
}

interface SelectedPart {
  id?: string; // Optional for manual parts
  name: string;
  price: number;
  isManual: boolean;
}

export function NewRepairScreen({ onNavigate }: NewRepairScreenProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');

  // Hierarchical Selection State
  const [hierarchy, setHierarchy] = useState<DeviceCategoryData[]>([]);
  const [selectedDeviceType, setSelectedDeviceType] = useState<string>('');
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');

  const [repairType, setRepairType] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [price, setPrice] = useState('');
  const [deposit, setDeposit] = useState('');
  const [warranty, setWarranty] = useState('90');
  const [status, setStatus] = useState<RepairStatus>('reçue');

  // Part Selection State
  const [selectedParts, setSelectedParts] = useState<SelectedPart[]>([]);
  const [availableParts, setAvailableParts] = useState<Product[]>([]);
  const [isLoadingParts, setIsLoadingParts] = useState(false);
  const [manualPart, setManualPart] = useState(''); // Fallback for manual entry




  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [openClientCombobox, setOpenClientCombobox] = useState(false);

  // Printing Modal State
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [repairToPrint, setRepairToPrint] = useState<Repair | null>(null);

  useEffect(() => {
    loadCustomers();
    loadHierarchy();
  }, []);

  const loadHierarchy = async () => {
    try {
      const data = await inventoryService.getHierarchy();
      setHierarchy(data);
    } catch (error) {
      console.error("Failed to load inventory hierarchy", error);
    }
  };

  // Auto-fetch parts when model changes
  useEffect(() => {
    const fetchParts = async () => {
      if (!selectedModel) {
        setAvailableParts([]);
        return;
      }
      setIsLoadingParts(true);
      try {
        // Search for parts matching the model name (e.g. "iPhone 13")
        const results = await getProducts(selectedModel);
        // Filter to include only items in "Pièces" section or categorized as parts
        // This relies on the 'section' field being populated correctly in inventory
        const parts = results.filter(p => p.section === 'Pièces' || p.categorie === 'Pièces');
        setAvailableParts(parts);
      } catch (err) {
        console.error("Failed to load parts for model", err);
      } finally {
        setIsLoadingParts(false);
      }
    };

    fetchParts();
  }, [selectedModel]);

  const loadCustomers = async () => {
    try {
      const data = await clientService.getClients();
      setCustomers(data);
    } catch (error) {
      console.error('Failed to load customers', error);
    }
  };

  const handleSelectPart = (productId: string) => {
    const product = availableParts.find(p => p.id === productId);
    if (!product) return;

    const partName = `${product.nom} (${product.quality || 'Standard'})`;

    const newPart: SelectedPart = {
      id: product.id,
      name: partName,
      price: product.prixVente,
      isManual: false
    };

    // Add to list
    setSelectedParts([...selectedParts, newPart]);

    // Update Price (Add selling price of part)
    const currentPrice = parseFloat(price) || 0;
    const newPrice = currentPrice + product.prixVente;
    setPrice(newPrice.toFixed(2));
  };

  const handleAddManualPart = () => {
    if (manualPart.trim()) {
      const newPart: SelectedPart = {
        name: manualPart.trim(),
        price: 0, // Manual parts don't autoset price currently
        isManual: true
      };
      setSelectedParts([...selectedParts, newPart]);
      setManualPart('');
    }
  };

  const handleRemovePart = (index: number) => {
    // Note: Removing a part does NOT automatically reduce price because we don't know if the user manually adjusted it.
    setSelectedParts(selectedParts.filter((_, i) => i !== index));
  };

  const handleCreateClient = async (newClient: Omit<Customer, 'id' | 'dateCreation'>) => {
    try {
      const created = await clientService.createClient(newClient);
      setCustomers([...customers, created]);
      setSelectedCustomer(created.id);
      setIsClientModalOpen(false);
    } catch (error) {
      console.error('Failed to create client', error);
      alert('Erreur lors de la création du client');
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCustomer || !selectedBrand || !selectedModel || !repairType || !price) {
      alert('Veuillez remplir les champs obligatoires');
      return;
    }

    // Construct the phone model string from hierarchy
    const brandName = hierarchy
      .find(t => t.id === selectedDeviceType)?.brands
      .find(b => b.id === selectedBrand)?.name || selectedBrand;

    // Format: "Brand - Model"
    const finalPhoneModel = `${brandName} ${selectedModel}`;

    const client = customers.find(c => c.id === selectedCustomer);
    const clientName = client ? `${client.prenom} ${client.nom}` : 'Inconnu';
    const piecesNames = selectedParts.map(p => p.name);

    try {
      const repairData: any = {
        numeroTicket: `REP-${Date.now().toString().slice(-6)}`,
        clientId: selectedCustomer,
        clientNom: clientName,
        modelePhone: finalPhoneModel,
        typeReparation: repairType,
        description: description,
        remarque: notes,
        statut: status,
        prix: parseFloat(price),
        depot: deposit ? parseFloat(deposit) : 0,
        piecesUtilisees: piecesNames,
        parts: selectedParts.filter(p => !p.isManual).map(p => p.id), // NEW: Info for backend inventory tracking
        garantie: parseInt(warranty),
        dateCreation: new Date().toISOString(),
        device_details: JSON.stringify({
          brand: brandName,
          model: selectedModel
        })
      };

      const newRepair = await repairService.createRepair(repairData);

      // Open print modal instead of browser confirm
      // Use local data for print object to ensure client name and pieces are correct
      const printableRepair = {
        ...newRepair,
        clientNom: clientName,
        clientTelephone: client?.telephone,
        piecesUtilisees: piecesNames,
        modelePhone: finalPhoneModel,
        remarque: notes // Add remarque for printing
      };

      setRepairToPrint(printableRepair);
      setIsPrintModalOpen(true);

      // Navigation happens after modal interaction (or users can navigate back manually if they cancel)
      // but to keep flow smooth, we might delay navigation? 
      // Actually, standard flow: create -> prompt -> (print or not) -> navigate list
      // But if we navigate list immediately, the modal might unmount if it's part of this screen? 
      // Yes. So we must NOT navigate yet.
      // We will handle navigation in the modal callbacks.

    } catch (error) {
      console.error('Failed to create repair', error);
      alert('Erreur lors de la création de la réparation: ' + (error as any).message);
    }
  };



  const handlePrintLabel = () => {
    if (repairToPrint) {
      printRepairLabel(repairToPrint);
    }
  };

  const handlePrintReceipt = () => {
    if (repairToPrint) {
      printRepairReceipt(repairToPrint);
    }
  };

  const handlePrintClose = () => {
    setIsPrintModalOpen(false);
    onNavigate('repairs');
  };

  // Helpers for Hierarchy
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onNavigate('repairs')}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Nouvelle réparation</h2>
          <p className="text-gray-500">Créer un nouveau ticket de réparation</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Informations du client</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="customer">Client *</Label>
                  <Popover open={openClientCombobox} onOpenChange={setOpenClientCombobox}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openClientCombobox}
                        className="w-full justify-between mt-1 bg-white font-normal"
                      >
                        {selectedCustomer
                          ? (() => {
                            const c = customers.find((customer) => customer.id === selectedCustomer);
                            return c ? `${c.prenom} ${c.nom} - ${c.telephone}` : "Sélectionner un client";
                          })()
                          : "Sélectionner ou rechercher un client..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Rechercher par nom ou téléphone..." />
                        <CommandList>
                          <CommandEmpty>Aucun client trouvé.</CommandEmpty>
                          <CommandGroup>
                            {customers.map((customer) => (
                              <CommandItem
                                key={customer.id}
                                value={`${customer.prenom} ${customer.nom} ${customer.telephone}`}
                                onSelect={() => {
                                  setSelectedCustomer(customer.id === selectedCustomer ? "" : customer.id);
                                  setOpenClientCombobox(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedCustomer === customer.id ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {customer.prenom} {customer.nom} ({customer.telephone})
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => setIsClientModalOpen(true)}
                >
                  <Plus className="w-4 h-4" />
                  Nouveau client
                </Button>
              </div>
            </Card>

            {/* Device Information (Hierarchical) */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Informations de l'appareil</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Type */}
                <div>
                  <Label>Type d'appareil</Label>
                  <Select value={selectedDeviceType} onValueChange={(val) => {
                    setSelectedDeviceType(val);
                    setSelectedBrand('');
                    setSelectedModel('');
                  }}>
                    <SelectTrigger className="mt-1 bg-white">
                      <SelectValue placeholder="Choisir..." />
                    </SelectTrigger>
                    <SelectContent>
                      {hierarchy.map(d => (
                        <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Brand */}
                <div>
                  <Label>Marque</Label>
                  <Select value={selectedBrand} onValueChange={(val) => {
                    setSelectedBrand(val);
                    setSelectedModel('');
                  }} disabled={!selectedDeviceType}>
                    <SelectTrigger className="mt-1 bg-white">
                      <SelectValue placeholder="Choisir..." />
                    </SelectTrigger>
                    <SelectContent>
                      {getBrands().sort((a, b) => a.name.localeCompare(b.name)).map(b => (
                        <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Model */}
                <div className="md:col-span-2">
                  <Label>Modèle</Label>
                  <Select value={selectedModel} onValueChange={setSelectedModel} disabled={!selectedBrand}>
                    <SelectTrigger className="mt-1 bg-white">
                      <SelectValue placeholder="Sélectionner le modèle" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px]">
                      {getModels().sort((a, b) => b.localeCompare(a, undefined, { numeric: true })).map(m => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4 mt-4 border-t pt-4 border-gray-100">
                <div>
                  <Label htmlFor="repairType">Type de réparation *</Label>
                  <Select value={repairType} onValueChange={setRepairType}>
                    <SelectTrigger className="mt-1 bg-white">
                      <SelectValue placeholder="Sélectionner le type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="screen">Remplacement écran</SelectItem>
                      <SelectItem value="battery">Remplacement batterie</SelectItem>
                      <SelectItem value="charging">Réparation port de charge</SelectItem>
                      <SelectItem value="camera">Réparation caméra</SelectItem>
                      <SelectItem value="speaker">Réparation haut-parleur</SelectItem>
                      <SelectItem value="water">Dégât d'eau</SelectItem>
                      <SelectItem value="other">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="description">Description du problème</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Décrivez le problème et l'état de l'appareil..."
                    rows={4}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="notes" className="flex items-center gap-2 text-gray-700">
                    <FileText className="w-4 h-4 text-amber-500" />
                    Remarque (Interne)
                  </Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Notes visible uniquement par l'équipe..."
                    rows={2}
                    className="mt-1.5 border-amber-200 focus:border-amber-400 focus:ring-amber-400 bg-amber-50/30"
                  />
                </div>
              </div>
            </Card>

            {/* Parts Used (With Inventory LIST Integration) */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Pièces utilisées</h3>
              <div className="space-y-4">

                {/* Automatic List Selection */}
                <div className="space-y-2">
                  <Label className="text-gray-700">Sélectionner une pièce (Inventaire)</Label>
                  <div className="flex gap-2">
                    <Select onValueChange={handleSelectPart} disabled={!selectedModel || isLoadingParts}>
                      <SelectTrigger className="bg-white border-gray-200 flex-1">
                        <SelectValue placeholder={
                          !selectedModel ? "Sélectionnez un modèle d'abord" :
                            isLoadingParts ? "Chargement des pièces..." :
                              availableParts.length === 0 ? "Aucune pièce trouvée pour ce modèle" :
                                "Choisir une pièce..."
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {availableParts.map(part => {
                          const isOutOfStock = part.quantite <= 0;
                          return (
                            <SelectItem key={part.id} value={part.id} disabled={false}>
                              <div className="flex justify-between w-full min-w-[300px] items-center">
                                <span className={isOutOfStock ? "text-red-500 font-medium" : ""}>
                                  {part.nom} ({part.quality || 'Std'}) {isOutOfStock && "(Stock épuisé)"}
                                </span>
                                <span className="font-semibold text-green-600 ml-2">${part.prixVente}</span>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    {isLoadingParts && <RefreshCw className="w-4 h-4 animate-spin text-gray-400 self-center" />}
                  </div>
                </div>

                {/* Manual Fallback */}
                <div className="relative pt-2 border-t border-dashed border-gray-200 mt-2">
                  <Label className="text-xs text-gray-500 mb-1 block">Ou ajouter manuellement (Hors inventaire)</Label>
                  <div className="flex gap-2">
                    <Input
                      value={manualPart}
                      onChange={(e) => setManualPart(e.target.value)}
                      placeholder="Nom de la pièce..."
                      className="bg-gray-50"
                    />
                    <Button type="button" onClick={handleAddManualPart} variant="outline" className="gap-2">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {selectedParts.length > 0 && (
                  <div className="space-y-2 pt-2">
                    {selectedParts.map((part, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200"
                      >
                        <div className="flex items-center gap-3">
                          <Package className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-gray-900">{part.name}</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemovePart(index)}
                          className="h-6 w-6 p-0 hover:bg-blue-100 text-blue-600"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Prix et paiement</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="price">Prix de la réparation *</Label>
                  <div className="relative mt-1">
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0.00"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Le prix se met à jour automatiquement lors de l'ajout de pièces.</p>
                </div>
                <div>
                  <Label htmlFor="deposit">Dépôt</Label>
                  <div className="relative mt-1">
                    <Input
                      id="deposit"
                      type="number"
                      step="0.01"
                      value={deposit}
                      onChange={(e) => setDeposit(e.target.value)}
                      placeholder="0.00"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Warranty & Status */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Garantie et statut</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="warranty">Durée de la garantie (jours)</Label>
                  <Select value={warranty} onValueChange={setWarranty}>
                    <SelectTrigger className="mt-1 bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 jours</SelectItem>
                      <SelectItem value="60">60 jours</SelectItem>
                      <SelectItem value="90">90 jours</SelectItem>
                      <SelectItem value="180">6 mois</SelectItem>
                      <SelectItem value="365">1 an</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Statut *</Label>
                  <Select value={status} onValueChange={(v) => setStatus(v as RepairStatus)}>
                    <SelectTrigger className="mt-1 bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reçue">Reçue</SelectItem>
                      <SelectItem value="en_cours">En cours</SelectItem>
                      <SelectItem value="en_attente_pieces">En attente de pièces</SelectItem>
                      <SelectItem value="réparée">Réparée</SelectItem>
                      <SelectItem value="payée_collectée">Collectée</SelectItem>
                      <SelectItem value="annulé">Annulé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            {/* Actions */}
            <div className="space-y-2">
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                Créer la réparation
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => onNavigate('repairs')}
              >
                Annuler
              </Button>
            </div>
          </div>
        </div>
      </form>

      <AddClientModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onAdd={handleCreateClient}
      />

      <PrintOptionsModal
        isOpen={isPrintModalOpen}
        onClose={handlePrintClose}
        onPrintLabel={handlePrintLabel}
        onPrintReceipt={handlePrintReceipt}
        title="Succès ! La réparation est créée"
        description="Voulez-vous imprimer les documents ?"
      />
    </div>
  );
}

