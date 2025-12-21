import { useState, useEffect } from 'react';
import { Search, Filter, Eye, Download } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import type { POSTransaction, PaymentMethod, CartItem } from '../types';
import * as saleService from '../../services/saleService';
import * as settingsService from '../../services/settingsService';
import { generateInvoiceHtml } from '../../utils/invoiceGenerator';
import type { ShopSettings } from '../types';

interface SalesHistoryScreenProps {
  // No props needed now
}

export function SalesHistoryScreen() {
  const [transactions, setTransactions] = useState<POSTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    try {
      const salesData = await saleService.getSales();
      // Map backend data to POSTransaction
      const mappedTransactions: POSTransaction[] = salesData.map((sale: any) => ({
        id: sale.id.toString(),
        numeroVente: `VENTE-${sale.id}`, // Generate a display ID
        date: sale.created_at,
        items: sale.items.map((item: any) => ({
          productId: item.product_id ? item.product_id.toString() : `manual-${Math.random()}`,
          nom: item.is_manual ? item.manual_name : item.product_name || 'Produit inconnu',
          prix: item.unit_price,
          quantite: item.quantity,
          categorie: 'Vente', // Default category
          type: item.is_manual ? 'manual' : 'product'
        })),
        sousTotal: parseFloat(sale.total_amount),
        tps: parseFloat(sale.tax_tps),
        tvq: parseFloat(sale.tax_tvq),
        total: parseFloat(sale.final_total),
        methodePaiement: sale.payment_method as PaymentMethod,
        taxesIncluses: false, // Default
        statut: sale.status === 'Completed' ? 'payé' : 'non_payé',
        clientNom: sale.clientNom, // From updated service
        clientEmail: sale.clientEmail,
        clientPhone: sale.clientPhone
      }));
      setTransactions(mappedTransactions);
    } catch (error) {
      console.error('Failed to load sales', error);
    } finally {
      setLoading(false);
    }
  };

  /* FILTER LOGIC START */
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch =
      transaction.numeroVente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (transaction.clientNom?.toLowerCase().includes(searchTerm.toLowerCase()) || false);

    const matchesPayment = paymentFilter === 'all' || transaction.methodePaiement === paymentFilter;

    // Date filter logic
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const transactionDate = new Date(transaction.date);
      const today = new Date();

      if (dateFilter === 'today') {
        matchesDate = transactionDate.toDateString() === today.toDateString();
      } else if (dateFilter === 'week') {
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        matchesDate = transactionDate >= weekAgo;
      } else if (dateFilter === 'month') {
        matchesDate =
          transactionDate.getMonth() === today.getMonth() &&
          transactionDate.getFullYear() === today.getFullYear();
      }
    }

    return matchesSearch && matchesPayment && matchesDate;
  });

  const handlePrintInvoice = async (transaction: POSTransaction) => {
    try {
      const settings = await settingsService.getSettings();

      let customerObj: any = undefined;
      if (transaction.clientNom) {
        customerObj = {
          nom: transaction.clientNom,
          email: transaction.clientEmail || '',
          telephone: transaction.clientPhone || ''
        };
      }

      const html = generateInvoiceHtml({
        shopSettings: settings as ShopSettings,
        items: transaction.items,
        totals: {
          subtotal: transaction.sousTotal,
          tps: transaction.tps,
          tvq: transaction.tvq,
          total: transaction.total
        },
        paymentMethod: transaction.methodePaiement,
        customer: customerObj,
        transactionNumber: transaction.numeroVente,
        date: transaction.date
      });

      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
      }
    } catch (error) {
      console.error('Failed to print invoice', error);
      alert('Erreur lors de l\'impression');
    }
  };

  const getPaymentMethodBadge = (method: PaymentMethod) => {
    const methodConfig = {
      comptant: { label: 'Comptant', className: 'bg-green-100 text-green-800 border-green-200' },
      debit: { label: 'Débit', className: 'bg-blue-100 text-blue-800 border-blue-200' },
      credit: { label: 'Crédit', className: 'bg-purple-100 text-purple-800 border-purple-200' },
      virement: { label: 'Virement', className: 'bg-orange-100 text-orange-800 border-orange-200' },
    };
    const config = methodConfig[method] || { label: method, className: 'bg-gray-100' };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const totalSales = filteredTransactions.reduce((sum, t) => sum + t.total, 0);
  const totalTransactions = filteredTransactions.length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Historique des ventes</h2>
          <p className="text-gray-500">Consultez toutes vos transactions</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Exporter
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <p className="text-sm text-gray-500">Total des ventes</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{totalSales.toFixed(2)} $</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-gray-500">Nombre de transactions</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{totalTransactions}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-gray-500">Moyenne par vente</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {totalTransactions > 0 ? (totalSales / totalTransactions).toFixed(2) : '0.00'} $
          </p>
        </Card>
      </div>

      <Card className="p-6">
        {/* Filters */}
        <div className="mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les dates</SelectItem>
                <SelectItem value="today">Aujourd'hui</SelectItem>
                <SelectItem value="week">7 derniers jours</SelectItem>
                <SelectItem value="month">Ce mois</SelectItem>
              </SelectContent>
            </Select>

            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Méthode de paiement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les méthodes</SelectItem>
                <SelectItem value="comptant">Comptant</SelectItem>
                <SelectItem value="debit">Débit</SelectItem>
                <SelectItem value="credit">Crédit</SelectItem>
                <SelectItem value="virement">Virement</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm text-gray-500">Numéro de vente</th>
                <th className="text-left py-3 px-4 text-sm text-gray-500">Date</th>
                <th className="text-left py-3 px-4 text-sm text-gray-500">Client</th>
                <th className="text-left py-3 px-4 text-sm text-gray-500">Articles</th>
                <th className="text-center py-3 px-4 text-sm text-gray-500">Méthode</th>
                <th className="text-right py-3 px-4 text-sm text-gray-500">Montant total</th>
                <th className="text-center py-3 px-4 text-sm text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <p className="text-sm font-semibold text-blue-600">{transaction.numeroVente}</p>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {new Date(transaction.date).toLocaleDateString('fr-CA', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900">
                    {transaction.clientNom || 'Client anonyme'}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {transaction.items.length} article{transaction.items.length > 1 ? 's' : ''}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {getPaymentMethodBadge(transaction.methodePaiement)}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900 text-right font-semibold">
                    {transaction.total.toFixed(2)} $
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-3 gap-1"
                        onClick={() => handlePrintInvoice(transaction)}
                      >
                        <Eye className="w-4 h-4" />
                        Facture
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && filteredTransactions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucune transaction trouvée</p>
          </div>
        )}
      </Card>
    </div>
  );
}
