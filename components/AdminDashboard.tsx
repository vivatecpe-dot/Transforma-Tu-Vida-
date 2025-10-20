import React, { useState, useEffect, useCallback } from 'react';
import supabase from '../supabaseClient';
import { BmiData } from '../types';
import UserCard from './UserCard';
import AddUserForm from './AddUserForm';
import DashboardMetrics from './DashboardMetrics';
import { PlusIcon } from './icons/FabIcon';

const AdminDashboard: React.FC = () => {
    const [registrations, setRegistrations] = useState<BmiData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAddUserFormOpen, setIsAddUserFormOpen] = useState(false);
    const [activeFilter, setActiveFilter] = useState('all');

    const handleLogout = () => {
        sessionStorage.removeItem('isAdminAuthenticated');
        window.location.href = '/';
    };

    const priorityMap: { [key: string]: number } = {
        'obesidad clase iii': 5,
        'obesidad clase ii': 4,
        'obesidad clase i': 3,
        'obesidad': 3,
        'sobrepeso': 2,
        'bajo peso': 1,
        'peso normal': 0,
    };

    const getPriority = (category: string) => {
        const lowerCaseCategory = category.toLowerCase();
        for (const key in priorityMap) {
            if (lowerCaseCategory.includes(key)) {
                return priorityMap[key];
            }
        }
        return -1;
    };

    const fetchRegistrations = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        const { data, error } = await supabase
            .from('registros_imc')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching registrations:', error);
            setError('No se pudieron cargar los registros. Revisa que las columnas "estado" y "notas" existan en tu tabla de Supabase.');
        } else if (data) {
            const sortedData = data.sort((a, b) => getPriority(b.categoria) - getPriority(a.categoria));
            setRegistrations(sortedData as BmiData[]);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchRegistrations();
    }, [fetchRegistrations]);

    const handleAddUserSuccess = () => {
        setIsAddUserFormOpen(false);
        fetchRegistrations();
    };

    const handleDeleteRegistration = async (id: number) => {
        const { error } = await supabase
            .from('registros_imc')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting registration:', error);
            setError('Error al eliminar el registro.');
        } else {
            setRegistrations(prev => prev.filter(reg => reg.id !== id));
        }
    };

    const handleUpdateStatus = async (id: number, newStatus: string) => {
        const { data, error } = await supabase
            .from('registros_imc')
            .update({ estado: newStatus })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating status:', error);
            setError('Error al actualizar el estado.');
        } else if (data) {
            setRegistrations(prev => 
                prev.map(reg => (reg.id === id ? { ...reg, estado: data.estado } : reg))
            );
        }
    };

    const handleUpdateNotes = async (id: number, newNotes: string) => {
        const { data, error } = await supabase
            .from('registros_imc')
            .update({ notas: newNotes })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating notes:', error);
            setError('Error al actualizar las notas.');
        } else if (data) {
            setRegistrations(prev => 
                prev.map(reg => (reg.id === id ? { ...reg, notas: data.notas } : reg))
            );
        }
    };

    const getFilteredRegistrations = () => {
        if (activeFilter === 'all') return registrations;
        
        const today = new Date().toISOString().slice(0, 10);

        return registrations.filter(reg => {
            switch (activeFilter) {
                case 'today':
                    return reg.created_at?.slice(0, 10) === today;
                case 'pending':
                    return reg.estado === 'Evaluación Agendada';
                case 'active':
                    return reg.estado === 'En Acompañamiento';
                default:
                    return true;
            }
        });
    };

    const filteredRegistrations = getFilteredRegistrations();

    return (
        <div className="min-h-screen bg-gray-100 font-sans p-4 md:p-8">
            <header className="mb-8 max-w-4xl mx-auto">
                <div className="flex justify-between items-center">
                    <a href="/" className="text-gray-500 hover:text-gray-800">&larr; Volver</a>
                    <button 
                        onClick={handleLogout}
                        className="bg-red-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-600 transition-colors duration-300 text-sm"
                    >
                        Cerrar Sesión
                    </button>
                </div>
                <div className="mt-6 text-center md:text-left">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Panel de Control</h1>
                    <p className="text-gray-600 mt-2">Gestiona tus participantes y visualiza tu progreso.</p>
                </div>
            </header>
            <main className="max-w-4xl mx-auto">
                <DashboardMetrics 
                    registrations={registrations} 
                    onFilterChange={setActiveFilter}
                    activeFilter={activeFilter}
                />
                
                {isLoading && (
                    <div className="flex justify-center items-center py-16">
                        <svg className="animate-spin w-12 h-12 text-green-600" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                )}
                {error && <p className="text-red-500 text-center bg-red-100 p-4 rounded-lg">{error}</p>}
                {!isLoading && !error && (
                    filteredRegistrations.length > 0 ? (
                        <div className="space-y-3">
                            {filteredRegistrations.map((reg) => (
                                <UserCard 
                                    key={reg.id} 
                                    data={reg} 
                                    onDelete={handleDeleteRegistration}
                                    onUpdateStatus={handleUpdateStatus}
                                    onUpdateNotes={handleUpdateNotes}
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center mt-12">
                            {registrations.length > 0 ? 'No hay registros que coincidan con este filtro.' : 'No hay registros todavía.'}
                        </p>
                    )
                )}
            </main>
            
            <button
                onClick={() => setIsAddUserFormOpen(true)}
                className="fixed bottom-6 right-6 bg-green-600 text-white rounded-full p-4 shadow-lg hover:bg-green-700 transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-green-300"
                aria-label="Abrir Calculadora y Registro"
            >
                <PlusIcon />
            </button>

            {isAddUserFormOpen && (
                <AddUserForm 
                    onClose={() => setIsAddUserFormOpen(false)} 
                    onSuccess={handleAddUserSuccess} 
                />
            )}
        </div>
    );
};

export default AdminDashboard;