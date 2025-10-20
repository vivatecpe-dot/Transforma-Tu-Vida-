import React, { useState, useEffect } from 'react';
import { BmiData, WellnessProfileData } from '../types';
import supabase from '../supabaseClient';
import LoadingSpinner from './LoadingSpinner';

interface WellnessProfileFormProps {
    user: BmiData;
    profileData: WellnessProfileData | null;
    onClose: () => void;
    onSuccess: (profile: WellnessProfileData) => void;
}

const WellnessProfileForm: React.FC<WellnessProfileFormProps> = ({ user, profileData, onClose, onSuccess }) => {
    const [formData, setFormData] = useState<Partial<WellnessProfileData>>({
        goals: [],
        other_goals: '',
        referrals: [{ name: '', phone: '' }, { name: '', phone: '' }, { name: '', phone: '' }],
        wake_up_time: '',
        sleep_time: '',
        eats_breakfast: null,
        breakfast_time: '',
        breakfast_details: '',
        water_intake: '',
        other_drinks: '',
        snacks: '',
        fruit_veg_portions: '',
        low_energy_time: '',
        exercise_frequency: '',
        eats_more_at_night: false,
        food_challenge: '',
        alcohol_per_week: '',
        daily_food_spending: '',
        free_meal_interest: null,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (profileData) {
            setFormData({
                ...profileData,
                goals: profileData.goals || [],
                referrals: profileData.referrals && profileData.referrals.length > 0 ? profileData.referrals : [{ name: '', phone: '' }, { name: '', phone: '' }, { name: '', phone: '' }],
            });
        }
    }, [profileData]);

    const handleGoalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = e.target;
        setFormData(prev => {
            const currentGoals = prev.goals || [];
            if (checked) {
                return { ...prev, goals: [...currentGoals, value] };
            } else {
                return { ...prev, goals: currentGoals.filter(goal => goal !== value) };
            }
        });
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: checked }));
    };

    const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleReferralChange = (index: number, field: 'name' | 'phone', value: string) => {
        const updatedReferrals = [...(formData.referrals || [])];
        updatedReferrals[index] = { ...updatedReferrals[index], [field]: value };
        setFormData(prev => ({ ...prev, referrals: updatedReferrals }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        if (!user.id) {
            setError("No se ha podido identificar al usuario.");
            setIsLoading(false);
            return;
        }

        // Preparamos los datos, asegurándonos de no incluir 'id' o 'created_at' que son gestionados por la DB.
        const dataToSave: Partial<WellnessProfileData> = {
            ...formData,
            user_id: user.id,
        };
        delete dataToSave.id;
        delete dataToSave.created_at;

        let response;
        if (profileData?.id) {
            // Es una actualización porque ya tenemos un perfil
            response = await supabase
                .from('wellness_profiles')
                .update(dataToSave)
                .eq('id', profileData.id)
                .select()
                .single();
        } else {
            // Es una inserción porque no hay perfil existente
            response = await supabase
                .from('wellness_profiles')
                .insert(dataToSave)
                .select()
                .single();
        }
        
        const { data, error: supabaseError } = response;

        if (supabaseError) {
            console.error("Supabase error:", supabaseError);
            setError("Hubo un error al guardar el perfil. Revisa la consola para más detalles y verifica la configuración de tu tabla 'wellness_profiles'.");
            setIsLoading(false);
        } else {
            onSuccess(data);
        }
    };

    const goalOptions = ["Perder peso", "Aumentar energía", "Mejorar rendimiento físico", "Tonificar/bajar %grasa", "Aumentar masa muscular", "Mejorar salud"];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 transition-opacity duration-300" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl transform transition-all duration-300 relative max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <header className="sticky top-0 bg-gray-50 p-4 border-b rounded-t-lg flex justify-between items-center z-10">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Perfil de Bienestar</h2>
                        <p className="text-sm text-gray-600">para <span className="font-semibold">{user.nombre}</span></p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors" aria-label="Cerrar modal">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </header>
                
                <form onSubmit={handleSubmit} className="overflow-y-auto px-6 pb-6" style={{ maxHeight: 'calc(90vh - 140px)' }}>
                    <fieldset className="mt-6 space-y-4">
                        <legend className="text-lg font-semibold text-gray-700">Metas Físicas y de Bienestar</legend>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {goalOptions.map(goal => (
                                <label key={goal} className="flex items-center space-x-2 text-sm">
                                    <input type="checkbox" value={goal} checked={formData.goals?.includes(goal)} onChange={handleGoalChange} className="rounded text-green-600 focus:ring-green-500"/>
                                    <span>{goal}</span>
                                </label>
                            ))}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Otras metas:</label>
                            <input type="text" name="other_goals" value={formData.other_goals || ''} onChange={handleChange} className="mt-1 w-full text-sm p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"/>
                        </div>
                    </fieldset>
                    
                    <fieldset className="mt-6 pt-4 border-t space-y-4">
                        <legend className="text-lg font-semibold text-gray-700">Análisis de Nutrición y Salud</legend>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div><label className="font-medium">Hora de despertar:</label><input type="time" name="wake_up_time" value={formData.wake_up_time || ''} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md"/></div>
                            <div><label className="font-medium">Hora de dormir:</label><input type="time" name="sleep_time" value={formData.sleep_time || ''} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md"/></div>
                            <div>
                                <label className="font-medium">¿Desayunas cada mañana?</label>
                                <div className="flex gap-4 mt-1"><label><input type="radio" name="eats_breakfast" value="SI" checked={formData.eats_breakfast === 'SI'} onChange={handleRadioChange}/> Si</label><label><input type="radio" name="eats_breakfast" value="NO" checked={formData.eats_breakfast === 'NO'} onChange={handleRadioChange}/> No</label></div>
                            </div>
                            <div><label className="font-medium">¿A qué horas?</label><input type="time" name="breakfast_time" value={formData.breakfast_time || ''} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md"/></div>
                            <div className="md:col-span-2"><label className="font-medium">¿Qué desayunas?</label><input type="text" name="breakfast_details" value={formData.breakfast_details || ''} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md"/></div>
                            <div><label className="font-medium">¿Cuánta agua bebes al día?</label><input type="text" name="water_intake" value={formData.water_intake || ''} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md"/></div>
                            <div><label className="font-medium">Otras bebidas (jugos, refrescos, etc.)</label><input type="text" name="other_drinks" value={formData.other_drinks || ''} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md"/></div>
                            <div><label className="font-medium">Meriendas entre comidas?</label><input type="text" name="snacks" value={formData.snacks || ''} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md"/></div>
                            <div><label className="font-medium">Porciones de frutas/verduras al día?</label><input type="text" name="fruit_veg_portions" value={formData.fruit_veg_portions || ''} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md"/></div>
                            <div><label className="font-medium">Hora en que sientes menos energía:</label><input type="text" name="low_energy_time" value={formData.low_energy_time || ''} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md"/></div>
                            <div><label className="font-medium">Frecuencia de ejercicio:</label><input type="text" name="exercise_frequency" value={formData.exercise_frequency || ''} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md"/></div>
                            <div className="md:col-span-2"><label className="font-medium">Mayor reto con la comida:</label><textarea name="food_challenge" value={formData.food_challenge || ''} onChange={handleChange} rows={2} className="w-full mt-1 p-2 border rounded-md"></textarea></div>
                            <div><label className="font-medium">Bebidas alcohólicas por semana?</label><input type="text" name="alcohol_per_week" value={formData.alcohol_per_week || ''} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md"/></div>
                            <div><label className="font-medium">Gasto diario en comida?</label><input type="text" name="daily_food_spending" value={formData.daily_food_spending || ''} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md"/></div>
                            <div>
                                <label className="font-medium">¿Tiendes a comer de más por las noches?</label>
                                <div className="flex items-center mt-1"><input type="checkbox" name="eats_more_at_night" checked={!!formData.eats_more_at_night} onChange={handleCheckboxChange} className="rounded"/></div>
                            </div>
                        </div>
                    </fieldset>

                    <fieldset className="mt-6 pt-4 border-t">
                        <legend className="text-lg font-semibold text-gray-700">Comparte Nuestro Estudio de Bienestar Gratis</legend>
                        <p className="text-sm text-gray-500 mb-4">Puedes nominar a 3 personas interesadas.</p>
                        <div className="space-y-3">
                            {[0, 1, 2].map(index => (
                                <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-2 p-2 border rounded-md bg-gray-50">
                                    <input type="text" placeholder={`Nombre ${index + 1}`} value={formData.referrals?.[index]?.name || ''} onChange={e => handleReferralChange(index, 'name', e.target.value)} className="w-full p-2 border rounded-md"/>
                                    <input type="tel" placeholder={`Teléfono ${index + 1}`} value={formData.referrals?.[index]?.phone || ''} onChange={e => handleReferralChange(index, 'phone', e.target.value)} className="w-full p-2 border rounded-md"/>
                                </div>
                            ))}
                        </div>
                    </fieldset>

                    <fieldset className="mt-6 pt-4 border-t">
                        <legend className="text-lg font-semibold text-gray-700">¿Te gustaría tener tu desayuno ó almuerzo gratis?</legend>
                         <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2 text-sm">
                            <label><input type="radio" name="free_meal_interest" value="SI" checked={formData.free_meal_interest === 'SI'} onChange={handleRadioChange} /> Si</label>
                            <label><input type="radio" name="free_meal_interest" value="MÁS INFO" checked={formData.free_meal_interest === 'MÁS INFO'} onChange={handleRadioChange} /> Más Info</label>
                            <label><input type="radio" name="free_meal_interest" value="NO" checked={formData.free_meal_interest === 'NO'} onChange={handleRadioChange} /> No</label>
                        </div>
                    </fieldset>

                    {error && <p className="text-red-500 text-sm text-center mt-4">{error}</p>}
                </form>

                <footer className="sticky bottom-0 bg-gray-50 p-4 border-t rounded-b-lg z-10">
                    <button type="submit" onClick={handleSubmit} disabled={isLoading} className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors duration-300 flex items-center justify-center disabled:bg-gray-400">
                        {isLoading ? <LoadingSpinner /> : (profileData ? 'Actualizar Perfil' : 'Guardar Perfil')}
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default WellnessProfileForm;