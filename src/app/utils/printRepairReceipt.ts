
import { Repair } from "../types";

export const printRepairReceipt = (repair: Repair) => {
  // Create a hidden iframe
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const shopInfo = {
    name: "Dr. Phone",
    address: "123 Main St, Campbellton, NB",
    phone: "(506) 555-0123",
    email: "info@drphone.ca",
    website: "www.drphone.ca"
  };

  const balanceDue = (repair.prix - repair.depot).toFixed(2);
  const dateStr = new Date(repair.dateCreation).toLocaleDateString('fr-CA', {
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
  });

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Reçu - ${repair.numeroTicket}</title>
        <style>
          @page {
            size: 80mm auto; /* 80mm thermal paper */
            margin: 0;
          }
          body {
            width: 80mm;
            margin: 0;
            padding: 5mm;
            box-sizing: border-box;
            font-family: 'Courier New', Courier, monospace; /* Monospace checks out for receipts */
            font-size: 12px;
            color: black;
            background: white;
          }
          .header {
            text-align: center;
            margin-bottom: 5mm;
          }
          .shop-name {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 2px;
            text-transform: uppercase;
          }
          .shop-info {
            font-size: 10px;
            line-height: 1.2;
          }
          .divider {
            border-top: 1px dashed black;
            margin: 3mm 0;
          }
          .section-title {
            font-weight: bold;
            font-size: 12px;
            margin-top: 2mm;
            margin-bottom: 1mm;
            text-transform: uppercase;
            border-bottom: 1px solid black;
            display: inline-block;
          }
          .row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 1mm;
          }
          .label {
            font-weight: bold;
          }
          .ticket-num {
            text-align: center;
            font-size: 18px;
            font-weight: bold;
            margin: 3mm 0;
            border: 2px solid black;
            padding: 2px;
          }
          .total-row {
            font-weight: bold;
            font-size: 14px;
            margin-top: 2mm;
            border-top: 1px solid black;
            padding-top: 1mm;
          }
          .footer {
            text-align: center;
            font-size: 10px;
            margin-top: 5mm;
            line-height: 1.2;
          }
          .terms {
            font-size: 9px;
            text-align: justify;
            margin-top: 3mm;
          }
          @media print {
            body { 
               width: 80mm;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="shop-name">${shopInfo.name}</div>
          <div class="shop-info">
            ${shopInfo.address}<br>
            ${shopInfo.phone}<br>
            ${shopInfo.email}
          </div>
        </div>

        <div class="divider"></div>

        <div style="text-align: center;">Reçu de Réparation</div>
        <div style="text-align: center; font-size: 10px;">${dateStr}</div>

        <div class="ticket-num">${repair.numeroTicket}</div>

        <div>
            <div class="section-title">CLIENT</div>
            <div class="row">
                <span>${repair.clientNom}</span>
            </div>
            <div class="row">
                <span>${repair.clientTelephone || ''}</span>
            </div>
            ${repair.clientEmail ? `<div class="row" style="font-size: 10px;"><span>${repair.clientEmail}</span></div>` : ''}
        </div>

        <div>
            <div class="section-title">APPAREIL</div>
            <div class="row">
                <span class="label">Modèle:</span>
                <span>${repair.modelePhone}</span>
            </div>
            <div class="row">
                <span class="label">Type:</span>
                <span>${repair.typeReparation}</span>
            </div>
             <div class="row">
                <span class="label">Garantie:</span>
                <span>${repair.garantie} Jours</span>
            </div>
        </div>

        ${repair.description ? `
        <div>
            <div class="section-title">PROBLEME</div>
            <div style="font-size: 11px;">${repair.description}</div>
        </div>
        ` : ''}



        <div class="divider"></div>

        <div class="row">
            <span>Sous-total estimé:</span>
            <span>${repair.prix.toFixed(2)}$</span>
        </div>
        <div class="row">
            <span>Dépôt:</span>
            <span>${repair.depot.toFixed(2)}$</span>
        </div>
        <div class="row total-row">
            <span>Reste à payer:</span>
            <span>${balanceDue}$</span>
        </div>

        <div class="divider"></div>

        <div class="footer">
            Merci de votre confiance!<br>
            <br>
            <div class="terms">
                <strong>CONDITIONS:</strong> Les appareils laissés plus de 60 jours après avis de réparation seront recyclés. La garantie couvre uniquement la pièce remplacée et la main-d'œuvre associée. Pas de garantie sur les dommages liquides ou physiques ultérieurs.
            </div>
            <br>
            <div style="font-family: 'BS-Code39', 'Libre Barcode 39', sans-serif; font-size: 30px;">
                *${repair.numeroTicket}*
            </div>
        </div>

        <script>
          window.onload = () => {
            window.print();
          };
        </script>
      </body>
    </html>
  `;

  const doc = iframe.contentWindow?.document;
  if (doc) {
    doc.open();
    doc.write(htmlContent);
    doc.close();

    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 2000);
  }
};
