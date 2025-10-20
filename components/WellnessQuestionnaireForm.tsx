import React, { useState } from 'react';
import { WellnessQuestionnaireData } from '../types';

interface WellnessQuestionnaireFormProps {
    userId: number;
    onSave: (data: WellnessQuestionnaireData) => void;
}

const WellnessQuestionnaireForm: React.FC<WellnessQuestionnaireFormProps> = ({ userId, onSave }) => {
    const [formData, setFormData] = useState<Partial<WellnessQuestionnaireData>>({
        user_id: userId,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as WellnessQuestionnaireData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Cuestionario de Bienestar (Consulta)</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Section: Objetivo - Conectar */}
                <div className="p-4 border rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-700 mb-3">Objetivo - Conectar</h3>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="clothing_size" className="block text-sm font-medium text-gray-700 mb-1">Talla de ropa que usas hoy:</label>
                            <input type="text" id="clothing_size" name="clothing_size" onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" />
                        </div>
                        <div>
                           <label htmlFor="wardrobe_goal" className="block text-sm font-medium text-gray-700 mb-1">¿Qué talla de ropa te gustaría volver a usar?</label>
                            <input type="text" id="wardrobe_goal" name="wardrobe_goal" onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" />
                        </div>
                        {/* ... other connection questions */}
                    </div>
                </div>

                 {/* Section: Cuestionario de nutrición */}
                 <div className="p-4 border rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-700 mb-3">Cuestionario de Nutrición (Gastos)</h3>
                     <div className="space-y-4">
                        <div>
                            <label htmlFor="daily_food_spending" className="block text-sm font-medium text-gray-700 mb-1">¿Cuánto gastas aprox. en comida al día (comida en la calle)?</label>
                            <input type="text" id="daily_food_spending" name="daily_food_spending" onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" />
                        </div>
                         {/* ... other spending questions */}
                    </div>
                </div>

                {/* Section: Notas del Coach */}
                <div className="p-4 border rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-700 mb-3">Notas del Coach</h3>
                    <textarea 
                        name="coach_notes"
                        onChange={handleChange}
                        rows={4}
                        className="w-full p-3 border rounded-lg"
                        placeholder="Añade tus notas aquí..."
                    ></textarea>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                    <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors">
                        Guardar Cuestionario
                    </button>
                </div>
            </form>
        </div>
    );
};

export default WellnessQuestionnaireForm;
