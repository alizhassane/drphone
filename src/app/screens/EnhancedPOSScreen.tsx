import { useState } from 'react';
import { Search, Barcode, Plus, Minus, Trash2, ShoppingCart, AlertCircle, User, Ticket, Edit2, FileText } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { AddManualItemModal } from '../components/modals/AddManualItemModal';
import { EditPriceModal } from '../components/modals/EditPriceModal';
import { AddClientModal } from '../components/modals/AddClientModal';
import type { Product, CartItem, Screen, ShopSettings, Repair, Customer, TransactionData } from '../types';

interface POSScreenProps {
  products: Product[];
  shopSettings: ShopSettings;
  onNavigate: (screen: Screen, data?: TransactionData) => void;
  repairForPayment?: Repair | null;
  customers?: Customer[];
  repairs?: Repair[];
}

export function POSScreen({ products, shopSettings, onNavigate, repairForPayment, customers = [], repairs = [] }: POSScreenProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tous');
  const [cart, setCart] = useState<CartItem[]>(() => {
    // Initialize cart with repair if provided
    if (repairForPayment) {
      const remaining = repairForPayment.prix - repairForPayment.depot;
      return [{
        productId: `repair-${repairForPayment.id}`,
        nom: `Réparation: ${repairForPayment.typeReparation} - ${repairForPayment.modelePhone}`,
        prix: remaining,
        quantite: 1,
        categorie: 'Réparation',
        type: 'repair',
        repairId: repairForPayment.id
      }];
    }
    return [];
  });
  const [taxIncluded, setTaxIncluded] = useState(false);
  const [linkedRepair, setLinkedRepair] = useState<Repair | null>(repairForPayment || null);

  // Initialize client if repair is provided
  const [selectedClient, setSelectedClient] = useState<Customer | null>(() => {
    if (repairForPayment && customers.length > 0) {
      return customers.find(c => c.id === repairForPayment.clientId) || null;
    }
    return null;
  });

  // Modal states
  const [isManualItemModalOpen, setIsManualItemModalOpen] = useState(false);
  const [isPriceEditModalOpen, setIsPriceEditModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CartItem | null>(null);

  // Search states
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [repairSearchTerm, setRepairSearchTerm] = useState('');
  const [showClientSearch, setShowClientSearch] = useState(false);
  const [showRepairSearch, setShowRepairSearch] = useState(false);

  const categories = ['Tous', 'Coques', 'Chargeurs', 'Câbles', 'Services', 'Accessoires', 'Batteries', 'Écrans'];

  const filteredProducts = products.filter(product => {
    const matchesSearch =
      product.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.codeBarres.includes(searchTerm);
    const matchesCategory = selectedCategory === 'Tous' || product.categorie === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredClients = customers.filter(customer =>
    customer.nom.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
    customer.prenom.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
    customer.telephone.includes(clientSearchTerm)
  ).slice(0, 5);

  const filteredRepairs = repairs.filter(repair =>
    repair.numeroTicket.toLowerCase().includes(repairSearchTerm.toLowerCase()) ||
    repair.clientNom.toLowerCase().includes(repairSearchTerm.toLowerCase())
  ).slice(0, 5);

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.productId === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.productId === product.id
          ? { ...item, quantite: item.quantite + 1 }
          : item
      ));
    } else {
      setCart([...cart, {
        productId: product.id,
        nom: product.nom,
        prix: product.prixVente,
        quantite: 1,
        categorie: product.categorie,
        type: 'product'
      }]);
    }
  };

  const addManualItem = (item: { nom: string; prix: number; categorie: string }) => {
    const newItem: CartItem = {
      productId: `manual-${Date.now()}`,
      nom: item.nom,
      prix: item.prix,
      quantite: 1,
      categorie: item.categorie,
      type: 'manual'
    };
    setCart([...cart, newItem]);
  };

  const updateQuantity = (productId: string, change: number) => {
    setCart(cart.map(item =>
      item.productId === productId
        ? { ...item, quantite: Math.max(1, item.quantite + change) }
        : item
    ).filter(item => item.quantite > 0));
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const updateItemPrice = (productId: string, newPrice: number) => {
    setCart(cart.map(item => {
      if (item.productId === productId) {
        return {
          ...item,
          prix: newPrice,
          priceModified: true,
          originalPrice: item.originalPrice || item.prix
        };
      }
      return item;
    }));
  };

  const handleEditPrice = (item: CartItem) => {
    setEditingItem(item);
    setIsPriceEditModalOpen(true);
  };

  const handleSelectClient = (client: Customer) => {
    setSelectedClient(client);
    setShowClientSearch(false);
    setClientSearchTerm('');
  };

  const handleSelectRepair = (repair: Repair) => {
    setLinkedRepair(repair);
    setShowRepairSearch(false);
    setRepairSearchTerm('');

    // Auto-select associated client
    if (repair.clientId) {
      const associatedClient = customers.find(truncate => truncate.id === repair.clientId);
      if (associatedClient) {
        handleSelectClient(associatedClient);
      }
    }

    // Optionally add repair to cart
    const repairInCart = cart.find(item => item.repairId === repair.id);
    if (!repairInCart) {
      const remaining = repair.prix - repair.depot;
      if (remaining > 0) {
        setCart([...cart, {
          productId: `repair-${repair.id}`,
          nom: `Réparation: ${repair.typeReparation} - ${repair.modelePhone}`,
          prix: remaining,
          quantite: 1,
          categorie: 'Réparation',
          type: 'repair',
          repairId: repair.id
        }]);
      }
    }
  };

  const calculateTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + (item.prix * item.quantite), 0);

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

  const totals = calculateTotals();

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('Le panier est vide');
      return;
    }
    // Navigate to checkout with cart data
    const transactionData: TransactionData = {
      items: cart,
      subtotal: totals.subtotal,
      tps: totals.tps,
      tvq: totals.tvq,
      total: totals.total,
      customer: selectedClient,
      linkedRepair: linkedRepair
    };
    onNavigate('payment', transactionData);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header Section - Fixed */}
      <div className="flex-shrink-0 p-4 md:p-6 border-b border-gray-200 bg-white">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Point de vente (POS)</h2>
          <p className="text-gray-500">Vente d'accessoires et de services</p>
        </div>

        {/* Client & Repair Linking */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          {/* Client Search */}
          <div className="relative">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Rechercher un client..."
                  value={clientSearchTerm}
                  onChange={(e) => {
                    setClientSearchTerm(e.target.value);
                    setShowClientSearch(e.target.value.length > 0);
                  }}
                  onFocus={() => clientSearchTerm.length > 0 && setShowClientSearch(true)}
                  className="pl-9 text-sm"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsClientModalOpen(true)}
                className="gap-1"
              >
                <Plus className="w-3 h-3" />
                Nouveau
              </Button>
            </div>
            {selectedClient && (
              <Badge className="mt-2 bg-blue-100 text-blue-800">
                {selectedClient.prenom} {selectedClient.nom} - {selectedClient.telephone}
              </Badge>
            )}
            {/* Client Search Results */}
            {showClientSearch && filteredClients.length > 0 && (
              <Card className="absolute top-full mt-1 w-full z-10 p-2 max-h-48 overflow-y-auto">
                {filteredClients.map((client) => (
                  <button
                    key={client.id}
                    onClick={() => handleSelectClient(client)}
                    className="w-full text-left p-2 hover:bg-gray-100 rounded text-sm"
                  >
                    <p className="font-medium">{client.prenom} {client.nom}</p>
                    <p className="text-xs text-gray-500">{client.telephone}</p>
                  </button>
                ))}
              </Card>
            )}
          </div>

          {/* Repair Search */}
          <div className="relative">
            <div className="relative">
              <Ticket className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Rechercher une réparation..."
                value={repairSearchTerm}
                onChange={(e) => {
                  setRepairSearchTerm(e.target.value);
                  setShowRepairSearch(e.target.value.length > 0);
                }}
                onFocus={() => repairSearchTerm.length > 0 && setShowRepairSearch(true)}
                className="pl-9 text-sm"
              />
            </div>
            {linkedRepair && (
              <Badge className="mt-2 bg-green-100 text-green-800">
                {linkedRepair.numeroTicket} - {linkedRepair.clientNom}
              </Badge>
            )}
            {/* Repair Search Results */}
            {showRepairSearch && filteredRepairs.length > 0 && (
              <Card className="absolute top-full mt-1 w-full z-10 p-2 max-h-48 overflow-y-auto">
                {filteredRepairs.map((repair) => (
                  <button
                    key={repair.id}
                    onClick={() => handleSelectRepair(repair)}
                    className="w-full text-left p-2 hover:bg-gray-100 rounded text-sm"
                  >
                    <p className="font-medium">{repair.numeroTicket}</p>
                    <p className="text-xs text-gray-500">{repair.clientNom} - {repair.typeReparation}</p>
                  </button>
                ))}
              </Card>
            )}
          </div>
        </div>

        {/* Repair Payment Alert */}
        {linkedRepair && (
          <Alert className="border-blue-200 bg-blue-50">
            <AlertCircle className="w-4 h-4 text-blue-600" />
            <AlertDescription className="text-blue-900">
              <strong>Réparation liée:</strong> {linkedRepair.numeroTicket} - {linkedRepair.clientNom}
              <br />
              <span className="text-sm">Montant restant: {(linkedRepair.prix - linkedRepair.depot).toFixed(2)} $</span>
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Main Content Area - Scrollable */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 p-4 md:p-6 pt-4 overflow-hidden min-h-0">
        {/* Products Section */}
        <div className="lg:col-span-2 flex flex-col min-h-0">
          <Card className="flex-1 flex flex-col overflow-hidden min-h-0">
            {/* Search and Categories - Fixed */}
            <div className="flex-shrink-0 p-4 md:p-6 border-b border-gray-200 bg-white">
              <div className="flex gap-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Rechercher par nom ou code-barres..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline" className="gap-2">
                  <Barcode className="w-4 h-4" />
                  Scanner
                </Button>
              </div>

              {/* Categories */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin mb-3">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    onClick={() => setSelectedCategory(category)}
                    className={selectedCategory === category ? 'bg-blue-600' : ''}
                    size="sm"
                  >
                    {category}
                  </Button>
                ))}
              </div>

              {/* Manual Item Button */}
              <Button
                variant="outline"
                className="w-full gap-2 border-dashed border-2"
                onClick={() => setIsManualItemModalOpen(true)}
              >
                <FileText className="w-4 h-4" />
                Produit / Service manuel
              </Button>
            </div>

            {/* Product Grid - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 min-h-0">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className="p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all text-left"
                  >
                    <div className="mb-2">
                      <p className="font-semibold text-gray-900 line-clamp-2">{product.nom}</p>
                      <p className="text-xs text-gray-500 mt-1">{product.categorie}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-bold text-blue-600">{product.prixVente.toFixed(2)} $</p>
                      <Badge variant="outline" className={product.quantite <= product.alerteStock ? 'border-orange-500 text-orange-700' : ''}>
                        {product.quantite}
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Cart Section */}
        <div className="flex flex-col min-h-0">
          <Card className="flex-1 flex flex-col overflow-hidden min-h-0">
            {/* Cart Header - Fixed */}
            <div className="flex-shrink-0 p-4 md:p-6 border-b border-gray-200 bg-blue-600">
              <div className="flex items-center gap-2 text-white">
                <ShoppingCart className="w-5 h-5" />
                <h3 className="font-semibold">Panier ({cart.length})</h3>
              </div>
            </div>

            {/* Cart Items - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 min-h-0">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <ShoppingCart className="w-12 h-12 mb-2" />
                  <p className="text-sm">Panier vide</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div
                      key={item.productId}
                      className={`p-3 rounded-lg ${item.type === 'repair' ? 'bg-blue-50 border border-blue-200' :
                        item.type === 'manual' ? 'bg-amber-50 border border-amber-200' :
                          item.priceModified ? 'bg-orange-50 border border-orange-200' :
                            'bg-gray-50'
                        }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm">{item.nom}</p>
                          <div className="flex gap-1 mt-1 flex-wrap">
                            {item.type === 'repair' && (
                              <Badge className="bg-blue-600 text-white text-xs">
                                Réparation
                              </Badge>
                            )}
                            {item.type === 'manual' && (
                              <Badge className="bg-amber-600 text-white text-xs">
                                Manuel
                              </Badge>
                            )}
                            {item.priceModified && (
                              <Badge className="bg-orange-600 text-white text-xs">
                                Prix modifié
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1 ml-2">
                          {item.type !== 'repair' && (
                            <button
                              onClick={() => handleEditPrice(item)}
                              className="text-blue-500 hover:text-blue-700 p-1"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          )}
                          <button
                            onClick={() => removeFromCart(item.productId)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        {item.type !== 'repair' ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.productId, -1)}
                              className="w-7 h-7 flex items-center justify-center bg-white border border-gray-300 rounded hover:bg-gray-100"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center font-semibold">{item.quantite}</span>
                            <button
                              onClick={() => updateQuantity(item.productId, 1)}
                              className="w-7 h-7 flex items-center justify-center bg-white border border-gray-300 rounded hover:bg-gray-100"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-600">Qté: 1</span>
                        )}
                        <div className="text-right">
                          <p className="font-bold text-gray-900">
                            {(item.prix * item.quantite).toFixed(2)} $
                          </p>
                          {item.priceModified && item.originalPrice && (
                            <p className="text-xs text-gray-500 line-through">
                              {(item.originalPrice * item.quantite).toFixed(2)} $
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Totals and Checkout - Fixed */}
            <div className="flex-shrink-0 p-4 md:p-6 border-t border-gray-200 bg-gray-50">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Sous-total</span>
                  <span className="font-semibold">{totals.subtotal.toFixed(2)} $</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">TPS ({shopSettings.tps}%)</span>
                  <span className="font-semibold">{totals.tps.toFixed(2)} $</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">TVQ ({shopSettings.tvq}%)</span>
                  <span className="font-semibold">{totals.tvq.toFixed(2)} $</span>
                </div>
                <div className="pt-2 border-t border-gray-200 flex justify-between">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-blue-600">{totals.total.toFixed(2)} $</span>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4 p-3 bg-white rounded-lg">
                <span className="text-sm text-gray-700">Prix taxes incluses</span>
                <button
                  onClick={() => setTaxIncluded(!taxIncluded)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${taxIncluded ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${taxIncluded ? 'translate-x-6' : 'translate-x-1'
                      }`}
                  />
                </button>
              </div>

              <Button
                onClick={handleCheckout}
                disabled={cart.length === 0}
                className="w-full bg-blue-600 hover:bg-blue-700 h-12"
                size="lg"
              >
                Procéder au paiement
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <AddManualItemModal
        isOpen={isManualItemModalOpen}
        onClose={() => setIsManualItemModalOpen(false)}
        onAdd={addManualItem}
      />

      {editingItem && (
        <EditPriceModal
          isOpen={isPriceEditModalOpen}
          onClose={() => {
            setIsPriceEditModalOpen(false);
            setEditingItem(null);
          }}
          itemName={editingItem.nom}
          currentPrice={editingItem.prix}
          originalPrice={editingItem.originalPrice}
          onSave={(newPrice) => updateItemPrice(editingItem.productId, newPrice)}
        />
      )}

      <AddClientModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onAdd={(newClient) => {
          console.log('New client:', newClient);
          alert('Client ajouté avec succès!');
          setIsClientModalOpen(false);
        }}
      />
    </div>
  );
}
