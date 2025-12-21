import { useState } from 'react';
import { Smartphone } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import * as userService from '../../services/userService';

import type { User } from '../types';

interface LoginScreenProps {
  onLogin: (user: User) => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [language, setLanguage] = useState<'fr' | 'en'>('fr');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const user = await userService.login(username, password);
      onLogin(user); // Proceed if successful 
    } catch (err) {
      setError("Nom d'utilisateur ou mot de passe incorrect");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4">
              <Smartphone className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Dr.Phone Manager</h1>
            <p className="text-gray-500 mt-1">Système de gestion de réparation</p>
          </div>

          {/* Language Selector */}
          <div className="flex justify-center gap-2 mb-6">
            <button
              onClick={() => setLanguage('fr')}
              className={`px-4 py-2 rounded-lg transition-colors ${language === 'fr'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              FR
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-4 py-2 rounded-lg transition-colors ${language === 'en'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              EN
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200 text-center">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username">Nom d'utilisateur</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Entrez votre nom d'utilisateur"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Entrez votre mot de passe"
                className="mt-1"
              />
            </div>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
              Se connecter
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Version 1.0.0 • © 2024 Dr.Phone
          </p>
        </div>
      </div>
    </div>
  );
}
