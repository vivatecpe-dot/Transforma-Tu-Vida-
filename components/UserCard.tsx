import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { BmiData } from '../types';
import { WhatsappIcon } from './icons/WhatsappIcon';
import WellnessProfileForm from './WellnessProfileForm';
import { WellnessProfileData, WellnessQuestionnaireData } from '../types';
import supabase from '../supabaseClient';
import { FileTextIcon, ClipboardListIcon, DownloadIcon } from './icons/DocumentIcon';
import WellnessQuestionnaireForm from './WellnessQuestionnaireForm';
import WellnessProfilePDF from './pdf/WellnessProfilePDF';
import WellnessQuestionnairePDF from './pdf/WellnessQuestionnairePDF';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';


interface UserCardProps {
    data: BmiData;
    onDelete: (id: number) => void;
    onUpdateStatus: (id: number, newStatus: string) => void;
    onUpdateNotes: (id: number, newNotes: string) => void;
}

const UserCard: React.FC<UserCardProps> = ({ data, onDelete, onUpdateStatus, onUpdateNotes }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [currentStatus, setCurrentStatus] = useState(data.estado || 'Nuevo');
    const [notes, setNotes] = useState(data.notas || '');
    const [isEditingNotes, setIsEditingNotes] = useState(false);
    const notesTextareaRef = useRef<HTMLTextAreaElement>(null);

    const [isProfileModalOpen, setProfileModalOpen] = useState(false);
    const [isQuestionnaireModalOpen, setQuestionnaireModalOpen] = useState(false);
    const [profileData, setProfileData] = useState<WellnessProfileData | null>(null);
    const [questionnaireData, setQuestionnaireData] = useState<WellnessQuestionnaireData | null>(null);
    const [profileError, setProfileError] = useState<string | null>(null);


    const statusOptions = ['Nuevo', 'Contactado', 'Evaluación Agendada', 'Evaluación Realizada', 'En Acompañamiento', 'Seguimiento (Post-Evaluación)', 'No Interesado'];
    const statusColors: { [key: string]: string } = {
        'Nuevo': 'bg-blue-100 text-blue-800',
        'Contactado': 'bg-yellow-100 text-yellow-800',
        'Evaluación Agendada': 'bg-purple-100 text-purple-800',
        'Evaluación Realizada': 'bg-indigo-100 text-indigo-800',
        'En Acompañamiento': 'bg-green-100 text-green-800',
        'Seguimiento (Post-Evaluación)': 'bg-pink-100 text-pink-800',
        'No Interesado': 'bg-red-100 text-red-800',
    };
    
    const getCategoryColor = (category: string) => {
        const lowerCaseCategory = category.toLowerCase();
        if (lowerCaseCategory.includes('obesidad')) return 'border-red-500';
        if (lowerCaseCategory.includes('sobrepeso')) return 'border-yellow-500';
        if (lowerCaseCategory.includes('peso normal')) return 'border-green-500';
        if (lowerCaseCategory.includes('bajo peso')) return 'border-blue-500';
        return 'border-gray-300';
    };

    const fetchProfileData = async () => {
        if (!data.id) return;
        setProfileError(null);
        try {
            const { data: profile, error } = await supabase
                .from('wellness_profiles')
                .select('*')
                .eq('user_id', data.id)
                .single();
            if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
                 if (error.message.includes('relation "public.wellness_profiles" does not exist')) {
                    throw new Error("La tabla 'wellness_profiles' no existe. Por favor, créala en tu base de datos de Supabase.");
                }
                throw error;
            }
            setProfileData(profile);
        } catch (err: any) {
            console.error("Error fetching wellness profile:", err);
            setProfileError(err.message);
        }
    };

    const fetchQuestionnaireData = async () => {
        if (!data.id) return;
        setProfileError(null);
        try {
            const { data: questionnaire, error } = await supabase
                .from('wellness_consultations')
                .select('*')
                .eq('user_id', data.id)
                .single();

            if (error && error.code !== 'PGRST116') {
                 if (error.message.includes('relation "public.wellness_consultations" does not exist')) {
                    throw new Error("La tabla 'wellness_consultations' no existe. Por favor, créala en tu base de datos de Supabase.");
                }
                throw error;
            }
            setQuestionnaireData(questionnaire);
        } catch (err: any) {
            console.error("Error fetching wellness questionnaire:", err);
            setProfileError(err.message);
        }
    };

    useEffect(() => {
        if (isExpanded) {
            fetchProfileData();
            fetchQuestionnaireData();
        }
    }, [isExpanded, data.id]);


    useEffect(() => {
        if (isEditingNotes && notesTextareaRef.current) {
            notesTextareaRef.current.style.height = 'auto';
            notesTextareaRef.current.style.height = `${notesTextareaRef.current.scrollHeight}px`;
        }
    }, [isEditingNotes, notes]);

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value;
        setCurrentStatus(newStatus);
        if(data.id) {
            onUpdateStatus(data.id, newStatus);
        }
    };

    const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setNotes(e.target.value);
        if (notesTextareaRef.current) {
            notesTextareaRef.current.style.height = 'auto';
            notesTextareaRef.current.style.height = `${notesTextareaRef.current.scrollHeight}px`;
        }
    };

    const handleSaveNotes = () => {
        if (data.id) {
            onUpdateNotes(data.id, notes);
            setIsEditingNotes(false);
        }
    };

    const handleDeleteClick = () => {
        if (window.confirm(`¿Estás seguro de que quieres eliminar a ${data.nombre}? Esta acción no se puede deshacer.`)) {
            if (data.id) {
                onDelete(data.id);
            }
        }
    };
    
    const handleWhatsAppClick = () => {
        const whatsappNumber = data.telefono.replace(/\D/g, '');
        const message = `¡Hola ${data.nombre}! Soy Cindy, tu coach de bienestar. Recibí tu evaluación y estoy emocionada de que comencemos juntos tu transformación. ¿Te parece si coordinamos una llamada para conversar sobre tus metas? 😊`;
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    };

    const handleSaveProfile = async (formData: WellnessProfileData, isFinal: boolean) => {
        if (!data.id) return;
        const dataToSave = {
            ...formData,
            user_id: data.id,
            is_complete: isFinal,
        };

        const { error } = await (profileData
            ? supabase.from('wellness_profiles').update(dataToSave).eq('user_id', data.id)
            : supabase.from('wellness_profiles').insert(dataToSave));

        if (error) {
             if (error.code === '23505') { // Unique violation
                alert("Hubo un error al guardar el perfil. Ya existe un perfil para este usuario. Esto puede deberse a un problema de permisos (RLS) que impide ver el perfil existente. Por favor, revisa la configuración de seguridad de tu tabla 'wellness_profiles'.");
            } else {
                alert(`Hubo un error al guardar el perfil. Revisa la consola para más detalles y verifica la configuración de tu tabla 'wellness_profiles'.`);
            }
            console.error('Error saving profile:', error);
        } else {
            setProfileModalOpen(false);
            fetchProfileData();
            if (!profileData) {
                // FIX: Called onUpdateStatus from props instead of the undefined handleUpdateStatus.
                onUpdateStatus(data.id, 'Evaluación Realizada');
            }
        }
    };
    
    const handleSaveQuestionnaire = async (formData: WellnessQuestionnaireData, isFinal: boolean) => {
        if (!data.id) return;
        const dataToSave = {
            ...formData,
            user_id: data.id,
            is_complete: isFinal,
        };

        const { error } = await (questionnaireData
            ? supabase.from('wellness_consultations').update(dataToSave).eq('user_id', data.id)
            : supabase.from('wellness_consultations').insert(dataToSave));

        if (error) {
            if (error.message.includes('relation "public.wellness_consultations" does not exist')) {
                 alert("Error: La tabla 'wellness_consultations' no existe en la base de datos. Por favor, créala para poder guardar el cuestionario.");
            } else if (error.code === '23505') {
                 alert("Hubo un error al guardar el cuestionario. Ya existe un cuestionario para este usuario. Esto puede deberse a un problema de permisos (RLS) que impide ver el cuestionario existente. Por favor, revisa la configuración de seguridad de tu tabla 'wellness_consultations'.");
            } else {
                alert(`Hubo un error al guardar el cuestionario. Revisa la consola para más detalles.`);
            }
            console.error('Error saving questionnaire:', error);
        } else {
            setQuestionnaireModalOpen(false);
            fetchQuestionnaireData();
            if (!questionnaireData) {
                // FIX: Called onUpdateStatus from props instead of the undefined handleUpdateStatus.
                onUpdateStatus(data.id, 'Evaluación Realizada');
            }
        }
    };

    const exportToPDF = async (type: 'profile' | 'questionnaire') => {
        const elementId = `pdf-export-${type}-${data.id}`;
        let componentToRender;
        let fileName;
    
        if (type === 'profile' && profileData) {
            componentToRender = <WellnessProfilePDF data={profileData} userData={data} />;
            fileName = `Perfil_de_Bienestar_${data.nombre.replace(/\s/g, '_')}.pdf`;
        } else if (type === 'questionnaire' && questionnaireData) {
            componentToRender = <WellnessQuestionnairePDF data={questionnaireData} userData={data} />;
            fileName = `Cuestionario_de_Evaluacion_de_Bienestar_${data.nombre.replace(/\s/g, '_')}.pdf`;
        } else {
            return;
        }
    
        const container = document.createElement('div');
        container.id = elementId;
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        container.style.width = '794px'; // A4 width in pixels approx
        document.body.appendChild(container);
    
        const root = ReactDOM.createRoot(container);
        root.render(componentToRender);
    
        // Give React a moment to render
        setTimeout(async () => {
            try {
                const canvas = await html2canvas(container, { scale: 2 });
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('p', 'mm', 'a4');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                const canvasWidth = canvas.width;
                const canvasHeight = canvas.height;
                const ratio = canvasWidth / canvasHeight;
                let newCanvasHeight = pdfWidth / ratio;
    
                if (newCanvasHeight > pdfHeight) {
                    newCanvasHeight = pdfHeight;
                }
    
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, newCanvasHeight);
                pdf.save(fileName);
            } catch (error) {
                console.error('Error generating PDF:', error);
            } finally {
                root.unmount();
                document.body.removeChild(container);
            }
        }, 500);
    };

    return (
        <div className={`bg-white rounded-lg shadow-md transition-all duration-300 border-l-4 ${getCategoryColor(data.categoria)}`}>
            <div className="p-4 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">{data.nombre}</h3>
                        <p className="text-sm text-gray-500">{new Date(data.created_at || '').toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[currentStatus] || 'bg-gray-100 text-gray-800'}`}>
                            {currentStatus}
                        </span>
                         <span className={`text-lg font-bold ${data.imc >= 25 ? 'text-red-600' : 'text-green-600'}`}>
                            {data.imc}
                         </span>
                         <svg className={`w-5 h-5 text-gray-500 transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                    </div>
                </div>
            </div>

            {isExpanded && (
                <div className="p-4 border-t border-gray-200">
                    {profileError && <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-md">{profileError}</p>}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4 text-sm">
                        <div>
                            <p className="font-semibold text-gray-600">Teléfono</p>
                            <p className="text-gray-800">{data.telefono}</p>
                        </div>
                        <div>
                            <p className="font-semibold text-gray-600">Edad</p>
                            <p className="text-gray-800">{data.edad} años</p>
                        </div>
                        <div>
                            <p className="font-semibold text-gray-600">Peso/Altura</p>
                            <p className="text-gray-800">{data.peso} kg / {data.altura} cm</p>
                        </div>
                         <div>
                            <p className="font-semibold text-gray-600">Categoría</p>
                            <p className="text-gray-800 font-medium">{data.categoria}</p>
                        </div>
                    </div>

                     <div className="mb-6 pt-4 border-t">
                        <label className="block text-sm font-semibold text-gray-600 mb-2">Acciones de Evaluación</label>
                        <div className="flex flex-wrap gap-2">
                             <button onClick={() => setProfileModalOpen(true)} className="flex items-center text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-3 rounded-lg transition-colors">
                                <FileTextIcon />
                                {profileData ? 'Ver / Editar Perfil' : 'Realizar Perfil'}
                            </button>
                            <button onClick={() => setQuestionnaireModalOpen(true)} className="flex items-center text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-3 rounded-lg transition-colors">
                                <ClipboardListIcon />
                                {questionnaireData ? 'Ver Cuestionario' : 'Realizar Cuestionario'}
                            </button>
                             {profileData && (
                                <button onClick={() => exportToPDF('profile')} className="flex items-center text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium py-2 px-3 rounded-lg transition-colors">
                                    <DownloadIcon />
                                    Exportar Perfil
                                </button>
                            )}
                            {questionnaireData && (
                                <button onClick={() => exportToPDF('questionnaire')} className="flex items-center text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium py-2 px-3 rounded-lg transition-colors">
                                    <DownloadIcon />
                                    Exportar Cuestionario
                                </button>
                            )}
                        </div>
                    </div>
                    
                    <div className="mb-4">
                         <label className="block text-sm font-semibold text-gray-600 mb-2">Cambiar Estado</label>
                         <select
                            value={currentStatus}
                            onChange={handleStatusChange}
                            className="w-full sm:w-auto p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                         >
                            {statusOptions.map(option => <option key={option} value={option}>{option}</option>)}
                         </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-2">Notas</label>
                        {isEditingNotes ? (
                            <>
                                <textarea
                                    ref={notesTextareaRef}
                                    value={notes}
                                    onChange={handleNotesChange}
                                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none overflow-hidden"
                                    rows={3}
                                    placeholder="Añadir notas sobre el seguimiento, próximas citas, etc."
                                />
                                <div className="flex justify-end space-x-2 mt-2">
                                    <button onClick={() => { setIsEditingNotes(false); setNotes(data.notas || ''); }} className="text-sm text-gray-600 hover:text-gray-800">Cancelar</button>
                                    <button onClick={handleSaveNotes} className="text-sm bg-green-600 text-white py-1 px-3 rounded-lg hover:bg-green-700">Guardar</button>
                                </div>
                            </>
                        ) : (
                            <div onClick={() => setIsEditingNotes(true)} className="w-full p-2 border border-dashed rounded-lg min-h-[60px] cursor-text whitespace-pre-wrap text-gray-700">
                                {notes || <span className="text-gray-400">Haz clic para añadir una nota...</span>}
                            </div>
                        )}
                    </div>
                    
                    <div className="flex justify-end items-center space-x-3 mt-4">
                        <button onClick={handleWhatsAppClick} className="flex items-center text-sm text-green-600 hover:text-green-800 font-semibold p-2 rounded-lg hover:bg-green-50 transition-colors">
                            <WhatsappIcon />
                            <span className="ml-1.5">Enviar Mensaje</span>
                        </button>
                        <button onClick={handleDeleteClick} className="text-sm text-red-600 hover:text-red-800 font-semibold p-2 rounded-lg hover:bg-red-50 transition-colors">
                            Eliminar
                        </button>
                    </div>
                </div>
            )}
            {isProfileModalOpen && (
                <WellnessProfileForm
                    userId={data.id!}
                    existingData={profileData}
                    onSave={handleSaveProfile}
                    onClose={() => setProfileModalOpen(false)}
                />
            )}
            {isQuestionnaireModalOpen && (
                 <WellnessQuestionnaireForm
                    userId={data.id!}
                    existingData={questionnaireData}
                    onSave={handleSaveQuestionnaire}
                    onClose={() => setQuestionnaireModalOpen(false)}
                />
            )}
        </div>
    );
};

export default UserCard;