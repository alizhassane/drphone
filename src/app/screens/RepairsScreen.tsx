import { useState, useEffect } from 'react';
import { Plus, Search, Eye, Edit, CreditCard, Filter, Printer, Trash } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { RepairStatusBadge } from '../components/RepairStatusBadge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import type { Repair, Screen, PaymentStatus, RepairStatus } from '../types';
import * as repairService from '../../services/repairService';
import { RepairDetailsModal } from '../components/modals/RepairDetailsModal';
import { EditRepairModal } from '../components/modals/EditRepairModal';
import { ConfirmationModal } from '../components/modals/ConfirmationModal';
import { PrintOptionsModal } from '../components/modals/PrintOptionsModal';
import { printRepairLabel } from '../utils/printRepairLabel';
import { printRepairReceipt } from '../utils/printRepairReceipt';

interface RepairsScreenProps {
  onNavigate: (screen: Screen, repair?: Repair) => void;
}

export function RepairsScreen({ onNavigate }: RepairsScreenProps) {
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [selectedRepair, setSelectedRepair] = useState<Repair | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [repairToDelete, setRepairToDelete] = useState<Repair | null>(null);

  useEffect(() => {
    loadRepairs();
  }, []);

  const loadRepairs = async () => {
    try {
      setLoading(true);
      const data = await repairService.getRepairs();
      setRepairs(data);
    } catch (error) {
      console.error('Failed to load repairs', error);
    } finally {
      setLoading(false);
    }
  };

  const getPaymentStatus = (repair: Repair): PaymentStatus => {
    const remaining = (repair.prix || 0) - (repair.depot || 0);
    // If status is 'payée_collectée', consider it paid regardless of calc
    if (repair.statut === 'payée_collectée') return 'payé';
    if (remaining <= 0.01) return 'payé'; // Floating point tolerance
    if (repair.depot > 0) return 'partiel';
    return 'non_payé';
  };

  const filteredRepairs = repairs.filter(repair => {
    const matchesSearch =
      repair.numeroTicket?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repair.clientNom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repair.modelePhone?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || repair.statut === statusFilter;
    const paymentStatus = getPaymentStatus(repair);
    const matchesPayment = paymentFilter === 'all' || paymentStatus === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  const getPaymentBadge = (status: PaymentStatus) => {
    const statusConfig = {
      payé: { label: 'Payé', className: 'bg-green-100 text-green-800 border-green-200' },
      partiel: { label: 'Partiel', className: 'bg-orange-100 text-orange-800 border-orange-200' },
      non_payé: { label: 'Non payé', className: 'bg-red-100 text-red-800 border-red-200' },
    };
    const config = statusConfig[status || 'non_payé'];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const statusCounts = repairs.reduce((acc, repair) => {
    acc[repair.statut] = (acc[repair.statut] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleStatusChange = async (repairId: string, newStatus: RepairStatus) => {
    try {
      await repairService.updateRepairStatus(Number(repairId), newStatus);
      await loadRepairs();
    } catch (error) {
      console.error('Failed to update status', error);
      alert('Erreur lors de la mise à jour du statut');
    }
  };

  const handleCollectPayment = (repair: Repair) => {
    onNavigate('pos', repair);
  };

  const handleViewRepair = (repair: Repair) => {
    setSelectedRepair(repair);
    setIsDetailsOpen(true);
  };

  const handleEditRepair = (repair: Repair) => {
    setSelectedRepair(repair);
    setIsEditOpen(true);
  };

  const handleDeleteClick = (repair: Repair) => {
    setRepairToDelete(repair);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!repairToDelete) return;
    try {
      await repairService.deleteRepair(Number(repairToDelete.id));
      setIsDeleteModalOpen(false);
      setRepairToDelete(null);
      await loadRepairs();
    } catch (error) {
      console.error('Failed to delete repair', error);
      alert('Erreur lors de la suppression');
    }
  };

  const handlePrintClick = (repair: Repair) => {
    setSelectedRepair(repair);
    setIsPrintModalOpen(true);
  };

  const handlePrintLabel = () => {
    if (selectedRepair) {
      printRepairLabel(selectedRepair);
    }
  };

  const handlePrintReceipt = () => {
    if (selectedRepair) {
      printRepairReceipt(selectedRepair);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Réparations</h2>
          <p className="text-gray-500">Gérez les tickets et suivis</p>
        </div>
        <Button
          onClick={() => onNavigate('new-repair')}
          className="bg-blue-600 hover:bg-blue-700 gap-2"
        >
          <Plus className="w-4 h-4" />
          Nouvelle réparation
        </Button>
      </div>

      {/* Quick Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button
          variant={statusFilter === 'all' ? 'default' : 'outline'}
          onClick={() => setStatusFilter('all')}
          className={statusFilter === 'all' ? 'bg-gray-800' : ''}
          size="sm"
        >
          Toutes
        </Button>
        <Button
          variant={statusFilter === 'reçue' ? 'default' : 'outline'}
          onClick={() => setStatusFilter('reçue')}
          className={statusFilter === 'reçue' ? 'bg-purple-600 hover:bg-purple-700' : ''}
          size="sm"
        >
          Reçue ({statusCounts['reçue'] || 0})
        </Button>
        <Button
          variant={statusFilter === 'en_cours' ? 'default' : 'outline'}
          onClick={() => setStatusFilter('en_cours')}
          className={statusFilter === 'en_cours' ? 'bg-orange-600 hover:bg-orange-700' : ''}
          size="sm"
        >
          En cours ({statusCounts['en_cours'] || 0})
        </Button>
        <Button
          variant={statusFilter === 'en_attente_pieces' ? 'default' : 'outline'}
          onClick={() => setStatusFilter('en_attente_pieces')}
          className={statusFilter === 'en_attente_pieces' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
          size="sm"
        >
          En attente pièces ({statusCounts['en_attente_pieces'] || 0})
        </Button>
        <Button
          variant={statusFilter === 'réparée' ? 'default' : 'outline'}
          onClick={() => setStatusFilter('réparée')}
          className={statusFilter === 'réparée' ? 'bg-blue-600 hover:bg-blue-700' : ''}
          size="sm"
        >
          Réparée ({statusCounts['réparée'] || 0})
        </Button>
        <Button
          variant={statusFilter === 'payée_collectée' ? 'default' : 'outline'}
          onClick={() => setStatusFilter('payée_collectée')}
          className={statusFilter === 'payée_collectée' ? 'bg-green-600 hover:bg-green-700' : ''}
          size="sm"
        >
          Payée/Collectée ({statusCounts['payée_collectée'] || 0})
        </Button>
      </div>

      <Card className="p-4 md:p-6">
        {/* Search and Filters */}
        <div className="mb-6 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Rechercher par ticket, client ou modèle..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 w-full sm:w-auto">
                  <Filter className="w-4 h-4" />
                  Paiement
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setPaymentFilter('all')}>
                  <span className="flex-1">Tous les paiements</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPaymentFilter('non_payé')}>
                  <Badge className="bg-red-100 text-red-800 border-red-200 flex-1 justify-center">
                    Non payé
                  </Badge>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPaymentFilter('partiel')}>
                  <Badge className="bg-orange-100 text-orange-800 border-orange-200 flex-1 justify-center">
                    Partiel
                  </Badge>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPaymentFilter('payé')}>
                  <Badge className="bg-green-100 text-green-800 border-green-200 flex-1 justify-center">
                    Payé
                  </Badge>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {paymentFilter !== 'all' && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Filtré par paiement:</span>
              {getPaymentBadge(paymentFilter as PaymentStatus)}
              <button
                onClick={() => setPaymentFilter('all')}
                className="text-blue-600 hover:underline ml-2"
              >
                Effacer
              </button>
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Ticket</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Client</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Appareil</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Statut</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Prix</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-600">Paiement</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRepairs.map((repair) => {
                const paymentStatus = getPaymentStatus(repair);
                const remaining = (repair.prix || 0) - (repair.depot || 0);
                const needsPayment = paymentStatus !== 'payé';

                return (
                  <tr key={repair.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-blue-600">{repair.numeroTicket}</td>
                    <td className="py-3 px-4 text-gray-900">{repair.clientNom}</td>
                    <td className="py-3 px-4 text-gray-600">
                      <div>{repair.modelePhone}</div>
                      <div className="text-xs text-gray-400">{repair.typeReparation}</div>
                    </td>
                    <td className="py-3 px-4">
                      <RepairStatusBadge
                        status={repair.statut}
                        onChange={(newStatus) => handleStatusChange(repair.id, newStatus)}
                        editable={true}
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <span className="font-semibold text-gray-900">{Number(repair.prix).toFixed(2)} $</span>
                        {needsPayment && (
                          <p className="text-xs text-red-600">
                            Reste: {remaining.toFixed(2)} $
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {getPaymentBadge(paymentStatus)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2"
                          title="Voir les détails"
                          onClick={() => handleViewRepair(repair)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2"
                          title="Modifier"
                          onClick={() => handleEditRepair(repair)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-gray-600 hover:text-gray-800"
                          title="Imprimer"
                          onClick={() => handlePrintClick(repair)}
                        >
                          <Printer className="w-4 h-4" />
                        </Button>
                        {needsPayment && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => handleCollectPayment(repair)}
                            title="Encaisser"
                          >
                            <CreditCard className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                          title="Supprimer"
                          onClick={() => handleDeleteClick(repair)}
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden space-y-3">
          {filteredRepairs.map((repair) => {
            const paymentStatus = getPaymentStatus(repair);
            const remaining = (repair.prix || 0) - (repair.depot || 0);
            const needsPayment = paymentStatus !== 'payé';

            return (
              <div
                key={repair.id}
                className={`p-4 border rounded-lg ${needsPayment && repair.statut === 'réparée'
                  ? 'border-yellow-300 bg-yellow-50/30'
                  : 'border-gray-200 bg-white'
                  }`}
              >
                {/* Header Row */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <p className="font-semibold text-blue-600">{repair.numeroTicket}</p>
                    <p className="text-sm text-gray-900">{repair.clientNom}</p>
                  </div>
                  <RepairStatusBadge
                    status={repair.statut}
                    onChange={(newStatus) => handleStatusChange(repair.id, newStatus)}
                    editable={true}
                  />
                </div>

                {/* Details */}
                <div className="space-y-2 text-sm mb-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Téléphone:</span>
                    <span className="text-gray-900">{repair.modelePhone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Réparation:</span>
                    <span className="text-gray-900">{repair.typeReparation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Date:</span>
                    <span className="text-gray-900">
                      {new Date(repair.dateCreation).toLocaleDateString('fr-CA')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Paiement:</span>
                    {getPaymentBadge(paymentStatus)}
                  </div>
                </div>

                {/* Price and Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <div>
                    <p className="font-bold text-gray-900">{Number(repair.prix).toFixed(2)} $</p>
                    {needsPayment && (
                      <p className="text-xs text-red-600">
                        Reste: {remaining.toFixed(2)} $
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1 px-2"
                      onClick={() => printRepairLabel(repair)}
                    >
                      <Printer className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      onClick={() => handleViewRepair(repair)}
                    >
                      <Eye className="w-4 h-4" />
                      Voir
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      onClick={() => handleEditRepair(repair)}
                    >
                      <Edit className="w-4 h-4" />
                      Modifier
                    </Button>
                    {needsPayment && (
                      <Button
                        size="sm"
                        className="gap-1 bg-green-600 hover:bg-green-700"
                        onClick={() => handleCollectPayment(repair)}
                      >
                        <CreditCard className="w-4 h-4" />
                        Encaisser
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredRepairs.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucune réparation trouvée</p>
          </div>
        )}
        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-500">Chargement...</p>
          </div>
        )}
      </Card>

      {selectedRepair && (
        <>
          <RepairDetailsModal
            isOpen={isDetailsOpen}
            onClose={() => setIsDetailsOpen(false)}
            repair={selectedRepair}
          />
          <EditRepairModal
            isOpen={isEditOpen}
            onClose={() => {
              setIsEditOpen(false);
            }}
            onSave={loadRepairs}
            repair={selectedRepair}
          />
        </>
      )}

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Supprimer la réparation"
        description={`Êtes-vous sûr de vouloir supprimer le ticket ${repairToDelete?.numeroTicket} ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
      />

      <PrintOptionsModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        onPrintLabel={handlePrintLabel}
        onPrintReceipt={handlePrintReceipt}
        title="Imprimer"
        description="Quel document voulez-vous imprimer ?"
      />
    </div>
  );
}
