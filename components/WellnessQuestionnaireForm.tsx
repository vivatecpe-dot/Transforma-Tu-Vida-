import React, { useState, useEffect, useMemo } from 'react';
import { BmiData, WellnessQuestionnaireData } from '../types';
import supabase from '../supabaseClient';
import LoadingSpinner from './LoadingSpinner';
import ProgressBar from './ProgressBar';

interface WellnessQuestionnaireFormProps {
    user: BmiData;
    questionnaireData: WellnessQuestionnaireData | null;
    onClose: () => void;
    onSuccess: (questionnaire: WellnessQuestionnaireData) => void;
    isExportMode?: boolean;
}

const requiredFields: (keyof WellnessQuestionnaireData)[] = [
    'clothing_size', 'body_parts_to_improve', 'previous_attempts', 'wardrobe_goal',
    'benefit_of_achieving_goals', 'plan_3_to_6_months', 'motivation_today', 'readiness_scale',
    'daily_food_spending', 'daily_coffee_spending', 'weekly_alcohol_spending', 'weekly_takeout_spending'
];


const WellnessQuestionnaireForm: React.FC<WellnessQuestionnaireFormProps> = ({ user, questionnaireData, onClose, onSuccess, isExportMode = false }) => {
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
    
    const completionPercentage = useMemo(() => {
        let completedFields = 0;
        // Check only fields relevant to completion, not referrals or notes
        for (const field of requiredFields) {
            const value = formData[field];
            if (value !== null && value !== undefined && value !== '') {
                completedFields++;
            }
        }
        return Math.round((completedFields / requiredFields.length) * 100);
    }, [formData]);

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

    const handleSave = async (isFinalizing: boolean) => {
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
            is_complete: isFinalizing
        };
        
        if (dataToSave.readiness_scale === '' as any) {
            dataToSave.readiness_scale = undefined; 
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
                setError("Error: La tabla 'wellness_consultations' no existe.");
            } else if (supabaseError.code === '23505') { 
                setError("Error: Ya existe un cuestionario para este usuario. Verifica tus políticas de RLS para permitir la lectura (SELECT).");
            } else {
                setError("Hubo un error al guardar el cuestionario. Revisa la consola.");
            }
            setIsLoading(false);
        } else {
            onSuccess(data);
        }
    };
    
    const formContent = (
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
            <h3 className="text-lg font-semibold text-gray-700 pt-4 border-t">Paso 2: Hábitos y Nutrición</h3>
            <div><label className="block text-sm font-medium">¿Cuánto gastas en comida diariamente?</label><input type="text" name="daily_food_spending" value={formData.daily_food_spending || ''} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md"/></div>
            <div><label className="block text-sm font-medium">¿Cuánto gastas en café?</label><input type="text" name="daily_coffee_spending" value={formData.daily_coffee_spending || ''} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md"/></div>
            <div><label className="block text-sm font-medium">¿Cuánto gastas semanalmente en alcohol?</label><input type="text" name="weekly_alcohol_spending" value={formData.weekly_alcohol_spending || ''} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md"/></div>
            <div><label className="block text-sm font-medium">¿Cuánto gastas semanalmente en comida para llevar?</label><input type="text" name="weekly_takeout_spending" value={formData.weekly_takeout_spending || ''} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md"/></div>
            
            <div className="pt-4 border-t">
                 <h3 className="text-lg font-semibold text-gray-700">Paso 3: Guion de Cierre</h3>
                 <div className="bg-green-50 p-4 rounded-lg border border-green-200 mt-2">
                    <h4 className="font-bold text-green-800">Recordatorio: Solución 80/20</h4>
                    <p className="text-sm text-gray-700 mt-2">"Con nuestro plan bajaremos el consumo calórico a la vez que aportamos muchos nutrientes. Si lo hacemos bien, pasarán tres cosas: Aumento de energía, no pasarás hambre, y tu cuerpo comenzará a cambiar."</p>
                </div>
            </div>

            <div className="space-y-3 pt-4 border-t">
                <h3 className="text-lg font-semibold text-gray-700">Paso 4: Referidos</h3>
                <p className="text-sm text-gray-500">Puedes nominar hasta 5 personas.</p>
                {formData.consultation_referrals?.map((_, index) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-2 p-2 border rounded-md bg-gray-50">
                        <input type="text" placeholder={`Nombre ${index + 1}`} value={formData.consultation_referrals?.[index]?.name || ''} onChange={e => handleReferralChange(index, 'name', e.target.value)} className="w-full p-2 border rounded-md"/>
                        <input type="tel" placeholder={`Teléfono ${index + 1}`} value={formData.consultation_referrals?.[index]?.phone || ''} onChange={e => handleReferralChange(index, 'phone', e.target.value)} className="w-full p-2 border rounded-md"/>
                    </div>
                ))}
            </div>
            <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-semibold text-gray-700">Paso 5: Notas del Coach y Feedback</h3>
                <div><label className="block text-sm font-medium">Notas de la evaluación (privado)</label><textarea name="coach_notes" value={formData.coach_notes || ''} onChange={handleChange} rows={4} className="w-full mt-1 p-2 border rounded-md" placeholder="Añade tus impresiones..."></textarea></div>
                <div><label className="block text-sm font-medium">Feedback para el Mentor</label><textarea name="mentor_feedback" value={formData.mentor_feedback || ''} onChange={handleChange} rows={3} className="w-full mt-1 p-2 border rounded-md" placeholder="¿Cómo te fue? ¿En qué necesitas trabajar?"></textarea></div>
            </div>
        </div>
    );
    
    // Special rendering mode for PDF export
    if (isExportMode) {
        return <div className="p-6 pdf-export-content bg-white">{formContent}</div>;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 transition-opacity duration-300" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl transform transition-all duration-300 relative max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <header className="sticky top-0 bg-gray-50 p-4 border-b rounded-t-lg flex justify-between items-center z-10">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Cuestionario de Evaluación</h2>
                        <p className="text-sm text-gray-600">para <span className="font-semibold">{user.nombre}</span></p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Cerrar"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
                </header>
                
                <div className="px-6 pt-4">
                     <ProgressBar percentage={completionPercentage} />
                </div>
                
                <div className="overflow-y-auto px-6 pb-6 pdf-export-content" style={{ maxHeight: 'calc(90vh - 210px)' }}>
                     <div className="mt-4">
                        {formContent}
                        {error && <p className="text-red-500 text-sm text-center mt-4 bg-red-50 p-3 rounded-md">{error}</p>}
                    </div>
                </div>

                <footer className="sticky bottom-0 bg-gray-100 p-4 border-t rounded-b-lg z-10 flex flex-col sm:flex-row gap-2 justify-end">
                    <button onClick={() => handleSave(false)} disabled={isLoading} className="bg-gray-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-gray-600 transition-colors duration-300 flex items-center justify-center disabled:bg-gray-400">
                        {isLoading ? <LoadingSpinner /> : 'Guardar Avance'}
                    </button>
                    <button onClick={() => handleSave(true)} disabled={isLoading || completionPercentage < 100} className="bg-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors duration-300 flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed">
                        {isLoading ? <LoadingSpinner /> : 'Finalizar y Guardar'}
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default WellnessQuestionnaireForm;