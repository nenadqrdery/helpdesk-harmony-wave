import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://sehqweccprkpmqsubult.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlaHF3ZWNjcHJrcG1xc3VidWx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MDc2OTUsImV4cCI6MjA2NTI4MzY5NX0.xz8TQLsVvsEsqcnT5T39FcVPFtHWxxq2I77nmeCz8wc";

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 