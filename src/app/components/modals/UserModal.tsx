import { useState, useEffect } from 'react';
import { X, Save, User as UserIcon, Mail, Lock, Shield } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import type { User } from '../../types';

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (user: Omit<User, 'id'>) => Promise<void>; // Make async to handle errors
    userToEdit?: User | null;
}

export function UserModal({ isOpen, onClose, onSave, userToEdit }: UserModalProps) {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        // nom removed
        email: '',
        role: 'Technicien' as User['role'],
        statut: 'Actif' as User['statut']
    });
    const [error, setError] = useState('');

    useEffect(() => {
        if (userToEdit) {
            setFormData({
                username: userToEdit.username || '',
                password: '', // Don't show existing password
                // nom removed
                email: userToEdit.email || '',
                role: userToEdit.role,
                statut: userToEdit.statut
            });
        } else {
            setFormData({
                username: '',
                password: '',
                // nom removed
                email: '',
                role: 'Technicien',
                statut: 'Actif'
            });
        }
        setError('');
    }, [userToEdit, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            // Map name to username automatically as "Nom complet" field is removed
            await onSave({ ...formData, name: formData.username });
            onClose();
        } catch (err: any) {
            console.error(err);
            if (err.message && err.message.includes('Username already taken')) {
                setError('Ce nom d\'utilisateur est déjà pris.');
            } else if (err.response && err.response.data && err.response.data.error === 'Username already taken') {
                setError('Ce nom d\'utilisateur est déjà pris.');
            } else {
                setError('Erreur lors de la sauvegarde.');
            }
        }
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

                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="username">Nom d'utilisateur (Unique)</Label>
                        <div className="relative">
                            <Shield className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                            <Input
                                id="username"
                                required
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                className="pl-9"
                                placeholder="Ex: jean.tremblay"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Mot de passe {userToEdit && '(Laisser vide pour ne pas changer)'}</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                            <Input
                                id="password"
                                type="password"
                                required={!userToEdit} // Required only for new users
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="pl-9"
                                placeholder={userToEdit ? "********" : "Créer un mot de passe"}
                            />
                        </div>
                    </div>

                    {/* Nom Complet field removed as per request */}

                    <div className="space-y-2">
                        <Label htmlFor="email">Adresse courriel</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="pl-9"
                                placeholder="jean@drphone.ca (Optionnel)"
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
                                    <SelectItem value="Manager">Manager</SelectItem>
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
