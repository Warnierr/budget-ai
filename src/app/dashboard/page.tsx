export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-blue-600">Budget AI</h1>
            <p className="text-sm text-gray-600">Dashboard</p>
          </div>
          <a
            href="/login"
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Déconnexion
          </a>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-8">
        <div className="bg-green-100 border border-green-500 text-green-800 px-6 py-4 rounded-lg mb-8">
          <h2 className="text-2xl font-bold mb-2">🎉 Connexion réussie !</h2>
          <p>Vous êtes bien connecté à Budget AI.</p>
          <p className="text-sm mt-2">Email : test@gmail.com</p>
        </div>
        
        <h2 className="text-3xl font-bold mb-8">Dashboard</h2>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Solde</h3>
            <p className="text-2xl font-bold text-green-600">0,00 €</p>
            <p className="text-xs text-gray-500 mt-1">Aucune transaction</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Revenus</h3>
            <p className="text-2xl font-bold text-green-600">0,00 €</p>
            <p className="text-xs text-gray-500 mt-1">0 revenus ce mois</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Dépenses</h3>
            <p className="text-2xl font-bold text-red-600">0,00 €</p>
            <p className="text-xs text-gray-500 mt-1">0 dépenses ce mois</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Abonnements</h3>
            <p className="text-2xl font-bold text-blue-600">0,00 €</p>
            <p className="text-xs text-gray-500 mt-1">0 abonnements actifs</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <a href="/dashboard/incomes" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-bold mb-2">💰 Ajouter un revenu</h3>
            <p className="text-sm text-gray-600">Enregistrez vos entrées d'argent</p>
          </a>

          <a href="/dashboard/expenses" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-bold mb-2">💳 Ajouter une dépense</h3>
            <p className="text-sm text-gray-600">Suivez vos dépenses quotidiennes</p>
          </a>

          <a href="/dashboard/subscriptions" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-bold mb-2">🔄 Ajouter un abonnement</h3>
            <p className="text-sm text-gray-600">Centralisez tous vos abonnements</p>
          </a>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">🎉 Bienvenue sur Budget AI !</h2>
          <p className="text-gray-600 mb-4">
            Votre connexion a fonctionné ! Commencez par ajouter vos premières données :
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>Ajoutez vos revenus mensuels (salaire, freelance, etc.)</li>
            <li>Enregistrez vos dépenses quotidiennes</li>
            <li>Centralisez tous vos abonnements (Netflix, Spotify, etc.)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
