import { useState, useEffect } from 'react';
import { Plus, Search, Barcode, Edit, Trash2 } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs'; // Import Tabs
import { AddProductModal } from '../components/modals/AddProductModal';
import type { Product } from '../types';
import * as productService from '../../services/productService';

export function InventoryScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [currentSection, setCurrentSection] = useState<string>('Accessoires'); // Default section

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Failed to load products', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.codeBarres?.includes(searchTerm);

    // Default legacy items to Accessoires if section is missing, 
    // OR map known parts categories to Pièces if migration missed them?
    // The migration should have handled it, but safety check:
    const productSection = product.section || 'Accessoires';

    const matchesSection = productSection === currentSection;

    return matchesSearch && matchesSection;
  });

  const handleAddProduct = async (newProduct: Omit<Product, 'id'>) => {
    try {
      await productService.createProduct(newProduct);
      await loadProducts();
      alert('Produit ajouté avec succès!');
    } catch (error) {
      console.error('Failed to add product', error);
      alert('Erreur lors de l\'ajout du produit');
    }
  };

  const handleEditProduct = async (id: string, updatedProduct: Omit<Product, 'id'>) => {
    try {
      await productService.updateProduct(id, updatedProduct);
      await loadProducts();
      setProductToEdit(null);
    } catch (error) {
      console.error('Failed to update product', error);
      alert('Erreur lors de la modification du produit');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return;
    try {
      await productService.deleteProduct(id);
      await loadProducts();
    } catch (error) {
      console.error('Failed to delete product', error);
      alert('Erreur lors de la suppression du produit');
    }
  }

  const openEditModal = (product: Product) => {
    setProductToEdit(product);
    setIsAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setProductToEdit(null);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion de l'inventaire</h2>
          <p className="text-gray-500">Gérez vos produits et pièces de rechange</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Barcode className="w-4 h-4" />
            Scanner code-barres
          </Button>
          <Button
            className="gap-2 bg-blue-600 hover:bg-blue-700"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Ajouter un produit
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <Tabs value={currentSection} onValueChange={setCurrentSection} className="w-[400px]">
            <TabsList>
              <TabsTrigger value="Accessoires">Accessoires</TabsTrigger>
              <TabsTrigger value="Pièces">Pièces de rechange</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm text-gray-500">Nom du produit</th>
                <th className="text-left py-3 px-4 text-sm text-gray-500">Code-barres</th>
                <th className="text-left py-3 px-4 text-sm text-gray-500">Catégorie</th>
                {currentSection === 'Pièces' && (
                  <th className="text-left py-3 px-4 text-sm text-gray-500">Qualité</th>
                )}
                <th className="text-center py-3 px-4 text-sm text-gray-500">Quantité</th>
                <th className="text-right py-3 px-4 text-sm text-gray-500">Prix d'achat</th>
                <th className="text-right py-3 px-4 text-sm text-gray-500">Prix de vente</th>
                <th className="text-center py-3 px-4 text-sm text-gray-500">Alerte stock</th>
                <th className="text-center py-3 px-4 text-sm text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => {
                const alertLimit = product.alerteStock ?? 0;
                const isLowStock = product.quantite <= alertLimit;

                return (
                  <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <p className="text-sm font-medium text-gray-900">{product.nom}</p>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 font-mono">
                      {product.codeBarres}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {product.categorie}
                    </td>
                    {currentSection === 'Pièces' && (
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {product.quality ? (
                          <Badge variant="outline">{product.quality}</Badge>
                        ) : '-'}
                      </td>
                    )}
                    <td className="py-3 px-4 text-center">
                      <Badge className={isLowStock ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                        {product.quantite}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900 text-right">
                      {Number(product.prixAchat || 0).toFixed(2)} $
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900 text-right">
                      {Number(product.prixVente || 0).toFixed(2)} $
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 text-center">
                      {product.alerteStock}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openEditModal(product)}>
                          <Edit className="w-4 h-4 text-blue-600" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleDeleteProduct(product.id)}>
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucun produit trouvé dans cette section</p>
          </div>
        )}
        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-500">Chargement...</p>
          </div>
        )}
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-sm text-gray-500">Total produits ({currentSection})</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{filteredProducts.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-500">Valeur inventaire (achat)</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {filteredProducts.reduce((sum, p) => sum + (Number(p.prixAchat || 0) * Number(p.quantite || 0)), 0).toFixed(2)} $
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-500">Valeur inventaire (vente)</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {filteredProducts.reduce((sum, p) => sum + (Number(p.prixVente || 0) * Number(p.quantite || 0)), 0).toFixed(2)} $
          </p>
        </Card>
      </div>

      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={handleCloseModal}
        onAdd={handleAddProduct}
        onEdit={handleEditProduct}
        productToEdit={productToEdit}
      />
    </div>
  );
}