import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Repair, RepairStatus } from '../../types';
import * as repairService from '../../../services/repairService'; // Fixed import path

interface EditRepairModalProps {
    isOpen: boolean;
    onClose: () => void;
    repair: Repair | null;
    onSave: () => void;
}

export function EditRepairModal({ isOpen, onClose, repair, onSave }: EditRepairModalProps) {
    const [status, setStatus] = useState<RepairStatus>('reçue');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [deposit, setDeposit] = useState('');
    const [warranty, setWarranty] = useState('90');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (repair) {
            setStatus(repair.statut);
            setDescription(repair.description || '');
            setPrice(repair.prix.toString());
            setDeposit(repair.depot.toString());
            setWarranty(repair.garantie ? repair.garantie.toString() : '90');
        }
    }, [repair]);

    const handleSave = async () => {
        if (!repair) return;

        setIsSaving(true);
        try {
            // Call the full update function
            await repairService.updateRepair(Number(repair.id), {
                statut: status,
                description: description,
                prix: parseFloat(price) || 0,
                depot: parseFloat(deposit) || 0,
                garantie: parseInt(warranty)
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
            <DialogContent className="sm:max-w-[425px] bg-white">
                <DialogHeader>
                    <DialogTitle>Modifier la réparation {repair.numeroTicket}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">

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
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Annuler
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
                        {isSaving ? 'Enregistrement...' : 'Enregistrer'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
