
import { useState, useEffect } from 'react';
import { ArrowLeft, Save, User as UserIcon, Search, Smartphone, UserPlus } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { Badge } from '../components/ui/badge';
import * as clientService from '../../services/clientService';
import * as phoneService from '../../services/phoneService';
import { Customer } from '../types';

interface BuyPhoneScreenProps {
    onNavigate: (screen: any) => void;
}

const BuyPhoneScreen = ({ onNavigate }: BuyPhoneScreenProps) => {
    const [step, setStep] = useState(1); // 1: Client, 2: Phone Details
    const [loading, setLoading] = useState(false);

    // Client State
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [selectedClient, setSelectedClient] = useState<string>(''); // 'walk-in' or client ID
    const [searchTerm, setSearchTerm] = useState('');

    // Phone State
    const [formData, setFormData] = useState({
        imei: '',
        brand: '',
        model: '',
        storage: '',
        color: '',
        condition: 'B',
        battery_health: 90,
        buying_price: 0,
        selling_price: 0,
        warranty_days: 30,
        source: 'customer'
    });

    useEffect(() => {
        loadCustomers();
    }, []);

    const loadCustomers = async () => {
        try {
            const data = await clientService.getClients();
            setCustomers(data);
        } catch (error) {
            console.error('Error loading clients:', error);
        }
    };

    const filteredCustomers = customers.filter(c =>
        c.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.telephone.includes(searchTerm)
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // If source is customer, we need a client OR explicitly walk-in
        if (!selectedClient && formData.source === 'customer') {
            alert('Veuillez sélectionner un client ou choisir "Client de passage"');
            return;
        }

        try {
            setLoading(true);
            const clientIdToSend = selectedClient === 'walk-in' ? null : parseInt(selectedClient);

            await phoneService.buyPhone({
                ...formData,
                client_id: clientIdToSend,
                purchase_price: formData.buying_price,
                payment_method: 'cash' // Default for now
            });
            alert('Téléphone acheté avec succès !');
            onNavigate('phones');
        } catch (error: any) {
            console.error(error);
            alert('Erreur: ' + (error.response?.data?.error || error.message));
        } finally {
            setLoading(false);
        }
    };

    const getInitials = (prenom: string, nom: string) => {
        return `${(prenom || '').charAt(0)}${(nom || '').charAt(0)}`.toUpperCase();
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 p-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => onNavigate('phones')}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Retour
                </Button>
                <h1 className="text-2xl font-bold">Acheter un Téléphone</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column: Client Selection */}
                <div className="space-y-6">
                    <Card className="p-6 border-none shadow-md h-full">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold flex items-center gap-2 text-gray-900">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <UserIcon className="w-5 h-5 text-blue-600" />
                                </div>
                                Vendeur (Client)
                            </h2>
                            {selectedClient && (
                                <Badge variant="default" className={selectedClient === 'walk-in' ? "bg-orange-600" : "bg-green-600"}>
                                    {selectedClient === 'walk-in' ? 'Client de passage' : 'Client sélectionné'}
                                </Badge>
                            )}
                        </div>

                        <div className="space-y-4">
                            {/* Walk-in Option */}
                            <Button
                                variant={selectedClient === 'walk-in' ? 'default' : 'outline'}
                                className={`w-full justify-start gap-2 h-12 ${selectedClient === 'walk-in' ? 'bg-orange-600 hover:bg-orange-700' : ''}`}
                                onClick={() => setSelectedClient('walk-in')}
                            >
                                <UserPlus className="w-5 h-5" />
                                Client de passage (Anonyme)
                            </Button>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-white px-2 text-gray-500">Ou rechercher un client</span>
                                </div>
                            </div>

                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    placeholder="Nom ou téléphone..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 h-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                                />
                            </div>

                            <div className="border rounded-xl h-[320px] overflow-y-auto pr-2 custom-scrollbar">
                                {filteredCustomers.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-center p-4">
                                        <UserIcon className="w-8 h-8 text-gray-300 mb-2" />
                                        <p className="text-sm text-gray-500">Aucun client trouvé</p>
                                    </div>
                                ) : (
                                    filteredCustomers.map(customer => (
                                        <div
                                            key={customer.id}
                                            onClick={() => setSelectedClient(customer.id)}
                                            className={`p-3 cursor-pointer border-b last:border-0 hover:bg-gray-50 transition-colors flex items-center gap-3 ${selectedClient === customer.id ? 'bg-blue-50/80 border-l-4 border-l-blue-600' : ''
                                                }`}
                                        >
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${selectedClient === customer.id ? 'bg-blue-200 text-blue-700' : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                {getInitials(customer.prenom, customer.nom)}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="font-medium text-gray-900 truncate">{customer.prenom} {customer.nom}</div>
                                                <div className="text-xs text-gray-500">{customer.telephone}</div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right Column: Phone Details */}
                <Card className="p-6 border-none shadow-md">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Smartphone className="w-5 h-5 text-purple-600" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">
                            Détails de l'appareil
                        </h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                            <div>
                                <Label className="text-gray-700">Numéro IMEI *</Label>
                                <Input
                                    required
                                    value={formData.imei}
                                    onChange={e => setFormData({ ...formData, imei: e.target.value })}
                                    placeholder="Scanner ou saisir l'IMEI"
                                    className="font-mono mt-1.5"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-gray-700">Marque *</Label>
                                    <Input
                                        required
                                        value={formData.brand}
                                        onChange={e => setFormData({ ...formData, brand: e.target.value })}
                                        placeholder="Apple"
                                        className="mt-1.5"
                                    />
                                </div>
                                <div>
                                    <Label className="text-gray-700">Modèle *</Label>
                                    <Input
                                        required
                                        value={formData.model}
                                        onChange={e => setFormData({ ...formData, model: e.target.value })}
                                        placeholder="iPhone 13"
                                        className="mt-1.5"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-gray-700">Stockage</Label>
                                <Select onValueChange={v => setFormData({ ...formData, storage: v })}>
                                    <SelectTrigger className="mt-1.5"><SelectValue placeholder="Capacité" /></SelectTrigger>
                                    <SelectContent>
                                        {['64GB', '128GB', '256GB', '512GB', '1TB'].map(s => (
                                            <SelectItem key={s} value={s}>{s}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label className="text-gray-700">Couleur</Label>
                                <Input
                                    value={formData.color}
                                    onChange={e => setFormData({ ...formData, color: e.target.value })}
                                    placeholder="Noir Sideral"
                                    className="mt-1.5"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-gray-700">Condition</Label>
                                <Select defaultValue="B" onValueChange={v => setFormData({ ...formData, condition: v as any })}>
                                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="A">Grade A (Comme neuf)</SelectItem>
                                        <SelectItem value="B">Grade B (Bon état)</SelectItem>
                                        <SelectItem value="C">Grade C (Usé)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label className="text-gray-700">Batterie (%)</Label>
                                <div className="relative mt-1.5">
                                    <Input
                                        type="number"
                                        value={formData.battery_health}
                                        onChange={e => setFormData({ ...formData, battery_health: parseInt(e.target.value) })}
                                        className="pr-8"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">%</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-dashed">
                            <div className="space-y-1.5">
                                <Label className="text-blue-600 font-semibold">Prix d'Achat</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600 font-bold">$</span>
                                    <Input
                                        type="number" required
                                        className="pl-8 font-bold text-blue-600 bg-blue-50 border-blue-200"
                                        value={formData.buying_price || ''}
                                        onChange={e => setFormData({ ...formData, buying_price: parseFloat(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-green-600 font-semibold">Prix de Vente</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600 font-bold">$</span>
                                    <Input
                                        type="number" required
                                        className="pl-8 font-bold text-green-600 bg-green-50 border-green-200"
                                        value={formData.selling_price || ''}
                                        onChange={e => setFormData({ ...formData, selling_price: parseFloat(e.target.value) })}
                                    />
                                </div>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-md font-semibold shadow-lg shadow-blue-200 mt-6"
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Traitement...
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Save className="w-4 h-4" />
                                    Confirmer l'achat
                                </div>
                            )}
                        </Button>
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default BuyPhoneScreen;
