import { X, Printer, Package } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Repair } from '../../types';

interface RepairDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    repair: Repair | null;
}

export function RepairDetailsModal({ isOpen, onClose, repair }: RepairDetailsModalProps) {
    if (!repair) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl bg-white max-h-[90vh] overflow-y-auto">
                <DialogHeader className="flex flex-row items-center justify-between border-b pb-4">
                    <DialogTitle className="text-xl font-bold">
                        Détails Réparation {repair.numeroTicket}
                    </DialogTitle>
                    {/* Close button handled by Dialog primitive usually, but we can add explicit actions if needed */}
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Header Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-500">Client</p>
                            <p className="font-semibold text-lg">{repair.clientNom}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500">Date</p>
                            <p className="font-medium">{new Date(repair.dateCreation).toLocaleDateString('fr-CA')}</p>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Appareil:</span>
                            <span className="font-medium">{repair.modelePhone}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Type de réparation:</span>
                            <span className="font-medium">{repair.typeReparation}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Statut:</span>
                            <Badge variant={repair.statut === 'réparée' ? 'default' : 'secondary'}>
                                {repair.statut.replace('_', ' ')}
                            </Badge>
                        </div>
                    </div>

                    {/* Issue Description */}
                    <div>
                        <h4 className="font-semibold mb-2">Description du problème</h4>
                        <p className="text-gray-700 bg-white border p-3 rounded-md text-sm">
                            {repair.description || "Aucune description fournie."}
                        </p>
                    </div>

                    {/* Parts Used */}
                    <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <Package className="w-4 h-4" />
                            Pièces utilisées
                        </h4>
                        {repair.piecesUtilisees && repair.piecesUtilisees.length > 0 ? (
                            <div className="bg-blue-50 border border-blue-100 rounded-md p-3">
                                <ul className="list-disc list-inside space-y-1">
                                    {repair.piecesUtilisees.map((part, idx) => (
                                        <li key={idx} className="text-sm text-gray-700">{part}</li>
                                    ))}
                                </ul>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 italic">Aucune pièce listée.</p>
                        )}
                    </div>

                    {/* Financials */}
                    <div className="border-t pt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Sous-total estimé:</span>
                            <span>{repair.prix.toFixed(2)} $</span>
                        </div>
                        {repair.depot > 0 && (
                            <div className="flex justify-between text-sm text-green-600">
                                <span>Dépôt versé:</span>
                                <span>-{repair.depot.toFixed(2)} $</span>
                            </div>
                        )}
                        <div className="flex justify-between font-bold text-lg pt-2 border-t">
                            <span>Total à payer:</span>
                            <span>{(repair.prix - repair.depot).toFixed(2)} $</span>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="outline" className="gap-2">
                            <Printer className="w-4 h-4" />
                            Imprimer Ticket
                        </Button>
                        <Button onClick={onClose}>
                            Fermer
                        </Button>
                    </div>

                </div>
            </DialogContent>
        </Dialog>
    );
}
