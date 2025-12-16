// Mock data for Dr.Phone Manager
import type { Customer, Product, Repair, Sale, DailyStat, ShopSettings, POSTransaction, User } from './types';

export const mockCustomers: Customer[] = [
  {
    id: '1',
    nom: 'Tremblay',
    prenom: 'Jean',
    telephone: '514-555-0101',
    email: 'jean.tremblay@email.com',
    adresse: '123 Rue Saint-Denis, Montréal, QC',
    dateCreation: '2024-01-15'
  },
  {
    id: '2',
    nom: 'Gagnon',
    prenom: 'Marie',
    telephone: '438-555-0202',
    email: 'marie.gagnon@email.com',
    adresse: '456 Boulevard René-Lévesque, Québec, QC',
    dateCreation: '2024-02-20'
  },
  {
    id: '3',
    nom: 'Roy',
    prenom: 'Pierre',
    telephone: '450-555-0303',
    email: 'pierre.roy@email.com',
    dateCreation: '2024-03-10'
  },
  {
    id: '4',
    nom: 'Côté',
    prenom: 'Sophie',
    telephone: '514-555-0404',
    email: 'sophie.cote@email.com',
    adresse: '789 Avenue du Parc, Montréal, QC',
    dateCreation: '2024-04-05'
  },
  {
    id: '5',
    nom: 'Bouchard',
    prenom: 'Luc',
    telephone: '418-555-0505',
    email: 'luc.bouchard@email.com',
    dateCreation: '2024-05-12'
  },
];

export const mockProducts: Product[] = [
  {
    id: '1',
    nom: 'Écran iPhone 13',
    codeBarres: '8901234567890',
    quantite: 12,
    prixAchat: 45.00,
    prixVente: 89.99,
    alerteStock: 5,
    categorie: 'Écrans'
  },
  {
    id: '2',
    nom: 'Batterie Samsung Galaxy S21',
    codeBarres: '8901234567891',
    quantite: 3,
    prixAchat: 25.00,
    prixVente: 54.99,
    alerteStock: 5,
    categorie: 'Batteries'
  },
  {
    id: '3',
    nom: 'Vitre de protection',
    codeBarres: '8901234567892',
    quantite: 45,
    prixAchat: 2.50,
    prixVente: 9.99,
    alerteStock: 10,
    categorie: 'Accessoires'
  },
  {
    id: '4',
    nom: 'Écran iPhone 14 Pro',
    codeBarres: '8901234567893',
    quantite: 8,
    prixAchat: 65.00,
    prixVente: 129.99,
    alerteStock: 5,
    categorie: 'Écrans'
  },
  {
    id: '5',
    nom: 'Câble USB-C',
    codeBarres: '8901234567894',
    quantite: 2,
    prixAchat: 3.00,
    prixVente: 12.99,
    alerteStock: 10,
    categorie: 'Câbles'
  },
  {
    id: '6',
    nom: 'Batterie iPhone 12',
    codeBarres: '8901234567895',
    quantite: 15,
    prixAchat: 22.00,
    prixVente: 49.99,
    alerteStock: 5,
    categorie: 'Batteries'
  },
  {
    id: '7',
    nom: 'Étui de protection',
    codeBarres: '8901234567896',
    quantite: 1,
    prixAchat: 5.00,
    prixVente: 19.99,
    alerteStock: 10,
    categorie: 'Coques'
  },
  {
    id: '8',
    nom: 'Chargeur rapide USB-C 20W',
    codeBarres: '8901234567897',
    quantite: 25,
    prixAchat: 8.00,
    prixVente: 24.99,
    alerteStock: 10,
    categorie: 'Chargeurs'
  },
  {
    id: '9',
    nom: 'Câble Lightning 1m',
    codeBarres: '8901234567898',
    quantite: 30,
    prixAchat: 4.00,
    prixVente: 14.99,
    alerteStock: 15,
    categorie: 'Câbles'
  },
  {
    id: '10',
    nom: 'Coque silicone iPhone 13',
    codeBarres: '8901234567899',
    quantite: 18,
    prixAchat: 3.50,
    prixVente: 12.99,
    alerteStock: 10,
    categorie: 'Coques'
  },
  {
    id: '11',
    nom: 'Nettoyage téléphone',
    codeBarres: '8901234567900',
    quantite: 999,
    prixAchat: 0.00,
    prixVente: 9.99,
    alerteStock: 0,
    categorie: 'Services'
  },
  {
    id: '12',
    nom: 'Installation vitre protection',
    codeBarres: '8901234567901',
    quantite: 999,
    prixAchat: 0.00,
    prixVente: 5.00,
    alerteStock: 0,
    categorie: 'Services'
  },
];

