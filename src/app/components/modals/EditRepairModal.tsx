import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '../ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '../ui/popover';
import { Check, ChevronsUpDown, X, Plus } from 'lucide-react';
import { cn } from '../ui/utils';
import { Repair, RepairStatus, Product } from '../../types';
import * as repairService from '../../../services/repairService';
import { getProducts, getProduct } from '../../../services/productService';
import { INVENTORY_HIERARCHY } from '../../data/inventoryHierarchy';

interface EditRepairModalProps {
    isOpen: boolean;
    onClose: () => void;
    repair: Repair | null;
    onSave: () => void;
}

interface SelectedPart {
    id?: string;
    name: string;
    price: number;
    isManual: boolean;
}

export function EditRepairModal({ isOpen, onClose, repair, onSave }: EditRepairModalProps) {
    const [status, setStatus] = useState<RepairStatus>('reçue');
    const [repairType, setRepairType] = useState('');
    const [description, setDescription] = useState('');
    const [notes, setNotes] = useState('');
    const [price, setPrice] = useState('');
    const [deposit, setDeposit] = useState('');
    const [warranty, setWarranty] = useState('90');
    const [partsList, setPartsList] = useState(''); // Text representation
    const [selectedParts, setSelectedParts] = useState<SelectedPart[]>([]);
    const [availableParts, setAvailableParts] = useState<Product[]>([]);
    const [isPartsLoading, setIsPartsLoading] = useState(false);
    const [openPartCombobox, setOpenPartCombobox] = useState(false);
    const [manualPart, setManualPart] = useState('');

    // Device Details State
    // We use IDs for hierarchy where possible
    const [selectedDeviceType, setSelectedDeviceType] = useState<string>('');
    const [selectedBrand, setSelectedBrand] = useState<string>('');
    const [selectedModel, setSelectedModel] = useState<string>('');

    // Fallback/Legacy text (used if hierarchy match fails or to store result)
    // Note: The save logic will reconstruct the names from IDs if IDs are present.

    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (repair) {
            setStatus(repair.statut);
            setRepairType(repair.typeReparation || '');
            setRepairType(repair.typeReparation || '');
            setDescription(repair.description || '');
            setNotes(repair.remarque || '');
            setPrice(repair.prix ? repair.prix.toString() : '');
            setDeposit(repair.depot ? repair.depot.toString() : '');
            setWarranty(repair.garantie ? repair.garantie.toString() : '90');
            // Initialize parts list text
            setPartsList(Array.isArray(repair.piecesUtilisees) ? repair.piecesUtilisees.join('\n') : '');

            // Parse device details
            try {
                if (repair.device_details) {
                    const details = JSON.parse(repair.device_details);

                    // Attempt to hydrate hierarchy
                    // detail.brand and detail.model are Strings (Names). We need IDs.
                    const brandName = details.brand;
                    const modelName = details.model;

                    // 1. Find Brand ID
                    let foundType = '';
                    let foundBrand = '';
                    let foundModel = '';

                    // Very basic reverse lookup (expensive but dataset small)
                    outerLoop:
                    for (const type of INVENTORY_HIERARCHY) {
                        for (const b of type.brands) {
                            if (b.name === brandName) {
                                foundType = type.id;
                                foundBrand = b.id;

                                // 2. Find Model ID within Brand
                                // Note: modelName might contain BrandName prefix (NewRepairScreen logic: "Brand Model")
                                // We check exact match or partial.
                                // NewRepairScreen saves: `${brandName} ${selectedModel}` (Step 195) -> Wait.
                                // Step 217: device_details: { model: selectedModel }. 
                                // In Step 217 I saved the RAW `selectedModel` (which is likely the name from the list, e.g. "iPhone 13").
                                // So we search for model name in the brand's models.
                                const m = b.models.find(m => m === modelName);
                                if (m) {
                                    foundModel = m; // The ID in hierarchy is just the string usually? Check Hierarchy.
                                    // NewRepairScreen uses strings as IDs for models usually in these lists.
                                    // Let's assume model in hierarchy is the string name itself.
                                } else {
                                    // If saved model was "iPhone 13 Pro", and list has "13 Pro".
                                    // or saved "Apple iPhone 13".
                                    foundModel = modelName; // Fallback
                                }
                                break outerLoop;
                            }
                        }
                    }

                    if (foundType) setSelectedDeviceType(foundType);
                    if (foundBrand) setSelectedBrand(foundBrand);
                    if (foundModel) setSelectedModel(foundModel); // This sets the value for Select

                } else if (repair.modelePhone) {
                    // Fallback: Try to parse "Brand Model" string from legacy repairs
                    // Example: "Apple iPhone 13"
                    const fullString = repair.modelePhone;

                    outerLoop2:
                    for (const type of INVENTORY_HIERARCHY) {
                        for (const b of type.brands) {
                            if (fullString.toLowerCase().includes(b.name.toLowerCase())) {
                                // Found brand
                                const foundType = type.id;
                                const foundBrand = b.id;

                                // Try to find model in the remaining string or just strict match
                                const matchingModel = b.models.find(m => fullString.includes(m));
                                if (matchingModel) {
                                    setSelectedDeviceType(foundType);
                                    setSelectedBrand(foundBrand);
                                    setSelectedModel(matchingModel);
                                    break outerLoop2;
                                }
                            }
                        }
                    }
                }
            } catch (e) {
                // Ignore
            }

            // Hydrate selectedParts from IDs if available
            if (repair.parts && repair.parts.length > 0) {
                const loadParts = async () => {
                    const loadedParts: SelectedPart[] = [];
                    for (const id of repair.parts!) { // Non-null assertion safe due to check
                        const product = await getProduct(id.toString());
                        if (product) {
                            loadedParts.push({
                                id: product.id,
                                name: product.nom,
                                price: product.prixVente,
                                isManual: false
                            });
                        }
                    }
                    setSelectedParts(loadedParts);
                };
                loadParts();
            } else {
                setSelectedParts([]);
            }
        }
    }, [repair]);

    // Fetch parts for combobox
    const handleSearchParts = async () => {
        setIsPartsLoading(true);
        try {
            // Search by selectedModel if available, otherwise fetch all
            const query = selectedModel || '';
            const results = await getProducts(query);
            // Filter primarily for parts section
            const parts = results.filter(p => p.section === 'Pièces' || p.categorie === 'Pièces');
            setAvailableParts(parts);
        } catch (error) {
            console.error(error);
        } finally {
            setIsPartsLoading(false);
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

        const newParts = [...selectedParts, newPart];
        setSelectedParts(newParts);

        // Append to text area
        setPartsList(prev => prev ? `${prev}\n${partName}` : partName);

        // Update price estimate? 
        // Logic: if price was manually set, we add to it? 
        // Or keep price separate? User usually expects price to go up.
        const currentPrice = parseFloat(price) || 0;
        setPrice((currentPrice + product.prixVente).toFixed(2));

        setOpenPartCombobox(false);
    };

    const handleAddManualPart = () => {
        if (manualPart.trim()) {
            const name = manualPart.trim();
            const newPart: SelectedPart = {
                name: name,
                price: 0,
                isManual: true
            };
            setSelectedParts([...selectedParts, newPart]);
            setPartsList(prev => prev ? `${prev}\n${name}` : name);
            setManualPart('');
        }
    };

    const handleRemovePart = (index: number) => {
        const partToRemove = selectedParts[index];
        const newParts = selectedParts.filter((_, i) => i !== index);
        setSelectedParts(newParts);

        // Remove from text area? Hard because text area is editable freeform.
        // We'll leave text area alone to avoid destroying user edits, or try to remove line?
        // Safer to leave text area alone or rebuild it?
        // Rebuilding it might lose manual edits.
        // We will NOT auto-remove from text area to be safe. User can edit text.

        // Deduct price?
        if (!partToRemove.isManual) {
            const currentPrice = parseFloat(price) || 0;
            setPrice(Math.max(0, currentPrice - partToRemove.price).toFixed(2));
        }
    };

    const handleSave = async () => {
        if (!repair) return;

        setIsSaving(true);
        try {
            await repairService.updateRepair(Number(repair.id), {
                statut: status,
                typeReparation: repairType,
                description: description,
                remarque: notes, // Pass as remarque which the service maps to notes
                prix: parseFloat(price) || 0,
                depot: parseFloat(deposit) || 0,
                garantie: parseInt(warranty),
                piecesUtilisees: partsList.split('\n').filter(p => p.trim() !== ''),
                parts: selectedParts.filter(p => !p.isManual).map(p => Number(p.id)), // Send IDs
                device_details: JSON.stringify({
                    // Construct names from IDs
                    brand: INVENTORY_HIERARCHY.flatMap(d => d.brands).find(b => b.id === selectedBrand)?.name || selectedBrand,
                    model: selectedModel
                })
            });

            onSave();
            onClose();
        } catch (error) {
            console.error('Failed to update repair', error);
            alert('Erreur lors de la mise à jour');
        } finally {
            setIsSaving(false);
        }
    };

    if (!repair) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto bg-white">
                <DialogHeader>
                    <DialogTitle>Modifier la réparation {repair.numeroTicket}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">

                    {/* Device Hierarchy Selection */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Type d'appareil</Label>
                            <Select value={selectedDeviceType} onValueChange={(v) => {
                                setSelectedDeviceType(v);
                                setSelectedBrand('');
                                setSelectedModel('');
                            }}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Choisir type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {INVENTORY_HIERARCHY.map(type => (
                                        <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Marque</Label>
                            <Select value={selectedBrand} onValueChange={(v) => {
                                setSelectedBrand(v);
                                setSelectedModel('');
                            }} disabled={!selectedDeviceType}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Choisir marque" />
                                </SelectTrigger>
                                <SelectContent>
                                    {selectedDeviceType && INVENTORY_HIERARCHY
                                        .find(t => t.id === selectedDeviceType)?.brands
                                        .map(b => (
                                            <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Modèle</Label>
                            <Select value={selectedModel} onValueChange={setSelectedModel} disabled={!selectedBrand}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Choisir modèle" />
                                </SelectTrigger>
                                <SelectContent>
                                    {selectedBrand && INVENTORY_HIERARCHY
                                        .flatMap(t => t.brands)
                                        .find(b => b.id === selectedBrand)?.models
                                        .map(m => (
                                            <SelectItem key={m} value={m}>{m}</SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        </div>

                    </div>

                    <div className="border-t my-2"></div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="status" className="text-right">
                            Statut
                        </Label>
                        <Select value={status} onValueChange={(v) => setStatus(v as RepairStatus)}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Statut" />
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

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="price" className="text-right">
                            Prix
                        </Label>
                        <Input
                            id="price"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="col-span-3"
                            type="number"
                        />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="deposit" className="text-right">
                            Dépôt
                        </Label>
                        <Input
                            id="deposit"
                            value={deposit}
                            onChange={(e) => setDeposit(e.target.value)}
                            className="col-span-3"
                            type="number"
                        />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="warranty" className="text-right">
                            Garantie
                        </Label>
                        <Select value={warranty} onValueChange={setWarranty}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Garantie" />
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

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="repairType" className="text-right">
                            Type
                        </Label>
                        <Input
                            id="repairType"
                            value={repairType}
                            onChange={(e) => setRepairType(e.target.value)}
                            className="col-span-3"
                        />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right">
                            Description
                        </Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="col-span-3"
                        />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="notes" className="text-right">
                            Remarque
                        </Label>
                        <Textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="col-span-3 bg-amber-50/30 border-amber-200"
                            placeholder="Interne..."
                        />
                    </div>

                    <div className="grid grid-cols-4 items-start gap-4">
                        <Label className="text-right pt-2">
                            Pièces
                        </Label>
                        <div className="col-span-3 space-y-3">
                            {/* Inventory Selector */}
                            <div className="flex gap-2">
                                <Popover open={openPartCombobox} onOpenChange={(open) => {
                                    setOpenPartCombobox(open);
                                    if (open) handleSearchParts();
                                }}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={openPartCombobox}
                                            className="flex-1 justify-between text-left font-normal"
                                        >
                                            <span className="truncate">Ajouter pièce stock...</span>
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]" align="start">
                                        <Command>
                                            <CommandInput placeholder="Rechercher pièce..." />
                                            <CommandList>
                                                <CommandEmpty>Aucune pièce trouvée.</CommandEmpty>
                                                <CommandGroup>
                                                    {availableParts.map((part) => (
                                                        <CommandItem
                                                            key={part.id}
                                                            value={part.nom}
                                                            onSelect={() => handleSelectPart(part.id)}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    selectedParts.some(p => p.id === part.id) ? "opacity-100" : "opacity-0"
                                                                )}
                                                            />
                                                            <div className="flex flex-col">
                                                                <span className={part.quantite <= 0 ? "text-red-500 font-medium" : ""}>{part.nom}</span>
                                                                <span className={cn("text-xs", part.quantite <= 0 ? "text-red-500" : "text-gray-500")}>
                                                                    {Number(part.quantite)} en stock | {part.prixVente}$
                                                                </span>
                                                            </div>
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>

                            {/* Manual Entry */}
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Ajouter pièce manuelle..."
                                    value={manualPart}
                                    onChange={(e) => setManualPart(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddManualPart())}
                                />
                                <Button type="button" variant="outline" size="icon" onClick={handleAddManualPart}>
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>

                            {/* Selected Parts List (Visual) */}
                            {selectedParts.length > 0 && (
                                <div className="space-y-1">
                                    {selectedParts.map((part, index) => (
                                        <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded text-sm">
                                            <span>{part.name}</span>
                                            <div className="flex items-center gap-2">
                                                {part.price > 0 && <span className="text-gray-500">{part.price}$</span>}
                                                <button type="button" onClick={() => handleRemovePart(index)} className="text-red-500 hover:text-red-700">
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Printable List (Text Area) */}
                            <div>
                                <Label htmlFor="partsList" className="text-xs text-gray-500 mb-1 block">
                                    Liste pour étiquette (modifiable)
                                </Label>
                                <Textarea
                                    id="partsList"
                                    value={partsList}
                                    onChange={(e) => setPartsList(e.target.value)}
                                    placeholder="Liste des pièces..."
                                    className="min-h-[80px]"
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Annuler
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
                        {isSaving ? 'Enregistrement...' : 'Enregistrer'}
                    </Button>
                </DialogFooter>
            </DialogContent >
        </Dialog >
    );
}
