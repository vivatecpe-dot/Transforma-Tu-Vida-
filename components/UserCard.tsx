import React, { useState, useRef, useEffect } from 'react';
import { BmiData } from '../types';
import { WhatsappIcon } from './icons/WhatsappIcon';

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

    useEffect(() => {
        if (isEditingNotes && notesTextareaRef.current) {
            notesTextareaRef.current.style.height = 'auto';
            notesTextareaRef.current.style.height = `${notesTextareaRef.current.scrollHeight}px`;
        }
    }, [isEditingNotes, notes]);


    const statusOptions = ['Nuevo', 'Contactado', 'Evaluación Agendada', 'En Acompañamiento', 'Finalizado', 'No interesado'];
    const statusColors: { [key: string]: string } = {
        'Nuevo': 'bg-blue-100 text-blue-800',
        'Contactado': 'bg-yellow-100 text-yellow-800',
        'Evaluación Agendada': 'bg-purple-100 text-purple-800',
        'En Acompañamiento': 'bg-green-100 text-green-800',
        'Finalizado': 'bg-gray-100 text-gray-800',
        'No interesado': 'bg-red-100 text-red-800',
    };
    
    const getCategoryColor = (category: string) => {
        const lowerCaseCategory = category.toLowerCase();
        if (lowerCaseCategory.includes('obesidad')) return 'border-red-500';
        if (lowerCaseCategory.includes('sobrepeso')) return 'border-yellow-500';
        if (lowerCaseCategory.includes('peso normal')) return 'border-green-500';
        if (lowerCaseCategory.includes('bajo peso')) return 'border-blue-500';
        return 'border-gray-300';
    };


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
        const whatsappNumber = data.telefono.replace(/\D/g, ''); // Eliminar no dígitos
        const message = `¡Hola ${data.nombre}! Soy Cindy, tu coach de bienestar. Recibí tu evaluación y estoy emocionada de que comencemos juntos tu transformación. ¿Te parece si coordinamos una llamada para conversar sobre tus metas? 😊`;
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
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
        </div>
    );
};

export default UserCard;