export const mockRepairs: Repair[] = [
  {
    id: '1',
    numeroTicket: 'TKT-2024-001',
    clientId: '1',
    clientNom: 'Jean Tremblay',
    modelePhone: 'iPhone 13',
    typeReparation: 'Remplacement écran',
    description: 'Écran fissuré suite à une chute',
    statut: 'réparée',
    prix: 89.99,
    depot: 20.00,
    piecesUtilisees: ['Écran iPhone 13'],
    garantie: 90,
    dateCreation: '2024-12-10',
    dateTermine: '2024-12-11',
    technicien: 'Marc L.'
  },
  {
    id: '2',
    numeroTicket: 'TKT-2024-002',
    clientId: '2',
    clientNom: 'Marie Gagnon',
    modelePhone: 'Samsung Galaxy S21',
    typeReparation: 'Remplacement batterie',
    description: 'Batterie se décharge rapidement',
    statut: 'en_cours',
    prix: 54.99,
    depot: 10.00,
    piecesUtilisees: ['Batterie Samsung Galaxy S21'],
    garantie: 60,
    dateCreation: '2024-12-14',
    technicien: 'Sophie D.'
  },
  {
    id: '3',
    numeroTicket: 'TKT-2024-003',
    clientId: '3',
    clientNom: 'Pierre Roy',
    modelePhone: 'iPhone 14 Pro',
    typeReparation: 'Remplacement écran',
    description: 'Écran ne répond plus au toucher',
    statut: 'en_attente_pieces',
    prix: 129.99,
    depot: 30.00,
    piecesUtilisees: ['Écran iPhone 14 Pro'],
    garantie: 90,
    dateCreation: '2024-12-15',
  },
  {
    id: '4',
    numeroTicket: 'TKT-2024-004',
    clientId: '4',
    clientNom: 'Sophie Côté',
    modelePhone: 'iPhone 12',
    typeReparation: 'Remplacement batterie',
    description: 'Batterie gonflée',
    statut: 'payée_collectée',
    prix: 49.99,
    depot: 49.99,
    piecesUtilisees: ['Batterie iPhone 12'],
    garantie: 60,
    dateCreation: '2024-12-08',
    dateTermine: '2024-12-09',
    technicien: 'Marc L.'
  },
  {
    id: '5',
    numeroTicket: 'TKT-2024-005',
    clientId: '5',
    clientNom: 'Luc Bouchard',
    modelePhone: 'iPhone 13',
    typeReparation: 'Réparation port de charge',
    description: 'Le téléphone ne charge plus',
    statut: 'reçue',
    prix: 39.99,
    depot: 0.00,
    piecesUtilisees: [],
    garantie: 30,
    dateCreation: '2024-12-14',
    technicien: 'Sophie D.'
  },
];

export const mockSales: Sale[] = [
  {
    id: '1',
    date: '2024-12-15',
    montant: 89.99,
    profit: 44.99,
    type: 'reparation',
    itemId: '1'
  },
  {
    id: '2',
    date: '2024-12-15',
    montant: 54.99,
    profit: 29.99,
    type: 'reparation',
    itemId: '2'
  },
  {
    id: '3',
    date: '2024-12-14',
    montant: 129.99,
    profit: 64.99,
    type: 'reparation',
    itemId: '3'
  },
  {
    id: '4',
    date: '2024-12-14',
    montant: 49.99,
    profit: 27.99,
    type: 'reparation',
    itemId: '4'
  },
  {
    id: '5',
    date: '2024-12-13',
    montant: 39.99,
    profit: 39.99,
    type: 'reparation',
    itemId: '5'
  },
];

export const mockDailyStats: DailyStat[] = [
  { date: '2024-12-01', ventes: 234.50, profits: 120.30, reparations: 3 },
  { date: '2024-12-02', ventes: 189.99, profits: 95.50, reparations: 2 },
  { date: '2024-12-03', ventes: 345.75, profits: 178.40, reparations: 4 },
  { date: '2024-12-04', ventes: 298.50, profits: 145.20, reparations: 3 },
  { date: '2024-12-05', ventes: 412.99, profits: 215.60, reparations: 5 },
  { date: '2024-12-06', ventes: 156.80, profits: 78.90, reparations: 2 },
  { date: '2024-12-07', ventes: 267.45, profits: 138.20, reparations: 3 },
  { date: '2024-12-08', ventes: 389.99, profits: 198.50, reparations: 4 },
  { date: '2024-12-09', ventes: 478.25, profits: 245.70, reparations: 6 },
  { date: '2024-12-10', ventes: 234.99, profits: 118.40, reparations: 3 },
  { date: '2024-12-11', ventes: 356.80, profits: 184.30, reparations: 4 },
  { date: '2024-12-12', ventes: 289.50, profits: 142.80, reparations: 3 },
  { date: '2024-12-13', ventes: 398.75, profits: 203.90, reparations: 5 },
  { date: '2024-12-14', ventes: 456.99, profits: 234.50, reparations: 5 },
  { date: '2024-12-15', ventes: 144.98, profits: 74.98, reparations: 2 },
];

