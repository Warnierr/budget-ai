export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
      <div className="text-center p-8">
        <h1 className="text-5xl font-bold text-blue-600 mb-4">Budget AI</h1>
        <p className="text-xl text-gray-600 mb-8">Gestion Budgétaire Intelligente</p>
        <div className="space-x-4">
          <a href="/login" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Connexion
          </a>
          <a href="/register" className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Inscription
          </a>
        </div>
      </div>
    </div>
  );
}

