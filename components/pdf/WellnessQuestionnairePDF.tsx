import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import { WellnessQuestionnaireData } from '../../types';

interface WellnessQuestionnairePDFProps {
    data: WellnessQuestionnaireData;
}

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        padding: 30,
        fontFamily: 'Helvetica',
    },
    section: {
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#cccccc',
        paddingBottom: 10,
    },
    header: {
        fontSize: 24,
        textAlign: 'center',
        marginBottom: 20,
        color: '#333333',
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#444444',
    },
    text: {
        fontSize: 11,
        marginBottom: 4,
        color: '#555555',
    },
     label: {
        fontWeight: 'bold',
    },
    notes: {
        fontSize: 11,
        backgroundColor: '#f3f3f3',
        padding: 8,
        borderRadius: 4,
        marginTop: 5,
    }
});

const WellnessQuestionnairePDF: React.FC<WellnessQuestionnairePDFProps> = ({ data }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            <Text style={styles.header}>Cuestionario de Bienestar</Text>

             <View style={styles.section}>
                <Text style={styles.title}>Información del Participante</Text>
                <Text style={styles.text}><Text style={styles.label}>ID de Usuario:</Text> {data.user_id}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.title}>Objetivo - Conectar</Text>
                <Text style={styles.text}><Text style={styles.label}>Talla de ropa actual:</Text> {data.clothing_size || 'No especificado'}</Text>
                <Text style={styles.text}><Text style={styles.label}>Talla de ropa deseada:</Text> {data.wardrobe_goal || 'No especificado'}</Text>
                <Text style={styles.text}><Text style={styles.label}>Partes del cuerpo a mejorar:</Text> {data.body_parts_to_improve || 'No especificado'}</Text>
                <Text style={styles.text}><Text style={styles.label}>¿Qué ha intentado antes?:</Text> {data.previous_attempts || 'No especificado'}</Text>
                {/* ... Add more fields */}
            </View>
            
            <View style={styles.section}>
                <Text style={styles.title}>Cuestionario de Nutrición (Gastos)</Text>
                <Text style={styles.text}><Text style={styles.label}>Gasto diario en comida:</Text> {data.daily_food_spending || 'No especificado'}</Text>
                <Text style={styles.text}><Text style={styles.label}>Gasto diario en café:</Text> {data.daily_coffee_spending || 'No especificado'}</Text>
                <Text style={styles.text}><Text style={styles.label}>Gasto semanal en alcohol:</Text> {data.weekly_alcohol_spending || 'No especificado'}</Text>
                <Text style={styles.text}><Text style={styles.label}>Gasto semanal en comida para llevar:</Text> {data.weekly_takeout_spending || 'No especificado'}</Text>
            </View>
            
            <View style={styles.section}>
                <Text style={styles.title}>Notas del Coach</Text>
                <Text style={styles.notes}>{data.coach_notes || 'Sin notas.'}</Text>
            </View>

        </Page>
    </Document>
);

export default WellnessQuestionnairePDF;
