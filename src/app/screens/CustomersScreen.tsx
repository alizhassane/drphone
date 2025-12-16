import { useState, useEffect } from 'react';
import { Search, Plus, User, Phone, Mail, Calendar, Edit, Trash2, History as HistoryIcon } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { AddClientModal } from '../components/modals/AddClientModal';
import { EditClientModal } from '../components/modals/EditClientModal';
import { ClientHistoryModal } from '../components/modals/ClientHistoryModal';
import type { Customer } from '../types';
import * as clientService from '../../services/clientService';

export function CustomersScreen() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // New states for Modals
  const [editingClient, setEditingClient] = useState<Customer | null>(null);
  const [historyClient, setHistoryClient] = useState<Customer | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const data = await clientService.getClients();
      setCustomers(data);
    } catch (error) {
      console.error('Failed to load customers', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.telephone.includes(searchTerm) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddClient = async (newClient: Omit<Customer, 'id' | 'dateCreation'>) => {
    try {
      await clientService.createClient(newClient);
      await loadCustomers();
      alert('Client ajouté avec succès!');
    } catch (error) {
      console.error('Failed to add client', error);
      alert('Erreur lors de l\'ajout du client');
    }
  };

  const handleEditClick = (client: Customer) => {
    setEditingClient(client);
    setIsEditModalOpen(true);
  };

  const handleHistoryClick = (client: Customer) => {
    setHistoryClient(client);
    setIsHistoryModalOpen(true);
  };

  const handleEditSave = async () => {
    await loadCustomers(); // Reload to see changes
    setIsEditModalOpen(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion des clients</h2>
          <p className="text-gray-500">Gérez vos clients et leur historique</p>
        </div>
        <Button
          className="gap-2 bg-blue-600 hover:bg-blue-700"
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus className="w-4 h-4" />
          Nouveau client
        </Button>
      </div>

      <Card className="p-6">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Rechercher par nom, téléphone ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map((customer) => (
            <Card key={customer.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {customer.prenom} {customer.nom}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Client depuis {new Date(customer.dateCreation).toLocaleDateString('fr-CA')}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{customer.telephone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="truncate">{customer.email}</span>
                  </div>
                </div>

                {customer.adresse && (
                  <p className="text-xs text-gray-500 pt-2 border-t border-gray-100">
                    {customer.adresse}
                  </p>
                )}

                <div className="pt-2 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2"
                    onClick={() => handleHistoryClick(customer)}
                  >
                    <HistoryIcon className="w-4 h-4" />
                    Historique
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEditClick(customer)}
                  >
                    Modifier
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredCustomers.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucun client trouvé</p>
          </div>
        )}
        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-500">Chargement...</p>
          </div>
        )}
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-sm text-gray-500">Total clients</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{customers.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-500">Nouveaux ce mois</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {customers.filter(c => {
              const date = new Date(c.dateCreation);
              const now = new Date();
              return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
            }).length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-500">Clients actifs</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{customers.length}</p>
        </Card>
      </div>

      {/* Add Client Modal */}
      <AddClientModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddClient}
      />

      {/* Edit Client Modal */}
      <EditClientModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        client={editingClient}
        onSave={handleEditSave}
      />

      {/* History Modal */}
      <ClientHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        client={historyClient}
      />
    </div>
  );
}