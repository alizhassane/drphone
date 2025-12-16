import { useState, useEffect } from 'react';
import { Save, Building2, DollarSign, Globe, Users, MessageSquare, Trash2, Edit2 } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { UserModal } from '../components/modals/UserModal';
import { mockUsers } from '../mockData';
import type { ShopSettings, User } from '../types';

interface SettingsScreenProps {
  shopSettings: ShopSettings;
  onSave: (settings: ShopSettings) => void;
}

export function SettingsScreen({ shopSettings, onSave }: SettingsScreenProps) {
  const [settings, setSettings] = useState(shopSettings);
  const [smsEnabled, setSmsEnabled] = useState(false);

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

  const handleSave = () => {
    onSave(settings);
    alert('Paramètres sauvegardés avec succès!');
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
                  checked={smsEnabled}
                  onCheckedChange={setSmsEnabled}
                />
              </div>

              {smsEnabled && (
                <>
                  <div>
                    <Label htmlFor="smsProvider">Fournisseur SMS</Label>
                    <Input
                      id="smsProvider"
                      placeholder="Ex: Twilio, Plivo, etc."
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="smsApiKey">Clé API</Label>
                    <Input
                      id="smsApiKey"
                      type="password"
                      placeholder="Entrez votre clé API"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="smsNumber">Numéro d'envoi</Label>
                    <Input
                      id="smsNumber"
                      placeholder="+1 XXX-XXX-XXXX"
                      className="mt-1"
                    />
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <p className="font-semibold text-gray-900 mb-3">Messages automatiques</p>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                        <span className="text-sm text-gray-900">Réparation reçue</span>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                        <span className="text-sm text-gray-900">Réparation en cours</span>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                        <span className="text-sm text-gray-900">Réparation terminée</span>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                        <span className="text-sm text-gray-900">Rappel de paiement</span>
                        <Switch />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
