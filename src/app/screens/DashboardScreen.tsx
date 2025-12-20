import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Wrench, AlertTriangle, Loader2, Smartphone } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import * as statsService from '../../services/statsService';
import type { DashboardStats } from '../../services/statsService';

export function DashboardScreen() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await statsService.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load dashboard stats', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    // Backend returns status as stored (e.g. 'reçue', 'en_cours')
    const statusConfig: Record<string, { label: string; className: string }> = {
      reçue: { label: 'Reçue', className: 'bg-gray-100 text-gray-800' },
      en_cours: { label: 'En cours', className: 'bg-orange-100 text-orange-800' },
      en_attente_pieces: { label: 'En attente de pièces', className: 'bg-yellow-100 text-yellow-800' },
      réparée: { label: 'Réparée', className: 'bg-blue-100 text-blue-800' },
      payée_collectée: { label: 'Payée / Collectée', className: 'bg-green-100 text-green-800' },
      annulé: { label: 'Annulé', className: 'bg-red-100 text-red-800' },
    };
    // Fallback for unknown status
    const config = statusConfig[status] || { label: status, className: 'bg-gray-100' };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6">
        <p className="text-red-500">Erreur lors du chargement des données. Veuillez réessayer.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Tableau de bord</h2>
        <p className="text-gray-500">Vue d'ensemble de votre magasin</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Ventes du jour</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {Number(stats.todaySales || 0).toFixed(2)} $
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Ventes du mois</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {Number(stats.monthSales || 0).toFixed(2)} $
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Profit du jour</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {Number(stats.todayProfit || 0).toFixed(2)} $
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Réparations en cours</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {Number(stats.ongoingRepairs || 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Wrench className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Téléphones en Stock</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {Number(stats.phonesInStock || 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Repairs */}
        <Card className="lg:col-span-2 p-6">
          <h3 className="font-bold text-gray-900 mb-4">5 dernières réparations</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm text-gray-500">Ticket</th>
                  <th className="text-left py-3 px-4 text-sm text-gray-500">Client</th>
                  <th className="text-left py-3 px-4 text-sm text-gray-500">Téléphone</th>
                  <th className="text-left py-3 px-4 text-sm text-gray-500">Statut</th>
                  <th className="text-right py-3 px-4 text-sm text-gray-500">Prix</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentRepairs.map((repair: any) => (
                  <tr key={repair.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm">{repair.numeroTicket || 'N/A'}</td>
                    <td className="py-3 px-4 text-sm">{repair.client_name || 'Inconnu'}</td>
                    {/* Note: repair table might not have phone directly if it's on client, check join */}
                    <td className="py-3 px-4 text-sm">{repair.modelePhone}</td>
                    <td className="py-3 px-4">{getStatusBadge(repair.status || repair.statut)}</td>
                    <td className="py-3 px-4 text-sm text-right">{Number(repair.cost_estimate || repair.prix || 0).toFixed(2)} $</td>
                    {/* Backend returns snake_case or mixed depending on query. Service uses `r.*`. Repairs table: `cost_estimate`. Frontend type: `prix`. */}
                    {/* The backend query `SELECT r.*` returns `cost_estimate`. */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Low Stock Alerts */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <h3 className="font-bold text-gray-900">Alertes de stock faible</h3>
          </div>
          <div className="space-y-3">
            {stats.lowStockItems.length === 0 ? (
              <p className="text-sm text-gray-500">Aucune alerte de stock</p>
            ) : (
              stats.lowStockItems.map((product: any) => (
                <div key={product.id} className={`p-3 rounded-lg border ${(product.stock_quantity || 0) === 0
                  ? 'bg-red-50 border-red-200'
                  : 'bg-orange-50 border-orange-200'
                  }`}>
                  <p className="text-sm font-semibold text-gray-900">{product.name || product.nom}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Quantité: <span className={`font-semibold ${(product.stock_quantity || 0) === 0 ? 'text-red-600' : 'text-orange-600'
                      }`}>{product.stock_quantity ?? product.quantite}</span> / {product.min_stock_alert || product.alerteStock || 5}
                  </p>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}