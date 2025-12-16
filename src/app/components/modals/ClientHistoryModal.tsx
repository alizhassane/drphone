import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Client, Repair, Sale } from '../../types';
import * as clientService from '../../../services/clientService';

interface ClientHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    client: Client | null;
}

export function ClientHistoryModal({ isOpen, onClose, client }: ClientHistoryModalProps) {
    const [repairs, setRepairs] = useState<Repair[]>([]);
    const [sales, setSales] = useState<Sale[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (client && isOpen) {
            loadHistory();
        }
    }, [client, isOpen]);

    const loadHistory = async () => {
        if (!client) return;
        setLoading(true);
        try {
            const history = await clientService.getClientHistory(client.id);
            setRepairs(history.repairs || []);
            setSales(history.sales || []);
        } catch (error) {
            console.error('Failed to load history', error);
        } finally {
            setLoading(false);
        }
    };

    if (!client) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[700px] bg-white max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Historique - {client.prenom} {client.nom}</DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="repairs" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="repairs">Réparations ({repairs.length})</TabsTrigger>
                        <TabsTrigger value="sales">Achats ({sales.length})</TabsTrigger>
                    </TabsList>

                    <TabsContent value="repairs" className="space-y-4 pt-4">
                        {loading ? <p className="text-center text-gray-500">Chargement...</p> :
                            repairs.length === 0 ? <p className="text-center text-gray-500 py-8">Aucune réparation trouvée</p> : (
                                <div className="space-y-3">
                                    {repairs.map((repair: any) => (
                                        <div key={repair.id} className="border rounded-lg p-3 flex justify-between items-center bg-gray-50">
                                            <div>
                                                <div className="font-medium">{repair.device_details || repair.modelePhone}</div>
                                                <div className="text-sm text-gray-500">{repair.issue_description || repair.description}</div>
                                                <div className="text-xs text-gray-400">{new Date(repair.created_at || repair.dateCreation).toLocaleDateString()}</div>
                                            </div>
                                            <div className="text-right">
                                                <Badge className={
                                                    repair.status === 'réparée' ? 'bg-green-600' :
                                                        repair.status === 'payée_collectée' ? 'bg-blue-600' :
                                                            'bg-gray-500'
                                                }>
                                                    {repair.status || repair.statut}
                                                </Badge>
                                                <div className="font-bold mt-1">{(repair.cost_estimate || repair.prix || 0).toFixed(2)} $</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                        }
                    </TabsContent>

                    <TabsContent value="sales" className="space-y-4 pt-4">
                        {loading ? <p className="text-center text-gray-500">Chargement...</p> :
                            sales.length === 0 ? <p className="text-center text-gray-500 py-8">Aucun achat trouvé</p> : (
                                <div className="space-y-3">
                                    {/* Sales rendering placeholder until sales structure confirmed */}
                                    <p>Liste des achats (à venir)</p>
                                </div>
                            )
                        }
                    </TabsContent>
                </Tabs>

                <DialogFooter>
                    <Button onClick={onClose}>Fermer</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
