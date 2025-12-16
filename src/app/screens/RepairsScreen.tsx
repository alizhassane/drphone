import { useState, useEffect } from 'react';
import { Plus, Search, Eye, Edit, CreditCard, Filter } from 'lucide-react';
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
import { EditRepairModal } from '../components/modals/EditRepairModal'; // Import Edit Modal

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
  const [isEditOpen, setIsEditOpen] = useState(false); // Edit Modal State

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
    if (remaining <= 0 || repair.statut === 'payée_collectée') return 'payé';
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

  const handleEditSave = () => {
    loadRepairs(); // Refresh list after edit
  };

  const statusCounts = {
    all: repairs.length,
    reçue: repairs.filter(r => r.statut === 'reçue').length,
    en_cours: repairs.filter(r => r.statut === 'en_cours').length,
    en_attente_pieces: repairs.filter(r => r.statut === 'en_attente_pieces').length,
    réparée: repairs.filter(r => r.statut === 'réparée').length,
    payée_collectée: repairs.filter(r => r.statut === 'payée_collectée').length,
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion des réparations</h2>
          <p className="text-gray-500">Gérez tous vos tickets de réparation</p>
        </div>
        <Button
          onClick={() => onNavigate('new-repair')}
          className="gap-2 bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          Nouvelle réparation
        </Button>
      </div>

      {/* Filter Pills ... (unchanged) */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <Button
          variant={statusFilter === 'all' ? 'default' : 'outline'}
          onClick={() => setStatusFilter('all')}
          className={statusFilter === 'all' ? 'bg-blue-600 flex-shrink-0' : 'flex-shrink-0'}
          size="sm"
        >
          Tous ({statusCounts.all})
        </Button>
        <Button
          variant={statusFilter === 'reçue' ? 'default' : 'outline'}
          onClick={() => setStatusFilter('reçue')}
          className={statusFilter === 'reçue' ? 'bg-gray-600 hover:bg-gray-700 flex-shrink-0' : 'flex-shrink-0'}
          size="sm"
        >
          Reçue ({statusCounts.reçue})
        </Button>
        <Button
          variant={statusFilter === 'en_cours' ? 'default' : 'outline'}
          onClick={() => setStatusFilter('en_cours')}
          className={statusFilter === 'en_cours' ? 'bg-orange-600 hover:bg-orange-700 flex-shrink-0' : 'flex-shrink-0'}
          size="sm"
        >
          En cours ({statusCounts.en_cours})
        </Button>
        <Button
          variant={statusFilter === 'en_attente_pieces' ? 'default' : 'outline'}
          onClick={() => setStatusFilter('en_attente_pieces')}
          className={statusFilter === 'en_attente_pieces' ? 'bg-yellow-600 hover:bg-yellow-700 flex-shrink-0' : 'flex-shrink-0'}
          size="sm"
        >
          En attente pièces ({statusCounts.en_attente_pieces})
        </Button>
        <Button
          variant={statusFilter === 'réparée' ? 'default' : 'outline'}
          onClick={() => setStatusFilter('réparée')}
          className={statusFilter === 'réparée' ? 'bg-blue-600 hover:bg-blue-700 flex-shrink-0' : 'flex-shrink-0'}
          size="sm"
        >
          Réparée ({statusCounts.réparée})
        </Button>
        <Button
          variant={statusFilter === 'payée_collectée' ? 'default' : 'outline'}
          onClick={() => setStatusFilter('payée_collectée')}
          className={statusFilter === 'payée_collectée' ? 'bg-green-600 hover:bg-green-700 flex-shrink-0' : 'flex-shrink-0'}
          size="sm"
        >
          Payée ({statusCounts.payée_collectée})
        </Button>
      </div>

      <Card className="p-4 md:p-6">
        {/* Search and Filters, same as before */}
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
                <th className="text-left py-3 px-4 text-sm text-gray-500">Ticket</th>
                <th className="text-left py-3 px-4 text-sm text-gray-500">Client</th>
                <th className="text-left py-3 px-4 text-sm text-gray-500">Téléphone</th>
                <th className="text-left py-3 px-4 text-sm text-gray-500">Réparation</th>
                <th className="text-left py-3 px-4 text-sm text-gray-500">Date</th>
                <th className="text-center py-3 px-4 text-sm text-gray-500">Statut</th>
                <th className="text-right py-3 px-4 text-sm text-gray-500">Prix</th>
                <th className="text-center py-3 px-4 text-sm text-gray-500">Paiement</th>
                <th className="text-center py-3 px-4 text-sm text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRepairs.map((repair) => {
                const paymentStatus = getPaymentStatus(repair);
                const remaining = (repair.prix || 0) - (repair.depot || 0);
                const needsPayment = paymentStatus !== 'payé';

                return (
                  <tr
                    key={repair.id}
                    className={`border-b border-gray-100 hover:bg-gray-50 ${needsPayment && repair.statut === 'réparée' ? 'bg-yellow-50/30' : ''
                      }`}
                  >
                    <td className="py-3 px-4">
                      <p className="text-sm font-semibold text-blue-600">{repair.numeroTicket}</p>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {repair.clientNom}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {repair.modelePhone}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {repair.typeReparation}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(repair.dateCreation).toLocaleDateString('fr-CA')}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <RepairStatusBadge
                        status={repair.statut}
                        onChange={(newStatus) => handleStatusChange(repair.id, newStatus)}
                        editable={true}
                      />
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900 text-right">
                      <div>
                        <p className="font-semibold">{Number(repair.prix).toFixed(2)} $</p>
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

      <RepairDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        repair={selectedRepair}
      />

      <EditRepairModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        repair={selectedRepair}
        onSave={handleEditSave}
      />
    </div>
  );
}
