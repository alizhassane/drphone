import { useState, useEffect } from 'react';
import { Search, Barcode, Plus, Minus, Trash2, ShoppingCart, AlertCircle, User as UserIcon, Ticket, Edit2, FileText, Smartphone } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { AddManualItemModal } from '../components/modals/AddManualItemModal';
import { EditPriceModal } from '../components/modals/EditPriceModal';
import { AddClientModal } from '../components/modals/AddClientModal';
import * as productService from '../../services/productService';
import * as clientService from '../../services/clientService';
import * as repairService from '../../services/repairService';
import * as phoneService from '../../services/phoneService';
import type { Product, CartItem, Screen, ShopSettings, Repair, Customer, TransactionData, Phone } from '../types';

interface POSScreenProps {
  shopSettings: ShopSettings;
  onNavigate: (screen: Screen, data?: any) => void;
  repairForPayment?: Repair | null;
}

export function POSScreen({ shopSettings, onNavigate, repairForPayment }: POSScreenProps) {
  // Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [repairSearchTerm, setRepairSearchTerm] = useState('');
  const [showClientSearch, setShowClientSearch] = useState(false);
  const [showRepairSearch, setShowRepairSearch] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Customer[]>([]);
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [phones, setPhones] = useState<Phone[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsData, clientsData, repairsData, phonesData] = await Promise.all([
        productService.getProducts(),
        clientService.getClients(),
        repairService.getRepairs(),
        phoneService.getPhones({ status: 'in_stock' })
      ]);
      setProducts(productsData);
      setClients(clientsData);
      setRepairs(repairsData);
      setPhones(phonesData);
    } catch (error) {
      console.error('Failed to load POS data', error);
    }
  };

  const [selectedCategory, setSelectedCategory] = useState<string>('Tous');
  const [cart, setCart] = useState<CartItem[]>(() => {
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
  const [selectedClient, setSelectedClient] = useState<Customer | null>(null);
  const [linkedRepair, setLinkedRepair] = useState<Repair | null>(repairForPayment || null);

  // Auto-select client from repairForPayment on load
  useEffect(() => {
    if (repairForPayment && clients.length > 0 && !selectedClient) {
      const client = clients.find(c => c.id === repairForPayment.clientId);
      if (client) setSelectedClient(client);
    }
  }, [repairForPayment, clients, selectedClient]); // Added selectedClient to dependency to prevent overwrite if manually changed, though typical flow is one-off

  // Modal states
  const [isManualItemModalOpen, setIsManualItemModalOpen] = useState(false);
  const [isPriceEditModalOpen, setIsPriceEditModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CartItem | null>(null);

  const categories = ['Tous', 'Téléphones', 'Coques', 'Chargeurs', 'Câbles', 'Services', 'Accessoires', 'Batteries', 'Écrans'];

  const filteredProducts = products.filter(product => {
    const matchesSearch =
      product.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.codeBarres.includes(searchTerm);
    const matchesCategory = selectedCategory === 'Tous' || product.categorie === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredPhones = phones.filter(phone => {
    const matchesSearch =
      phone.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      phone.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      phone.imei.includes(searchTerm);
    const matchesCategory = selectedCategory === 'Tous' || selectedCategory === 'Téléphones';
    return matchesSearch && matchesCategory;
  });

  const filteredClients = clients.filter(customer =>
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

  const addToCartPhone = (phone: Phone) => {
    if (cart.some(item => item.productId === phone.id)) {
      alert('Ce téléphone est déjà dans le panier.');
      return;
    }
    setCart([...cart, {
      productId: phone.id,
      nom: `${phone.brand} ${phone.model} (${phone.storage}) - IMEI: ${phone.imei}`,
      prix: phone.selling_price,
      quantite: 1,
      categorie: 'Téléphones',
      type: 'phone',
      originalPrice: phone.selling_price
    }]);
  };

  const addManualItem = (item: { nom: string; prix: number; categorie: string }) => {
    const newItem: CartItem = {
      productId: `manual-${Date.now()}`,
      nom: item.nom,
      prix: item.prix,
      quantite: 1,
      categorie: item.categorie,
      type: 'manual',
      originalPrice: item.prix
    };
    setCart([...cart, newItem]);
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.productId === productId) {
        if (item.type === 'repair' || item.type === 'phone') {
          // Cannot change quantity for repairs or unique phones
          return item;
        }
        const newQuantity = Math.max(1, item.quantite + delta);
        return { ...item, quantite: newQuantity };
      }
      return item;
    }));
  };

  const removeFromCart = (productId: string) => {
    const item = cart.find(i => i.productId === productId);
    if (item?.type === 'repair') {
      setLinkedRepair(null); // Unlink repair if removed
    }
    setCart(cart.filter(item => item.productId !== productId));
  };

  const handlePriceEdit = (price: number) => {
    if (editingItem) {
      setCart(cart.map(item =>
        item.productId === editingItem.productId
          ? { ...item, prix: price, priceModified: price !== item.originalPrice }
          : item
      ));
      setEditingItem(null);
    }
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
      const associatedClient = clients.find(c => c.id === repair.clientId);
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

  const subtotal = cart.reduce((sum, item) => sum + (item.prix * item.quantite), 0);
  const tps = subtotal * (shopSettings.tps / 100);
  const tvq = subtotal * (shopSettings.tvq / 100);
  const total = subtotal + tps + tvq;

  const handleCheckout = () => {
    const transactionData: TransactionData = {
      items: cart.map(item => ({
        ...item,
      })),
      subtotal,
      tps,
      tvq,
      total,
      customer: selectedClient,
      linkedRepair: linkedRepair
    };
    onNavigate('payment', transactionData);
  };

  const handleToggleTaxMode = () => {
    const newTaxIncluded = !taxIncluded;
    const totalTaxRate = (shopSettings.tps + shopSettings.tvq) / 100;
    const multiplier = 1 + totalTaxRate;

    setCart(cart.map(item => {
      // Avoid modifying repair prices directly if logic forbids it, but user asked for "every article".
      // Repairs usually fixed price? 
      // Existing logic (updateQuantity) prevents quantity change but not price change via edit.
      // So we should update price here too.

      let newPrice;
      let newOriginalPrice = item.originalPrice;

      if (newTaxIncluded) {
        // Excl -> Incl : Remove Tax component to show Pre-Tax Price that totals to original amount
        newPrice = item.prix / multiplier;
        if (newOriginalPrice) newOriginalPrice = newOriginalPrice / multiplier;
      } else {
        // Incl -> Excl : Restore original price (Add back tax component)
        newPrice = item.prix * multiplier;
        if (newOriginalPrice) newOriginalPrice = newOriginalPrice * multiplier;
      }

      // Rounding to 2 decimal places to avoid visual weirdness
      newPrice = Math.round(newPrice * 100) / 100;
      if (newOriginalPrice) newOriginalPrice = Math.round(newOriginalPrice * 100) / 100;

      return {
        ...item,
        prix: newPrice,
        originalPrice: newOriginalPrice
      };
    }));

    setTaxIncluded(newTaxIncluded);
  };

  return (
    <div className="flex flex-col h-full">
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
                <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
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
                {selectedClient?.prenom} {selectedClient?.nom} - {selectedClient?.telephone}
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
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 p-4 md:p-6 pt-4">
        {/* Products Section */}
        <div className="lg:col-span-2 flex flex-col min-h-0">
          <Card className="flex-1 flex flex-col">
            {/* Search and Categories - Fixed */}
            <div className="flex-shrink-0 p-4 md:p-6 border-b border-gray-200 bg-white">
              <div className="flex gap-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="pos-search-input"
                    type="text"
                    placeholder="Rechercher par nom, code-barres ou IMEI..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline" className="gap-2" onClick={() => document.getElementById('pos-search-input')?.focus()}>
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
                    {category === 'Téléphones' && <Smartphone className="w-4 h-4 mr-2 ml-2 mt-1" />}
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
            <div className="flex-1 p-4 md:p-6 overflow-y-auto">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

                {/* Show Phones */}
                {(selectedCategory === 'Tous' || selectedCategory === 'Téléphones') && filteredPhones.map((phone) => (
                  <button
                    key={phone.id}
                    onClick={() => addToCartPhone(phone)}
                    className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all text-left flex flex-col justify-between"
                  >
                    <div className="mb-2 w-full">
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="outline" className="bg-white text-xs">{phone.brand}</Badge>
                        <Badge className={phone.battery_health < 85 ? "bg-red-500 text-[10px]" : "bg-green-500 text-[10px]"}>
                          {phone.battery_health}%
                        </Badge>
                      </div>
                      <p className="font-bold text-gray-900 line-clamp-2 text-sm">
                        {phone.model}
                      </p>
                      <p className="text-xs text-gray-500 mb-1">{phone.storage} - {phone.color}</p>
                      <Badge variant="secondary" className="mb-2 text-xs">Grade {phone.condition}</Badge>
                      <div className="text-xs text-mono text-gray-400 truncate">{phone.imei}</div>
                    </div>
                    <div className="text-lg font-bold text-blue-600 mt-auto">
                      ${phone.selling_price}
                    </div>
                  </button>
                ))}

                {/* Show Products */}
                {(selectedCategory !== 'Téléphones') && filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className="p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all text-left flex flex-col justify-between"
                  >
                    <div className="mb-2">
                      <p className="font-semibold text-gray-900 line-clamp-2">{product.nom}</p>
                      <p className="text-xs text-gray-500 mt-1">{product.categorie}</p>
                    </div>
                    <div className="flex items-center justify-between mt-auto">
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
          <Card className="flex flex-col max-h-full">
            {/* Cart Header - Fixed */}
            <div className="flex-shrink-0 p-4 md:p-6 border-b border-gray-200 bg-blue-600">
              <div className="flex items-center gap-2 text-white">
                <ShoppingCart className="w-5 h-5" />
                <h3 className="font-semibold">Panier ({cart.length})</h3>
              </div>
            </div>

            {/* Cart Items - Scrollable */}
            <div className="flex-1 p-4 overflow-y-auto">
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
                          {item.type !== 'repair' && item.type !== 'phone' && (
                            <button
                              onClick={() => { setEditingItem(item); setIsPriceEditModalOpen(true); }}
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
                        {item.type !== 'repair' && item.type !== 'phone' ? (
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
                  <span className="font-semibold">{subtotal.toFixed(2)} $</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">TPS ({shopSettings.tps}%)</span>
                  <span className="font-semibold">{tps.toFixed(2)} $</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">TVQ ({shopSettings.tvq}%)</span>
                  <span className="font-semibold">{tvq.toFixed(2)} $</span>
                </div>
                <div className="pt-2 border-t border-gray-200 flex justify-between">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-blue-600">{total.toFixed(2)} $</span>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4 p-3 bg-white rounded-lg">
                <span className="text-sm text-gray-700">Prix taxes incluses</span>
                <button
                  onClick={handleToggleTaxMode}
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
          onSave={handlePriceEdit}
        />
      )}

      <AddClientModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onAdd={async (clientData) => {
          try {
            await clientService.createClient(clientData);
            await loadData(); // Reload clients
            alert('Client ajouté avec succès!');
            setIsClientModalOpen(false);
            setShowClientSearch(true);
          } catch (error) {
            console.error('Error adding client:', error);
            alert('Erreur lors de l\'ajout du client');
          }
        }}
      />
    </div>
  );
}
