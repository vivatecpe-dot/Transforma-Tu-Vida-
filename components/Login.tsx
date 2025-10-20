import React, { useState } from 'react';
import HeaderIcon from './icons/HeaderIcon';

interface LoginProps {
    onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Esta es la contraseña. Puedes cambiarla si lo deseas.
        const ADMIN_PASSWORD = 'Exito2025';

        if (password === ADMIN_PASSWORD) {
            setError('');
            // Guardar el estado de autenticación en la sesión del navegador.
            // Esto permite que permanezcas logueado si recargas la página.
            sessionStorage.setItem('isAdminAuthenticated', 'true');
            onLoginSuccess();
        } else {
            setError('Contraseña incorrecta. Inténtalo de nuevo.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center font-sans p-4">
            <header className="mb-8 text-center w-full max-w-xs">
                <div className="inline-flex items-center justify-center p-4 bg-white rounded-full shadow-lg mb-4">
                    <HeaderIcon />
                </div>
                <h1 className="text-3xl font-bold text-gray-800">
                    Acceso de Administrador
                </h1>
            </header>
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-xs">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                            Contraseña
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    <button
                        type="submit"
                        className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors duration-300"
                    >
                        Ingresar
                    </button>
                </form>
            </div>
             <footer className="mt-8 text-center text-gray-500 text-sm">
                <a href="/" className="text-gray-500 hover:text-gray-800">&larr; Volver al sitio principal</a>
            </footer>
        </div>
    );
};

export default Login;