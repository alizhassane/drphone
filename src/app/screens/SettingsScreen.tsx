import { useState, useEffect } from 'react';
import { Save, Building2, DollarSign, Globe, Users, MessageSquare, Trash2, Edit2, Smartphone, Laptop, Tablet, Gamepad, Monitor, Search, Plus, ChevronRight } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { UserModal } from '../components/modals/UserModal';
import { mockUsers } from '../mockData';
import type { ShopSettings, User } from '../types';
import * as inventoryService from '../../services/inventoryService';
import { DeviceCategoryData, BrandData } from '../../services/inventoryService';
import * as settingsService from '../../services/settingsService';

interface SettingsScreenProps {
  shopSettings: ShopSettings;
  onSave: (settings: ShopSettings) => void;
}

export function SettingsScreen({ shopSettings, onSave }: SettingsScreenProps) {
  const [settings, setSettings] = useState(shopSettings);

  // SMS Settings State
  const [smsConfig, setSmsConfig] = useState({
    sms_enabled: 'false',
    sms_provider: '',
    sms_api_key: '',
    sms_number: '',
    sms_tmpl_received: 'true',
    sms_tmpl_done: 'true'
  });

  useEffect(() => {
    loadSmsSettings();
  }, []);

  const loadSmsSettings = async () => {
    try {
      const data = await settingsService.getSettings();
      if (data) setSmsConfig(prev => ({ ...prev, ...data }));
    } catch (e) {
      console.error("Failed to load settings", e);
    }
  };

  // User Management State
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('users');
    return saved ? JSON.parse(saved) : mockUsers;
  });
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);

  // Persist users when changed
  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
  }, [users]);

  const handleSave = async () => {
    onSave(settings);
    // Save SMS settings
    try {
      await settingsService.updateSettings(smsConfig);
      alert('Paramètres sauvegardés avec succès!');
    } catch (e) {
      alert('Erreur lors de la sauvegarde des paramètres SMS');
    }
  };

  const handleAddUser = (userData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...userData,
      id: Date.now().toString()
    };
    setUsers([...users, newUser]);
  };

  const handleEditUser = (userData: Omit<User, 'id'>) => {
    if (!userToEdit) return;
    const updatedUsers = users.map(u =>
      u.id === userToEdit.id ? { ...userData, id: u.id } : u
    );
    setUsers(updatedUsers);
    setUserToEdit(null);
  };



  const handleDeleteUser = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  // --- Inventory Management ---
  const [hierarchy, setHierarchy] = useState<DeviceCategoryData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<DeviceCategoryData | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<BrandData | null>(null);
  const [modelFilter, setModelFilter] = useState('');
  const [newItemName, setNewItemName] = useState('');

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadHierarchy();
  }, []);

  const loadHierarchy = async () => {
    try {
      const data = await inventoryService.getHierarchy();
      setHierarchy(data);
      // Refresh selections if they still exist
      if (selectedCategory) {
        const updatedCat = data.find(c => c.id === selectedCategory.id);
        setSelectedCategory(updatedCat || null);
        if (selectedBrand && updatedCat) {
          const updatedBrand = updatedCat.brands.find(b => b.id === selectedBrand.id);
          setSelectedBrand(updatedBrand || null);
        } else {
          setSelectedBrand(null);
        }
      }
    } catch (err) {
      console.error("Failed to load hierarchy", err);
    }
  };

  const handleAddCategory = async () => {
    if (!newItemName.trim()) return;
    const id = newItemName.toLowerCase().replace(/\s+/g, '_');
    try {
      setLoading(true);
      await inventoryService.addCategory(id, newItemName);
      setNewItemName('');
      await loadHierarchy();
    } catch (e) {
      alert('Erreur ajout catégorie');
    } finally { setLoading(false); }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Supprimer cette catégorie ?')) return;
    await inventoryService.deleteCategory(id);
    if (selectedCategory?.id === id) {
      setSelectedCategory(null);
      setSelectedBrand(null);
    }
    await loadHierarchy();
  };

  const handleAddBrand = async () => {
    if (!selectedCategory || !newItemName.trim()) return;
    try {
      setLoading(true);
      await inventoryService.addBrand(selectedCategory.id, newItemName);
      setNewItemName('');
      await loadHierarchy();
    } catch (e) {
      alert('Erreur ajout marque');
    } finally { setLoading(false); }
  };

  const handleDeleteBrand = async (id: string) => {
    if (!confirm('Supprimer cette marque ?')) return;
    await inventoryService.deleteBrand(id);
    if (selectedBrand?.id === id) {
      setSelectedBrand(null);
    }
    await loadHierarchy();
  };

  const handleAddModel = async () => {
    if (!selectedBrand || !newItemName.trim()) return;
    try {
      setLoading(true);
      // We need brand.id
      await inventoryService.addModel(selectedBrand.id, newItemName);
      setNewItemName('');
      await loadHierarchy();
    } catch (e) {
      alert('Erreur ajout modèle');
    } finally { setLoading(false); }
  };

  const handleDeleteModel = async (modelName: string) => {
    if (!selectedBrand || !confirm('Supprimer ce modèle ?')) return;
    await inventoryService.deleteModel(selectedBrand.id, modelName);
    await loadHierarchy();
  };

  const getCategoryIcon = (id: string) => {
    switch (id.toLowerCase()) {
      case 'phone': return <Smartphone className="w-4 h-4" />;
      case 'laptop': return <Laptop className="w-4 h-4" />;
      case 'tablet': return <Tablet className="w-4 h-4" />;
      case 'console': return <Gamepad className="w-4 h-4" />;
      case 'computer': return <Monitor className="w-4 h-4" />;
      default: return <Smartphone className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Paramètres</h2>
          <p className="text-gray-500">Configurez votre système</p>
        </div>
        <Button onClick={handleSave} className="gap-2 bg-blue-600 hover:bg-blue-700">
          <Save className="w-4 h-4" />
          Sauvegarder
        </Button>
      </div>

      <Tabs defaultValue="shop" className="space-y-6">
        <TabsList>
          <TabsTrigger value="shop" className="gap-2">
            <Building2 className="w-4 h-4" />
            Magasin
          </TabsTrigger>
          <TabsTrigger value="taxes" className="gap-2">
            <DollarSign className="w-4 h-4" />
            Taxes
          </TabsTrigger>
          <TabsTrigger value="language" className="gap-2">
            <Globe className="w-4 h-4" />
            Langue
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2">
            <Users className="w-4 h-4" />
            Utilisateurs
          </TabsTrigger>
          <TabsTrigger value="sms" className="gap-2">
            <MessageSquare className="w-4 h-4" />
            SMS
          </TabsTrigger>
          <TabsTrigger value="devices" className="gap-2">
            <Smartphone className="w-4 h-4" />
            Appareils
          </TabsTrigger>
        </TabsList>

        {/* Shop Information */}
        <TabsContent value="shop">
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-6">Informations du magasin</h3>
            <div className="space-y-4 max-w-2xl">
              <div>
                <Label htmlFor="shopName">Nom du magasin</Label>
                <Input
                  id="shopName"
                  value={settings.nom}
                  onChange={(e) => setSettings({ ...settings, nom: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="address">Adresse</Label>
                <Input
                  id="address"
                  value={settings.adresse}
                  onChange={(e) => setSettings({ ...settings, adresse: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    value={settings.telephone}
                    onChange={(e) => setSettings({ ...settings, telephone: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Courriel</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.email}
                    onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <p className="font-semibold text-gray-900 mb-2">Logo du magasin</p>
                <div className="flex items-start gap-4">
                  <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden bg-gray-50 relative">
                    {settings.logoUrl ? (
                      <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-gray-400 text-xs text-center p-2">Aucun logo</span>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="logo">Téléverser une image</Label>
                    <Input
                      id="logo"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setSettings({ ...settings, logoUrl: reader.result as string });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-gray-500">Formats acceptés: PNG, JPG, JPEG. Max 1Mo recommandé.</p>
                    {settings.logoUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSettings({ ...settings, logoUrl: undefined })}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        Supprimer le logo
                      </Button>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </Card>
        </TabsContent>

        {/* Tax Configuration */}
        <TabsContent value="taxes">
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Configuration TPS / TVQ</h3>
            <p className="text-sm text-gray-500 mb-6">
              Configurez les taux de taxes applicables au Québec, Canada
            </p>
            <div className="space-y-4 max-w-2xl">
              <div>
                <Label htmlFor="tps">TPS (Taxe sur les produits et services) %</Label>
                <Input
                  id="tps"
                  type="number"
                  step="0.001"
                  value={settings.tps}
                  onChange={(e) => setSettings({ ...settings, tps: parseFloat(e.target.value) })}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">Taux fédéral actuel: 5%</p>
              </div>
              <div>
                <Label htmlFor="tvq">TVQ (Taxe de vente du Québec) %</Label>
                <Input
                  id="tvq"
                  type="number"
                  step="0.001"
                  value={settings.tvq}
                  onChange={(e) => setSettings({ ...settings, tvq: parseFloat(e.target.value) })}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">Taux provincial actuel: 9.975%</p>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-900 font-semibold mb-1">Taux combiné</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {(settings.tps + settings.tvq).toFixed(3)}%
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Language Settings */}
        <TabsContent value="language">
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-6">Paramètres de langue</h3>
            <div className="space-y-4 max-w-2xl">
              <div>
                <Label>Langue de l'interface</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <button
                    onClick={() => setSettings({ ...settings, langue: 'fr' })}
                    className={`
                      p-4 rounded-lg border-2 transition-all
                      ${settings.langue === 'fr'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    <p className={`font-semibold ${settings.langue === 'fr' ? 'text-blue-900' : 'text-gray-900'}`}>
                      Français
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Français (Canada)</p>
                  </button>
                  <button
                    onClick={() => setSettings({ ...settings, langue: 'en' })}
                    className={`
                      p-4 rounded-lg border-2 transition-all
                      ${settings.langue === 'en'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    <p className={`font-semibold ${settings.langue === 'en' ? 'text-blue-900' : 'text-gray-900'}`}>
                      English
                    </p>
                    <p className="text-sm text-gray-500 mt-1">English (Canada)</p>
                  </button>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Users & Roles */}
        <TabsContent value="users">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-gray-900">Utilisateurs et rôles</h3>
              <Button onClick={() => setIsUserModalOpen(true)} className="gap-2">
                <Users className="w-4 h-4" />
                Ajouter un utilisateur
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm text-gray-500">Nom</th>
                    <th className="text-left py-3 px-4 text-sm text-gray-500">Courriel</th>
                    <th className="text-left py-3 px-4 text-sm text-gray-500">Rôle</th>
                    <th className="text-center py-3 px-4 text-sm text-gray-500">Statut</th>
                    <th className="text-center py-3 px-4 text-sm text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-900">{user.nom}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{user.email}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        <span className={`inline-block px-2 py-1 text-xs rounded-full 
                          ${user.role === 'Admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-2 py-1 text-xs rounded-full 
                          ${user.statut === 'Actif' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {user.statut}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setUserToEdit(user);
                              setIsUserModalOpen(true);
                            }}
                          >
                            <Edit2 className="w-4 h-4 text-blue-600" />
                          </Button>
                          {/* Prevent deleting the main admin if wanted, logic could be added here */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <UserModal
            isOpen={isUserModalOpen}
            onClose={() => {
              setIsUserModalOpen(false);
              setUserToEdit(null);
            }}
            onSave={userToEdit ? handleEditUser : handleAddUser}
            userToEdit={userToEdit}
          />
        </TabsContent>

        {/* SMS Configuration */}
        <TabsContent value="sms">
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Configuration SMS</h3>
            <p className="text-sm text-gray-500 mb-6">
              Envoyez des notifications SMS automatiques à vos clients
            </p>
            <div className="space-y-6 max-w-2xl">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="text-gray-900">Activer les notifications SMS</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Permet d'envoyer des SMS aux clients pour les mises à jour de réparation
                  </p>
                </div>
                <Switch
                  checked={smsConfig.sms_enabled === 'true'}
                  onCheckedChange={(c) => setSmsConfig({ ...smsConfig, sms_enabled: String(c) })}
                />
              </div>

              {smsConfig.sms_enabled === 'true' && (
                <>
                  <div>
                    <Label htmlFor="smsProvider">Fournisseur SMS</Label>
                    <Input
                      id="smsProvider"
                      placeholder="Ex: Twilio, Plivo, etc."
                      value={smsConfig.sms_provider}
                      onChange={(e) => setSmsConfig({ ...smsConfig, sms_provider: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="smsApiKey">Clé API / Token</Label>
                    <Input
                      id="smsApiKey"
                      type="password"
                      placeholder="Entrez votre clé API"
                      value={smsConfig.sms_api_key}
                      onChange={(e) => setSmsConfig({ ...smsConfig, sms_api_key: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="smsNumber">Numéro d'envoi</Label>
                    <Input
                      id="smsNumber"
                      placeholder="+1 XXX-XXX-XXXX"
                      value={smsConfig.sms_number}
                      onChange={(e) => setSmsConfig({ ...smsConfig, sms_number: e.target.value })}
                      className="mt-1"
                    />
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <p className="font-semibold text-gray-900 mb-3">Messages automatiques</p>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                        <span className="text-sm text-gray-900">Réparation reçue</span>
                        <Switch
                          checked={smsConfig.sms_tmpl_received === 'true'}
                          onCheckedChange={(c) => setSmsConfig({ ...smsConfig, sms_tmpl_received: String(c) })}
                        />
                      </div>
                      {/* 
                      <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                        <span className="text-sm text-gray-900">Réparation en cours</span>
                        <Switch defaultChecked />
                      </div> 
                      */}
                      <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                        <span className="text-sm text-gray-900">Réparation terminée</span>
                        <Switch
                          checked={smsConfig.sms_tmpl_done === 'true'}
                          onCheckedChange={(c) => setSmsConfig({ ...smsConfig, sms_tmpl_done: String(c) })}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </Card>
        </TabsContent>



        <TabsContent value="devices">
          <Card className="flex flex-col h-[750px] overflow-hidden border-0 shadow-none">
            {/* Header Section */}
            <div className="p-6 border-b bg-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Gestion des Appareils</h3>
                  <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                    {selectedCategory ? (
                      <>
                        <span className="flex items-center gap-1 font-medium text-blue-600">
                          {getCategoryIcon(selectedCategory.id)}
                          {selectedCategory.name}
                        </span>
                        {selectedBrand && (
                          <>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                            <span className="font-medium text-blue-600">{selectedBrand.name}</span>
                          </>
                        )}
                      </>
                    ) : 'Sélectionnez une catégorie pour commencer'}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-end bg-gray-50 p-4 rounded-lg border border-gray-100">
                <div className="flex-1">
                  <Label className="text-xs font-medium text-gray-500 uppercase mb-1.5 block">
                    {selectedBrand ? `Nouveau Modèle (${selectedBrand.name})` : selectedCategory ? `Nouvelle Marque (${selectedCategory.name})` : 'Nouvelle Catégorie'}
                  </Label>
                  <div className="relative">
                    <Input
                      placeholder={selectedBrand ? "Ex: iPhone 16 Pro" : selectedCategory ? "Ex: Apple" : "Ex: Smartphone"}
                      value={newItemName}
                      onChange={e => setNewItemName(e.target.value)}
                      className="pl-9 bg-white"
                    />
                    <Plus className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  </div>
                </div>
                <Button
                  disabled={loading || !newItemName.trim()}
                  onClick={() => {
                    if (selectedBrand) handleAddModel();
                    else if (selectedCategory) handleAddBrand();
                    else handleAddCategory();
                  }}
                  className="mb-[1px] bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]"
                >
                  {loading ? 'Ajout...' : 'Ajouter'}
                </Button>
              </div>
            </div>

            {/* Main Columns Grid */}
            {/* Main Columns Grid */}
            <div className="grid grid-cols-12 flex-1 min-h-0 bg-gray-50 divide-x divide-gray-200">

              {/* Categories Column (3 cols) */}
              <div className="col-span-3 flex flex-col bg-white min-h-0 overflow-hidden">
                <div className="p-3 bg-gray-50/80 border-b font-semibold text-xs text-gray-500 uppercase tracking-wider">
                  Catégories
                </div>
                <div className="overflow-y-auto flex-1 p-2 space-y-1">
                  {hierarchy.map(cat => (
                    <div
                      key={cat.id}
                      onClick={() => { setSelectedCategory(cat); setSelectedBrand(null); }}
                      className={`
                                    group flex justify-between items-center p-3 rounded-lg cursor-pointer transition-all border
                                    ${selectedCategory?.id === cat.id
                          ? 'bg-blue-50 border-blue-200 shadow-sm'
                          : 'hover:bg-gray-50 border-transparent hover:border-gray-100'
                        }
                                `}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`
                                        w-8 h-8 rounded-full flex items-center justify-center transition-colors
                                        ${selectedCategory?.id === cat.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500 group-hover:bg-white'}
                                    `}>
                          {getCategoryIcon(cat.id)}
                        </div>
                        <span className={`font-medium ${selectedCategory?.id === cat.id ? 'text-blue-900' : 'text-gray-700'}`}>
                          {cat.name}
                        </span>
                      </div>
                      <Button
                        size="sm" variant="ghost"
                        className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-600 hover:bg-red-50"
                        onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat.id); }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Brands Column (3 cols) */}
              <div className="col-span-3 flex flex-col bg-white min-h-0 overflow-hidden">
                <div className="p-3 bg-gray-50/80 border-b font-semibold text-xs text-gray-500 uppercase tracking-wider flex justify-between">
                  <span>Marques</span>
                  {selectedCategory && <span className="text-blue-600 normal-case bg-blue-50 px-2 rounded-full text-[10px]">{selectedCategory.brands.length}</span>}
                </div>
                <div className="overflow-y-auto flex-1 p-2 space-y-1">
                  {!selectedCategory ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 text-center">
                      <Smartphone className="w-12 h-12 mb-3 opacity-20" />
                      <p className="text-sm">Sélectionnez une catégorie pour voir les marques</p>
                    </div>
                  ) : selectedCategory.brands.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-sm">Aucune marque</div>
                  ) : (
                    selectedCategory.brands.map(brand => (
                      <div
                        key={brand.id}
                        onClick={() => setSelectedBrand(brand)}
                        className={`
                                        group flex justify-between items-center p-3 rounded-lg cursor-pointer transition-all border
                                        ${selectedBrand?.id === brand.id
                            ? 'bg-blue-50 border-blue-200 shadow-sm'
                            : 'hover:bg-gray-50 border-transparent hover:border-gray-100'
                          }
                                    `}
                      >
                        <span className={`font-medium ml-2 ${selectedBrand?.id === brand.id ? 'text-blue-900' : 'text-gray-700'}`}>
                          {brand.name}
                        </span>
                        <Button
                          size="sm" variant="ghost"
                          className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-600 hover:bg-red-50"
                          onClick={(e) => { e.stopPropagation(); handleDeleteBrand(brand.id); }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Models Column (6 cols) - Wider for long names */}
              <div className="col-span-6 flex flex-col bg-white min-h-0 overflow-hidden">
                <div className="p-3 bg-gray-50/80 border-b flex items-center justify-between">
                  <span className="font-semibold text-xs text-gray-500 uppercase tracking-wider">Modèles</span>
                  {selectedBrand && (
                    <div className="relative">
                      <Search className="w-3 h-3 absolute left-2 top-1.5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Filtrer..."
                        value={modelFilter}
                        onChange={(e) => setModelFilter(e.target.value)}
                        className="h-6 w-32 pl-6 pr-2 text-xs bg-white border border-gray-200 rounded focus:outline-none focus:border-blue-400 transition-colors"
                      />
                    </div>
                  )}
                </div>
                <div className="overflow-y-auto flex-1 p-2">
                  {!selectedBrand ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 text-center">
                      <Laptop className="w-12 h-12 mb-3 opacity-20" />
                      <p className="text-sm">Sélectionnez une marque pour voir les modèles</p>
                    </div>
                  ) : selectedBrand.models.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-sm">Aucun modèle</div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {selectedBrand.models
                        .filter(m => m.toLowerCase().includes(modelFilter.toLowerCase()))
                        .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }))
                        .map((model, idx) => (
                          <div
                            key={idx}
                            className="group flex justify-between items-center p-2.5 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all bg-white"
                          >
                            <span className="text-sm text-gray-700 truncate pr-2" title={model}>{model}</span>
                            <Button
                              size="sm" variant="ghost"
                              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-600"
                              onClick={() => handleDeleteModel(model)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>

            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div >
  );
}
