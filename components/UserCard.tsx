import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BmiData, WellnessProfileData, WellnessQuestionnaireData } from '../types';
import { WhatsappIcon } from './icons/WhatsappIcon';
import WellnessProfileForm from './WellnessProfileForm';
import { FileTextIcon, ClipboardListIcon, DownloadIcon } from './icons/DocumentIcon';
import supabase from '../supabaseClient';
import WellnessQuestionnaireForm from './WellnessQuestionnaireForm';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';


interface UserCardProps {
    data: BmiData;
    onDelete: (id: number) => Promise<void>;
    onUpdateStatus: (id: number, newStatus: string) => Promise<void>;
    onUpdateNotes: (id: number, newNotes: string) => Promise<void>;
}

const getStatusStyles = (status: string): { bg: string; text: string; } => {
    const s = (status || 'nuevo').toLowerCase();
    if (s.includes('nuevo')) return { bg: 'bg-gray-200', text: 'text-gray-800' };
    if (s.includes('contactado')) return { bg: 'bg-blue-200', text: 'text-blue-800' };
    if (s.includes('evaluación agendada')) return { bg: 'bg-purple-200', text: 'text-purple-800' };
    if (s.includes('evaluación realizada')) return { bg: 'bg-yellow-200', text: 'text-yellow-800' };
    if (s.includes('en acompañamiento')) return { bg: 'bg-green-200', text: 'text-green-800' };
    if (s.includes('seguimiento')) return { bg: 'bg-teal-200', text: 'text-teal-800' };
    if (s.includes('no interesado')) return { bg: 'bg-red-200', text: 'text-red-800' };
    return { bg: 'bg-gray-200', text: 'text-gray-800' };
};

const getProgress = (status: string): { percent: number; color: string; label: string } => {
    const s = (status || 'nuevo').toLowerCase();
    if (s.includes('nuevo')) return { percent: 10, color: 'bg-gray-400', label: 'Nuevo' };
    if (s.includes('contactado')) return { percent: 30, color: 'bg-blue-500', label: 'Contactado' };
    if (s.includes('evaluación agendada')) return { percent: 50, color: 'bg-purple-500', label: 'Evaluación Agendada' };
    if (s.includes('evaluación realizada')) return { percent: 75, color: 'bg-yellow-500', label: 'Evaluación Realizada' };
    if (s.includes('en acompañamiento')) return { percent: 100, color: 'bg-green-500', label: 'Cliente Activo' };
    if (s.includes('seguimiento')) return { percent: 100, color: 'bg-teal-500', label: 'Seguimiento' };
    if (s.includes('no interesado')) return { percent: 100, color: 'bg-red-500', label: 'No Interesado' };
    return { percent: 0, color: 'bg-gray-400', label: 'Inicio' };
};


