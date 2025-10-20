import React, { useState, useEffect } from 'react';
import { BmiData, WellnessQuestionnaireData } from '../types';
import supabase from '../supabaseClient';
import LoadingSpinner from './LoadingSpinner';

interface WellnessQuestionnaireFormProps {
    user: BmiData;
    questionnaireData: WellnessQuestionnaireData | null;
    onClose: () => void;
    onSuccess: (questionnaire: WellnessQuestionnaireData) => void;
}

const WellnessQuestionnaireForm: React.FC<WellnessQuestionnaireFormProps> = ({ user, questionnaireData, onClose, onSuccess }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<Partial<WellnessQuestionnaireData>>({
        readiness_scale: 5,
        consultation_referrals: [{ name: '', phone: '' }, { name: '', phone: '' }, { name: '', phone: '' }, { name: '', phone: '' }, { name: '', phone: '' }]
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (questionnaireData) {
            setFormData({
                ...questionnaireData,
                consultation_referrals: questionnaireData.consultation_referrals && questionnaireData.consultation_referrals.length > 0 ? questionnaireData.consultation_referrals : [{ name: '', phone: '' }, { name: '', phone: '' }, { name: '', phone: '' }, { name: '', phone: '' }, { name: '', phone: '' }],
            });
        }
    }, [questionnaireData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const finalValue = type === 'number' ? (value === '' ? '' : parseFloat(value)) : value;
        setFormData(prev => ({ ...prev, [name]: finalValue }));
    };

    const handleReferralChange = (index: number, field: 'name' | 'phone', value: string) => {
        const updatedReferrals = [...(formData.consultation_referrals || [])];
        updatedReferrals[index] = { ...updatedReferrals[index], [field]: value };
        setFormData(prev => ({ ...prev, consultation_referrals: updatedReferrals }));
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

        const dataToSave: Partial<WellnessQuestionnaireData> = {
            ...formData,
            user_id: user.id,
        };
        
        // **SOLUCIÓN: Limpieza de datos**
        // Convierte un string vacío a null para el campo numérico para evitar errores en la BD.
        if (dataToSave.readiness_scale === '' as any) {
            dataToSave.readiness_scale = undefined; // o null
        }

        delete dataToSave.id;
        delete dataToSave.created_at;
        
        let response;

        if (questionnaireData?.id) {
            response = await supabase
                .from('wellness_consultations')
                .update(dataToSave)
                .eq('id', questionnaireData.id)
                .select()
                .single();
        } else {
            response = await supabase
                .from('wellness_consultations')
                .insert(dataToSave)
                .select()
                .single();
        }

        const { data, error: supabaseError } = response;


        if (supabaseError) {
            console.error("Supabase error:", supabaseError);
            if (supabaseError.code === '42P01') {
                setError("Error: La tabla 'wellness_consultations' no existe en tu base de datos. Por favor, créala usando el editor SQL de Supabase antes de guardar.");
            } else if (supabaseError.code === '23505') { 
                setError("Error: Ya existe un cuestionario para este usuario. Esto puede ocurrir si los permisos de lectura (RLS) en la tabla 'wellness_consultations' impiden que la aplicación lo detecte. Por favor, verifica tus políticas de RLS para permitir la lectura (SELECT).");
            } else {
                setError("Hubo un error al guardar el cuestionario. Revisa la consola para más detalles.");
            }
            setIsLoading(false);
        } else {
            onSuccess(data);
        }
    };

    const renderStep = () => {
        switch (step) {
            case 1: // Objetivo - Conectar
                return (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-700">Paso 1: Conectar y Objetivos</h3>
                        <div><label className="block text-sm font-medium">¿Qué talla de ropa?</label><input type="text" name="clothing_size" value={formData.clothing_size || ''} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md"/></div>
                        <div><label className="block text-sm font-medium">3 partes del cuerpo que te gustaría mejorar</label><textarea name="body_parts_to_improve" value={formData.body_parts_to_improve || ''} onChange={handleChange} rows={2} className="w-full mt-1 p-2 border rounded-md"></textarea></div>
                        <div><label className="block text-sm font-medium">¿Qué has hecho antes para intentarlo?</label><textarea name="previous_attempts" value={formData.previous_attempts || ''} onChange={handleChange} rows={2} className="w-full mt-1 p-2 border rounded-md"></textarea></div>
                        <div><label className="block text-sm font-medium">¿Qué tienes en tu armario que podríamos usar como objetivo?</label><input type="text" name="wardrobe_goal" value={formData.wardrobe_goal || ''} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md"/></div>
                        <div><label className="block text-sm font-medium">¿Cómo te beneficiaría lograr estos objetivos?</label><textarea name="benefit_of_achieving_goals" value={formData.benefit_of_achieving_goals || ''} onChange={handleChange} rows={2} className="w-full mt-1 p-2 border rounded-md"></textarea></div>
                        <div><label className="block text-sm font-medium">¿Qué tienes planeado para los próximos 3 a 6 meses?</label><input type="text" name="plan_3_to_6_months" value={formData.plan_3_to_6_months || ''} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md"/></div>
                        <div><label className="block text-sm font-medium">APEGO EMOCIONAL: ¿Qué te impulsó hoy?</label><textarea name="motivation_today" value={formData.motivation_today || ''} onChange={handleChange} rows={2} className="w-full mt-1 p-2 border rounded-md"></textarea></div>
                        <div>
                            <label className="block text-sm font-medium">En escala del 1 al 10, ¿qué tan listo te sientes? ({formData.readiness_scale})</label>
                            <input type="range" name="readiness_scale" min="1" max="10" value={formData.readiness_scale || 5} onChange={handleChange} className="w-full mt-1"/>
                        </div>
                    </div>
                );
            case 2: // Cuestionario de Nutrición
                return (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-700">Paso 2: Hábitos y Nutrición</h3>
                        <div><label className="block text-sm font-medium">¿Cuánto gastas en comida diariamente?</label><input type="text" name="daily_food_spending" value={formData.daily_food_spending || ''} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md"/></div>
                        <div><label className="block text-sm font-medium">¿Cuánto gastas en café?</label><input type="text" name="daily_coffee_spending" value={formData.daily_coffee_spending || ''} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md"/></div>
                        <div><label className="block text-sm font-medium">¿Cuánto gastas semanalmente en alcohol?</label><input type="text" name="weekly_alcohol_spending" value={formData.weekly_alcohol_spending || ''} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md"/></div>
                        <div><label className="block text-sm font-medium">¿Cuánto gastas semanalmente en comida para llevar?</label><input type="text" name="weekly_takeout_spending" value={formData.weekly_takeout_spending || ''} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md"/></div>
                    </div>
                );
            case 3: // Solución y Planes
                return (
                     <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-700">Paso 3: Solución y Planes</h3>
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                            <h4 className="font-bold text-green-800">Guion: Solución 80/20</h4>
                            <p className="text-sm text-gray-700 mt-2">"La mayoría de las personas cuando quieren perder peso simplemente dejan de comer para “bajar calorías” sin fijarse en la calidad nutricional de lo que comen. Haciendo eso se sienten horrible, se enojan, se sienten cansados. Con nuestro plan bajaremos el consumo calórico a la vez que aportamos muchos nutrientes a tu dieta. Si hacemos las cosas bien, tres cosas van a pasar:"</p>
                            <ol className="list-decimal list-inside text-sm text-gray-700 mt-2 space-y-1">
                                <li><span className="font-semibold">Aumento de energía.</span></li>
                                <li><span className="font-semibold">No pasarás hambre.</span></li>
                                <li><span className="font-semibold">Tu cuerpo comenzará a cambiar, ¡garantizado!</span></li>
                            </ol>
                        </div>
                         <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-sm text-gray-700">
                            <h4 className="font-bold text-blue-800">Checklist de Cierre</h4>
                             <ul className="list-disc list-inside mt-2 space-y-1">
                                <li>Explicar planes 1-4.</li>
                                <li>Enviar foto de los planes.</li>
                                <li>Hacer coincidir con su gasto diario actual.</li>
                                <li>Explicar descuento por referidos (25% por 2 personas).</li>
                                <li>Confirmar método de pago.</li>
                             </ul>
                         </div>
                    </div>
                );
            case 4: // Referidos
                return (
                    <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-gray-700">Paso 4: Referidos</h3>
                        <p className="text-sm text-gray-500">Puedes nominar hasta 5 personas para una Evaluación de Bienestar Gratuita.</p>
                        {formData.consultation_referrals?.map((_, index) => (
                             <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-2 p-2 border rounded-md bg-gray-50">
                                <input type="text" placeholder={`Nombre ${index + 1}`} value={formData.consultation_referrals?.[index]?.name || ''} onChange={e => handleReferralChange(index, 'name', e.target.value)} className="w-full p-2 border rounded-md"/>
                                <input type="tel" placeholder={`Teléfono ${index + 1}`} value={formData.consultation_referrals?.[index]?.phone || ''} onChange={e => handleReferralChange(index, 'phone', e.target.value)} className="w-full p-2 border rounded-md"/>
                            </div>
                        ))}
                    </div>
                );
            case 5: // Notas del Coach
                return (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-700">Paso 5: Notas del Coach y Feedback</h3>
                        <div><label className="block text-sm font-medium">Notas de la evaluación (privado)</label><textarea name="coach_notes" value={formData.coach_notes || ''} onChange={handleChange} rows={4} className="w-full mt-1 p-2 border rounded-md" placeholder="Añade tus impresiones, resumen, etc."></textarea></div>
                        <div><label className="block text-sm font-medium">Feedback para el Mentor</label><textarea name="mentor_feedback" value={formData.mentor_feedback || ''} onChange={handleChange} rows={3} className="w-full mt-1 p-2 border rounded-md" placeholder="¿Cómo te fue en la evaluación? ¿En qué necesitas trabajar? Plan de acción."></textarea></div>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 transition-opacity duration-300" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl transform transition-all duration-300 relative max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <header className="sticky top-0 bg-gray-50 p-4 border-b rounded-t-lg flex justify-between items-center z-10">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Cuestionario de Evaluación de Bienestar</h2>
                        <p className="text-sm text-gray-600">para <span className="font-semibold">{user.nombre}</span></p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Cerrar"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
                </header>
                
                <div className="overflow-y-auto px-6 pb-6" style={{ maxHeight: 'calc(90vh - 150px)' }}>
                     <div className="mt-4">
                        {renderStep()}
                        {error && <p className="text-red-500 text-sm text-center mt-4 bg-red-50 p-3 rounded-md">{error}</p>}
                    </div>
                </div>

                <footer className="sticky bottom-0 bg-gray-100 p-4 border-t rounded-b-lg z-10 flex justify-between items-center">
                    <button onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1} className="bg-gray-300 text-gray-800 py-2 px-4 rounded-lg font-semibold hover:bg-gray-400 disabled:opacity-50">Anterior</button>
                    {step < 5 ? (
                        <button onClick={() => setStep(s => Math.min(5, s + 1))} className="bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700">Siguiente</button>
                    ) : (
                        <button onClick={handleSubmit} disabled={isLoading} className="bg-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-700 flex items-center disabled:bg-gray-400">
                             {isLoading ? <LoadingSpinner /> : (questionnaireData ? 'Actualizar Cuestionario' : 'Finalizar y Guardar')}
                        </button>
                    )}
                </footer>
            </div>
        </div>
    );
};

export default WellnessQuestionnaireForm;