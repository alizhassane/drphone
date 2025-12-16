import { useState } from 'react';
import { ArrowLeft, Printer, CreditCard, DollarSign, Smartphone } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import type { Screen, ShopSettings, PaymentMethod } from '../types';

interface PaymentScreenProps {
  onNavigate: (screen: Screen) => void;
  shopSettings: ShopSettings;
}

export function PaymentScreen({ onNavigate, shopSettings }: PaymentScreenProps) {
  const [taxIncluded, setTaxIncluded] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('comptant');
  
  // Example repair data
  const subtotal = 89.99;
  
  // Calculate taxes
  const calculateTotal = () => {
    if (taxIncluded) {
      const total = subtotal;
      const tpsAmount = (total / (1 + (shopSettings.tps + shopSettings.tvq) / 100)) * (shopSettings.tps / 100);
      const tvqAmount = (total / (1 + (shopSettings.tps + shopSettings.tvq) / 100)) * (shopSettings.tvq / 100);
      return {
        subtotal: total - tpsAmount - tvqAmount,
        tps: tpsAmount,
        tvq: tvqAmount,
        total: total
      };
    } else {
      const tpsAmount = subtotal * (shopSettings.tps / 100);
      const tvqAmount = subtotal * (shopSettings.tvq / 100);
      return {
        subtotal: subtotal,
        tps: tpsAmount,
        tvq: tvqAmount,
        total: subtotal + tpsAmount + tvqAmount
      };
    }
  };

  const totals = calculateTotal();

  const paymentMethods: { id: PaymentMethod; label: string; icon: any }[] = [
    { id: 'comptant', label: 'Comptant', icon: DollarSign },
    { id: 'debit', label: 'Débit', icon: CreditCard },
    { id: 'credit', label: 'Crédit', icon: CreditCard },
  ];

  const handlePrint = () => {
    alert('Impression de la facture...');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onNavigate('repairs')}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Paiement et facturation</h2>
          <p className="text-gray-500">Ticket #TKT-2024-001</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invoice Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Détails de la facture</h3>
            
            {/* Shop Info */}
            <div className="pb-6 border-b border-gray-200">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Smartphone className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{shopSettings.nom}</h4>
                  <p className="text-sm text-gray-600 mt-1">{shopSettings.adresse}</p>
                  <p className="text-sm text-gray-600">Tél: {shopSettings.telephone}</p>
                  <p className="text-sm text-gray-600">{shopSettings.email}</p>
                </div>
              </div>
            </div>

            {/* Customer & Repair Info */}
            <div className="py-6 border-b border-gray-200 grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Client</p>
                <p className="text-gray-900">Jean Tremblay</p>
                <p className="text-sm text-gray-600">514-555-0101</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Date</p>
                <p className="text-gray-900">{new Date().toLocaleDateString('fr-CA')}</p>
                <p className="text-sm text-gray-600">Numéro: TKT-2024-001</p>
              </div>
            </div>

            {/* Items */}
            <div className="py-6 border-b border-gray-200">
              <table className="w-full">
                <thead>
                  <tr className="text-left">
                    <th className="pb-2 text-sm text-gray-500">Description</th>
                    <th className="pb-2 text-sm text-gray-500 text-right">Montant</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-2">
                      <p className="text-gray-900">Remplacement écran iPhone 13</p>
                      <p className="text-sm text-gray-500">Écran LCD - Garantie 90 jours</p>
                    </td>
                    <td className="py-2 text-right text-gray-900">{subtotal.toFixed(2)} $</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="pt-6 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Sous-total</span>
                <span className="text-gray-900">{totals.subtotal.toFixed(2)} $</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">TPS ({shopSettings.tps}%)</span>
                <span className="text-gray-900">{totals.tps.toFixed(2)} $</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">TVQ ({shopSettings.tvq}%)</span>
                <span className="text-gray-900">{totals.tvq.toFixed(2)} $</span>
              </div>
              <div className="pt-3 border-t border-gray-200 flex justify-between">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-blue-600">{totals.total.toFixed(2)} $</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Payment Options */}
        <div className="space-y-6">
          {/* Tax Toggle */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Options de facturation</h3>
            <div className="flex items-center justify-between">
              <Label htmlFor="tax-toggle" className="cursor-pointer">
                Prix taxes incluses
              </Label>
              <Switch
                id="tax-toggle"
                checked={taxIncluded}
                onCheckedChange={setTaxIncluded}
              />
            </div>
          </Card>

          {/* Payment Method */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Méthode de paiement</h3>
            <div className="space-y-2">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={`
                      w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all
                      ${paymentMethod === method.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    <div className={`
                      w-10 h-10 rounded-lg flex items-center justify-center
                      ${paymentMethod === method.id ? 'bg-blue-600' : 'bg-gray-100'}
                    `}>
                      <Icon className={`w-5 h-5 ${paymentMethod === method.id ? 'text-white' : 'text-gray-600'}`} />
                    </div>
                    <span className={`flex-1 text-left ${paymentMethod === method.id ? 'text-blue-900 font-semibold' : 'text-gray-700'}`}>
                      {method.label}
                    </span>
                    {paymentMethod === method.id && (
                      <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Actions */}
          <div className="space-y-2">
            <Button onClick={handlePrint} className="w-full gap-2 bg-blue-600 hover:bg-blue-700">
              <Printer className="w-4 h-4" />
              Imprimer la facture
            </Button>
            <Button variant="outline" className="w-full">
              Envoyer par courriel
            </Button>
          </div>

          {/* Summary */}
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Montant payé</span>
                <span className="font-semibold text-gray-900">{totals.total.toFixed(2)} $</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Méthode</span>
                <span className="font-semibold text-gray-900">
                  {paymentMethods.find(m => m.id === paymentMethod)?.label}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
