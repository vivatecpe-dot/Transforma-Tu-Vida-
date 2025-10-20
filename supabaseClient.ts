import { createClient } from '@supabase/supabase-js';

// Credenciales de Supabase.
// Estas claves son seguras para ser expuestas en el navegador ya que Supabase
// utiliza Row Level Security (RLS) para proteger tus datos.
const supabaseUrl = 'https://wszxpxpkyugnslsmehoq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzenhweHBreXVnbnNsc21laG9xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3MDgyOTIsImV4cCI6MjA3NjI4NDI5Mn0.UOlFGO8QejAbU-T-oGj_6_ovqxe5_PkPc8Em5pwaGfw';


if (!supabaseUrl || !supabaseAnonKey) {
    // Este error aparecerá en la consola del navegador si las credenciales no se han configurado.
    throw new Error('Las credenciales de Supabase no están configuradas.');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
