import React, { useState, useEffect } from 'react';
import { BmiData } from './types';
import RegistrationForm from './components/RegistrationForm';
import ResultModal from './components/ResultModal';
import HeaderIcon from './components/icons/HeaderIcon';
import AdminDashboard from './components/AdminDashboard';
import Login from './components/Login';


const App: React.FC = () => {
  const [result, setResult] = useState<BmiData | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Comprobar si el usuario ya está autenticado en la sesión del navegador
    const sessionAuth = sessionStorage.getItem('isAdminAuthenticated');
    if (sessionAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleSuccess = (data: BmiData) => {
    setResult(data);
  };

  const handleCloseModal = () => {
    setResult(null);
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  // Lógica de enrutamiento
  const renderContent = () => {
    if (window.location.pathname === '/admin') {
      if (isAuthenticated) {
        return <AdminDashboard />;
      } else {
        return <Login onLoginSuccess={handleLoginSuccess} />;
      }
    }

    // Página principal por defecto
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center font-sans p-4">
        <header className="mb-8 text-center w-full max-w-md">
          <div className="inline-flex items-center justify-center p-4 bg-white rounded-full shadow-lg mb-4">
              <HeaderIcon />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
              ¡Transforma Tu Vida!
          </h1>
        </header>
        <main className="w-full flex justify-center">
           <RegistrationForm onSuccess={handleSuccess} />
           {result && <ResultModal data={result} onClose={handleCloseModal} />}
        </main>
        <footer className="mt-8 text-center text-gray-500 text-sm">
          <p>"Hoy es tu oportunidad de construir el mañana que quieres."</p>
          <a href="/admin" className="text-gray-400 hover:text-gray-600 text-xs mt-2 block">Admin Panel</a>
        </footer>
      </div>
    );
  };

  return renderContent();
};

export default App;