export const mockShopSettings: ShopSettings = {
  nom: 'Dr.Phone Manager - Montréal',
  adresse: '1234 Rue Sainte-Catherine, Montréal, QC H3B 1A1',
  telephone: '514-555-1234',
  email: 'info@drphone.ca',
  tps: 5,
  tvq: 9.975,
  langue: 'fr'
};

export const mockUsers: User[] = [
  {
    id: '1',
    nom: 'Administrateur',
    email: 'admin@drphone.ca',
    role: 'Admin',
    statut: 'Actif'
  },
  {
    id: '2',
    nom: 'Marc Leblanc',
    email: 'marc.l@drphone.ca',
    role: 'Technicien',
    statut: 'Actif'
  },
  {
    id: '3',
    nom: 'Sophie Dubois',
    email: 'sophie.d@drphone.ca',
    role: 'Technicien',
    statut: 'Actif'
  }
];

export const mockPOSTransactions: POSTransaction[] = [
  {
    id: '1',
    numeroVente: 'VTE-2024-001',
    date: '2024-12-15T10:30:00',
    items: [
      { productId: '3', nom: 'Vitre de protection', prix: 9.99, quantite: 2, categorie: 'Accessoires' },
      { productId: '9', nom: 'Câble Lightning 1m', prix: 14.99, quantite: 1, categorie: 'Câbles' }
    ],
    sousTotal: 34.97,
    tps: 1.75,
    tvq: 3.49,
    total: 40.21,
    methodePaiement: 'debit',
    clientNom: 'Jean Tremblay',
    clientId: '1',
    taxesIncluses: false,
    statut: 'payé'
  },
  {
    id: '2',
    numeroVente: 'VTE-2024-002',
    date: '2024-12-15T14:15:00',
    items: [
      { productId: '8', nom: 'Chargeur rapide USB-C 20W', prix: 24.99, quantite: 1, categorie: 'Chargeurs' },
      { productId: '10', nom: 'Coque silicone iPhone 13', prix: 12.99, quantite: 1, categorie: 'Coques' }
    ],
    sousTotal: 37.98,
    tps: 1.90,
    tvq: 3.79,
    total: 43.67,
    methodePaiement: 'comptant',
    taxesIncluses: false,
    statut: 'payé'
  },
  {
    id: '3',
    numeroVente: 'VTE-2024-003',
    date: '2024-12-14T16:45:00',
    items: [
      { productId: '11', nom: 'Nettoyage téléphone', prix: 9.99, quantite: 1, categorie: 'Services' },
      { productId: '3', nom: 'Vitre de protection', prix: 9.99, quantite: 1, categorie: 'Accessoires' },
      { productId: '12', nom: 'Installation vitre protection', prix: 5.00, quantite: 1, categorie: 'Services' }
    ],
    sousTotal: 24.98,
    tps: 1.25,
    tvq: 2.49,
    total: 28.72,
    methodePaiement: 'credit',
    clientNom: 'Marie Gagnon',
    clientId: '2',
    taxesIncluses: false,
    statut: 'payé'
  },
  {
    id: '4',
    numeroVente: 'VTE-2024-004',
    date: '2024-12-14T11:20:00',
    items: [
      { productId: '9', nom: 'Câble Lightning 1m', prix: 14.99, quantite: 3, categorie: 'Câbles' }
    ],
    sousTotal: 44.97,
    tps: 2.25,
    tvq: 4.49,
    total: 51.71,
    methodePaiement: 'debit',
    taxesIncluses: false,
    statut: 'payé'
  },
  {
    id: '5',
    numeroVente: 'VTE-2024-005',
    date: '2024-12-13T09:30:00',
    items: [
      { productId: '7', nom: 'Étui de protection', prix: 19.99, quantite: 2, categorie: 'Coques' }
    ],
    sousTotal: 39.98,
    tps: 2.00,
    tvq: 3.99,
    total: 45.97,
    methodePaiement: 'comptant',
    taxesIncluses: false,
    statut: 'payé'
  },
];