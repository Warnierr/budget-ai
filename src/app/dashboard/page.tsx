import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { formatCurrency, getFirstDayOfMonth, getLastDayOfMonth } from "@/lib/utils";
import Link from "next/link";
import { OverviewBarChart } from "@/components/charts/overview-bar";
import { SpendingPieChart } from "@/components/charts/spending-pie";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const startDate = getFirstDayOfMonth();
  const endDate = getLastDayOfMonth();

  // Récupération des données en parallèle
  const [
    incomeData, 
    expenseData, 
    subscriptionData, 
    incomeCount, 
    expenseCount, 
    subCount,
    expensesByCategory,
    allCategories
  ] = await Promise.all([
    // Somme des revenus du mois
    prisma.income.aggregate({
      where: { userId: session.user.id, date: { gte: startDate, lte: endDate } },
      _sum: { amount: true },
    }),
    // Somme des dépenses du mois
    prisma.expense.aggregate({
      where: { userId: session.user.id, date: { gte: startDate, lte: endDate } },
      _sum: { amount: true },
    }),
    // Somme des abonnements actifs
    prisma.subscription.aggregate({
      where: { userId: session.user.id, isActive: true },
      _sum: { amount: true },
    }),
    // Comptes
    prisma.income.count({ where: { userId: session.user.id, date: { gte: startDate, lte: endDate } } }),
    prisma.expense.count({ where: { userId: session.user.id, date: { gte: startDate, lte: endDate } } }),
    prisma.subscription.count({ where: { userId: session.user.id, isActive: true } }),
    // Dépenses par catégorie pour le PieChart
    prisma.expense.groupBy({
      by: ['categoryId'],
      where: { userId: session.user.id, date: { gte: startDate, lte: endDate } },
      _sum: { amount: true },
    }),
    // Toutes les catégories pour mapper les noms
    prisma.category.findMany({
      where: { OR: [{ userId: session.user.id }, { isDefault: true }] }
    })
  ]);

  const totalIncome = incomeData._sum.amount || 0;
  const totalExpense = expenseData._sum.amount || 0;
  const totalSubscription = subscriptionData._sum.amount || 0;
  const balance = totalIncome - totalExpense;

  // Préparation des données pour les graphiques
  const pieData = expensesByCategory.map(item => {
    const category = allCategories.find(c => c.id === item.categoryId);
    return {
      name: category?.name || 'Non classé',
      value: item._sum.amount || 0,
      color: category?.color || undefined
    };
  }).sort((a, b) => b.value - a.value); // Trier par montant décroissant

  const barData = [
    {
      name: 'Ce mois',
      revenus: totalIncome,
      depenses: totalExpense,
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
         <h1 className="text-3xl font-bold text-gray-900">Vue d'ensemble</h1>
         <span className="text-sm text-gray-500">
           {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
         </span>
      </div>
      
      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Solde */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Solde du mois</h3>
          <p className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(balance)}
          </p>
          <p className="text-xs text-gray-400 mt-1">Revenus - Dépenses</p>
        </div>

        {/* Revenus */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Revenus</h3>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
          <p className="text-xs text-gray-400 mt-1">{incomeCount} entrées ce mois</p>
        </div>

        {/* Dépenses */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Dépenses</h3>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpense)}</p>
          <p className="text-xs text-gray-400 mt-1">{expenseCount} dépenses ce mois</p>
        </div>

        {/* Abonnements */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Abonnements</h3>
          <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalSubscription)}</p>
          <p className="text-xs text-gray-400 mt-1">{subCount} actifs / mois</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Revenus vs Dépenses</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <OverviewBarChart data={barData} />
          </CardContent>
        </Card>
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Répartition des dépenses</CardTitle>
          </CardHeader>
          <CardContent>
            <SpendingPieChart data={pieData} />
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-3">
        <Link href="/dashboard/incomes" className="group bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all hover:border-blue-200">
          <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
            <span className="text-xl">💰</span>
          </div>
          <h3 className="text-lg font-bold mb-2 text-gray-900">Ajouter un revenu</h3>
          <p className="text-sm text-gray-500">Enregistrez vos salaires et primes</p>
        </Link>

        <Link href="/dashboard/expenses" className="group bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all hover:border-red-200">
          <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-red-200 transition-colors">
            <span className="text-xl">💳</span>
          </div>
          <h3 className="text-lg font-bold mb-2 text-gray-900">Ajouter une dépense</h3>
          <p className="text-sm text-gray-500">Courses, factures, loisirs...</p>
        </Link>

        <Link href="/dashboard/subscriptions" className="group bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all hover:border-blue-200">
           <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
            <span className="text-xl">🔄</span>
          </div>
          <h3 className="text-lg font-bold mb-2 text-gray-900">Gérer les abonnements</h3>
          <p className="text-sm text-gray-500">Netflix, Spotify, Internet...</p>
        </Link>
      </div>
    </div>
  );
}
