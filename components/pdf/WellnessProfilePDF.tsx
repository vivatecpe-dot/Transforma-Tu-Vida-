import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import { WellnessProfileData } from '../../types';

interface WellnessProfilePDFProps {
    data: WellnessProfileData;
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
    }
});

const WellnessProfilePDF: React.FC<WellnessProfilePDFProps> = ({ data }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            <Text style={styles.header}>Perfil de Bienestar</Text>

            <View style={styles.section}>
                <Text style={styles.title}>Información del Participante</Text>
                <Text style={styles.text}><Text style={styles.label}>ID de Usuario:</Text> {data.user_id}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.title}>Metas</Text>
                <Text style={styles.text}><Text style={styles.label}>Objetivos:</Text> {data.goals?.join(', ') || 'No especificado'}</Text>
                <Text style={styles.text}><Text style={styles.label}>Otras Metas:</Text> {data.other_goals || 'No especificado'}</Text>
            </View>
            
            <View style={styles.section}>
                <Text style={styles.title}>Análisis de Nutrición y Salud</Text>
                <Text style={styles.text}><Text style={styles.label}>Hora de despertar:</Text> {data.wake_up_time || 'No especificado'}</Text>
                <Text style={styles.text}><Text style={styles.label}>Hora de dormir:</Text> {data.sleep_time || 'No especificado'}</Text>
                {/* ... Add more fields from WellnessProfileData */}
            </View>

            <View style={styles.section}>
                 <Text style={styles.title}>Referidos</Text>
                 {data.referrals?.map((ref, index) => (
                    <Text key={index} style={styles.text}>
                        {index + 1}. {ref.name} - {ref.phone}
                    </Text>
                 )) || <Text style={styles.text}>No hay referidos.</Text>}
            </View>
        </Page>
    </Document>
);

export default WellnessProfilePDF;
