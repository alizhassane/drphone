import { ShopSettings, CartItem, PaymentMethod, Customer } from '../app/types';

interface InvoiceData {
    shopSettings: ShopSettings;
    items: CartItem[];
    totals: {
        subtotal: number;
        tps: number;
        tvq: number;
        total: number;
    };
    paymentMethod: PaymentMethod;
    customer?: Customer | null | undefined; // Allow undefined to match TransactionData
    transactionNumber: string;
    date: string;
    linkedRepair?: { garantie: number } | null;
}

export const generateInvoiceHtml = (data: InvoiceData): string => {
    const { shopSettings, items, totals, paymentMethod, customer, transactionNumber, date, linkedRepair } = data;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format(amount);
    };

    const paymentMethodLabel = {
        comptant: 'Comptant',
        debit: 'Débit',
        credit: 'Crédit',
        virement: 'Virement'
    }[paymentMethod] || paymentMethod;

    return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <title>Facture #${transactionNumber}</title>
        <style>
            body {
                font-family: 'Courier New', Courier, monospace; /* Monospace is better for receipts */
                color: #000;
                line-height: 1.2;
                font-size: 12px;
                margin: 0;
                padding: 10px;
                width: 80mm; /* Target width */
            }
            .invoice-box {
                width: 100%;
                margin: 0;
                border: none;
                padding: 0;
                box-shadow: none;
            }
            .header {
                display: flex;
                flex-direction: column; /* Stacked header */
                align-items: center;
                text-align: center;
                margin-bottom: 20px;
                border-bottom: 1px dashed #000;
                padding-bottom: 15px;
            }
            .shop-info h1 {
                margin: 0;
                font-size: 16px;
                font-weight: bold;
                color: #000;
            }
            .shop-info p {
                margin: 2px 0;
                color: #000;
                font-size: 11px;
            }
            .invoice-details {
                text-align: center;
                margin-top: 10px;
            }
            .invoice-details h2 {
                margin: 0;
                font-size: 14px;
                border-bottom: none;
            }
            .client-section {
                margin-bottom: 20px;
                border-bottom: 1px dashed #000;
                padding-bottom: 10px;
            }
            .client-section h3 {
                font-size: 12px;
                margin: 0 0 5px;
                border: none;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
            }
            th {
                text-align: left;
                padding: 5px 0;
                border-bottom: 1px dashed #000;
                font-size: 11px;
            }
            td {
                padding: 5px 0;
                border-bottom: none;
                font-size: 11px;
                vertical-align: top;
            }
            .item-name {
                display: block;
                font-weight: bold;
            }
            .totals {
                width: 100%;
                margin: 0;
                border-top: 1px dashed #000;
                padding-top: 10px;
            }
            .totals-row {
                display: flex;
                justify-content: space-between;
                padding: 2px 0;
                font-size: 12px;
            }
            .totals-row.final {
                font-weight: bold;
                font-size: 14px;
                border-top: 1px dashed #000;
                padding-top: 5px;
                margin-top: 5px;
            }
            .footer {
                margin-top: 20px;
                text-align: center;
                color: #000;
                font-size: 10px;
                border-top: 1px dashed #000;
                padding-top: 10px;
            }
            @media print {
                @page { 
                    size: 80mm auto; /* 80mm width, auto height */
                    margin: 0;
                }
                body { 
                    width: 76mm; /* slightly less than 80 to avoid clipping */
                    margin: 0 auto;
                    padding: 2mm;
                }
                .invoice-box {
                    width: 100%;
                }
            }
        </style>
    </head>
    <body>
        <div class="invoice-box">
            <div class="header">
                <div class="shop-info">
                    ${shopSettings.logoUrl ? `<img src="${shopSettings.logoUrl}" alt="Logo" style="max-width: 90%; max-height: 200px; width: auto; margin: 0 auto 15px auto; display: block;">` : ''}
                    <h1>${shopSettings.nom}</h1>
                    <p>${shopSettings.adresse}</p>
                    <p>Tél: ${shopSettings.telephone}</p>
                    <p>Email: ${shopSettings.email}</p>
                </div>
                <div class="invoice-details">
                    <h2>Facture</h2>
                    <p>#${transactionNumber}</p>
                    <p>Date: ${new Date(date).toLocaleDateString('fr-CA')}</p>
                </div>
            </div>

            <div class="client-section">
                <h3>Facturé à:</h3>
                <p><strong>${customer ? `${customer.prenom} ${customer.nom}` : 'Client de passage'}</strong></p>
                ${customer?.telephone ? `<p>${customer.telephone}</p>` : ''}
                ${customer?.email ? `<p>${customer.email}</p>` : ''}
                ${customer?.adresse ? `<p>${customer.adresse}</p>` : ''}
            </div>

            <table>
                <thead>
                    <tr>
                        <th style="width: 50%">Item</th>
                        <th class="text-right" style="width: 15%">Qté</th>
                        <th class="text-right" style="width: 35%">Prix</th>
                    </tr>
                </thead>
                <tbody>
                    ${items.map(item => `
                        <tr>
                            <td colspan="3" style="padding-bottom: 0;">
                                <span class="item-name">${item.nom}</span>
                                ${item.type === 'repair' ? '<small style="font-style:italic;">(Réparation)</small>' : ''}
                            </td>
                        </tr>
                        <tr>
                            <td style="padding-top: 0;"></td>
                            <td class="text-right">${item.quantite}</td>
                            <td class="text-right">${formatCurrency(item.prix * item.quantite)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <div class="totals">
                <div class="totals-row">
                    <span>Sous-total:</span>
                    <span>${formatCurrency(totals.subtotal)}</span>
                </div>
                <div class="totals-row">
                    <span>TPS (${shopSettings.tps}%):</span>
                    <span>${formatCurrency(totals.tps)}</span>
                </div>
                <div class="totals-row">
                    <span>TVQ (${shopSettings.tvq}%):</span>
                    <span>${formatCurrency(totals.tvq)}</span>
                </div>
                <div class="totals-row final">
                    <span>Total:</span>
                    <span>${formatCurrency(totals.total)}</span>
                </div>
                <div class="totals-row" style="margin-top: 10px; color: #666; font-size: 12px;">
                    <span>Méthode:</span>
                    <span>${paymentMethodLabel}</span>
                </div>
            </div>

            <div class="footer">
                <p>Merci de votre confiance!</p>
                <p>Veuillez conserver cette facture pour votre garantie.</p>
                ${linkedRepair ? `
                <div style="margin-top: 15px; text-align: left; border-top: 1px dashed #000; padding-top: 10px;">
                    <p style="font-weight: bold; margin-bottom: 5px;">Conditions de Garantie:</p>
                    <p style="text-align: justify; font-size: 10px;">
                        Ce service inclut une garantie limitée de <strong>${linkedRepair.garantie} jours</strong> sur les pièces remplacées et la main-d'œuvre associée, à compter de la date de cette facture.
                    </p>
                    <p style="text-align: justify; font-size: 10px; margin-top: 5px;">
                        Cette garantie ne couvre pas les dommages causés par des liquides, les dommages physiques (bris, fissures), les modifications logicielles, ou toute intervention par un tiers.
                    </p>
                </div>
                ` : ''}
            </div>
        </div>
        <script>
            window.onload = function() { window.print(); }
        </script>
    </body>
    </html>
    `;
};
