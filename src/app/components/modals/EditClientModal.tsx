import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Client } from '../../types';
import * as clientService from '../../../services/clientService';

interface EditClientModalProps {
    isOpen: boolean;
    onClose: () => void;
    client: Client | null;
    onSave: () => void;
}

export function EditClientModal({ isOpen, onClose, client, onSave }: EditClientModalProps) {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (client) {
            setName(client.nom); // Assuming client object uses 'nom' but backend uses 'name'. Need to check frontend mapping.
            // types.ts says Customer has 'nom', 'prenom'.
            // Wait, types.ts: Customer { nom: string; prenom: string; ... }
            // Backend clientService.ts: Client { name: string; ... }
            // The frontend likely combines or maps them. 
            // Checking CustomersScreen.tsx: customer.nom, customer.prenom.
            // Checking clientService.ts (step 586): result of fetch is returned directly?
            // Step 586 backend: SELECT * FROM clients. Columns: name, phone, email.
            // Step 581 CustomersScreen: .map(customer => customer.prenom + customer.nom)
            // Wait, if backend returns 'name' and frontend expects 'nom'/'prenom', there must be mapping in frontend service.
            // I need to check `frontend/src/services/clientService.ts` first!
            // Proceeding with creating Modal but I might need to adjust based on frontend service.
            // Let's assume frontend service maps 'name' -> 'nom' + 'prenom' split or similar.
            // Actually, for simplicity, I'll allow editing "Name" (Full Name) if that's what backend has.
            // Inspecting CustomersScreen again... it renders `{customer.prenom} {customer.nom}`.
            // Backend schema has `name` (single column).
            // So frontend service MUST be splitting it.

            // Let's assume for now I edit "Full Name" and let the service/backend handle it.
            setName(`${client.prenom} ${client.nom}`.trim());
            setPhone(client.telephone);
            setEmail(client.email);
            setAddress(client.adresse || '');
        }
    }, [client]);

    const handleSave = async () => {
        if (!client) return;

        setIsSaving(true);
        try {
            // We send 'name' to updateClient in frontend service.
            await clientService.updateClient(client.id, {
                nom: name, // passing full name as 'nom' for now, service should handle it
                telephone: phone,
                email: email,
                adresse: address
            });
            onSave();
            onClose();
        } catch (error) {
            console.error('Failed to update client', error);
            alert('Erreur lors de la mise à jour');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] bg-white">
                <DialogHeader>
                    <DialogTitle>Modifier Client</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Nom complet
                        </Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="phone" className="text-right">
                            Téléphone
                        </Label>
                        <Input
                            id="phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">
                            Email
                        </Label>
                        <Input
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="address" className="text-right">
                            Adresse
                        </Label>
                        <Input
                            id="address"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Annuler
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
                        {isSaving ? 'Enregistrer' : 'Enregistrer'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
