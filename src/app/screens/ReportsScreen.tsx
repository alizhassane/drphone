import { useState, useEffect } from 'react';
import { FileDown, TrendingUp, DollarSign, Loader2 } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import * as statsService from '../../services/statsService';
import type { DailyStat } from '../../services/statsService'; // Verify if we exported this type

// Extend or use the type from service
interface StatData {
  date: string;
  ventes: number;
  profits: number;
  reparations: number;
}

export function ReportsScreen() {
  const [dailyStats, setDailyStats] = useState<StatData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('daily');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await statsService.getDailyStats();
      // Backend returns fields: date, ventes, profits, reparations
      // Just ensure types match
      const formatted: StatData[] = data.map((d: any) => ({
        date: d.date,
        ventes: parseFloat(d.ventes),
        profits: parseFloat(d.profits),
        reparations: parseInt(d.reparations)
      }));
      setDailyStats(formatted);
    } catch (error) {
      console.error('Failed to load reports', error);
    } finally {
      setLoading(false);
    }
  };

  // Process data for different time periods
  const getDailyData = () => {
    // Backend returns last 30 days. Slice last 7 for daily view default?
    return dailyStats.slice(-7).map(stat => ({
      date: new Date(stat.date).toLocaleDateString('fr-CA', { day: '2-digit', month: 'short' }),
      ventes: stat.ventes,
      profits: stat.profits,
      reparations: stat.reparations
    }));
  };

  const getMonthlyData = () => {
    // Group by month
    const monthlyMap = new Map();
    dailyStats.forEach(stat => {
      const month = stat.date.substring(0, 7);
      if (!monthlyMap.has(month)) {
        monthlyMap.set(month, { ventes: 0, profits: 0, reparations: 0 });
      }
      const data = monthlyMap.get(month);
      data.ventes += stat.ventes;
      data.profits += stat.profits;
      data.reparations += stat.reparations;
    });

    return Array.from(monthlyMap.entries()).map(([month, data]) => ({
      date: new Date(month).toLocaleDateString('fr-CA', { month: 'short', year: 'numeric' }),
      ventes: data.ventes,
      profits: data.profits,
      reparations: data.reparations
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const dailyData = getDailyData();
  const monthlyData = getMonthlyData();

  // Calculate summary stats (from loaded data)
  const totalSales = dailyStats.reduce((sum, stat) => sum + stat.ventes, 0);
  const totalProfits = dailyStats.reduce((sum, stat) => sum + stat.profits, 0);
  const totalRepairs = dailyStats.reduce((sum, stat) => sum + stat.reparations, 0);
  const avgDailySales = dailyStats.length > 0 ? totalSales / dailyStats.length : 0;

  const handleExport = (format: string) => {
    alert(`Export en format ${format.toUpperCase()}...`);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Rapports</h2>
          <p className="text-gray-500">Analysez vos ventes et performances</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExport('pdf')} className="gap-2">
            <FileDown className="w-4 h-4" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={() => handleExport('excel')} className="gap-2">
            <FileDown className="w-4 h-4" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Ventes totales</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {totalSales.toFixed(2)} $
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Profits totaux</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {totalProfits.toFixed(2)} $
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Réparations totales</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {totalRepairs}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Moyenne quotidienne</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {avgDailySales.toFixed(2)} $
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="daily">Quotidien</TabsTrigger>
          <TabsTrigger value="monthly">Mensuel</TabsTrigger>
          <TabsTrigger value="yearly">Annuel</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-6 mt-6">
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-6">Ventes et profits - 7 derniers jours</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  formatter={(value: number) => `${value.toFixed(2)} $`}
                />
                <Legend />
                <Line type="monotone" dataKey="ventes" stroke="#3b82f6" strokeWidth={2} name="Ventes" />
                <Line type="monotone" dataKey="profits" stroke="#10b981" strokeWidth={2} name="Profits" />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-6">Nombre de réparations - 7 derniers jours</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
                <Legend />
                <Bar dataKey="reparations" fill="#8b5cf6" name="Réparations" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="monthly" className="space-y-6 mt-6">
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-6">Ventes et profits mensuels</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  formatter={(value: number) => `${value.toFixed(2)} $`}
                />
                <Legend />
                <Line type="monotone" dataKey="ventes" stroke="#3b82f6" strokeWidth={2} name="Ventes" />
                <Line type="monotone" dataKey="profits" stroke="#10b981" strokeWidth={2} name="Profits" />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-6">Nombre de réparations mensuelles</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
                <Legend />
                <Bar dataKey="reparations" fill="#8b5cf6" name="Réparations" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="yearly" className="space-y-6 mt-6">
          <Card className="p-6 text-center py-20">
            <p className="text-gray-500">Les rapports annuels seront disponibles après une année complète d'utilisation</p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