const UserCard: React.FC<UserCardProps> = ({ data, onDelete, onUpdateStatus, onUpdateNotes }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [notes, setNotes] = useState(data.notas || '');
    const [isSavingNotes, setIsSavingNotes] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const [wellnessProfile, setWellnessProfile] = useState<WellnessProfileData | null>(null);
    const [questionnaire, setQuestionnaire] = useState<WellnessQuestionnaireData | null>(null);
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [dataError, setDataError] = useState<string | null>(null);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isQuestionnaireModalOpen, setIsQuestionnaireModalOpen] = useState(false);

    const fetchData = async () => {
        if (!data.id) return;
        setIsLoadingData(true);
        setDataError(null);

        // Fetch wellness profile
        const { data: profileData, error: profileError } = await supabase
            .from('wellness_profiles')
            .select('*')
            .eq('user_id', data.id)
            .maybeSingle();
        
        if (profileError) {
            console.error('Error fetching wellness profile:', profileError);
            if (profileError.code === '42P01') {
                setDataError("Error: La tabla 'wellness_profiles' no existe. Por favor, créala en Supabase.");
            }
        } else {
            setWellnessProfile(profileData);
        }

        // Fetch questionnaire data
        const { data: questionnaireData, error: questionnaireError } = await supabase
            .from('wellness_consultations')
            .select('*')
            .eq('user_id', data.id)
            .maybeSingle();

        if (questionnaireError) {
            console.error('Error fetching questionnaire:', questionnaireError);
            if (questionnaireError.code === '42P01') {
                setDataError(prev => (prev ? prev + " " : "") + "Error: La tabla 'wellness_consultations' no existe. Por favor, créala en Supabase.");
            }
        } else {
            setQuestionnaire(questionnaireData);
        }

        setIsLoadingData(false);
    };
    
    const handleExportPDF = async (formType: 'profile' | 'questionnaire') => {
        setIsExporting(true);
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'fixed';
        tempContainer.style.left = '-9999px'; // Render off-screen
        document.body.appendChild(tempContainer);
        
        const root = ReactDOM.createRoot(tempContainer);

        const FormComponent = formType === 'profile' ? WellnessProfileForm : WellnessQuestionnaireForm;
        const dataToRender = formType === 'profile' ? wellnessProfile : questionnaire;
        const fileName = `${formType === 'profile' ? 'Perfil_de_Bienestar' : 'Cuestionario_de_Evaluacion'}_${data.nombre.replace(/ /g, '_')}.pdf`;

        // Render the form in a special 'export' mode to get the content
        root.render(
            <FormComponent
                user={data}
                profileData={formType === 'profile' ? dataToRender as WellnessProfileData : null}
                questionnaireData={formType === 'questionnaire' ? dataToRender as WellnessQuestionnaireData : null}
                onClose={() => {}}
                onSuccess={() => {}}
                isExportMode={true}
            />
        );

        // Wait a bit for rendering
        await new Promise(resolve => setTimeout(resolve, 500));

        const formElement = tempContainer.querySelector<HTMLElement>('.pdf-export-content');
        if (formElement) {
            const canvas = await html2canvas(formElement, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(fileName);
        }

        // Cleanup
        root.unmount();
        document.body.removeChild(tempContainer);
        setIsExporting(false);
    };

    useEffect(() => {
        if (isExpanded && data.id) {
            fetchData();
        }
    }, [isExpanded, data.id]);

    const handleProfileSuccess = (newProfileData: WellnessProfileData) => {
        setWellnessProfile(newProfileData);
        setIsProfileModalOpen(false);
        const currentStatus = data.estado || 'Nuevo';
        const precedingStatuses = ['Nuevo', 'Contactado', 'Evaluación Agendada'];
        if (data.id && precedingStatuses.includes(currentStatus)) {
            onUpdateStatus(data.id, 'Evaluación Realizada');
        }
    };

    const handleQuestionnaireSuccess = (newQuestionnaire: WellnessQuestionnaireData) => {
        setQuestionnaire(newQuestionnaire);
        setIsQuestionnaireModalOpen(false);
        const currentStatus = data.estado || 'Nuevo';
        const precedingStatuses = ['Nuevo', 'Contactado', 'Evaluación Agendada'];
        if (data.id && precedingStatuses.includes(currentStatus)) {
            onUpdateStatus(data.id, 'Evaluación Realizada');
        }
    };

    const getCategoryStyles = (category: string): { color: string } => {
        const lowerCaseCategory = category.toLowerCase();
        if (lowerCaseCategory.includes('obesidad')) return { color: 'bg-red-500' };
        if (lowerCaseCategory.includes('sobrepeso')) return { color: 'bg-yellow-500' };
        if (lowerCaseCategory.includes('bajo peso')) return { color: 'bg-blue-500' };
        if (lowerCaseCategory.includes('peso normal')) return { color: 'bg-green-500' };
        return { color: 'bg-gray-400' };
    };

    const handleWhatsAppClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        const userNumber = data.telefono.replace(/[^0-9]/g, '');
        const message = `¡Hola ${data.nombre}, soy Cindy Daboin! 😊 Vi que te registraste para calcular tu IMC. ¡Felicidades por dar este gran paso hacia una vida más saludable! Me encantaría conversar contigo y contarte cómo puedo ayudarte a alcanzar tus metas. ¿Tienes un momento para charlar?`;
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${userNumber}?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    };

    const statusOptions = ['Nuevo', 'Contactado', 'Evaluación Agendada', 'Evaluación Realizada', 'En Acompañamiento', 'Seguimiento (Post-Evaluación)', 'No Interesado'];
    const currentStatus = data.estado || 'Nuevo';

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm(`¿Estás seguro de que quieres eliminar el registro de ${data.nombre}? Esta acción no se puede deshacer.`)) {
            if(!data.id) return;
            setIsDeleting(true);
            await onDelete(data.id);
        }
    };

    const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        e.stopPropagation();
        if(!data.id) return;
        const newStatus = e.target.value;
        setIsUpdating(true);
        await onUpdateStatus(data.id, newStatus);
        setIsUpdating(false);
    };
    
    const handleSaveNotes = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!data.id) return;
        setIsSavingNotes(true);
        await onUpdateNotes(data.id, notes);
        setIsSavingNotes(false);
    };

    const { color } = getCategoryStyles(data.categoria);
    const statusStyles = getStatusStyles(currentStatus);
    const progress = getProgress(currentStatus);

    return (
        <>
            <div 
                className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 ease-in-out cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => e.key === 'Enter' && setIsExpanded(!isExpanded)}
                aria-expanded={isExpanded}
            >
                <div className="flex items-stretch">
                    <div className={`w-2 flex-shrink-0 ${color}`}></div>
                    <div className="p-4 w-full">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-800">{data.nombre}</h3>
                            <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusStyles.bg} ${statusStyles.text}`}>
                                    {currentStatus}
                                </span>
                                <svg className={`w-5 h-5 text-gray-500 transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>

                        <div className="mt-2">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div 
                                    className={`${progress.color} h-2.5 rounded-full transition-all duration-500`} 
                                    style={{ width: `${progress.percent}%` }}
                                    title={`${progress.label} - ${progress.percent}%`}
                                ></div>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>{progress.label}</span>
                                <span>{progress.percent}%</span>
                            </div>
                        </div>

                        {isExpanded && (
                            <div className="mt-4 pt-4 border-t border-gray-200 space-y-4" onClick={(e) => e.stopPropagation()}>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-600">
                                    <p><span className="font-semibold">Teléfono:</span> <a href={`tel:${data.telefono}`} className="text-green-700 hover:underline">{data.telefono}</a></p>
                                    <p><span className="font-semibold">Edad:</span> {data.edad} años</p>
                                    <p><span className="font-semibold">Peso:</span> {data.peso} kg</p>
                                    <p><span className="font-semibold">Altura:</span> {data.altura} cm</p>
                                </div>
                                
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
                                    <p className="text-xs text-gray-500">Resultado IMC</p>
                                    <p className="text-3xl font-bold text-gray-800">{data.imc}</p>
                                    <p className="text-md font-semibold text-gray-700">{data.categoria}</p>
                                </div>
                                
                                <div className="mt-4 border-t pt-4">
                                     <h4 className="text-sm font-semibold text-gray-700 mb-2">Acciones Rápidas</h4>
                                     {isLoadingData ? (
                                        <div className="flex justify-center items-center h-24 bg-gray-100 rounded-lg"><p>Cargando datos...</p></div>
                                     ) : dataError ? (
                                        <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{dataError}</div>
                                     ) : (
                                        <div className="space-y-2">
                                            <div className="flex flex-col sm:flex-row gap-2">
                                                <button onClick={handleWhatsAppClick} className="flex-1 bg-green-500 text-white py-2.5 px-4 rounded-lg font-semibold hover:bg-green-600 transition-colors duration-300 flex items-center justify-center"><WhatsappIcon /><span className="ml-2">Contactar</span></button>
                                                <button onClick={() => setIsProfileModalOpen(true)} className="flex-1 bg-blue-600 text-white py-2.5 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-300 flex items-center justify-center"><FileTextIcon />{wellnessProfile ? 'Ver / Editar Perfil' : 'Realizar Perfil'}</button>
                                                <button onClick={() => setIsQuestionnaireModalOpen(true)} className="flex-1 bg-purple-600 text-white py-2.5 px-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors duration-300 flex items-center justify-center"><ClipboardListIcon />{questionnaire ? 'Ver Cuestionario' : 'Realizar Cuestionario'}</button>
                                            </div>
                                            <div className="flex flex-col sm:flex-row gap-2">
                                                {wellnessProfile && <button onClick={() => handleExportPDF('profile')} disabled={isExporting} className="flex-1 bg-gray-700 text-white py-2 px-4 rounded-lg font-semibold hover:bg-gray-800 transition-colors duration-300 flex items-center justify-center disabled:bg-gray-400"><DownloadIcon />{isExporting ? 'Exportando...' : 'Exportar Perfil'}</button>}
                                                {questionnaire && <button onClick={() => handleExportPDF('questionnaire')} disabled={isExporting} className="flex-1 bg-gray-700 text-white py-2 px-4 rounded-lg font-semibold hover:bg-gray-800 transition-colors duration-300 flex items-center justify-center disabled:bg-gray-400"><DownloadIcon />{isExporting ? 'Exportando...' : 'Exportar Cuestionario'}</button>}
                                            </div>
                                        </div>
                                     )}
                                </div>

                                <div>
                                    <label htmlFor={`notes-${data.id}`} className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                                    <textarea id={`notes-${data.id}`} rows={3} className="w-full text-sm p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transition disabled:bg-gray-100" placeholder="Añadir una nota..." value={notes} onChange={(e) => setNotes(e.target.value)} disabled={isSavingNotes} />
                                    <button onClick={handleSaveNotes} disabled={isSavingNotes || notes === (data.notas || '')} className="mt-2 w-full sm:w-auto bg-green-600 text-white py-1.5 px-4 rounded-md font-semibold hover:bg-green-700 transition-colors duration-300 flex items-center justify-center text-sm disabled:bg-gray-400 disabled:cursor-not-allowed">
                                        {isSavingNotes ? (<><svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>Guardando...</>) : 'Guardar Nota'}
                                    </button>
                                </div>

                                <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                                    <div className="flex items-center space-x-2">
                                        <label htmlFor={`status-${data.id}`} className="text-sm font-medium text-gray-600">Estado:</label>
                                        <select id={`status-${data.id}`} value={currentStatus} onChange={handleStatusChange} disabled={isUpdating} className="text-sm rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 disabled:bg-gray-100 transition">
                                            {statusOptions.map(option => (<option key={option} value={option}>{option}</option>))}
                                        </select>
                                        {isUpdating && <svg className="animate-spin h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>}
                                    </div>
                                    <button onClick={handleDelete} disabled={isDeleting} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors duration-200 disabled:opacity-50" aria-label={`Eliminar a ${data.nombre}`}>
                                        {isDeleting ? 
                                            <svg className="animate-spin h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                                            :
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
                                        }
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {isProfileModalOpen && data.id && (
                <WellnessProfileForm
                    user={data}
                    profileData={wellnessProfile}
                    onClose={() => setIsProfileModalOpen(false)}
                    onSuccess={handleProfileSuccess}
                />
            )}
            {isQuestionnaireModalOpen && data.id && (
                <WellnessQuestionnaireForm
                    user={data}
                    questionnaireData={questionnaire}
                    onClose={() => setIsQuestionnaireModalOpen(false)}
                    onSuccess={handleQuestionnaireSuccess}
                />
            )}
        </>
    );
};

export default UserCard;