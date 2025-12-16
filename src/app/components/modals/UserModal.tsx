import { useState, useEffect } from 'react';
import { X, Save, User as UserIcon, Mail } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import type { User } from '../../types';

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (user: Omit<User, 'id'>) => void;
    userToEdit?: User | null;
}

export function UserModal({ isOpen, onClose, onSave, userToEdit }: UserModalProps) {
    const [formData, setFormData] = useState({
        nom: '',
        email: '',
        role: 'Technicien' as User['role'],
        statut: 'Actif' as User['statut']
    });

    useEffect(() => {
        if (userToEdit) {
            setFormData({
                nom: userToEdit.nom,
                email: userToEdit.email,
                role: userToEdit.role,
                statut: userToEdit.statut
            });
        } else {
            setFormData({
                nom: '',
                email: '',
                role: 'Technicien',
                statut: 'Actif'
            });
        }
    }, [userToEdit, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-in fade-in zoom-in duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    {userToEdit ? (
                        <>
                            <div className="bg-blue-100 p-2 rounded-lg">
                                <UserIcon className="w-5 h-5 text-blue-600" />
                            </div>
                            Modifier l'utilisateur
                        </>
                    ) : (
                        <>
                            <div className="bg-green-100 p-2 rounded-lg">
                                <UserIcon className="w-5 h-5 text-green-600" />
                            </div>
                            Nouvel utilisateur
                        </>
                    )}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="nom">Nom complet</Label>
                        <div className="relative">
                            <UserIcon className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                            <Input
                                id="nom"
                                required
                                value={formData.nom}
                                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                                className="pl-9"
                                placeholder="Ex: Jean Tremblay"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Adresse courriel</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                            <Input
                                id="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="pl-9"
                                placeholder="jean@drphone.ca"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Rôle</Label>
                            <Select
                                value={formData.role}
                                onValueChange={(value: User['role']) => setFormData({ ...formData, role: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Admin">Admin</SelectItem>
                                    <SelectItem value="Technicien">Technicien</SelectItem>
                                    <SelectItem value="Vendeur">Vendeur</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Statut</Label>
                            <Select
                                value={formData.statut}
                                onValueChange={(value: User['statut']) => setFormData({ ...formData, statut: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Actif">Actif</SelectItem>
                                    <SelectItem value="Inactif">Inactif</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-gray-100">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Annuler
                        </Button>
                        <Button type="submit" className="gap-2 bg-blue-600 hover:bg-blue-700">
                            <Save className="w-4 h-4" />
                            Enregistrer
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
