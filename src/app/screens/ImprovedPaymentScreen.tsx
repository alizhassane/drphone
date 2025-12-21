import { useState, useEffect } from 'react';
import { ArrowLeft, Printer, CreditCard, DollarSign, Smartphone, ArrowRightLeft, Check, AlertTriangle } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { PaymentConfirmationModal } from '../components/PaymentConfirmationModal';
import type { Screen, ShopSettings, PaymentMethod, TransactionData } from '../types';
import * as saleService from '../../services/saleService';
import * as repairService from '../../services/repairService';
import { generateInvoiceHtml } from '../../utils/invoiceGenerator';

interface ImprovedPaymentScreenProps {
  onNavigate: (screen: Screen) => void;
  shopSettings: ShopSettings;
  transaction?: TransactionData | null;
}

export function ImprovedPaymentScreen({ onNavigate, shopSettings, transaction }: ImprovedPaymentScreenProps) {
  const [taxIncluded, setTaxIncluded] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('comptant');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedSale, setCompletedSale] = useState<any>(null);

  // Use transaction data or fallback to empty
  const items = transaction?.items || [];
  const customer = transaction?.customer;
  const linkedRepair = transaction?.linkedRepair;

  useEffect(() => {
    if (!transaction) {
      // If no transaction provided, maybe redirect back to POS?
      // onNavigate('pos');
    }
  }, [transaction, onNavigate]);

  // Calculate adjusted items based on tax selection
  // "Tax Included" means we treat the source price as Inclusive, so we reduce it to Exclusive for display/calc
  const calculatedItems = taxIncluded
    ? items.map((item: any) => ({
      ...item,
      prix: item.prix / (1 + (shopSettings.tps + shopSettings.tvq) / 100),
      originalPrice: item.originalPrice ? item.originalPrice / (1 + (shopSettings.tps + shopSettings.tvq) / 100) : undefined
    }))
    : items;

  // Calculate taxes
  const calculateTotal = () => {
    const subtotal = calculatedItems.reduce((sum: number, item: any) => sum + (item.prix * item.quantite), 0);
    const tpsAmount = subtotal * (shopSettings.tps / 100);
    const tvqAmount = subtotal * (shopSettings.tvq / 100);

    return {
      subtotal: subtotal,
      tps: tpsAmount,
      tvq: tvqAmount,
      total: subtotal + tpsAmount + tvqAmount
    };
  };

  const totals = calculateTotal();

  const paymentMethods: { id: PaymentMethod; label: string; icon: any }[] = [
    { id: 'comptant', label: 'Comptant', icon: DollarSign },
    { id: 'debit', label: 'Débit', icon: CreditCard },
    { id: 'credit', label: 'Crédit', icon: CreditCard },
    { id: 'virement', label: 'Virement', icon: ArrowRightLeft },
  ];

  const handleConfirmPayment = async () => {
    if (!transaction || items.length === 0) return;

    setIsProcessing(true);
    try {
      const saleInput: saleService.SaleInput = {
        total_amount: totals.subtotal,
        tax_tps: totals.tps,
        tax_tvq: totals.tvq,
        final_total: totals.total,
        payment_method: paymentMethod,
        items: calculatedItems.map((item: any) => ({
          product_id: item.type === 'product' && !item.productId.startsWith('manual') && !item.productId.startsWith('repair') ? parseInt(item.productId) : undefined,
          phone_id: item.type === 'phone' ? item.productId : undefined,
          repair_id: item.type === 'repair' && item.repairId ? parseInt(item.repairId) : undefined,
          quantity: item.quantite,
          unit_price: item.prix,
          is_manual: item.type === 'manual' || item.type === 'repair' || item.productId.startsWith('manual'),
          manual_name: item.type === 'manual' || item.type === 'repair' ? item.nom : undefined
        })),
        client_id: customer && customer.id ? parseInt(customer.id) : undefined,
      };

      const result = await saleService.createSale(saleInput);
      setCompletedSale(result);

      // Backend now handles repair status updates automatically via transaction
      // AUTOMATION: Update Repair Status if linked - REMOVED (Handled by backend)

      setShowConfirmation(true);
    } catch (error) {
      console.error("Payment failed", error);
      alert("Erreur lors du traitement du paiement");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrint = () => {
    // Determine data source (completed sale or current transaction)
    const printTransactionNumber = completedSale?.numeroVente || "PERCU-" + Date.now().toString().slice(-6);
    const printDate = completedSale?.created_at || new Date().toISOString();

    const invoiceHtml = generateInvoiceHtml({
      shopSettings,
      items: calculatedItems,
      totals: {
        subtotal: totals.subtotal,
        tps: totals.tps,
        tvq: totals.tvq,
        total: totals.total
      },
      paymentMethod,
      customer,
      transactionNumber: printTransactionNumber,
      date: printDate,
      linkedRepair
    });

    // Create a hidden iframe for printing
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    // Write content to iframe
    const iframeDoc = iframe.contentWindow?.document;
    if (iframeDoc) {
      iframeDoc.open();
      iframeDoc.write(invoiceHtml);
      iframeDoc.close();

      // Wait for content to load then print
      // Note: The invoice HTML already has window.onload = print()
      // But we can add a fallback or listener here if needed.
      // Since the HTML has the script, it should auto-print the iframe context.

      // Cleanup after print (optional, but good practice to remove DOM elements)
      // Browsers handle print blocking differently, so we might leave it or use a timeout.
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    }
  };

  const handleCloseConfirmation = () => {
    setShowConfirmation(false);
    onNavigate('dashboard');
  };

  const getPaymentMethodLabel = (method: PaymentMethod) => {
    return paymentMethods.find(m => m.id === method)?.label || method;
  };

  if (!transaction) {
    return (
      <div className="p-6 text-center">
        <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900">Aucune transaction en cours</h2>
        <Button onClick={() => onNavigate('pos')} className="mt-4">Retour au POS</Button>
      </div>
    )
  }

  return (
    <>
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate('pos')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Paiement et facturation</h2>
            <p className="text-gray-500">Finaliser la transaction</p>
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

              {/* Customer & Transaction Info */}
              <div className="py-6 border-b border-gray-200 grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Client</p>
                  <p className="text-gray-900">{customer ? `${customer.prenom} ${customer.nom}` : 'Client de passage'}</p>
                  {customer && <p className="text-sm text-gray-600">{customer.telephone}</p>}
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Date</p>
                  <p className="text-gray-900">{new Date().toLocaleDateString('fr-CA')}</p>
                  {/* <p className="text-sm text-gray-600">VTE-2024-006</p> */}
                </div>
              </div>

              {/* Items */}
              <div className="py-6 border-b border-gray-200">
                <table className="w-full">
                  <thead>
                    <tr className="text-left">
                      <th className="pb-2 text-sm text-gray-500">Description</th>
                      <th className="pb-2 text-sm text-gray-500 text-center">Qté</th>
                      <th className="pb-2 text-sm text-gray-500 text-right">Prix unit.</th>
                      <th className="pb-2 text-sm text-gray-500 text-right">Montant</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calculatedItems.map((item: any, index: number) => (
                      <tr key={index}>
                        <td className="py-2">
                          <p className="text-gray-900">{item.nom}</p>
                          {item.type === 'repair' && <Badge className="text-xs ml-2">Réparation</Badge>}
                        </td>
                        <td className="py-2 text-center text-gray-900">{item.quantite}</td>
                        <td className="py-2 text-right text-gray-900">{item.prix.toFixed(2)} $</td>
                        <td className="py-2 text-right text-gray-900">
                          {(item.prix * item.quantite).toFixed(2)} $
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="pt-6 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Prix avant taxes</span>
                  <span className="text-gray-900 font-semibold">{totals.subtotal.toFixed(2)} $</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">TPS ({shopSettings.tps}%)</span>
                  <span className="text-gray-900 font-semibold">{totals.tps.toFixed(2)} $</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">TVQ ({shopSettings.tvq}%)</span>
                  <span className="text-gray-900 font-semibold">{totals.tvq.toFixed(2)} $</span>
                </div>
                <div className="pt-3 border-t-2 border-gray-300 flex justify-between items-center">
                  <span className="text-xl font-bold text-gray-900">Total</span>
                  <span className="text-3xl font-bold text-blue-600">{totals.total.toFixed(2)} $</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Payment Options */}
          <div className="space-y-6">
            {/* Tax Toggle */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Options de facturation</h3>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <Label htmlFor="tax-toggle" className="cursor-pointer text-gray-700">
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
                          ? 'border-blue-600 bg-blue-50 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
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
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </Card>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                onClick={handleConfirmPayment}
                disabled={isProcessing}
                className="w-full bg-green-600 hover:bg-green-700 h-14 text-lg font-semibold"
              >
                {isProcessing ? 'Traitement...' : 'Confirmer le paiement'}
              </Button>
              <Button
                onClick={handlePrint}
                variant="outline"
                className="w-full h-12 gap-2"
              >
                <Printer className="w-4 h-4" />
                Imprimer la facture
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => onNavigate('pos')}
              >
                Annuler
              </Button>
            </div>

            {/* Payment Summary */}
            <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">À payer</span>
                  <span className="font-bold text-blue-900 text-lg">{totals.total.toFixed(2)} $</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Méthode</span>
                  <span className="font-semibold text-gray-900">
                    {getPaymentMethodLabel(paymentMethod)}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <PaymentConfirmationModal
        isOpen={showConfirmation}
        onClose={handleCloseConfirmation}
        transactionNumber={completedSale?.numeroVente || "VTE-XXXX"}
        amount={totals.total}
        paymentMethod={getPaymentMethodLabel(paymentMethod)}
        onPrint={handlePrint}
      />
    </>
  );
}
