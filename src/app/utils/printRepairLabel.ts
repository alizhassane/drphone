
import { Repair } from "../types";

export const printRepairLabel = (repair: Repair) => {
  // Create a hidden iframe
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Étiquette Réparation - ${repair.numeroTicket}</title>
        <style>
          @page {
            size: 89mm 28mm; /* Standard Address Label Landscape */
            margin: 0;
          }
          body {
            width: 89mm;
            height: 28mm;
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', Arial, sans-serif;
            font-size: 10px;
            display: flex;
            flex-direction: column;
            background: white;
          }
          .header {
            background-color: black;
            color: white;
            padding: 2px 4px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            height: 4mm;
          }
          .header-title {
            font-weight: 800;
            font-size: 10px;
            letter-spacing: 0.5px;
          }
          .ticket-id {
            font-weight: 800;
            font-size: 12px;
          }
          
          .content {
            flex: 1;
            padding: 2px 4px;
            display: flex;
            flex-direction: column;
            justify-content: space-evenly;
            overflow: hidden;
          }
          
          .info-row {
            display: grid;
            grid-template-columns: 60px 1fr;
            align-items: baseline;
            line-height: 1.1;
          }
          
          .label {
            font-weight: 700;
            font-size: 9px;
            color: #000;
            text-transform: uppercase;
          }
          
          .value {
            font-weight: 500;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            font-size: 10px;
          }

          .parts-value {
             font-size: 9px;
             font-style: italic;
          }

          .footer {
            border-top: 1px dashed #000;
            margin: 0 4px 2px 4px;
            padding-top: 1px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-weight: 700;
            font-size: 10px;
            height: 4mm;
          }
          
          @media print {
            body {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <span class="header-title">REPARATION</span>
          <span class="ticket-id">${repair.numeroTicket}</span>
        </div>
        
        <div class="content">
          <div class="info-row">
            <span class="label">CLIENT</span>
            <span class="value">${repair.clientNom} ${repair.clientTelephone || ''}</span>
          </div>
          <div class="info-row">
            <span class="label">APPAREIL</span>
            <span class="value">${repair.modelePhone}</span>
          </div>
          ${repair.remarque ? `
          <div class="info-row">
            <span class="label">REMARQUE</span>
            <span class="value" style="white-space: normal; line-height: 1; font-size: 9px;">${repair.remarque}</span>
          </div>` : ''}
           <div class="info-row">
            <span class="label">PIECES</span>
            <span class="value parts-value">${repair.piecesUtilisees?.join(', ') || '-'}</span>
          </div>
        </div>

        <div class="footer">
          <span>${new Date(repair.dateCreation).toLocaleDateString()}</span>
          <span>${repair.prix.toFixed(2)}$</span>
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

    // Clean up iframe after printing (give it time to start printing)
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 2000); // 2 seconds delay to ensure print dialog opens
  } else {
    console.error("Failed to access iframe document");
  }
};
