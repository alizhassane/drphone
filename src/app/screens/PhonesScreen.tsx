
import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Smartphone, Battery, Tag, CheckCircle, Smartphone as PhoneIcon } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../components/ui/table';
import * as phoneService from '../../services/phoneService';
import { Phone } from '../types';

interface PhonesScreenProps {
    onNavigate: (screen: any) => void;
}

const PhonesScreen = ({ onNavigate }: PhonesScreenProps) => {
    const [phones, setPhones] = useState<Phone[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        loadPhones();
    }, []);

    const loadPhones = async () => {
        try {
            setLoading(true);
            const data = await phoneService.getPhones();
            setPhones(data);
        } catch (error) {
            console.error('Error loading phones:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredPhones = phones.filter(phone => {
        const matchesSearch =
            phone.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
            phone.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
            phone.imei.includes(searchTerm);

        if (statusFilter === 'all') return matchesSearch;
        return matchesSearch && phone.status === statusFilter;
    });

    const getConditionColor = (grade: string) => {
        switch (grade) {
            case 'A': return 'bg-green-100 text-green-800';
            case 'B': return 'bg-yellow-100 text-yellow-800';
            case 'C': return 'bg-orange-100 text-orange-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6 p-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Gestion des Téléphones</h1>
                    <p className="text-gray-500">Gérez votre stock de smartphones d'occasion</p>
                </div>
                <Button onClick={() => onNavigate('buy-phone')} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Acheter un téléphone
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 border-none shadow-md bg-gradient-to-br from-blue-50 to-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-blue-600 mb-1">En Stock</p>
                            <h3 className="text-3xl font-bold text-gray-900">
                                {phones.filter(p => p.status === 'in_stock').length}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">Appareils disponibles</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shadow-inner">
                            <PhoneIcon className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6 border-none shadow-md bg-gradient-to-br from-green-50 to-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-green-600 mb-1">Vendus</p>
                            <h3 className="text-3xl font-bold text-gray-900">
                                {phones.filter(p => p.status === 'sold').length}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">Total ventes</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center shadow-inner">
                            <Tag className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6 border-none shadow-md bg-gradient-to-br from-purple-50 to-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-purple-600 mb-1">Valeur Stock</p>
                            <h3 className="text-3xl font-bold text-gray-900">
                                ${phones.filter(p => p.status === 'in_stock').reduce((acc, curr) => acc + curr.selling_price, 0).toFixed(2)}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">Prix de vente total</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center shadow-inner">
                            <CheckCircle className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                </Card>
            </div>

            <Card className="p-6 border-none shadow-sm">
                <div className="flex flex-col md:flex-row gap-4 mb-6 items-center justify-between">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            placeholder="Rechercher par IMEI, marque ou modèle..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 border-gray-200 focus:border-blue-500 transition-colors"
                        />
                    </div>
                    <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                        <Button
                            variant="ghost"
                            size="sm"
                            className={statusFilter === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}
                            onClick={() => setStatusFilter('all')}
                        >
                            Tous
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className={statusFilter === 'in_stock' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-blue-600'}
                            onClick={() => setStatusFilter('in_stock')}
                        >
                            En Stock
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className={statusFilter === 'sold' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-green-600'}
                            onClick={() => setStatusFilter('sold')}
                        >
                            Vendus
                        </Button>
                    </div>
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Appareil</TableHead>
                                <TableHead>IMEI</TableHead>
                                <TableHead>État</TableHead>
                                <TableHead>Batt.</TableHead>
                                <TableHead>Prix Achat</TableHead>
                                <TableHead>Prix Vente</TableHead>
                                <TableHead>Statut</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                            Chargement des données...
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : filteredPhones.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-12">
                                        <div className="flex flex-col items-center justify-center gap-3 text-gray-500">
                                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                                <Search className="w-8 h-8 text-gray-400" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">Aucun téléphone trouvé</p>
                                                <p className="text-sm mt-1">Modifiez vos filtres ou ajoutez un nouvel appareil.</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredPhones.map((phone) => (
                                    <TableRow key={phone.id} className="cursor-pointer hover:bg-blue-50/50 transition-colors group">
                                        <TableCell>
                                            <div>
                                                <div className="font-semibold text-gray-900">{phone.brand} {phone.model}</div>
                                                <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                                                    <span className="bg-gray-100 px-1.5 py-0.5 rounded">{phone.storage}</span>
                                                    <span>{phone.color}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded select-all">
                                                {phone.imei}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className={`${getConditionColor(phone.condition)} border-0 font-medium`}>
                                                Grade {phone.condition}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className={`relative flex items-center justify-center ${phone.battery_health < 80 ? 'text-red-600' : 'text-green-600'}`}>
                                                    <Battery className="w-4 h-4" />
                                                    {phone.battery_health < 80 && (
                                                        <span className="absolute -top-1 -right-1 flex h-2 w-2">
                                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                                        </span>
                                                    )}
                                                </div>
                                                <span className={`text-sm font-medium ${phone.battery_health < 80 ? 'text-red-700' : 'text-gray-700'}`}>
                                                    {phone.battery_health}%
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-gray-500">${phone.buying_price.toFixed(2)}</TableCell>
                                        <TableCell className="font-bold text-gray-900">${phone.selling_price.toFixed(2)}</TableCell>
                                        <TableCell>
                                            <Badge className={`
                                                ${phone.status === 'in_stock' ? 'bg-green-100 text-green-700 hover:bg-green-200' : ''}
                                                ${phone.status === 'sold' ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : ''}
                                            `}>
                                                {phone.status === 'in_stock' ? (
                                                    <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>En Stock</span>
                                                ) : phone.status === 'sold' ? (
                                                    <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>Vendu</span>
                                                ) : 'Retourné'}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>
        </div>
    );
};

export default PhonesScreen;
