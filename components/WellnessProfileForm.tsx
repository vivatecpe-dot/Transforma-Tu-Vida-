import React, { useState } from 'react';
import { WellnessProfileData } from '../types';

interface WellnessProfileFormProps {
    userId: number;
    onSave: (data: WellnessProfileData) => void;
}

const WellnessProfileForm: React.FC<WellnessProfileFormProps> = ({ userId, onSave }) => {
    const [formData, setFormData] = useState<Partial<WellnessProfileData>>({
        user_id: userId,
        goals: [],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as WellnessProfileData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Perfil de Bienestar</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Section: Metas */}
                <div className="p-4 border rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-700 mb-3">Metas de Bienestar</h3>
                    <p className="text-sm text-gray-600 mb-2">Selecciona tus principales objetivos:</p>
                    {/* Checkbox examples */}
                    <div className="space-y-2">
                         <div>
                            <input type="checkbox" id="goal1" name="goals" value="perder_peso" />
                            <label htmlFor="goal1" className="ml-2">Perder peso / grasa corporal</label>
                        </div>
                        <div>
                            <input type="checkbox" id="goal2" name="goals" value="aumentar_musculo" />
                            <label htmlFor="goal2" className="ml-2">Aumentar masa muscular</label>
                        </div>
                        {/* ... other goals */}
                    </div>
                    <div className="mt-4">
                        <label htmlFor="other_goals" className="block text-sm font-medium text-gray-700 mb-1">Otras metas:</label>
                        <input type="text" id="other_goals" name="other_goals" onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500" />
                    </div>
                </div>

                 {/* Section: Análisis de Nutrición y Salud */}
                 <div className="p-4 border rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-700 mb-3">Análisis de Nutrición y Salud</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <label htmlFor="wake_up_time" className="block text-sm font-medium text-gray-700 mb-1">¿A qué hora te levantas?</label>
                            <input type="time" id="wake_up_time" name="wake_up_time" onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" />
                         </div>
                         <div>
                            <label htmlFor="sleep_time" className="block text-sm font-medium text-gray-700 mb-1">¿A qué hora te acuestas?</label>
                            <input type="time" id="sleep_time" name="sleep_time" onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" />
                         </div>
                     </div>
                     {/* ... other nutrition questions */}
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                    <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors">
                        Guardar Perfil
                    </button>
                </div>
            </form>
        </div>
    );
};

export default WellnessProfileForm;
