// Types for Dr.Phone Manager

export type RepairStatus = 'reçue' | 'en_cours' | 'en_attente_pieces' | 'réparée' | 'payée_collectée' | 'annulé';

export type PaymentStatus = 'payé' | 'non_payé' | 'partiel';

export interface Customer {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  adresse?: string;
  dateCreation: string;
}

export type Client = Customer;

export interface Product {
  id: string;
  nom: string;
  codeBarres: string;
  quantite: number;
  prixAchat: number;
  prixVente: number;
  alerteStock: number;
  categorie: string;
  section?: 'Pièces' | 'Accessoires';
  quality?: string;
}

export interface Repair {
  id: string;
  numeroTicket: string;
  clientId: string;
  clientNom: string;
  clientTelephone?: string; // Added client phone number
  clientEmail?: string; // Added client email
  modelePhone: string;
  typeReparation: string;
  remarque?: string; // Added remark field
  description?: string;
  statut: RepairStatus;
  prix: number;
  depot: number;
  piecesUtilisees: string[];
  parts?: number[];
  device_details?: string;
  garantie: number;
  dateCreation: string;
  dateTermine?: string;
  technicien?: string;
}

export interface Sale {
  id: string;
  date: string;
  montant: number;
  profit: number;
  type: 'reparation' | 'vente_produit';
  itemId: string;
}

export interface DailyStat {
  date: string;
  ventes: number;
  profits: number;
  reparations: number;
}

export type PaymentMethod = 'comptant' | 'debit' | 'credit' | 'virement';

export interface Invoice {
  repairId: string;
  sousTotal: number;
  tps: number;
  tvq: number;
  total: number;
  methodePaiement?: PaymentMethod;
  taxesIncluses: boolean;
}

export interface ShopSettings {
  nom: string;
  adresse: string;
  telephone: string;
  email: string;
  tps: number;
  tvq: number;
  langue: 'fr' | 'en';
  logoUrl?: string;
}

export interface CartItem {
  productId: string;
  nom: string;
  prix: number;
  quantite: number;
  categorie: string;
  type?: 'product' | 'repair' | 'manual' | 'phone'; // Added 'phone'
  repairId?: string; // NEW: Link to repair if applicable
  priceModified?: boolean; // NEW: Flag to indicate if price was manually changed
  originalPrice?: number; // NEW: Store original price if modified
}

export interface POSTransaction {
  id: string;
  numeroVente: string;
  date: string;
  items: CartItem[];
  sousTotal: number;
  tps: number;
  tvq: number;
  total: number;
  methodePaiement: PaymentMethod;
  clientId?: string;
  clientNom?: string;
  clientEmail?: string;
  clientPhone?: string;
  taxesIncluses: boolean;
  statut: PaymentStatus;
}

export interface RepairWithPayment extends Repair {
  montantPaye: number;
  montantRestant: number;
  statutPaiement: PaymentStatus;
}

export interface TransactionData {
  items: CartItem[];
  subtotal: number;
  tps: number;
  tvq: number;
  total: number;
  customer?: Customer | null;
  linkedRepair?: Repair | null; // For paying repairs
}

export type Screen =
  | 'login'
  | 'dashboard'
  | 'inventory'
  | 'customers'
  | 'repairs'
  | 'new-repair'
  | 'payment'
  | 'pos'
  | 'sales-history'
  | 'sales-history'
  | 'reports'
  | 'phones'
  | 'buy-phone'
  | 'settings';

export interface User {
  id: string;
  username: string; // NEW
  password?: string; // NEW
  name: string;
  email?: string;
  role: 'Admin' | 'Manager' | 'Technicien' | 'Vendeur';
  statut: 'Actif' | 'Inactif';
}

export interface Phone {
  id: string;
  imei: string;
  brand: string;
  model: string;
  storage: string;
  color: string;
  condition: 'A' | 'B' | 'C';
  battery_health: number;
  buying_price: number;
  selling_price: number;
  warranty_days: number;
  status: 'in_stock' | 'sold' | 'returned';
  source: 'customer' | 'supplier';
  created_at?: string;
}