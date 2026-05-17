-- ====================================================================
-- Script SQL para inicializar Módulo Académico en Supabase
-- Ejecutar en el SQL Editor de Supabase
-- ====================================================================

-- 1. Tabla de Tareas (Assignments)
CREATE TABLE IF NOT EXISTS public.assignments (
    id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabla de Entregas de Tareas
CREATE TABLE IF NOT EXISTS public.assignment_submissions (
    id SERIAL PRIMARY KEY,
    assignment_id INTEGER REFERENCES public.assignments(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    grade NUMERIC,
    comments TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(assignment_id, student_id)
);

-- 3. Tabla de Cuestionarios (Quizzes)
CREATE TABLE IF NOT EXISTS public.quizzes (
    id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tabla de Preguntas de Cuestionarios
CREATE TABLE IF NOT EXISTS public.quiz_questions (
    id SERIAL PRIMARY KEY,
    quiz_id INTEGER REFERENCES public.quizzes(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_option INTEGER NOT NULL
);

-- 5. Tabla de Resultados de Cuestionarios
CREATE TABLE IF NOT EXISTS public.quiz_results (
    id SERIAL PRIMARY KEY,
    quiz_id INTEGER REFERENCES public.quizzes(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(quiz_id, student_id)
);

-- Habilitar RLS (Opcional, según la configuración de seguridad del instituto)
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;

-- Políticas permisivas básicas (ajustar en producción)
CREATE POLICY "Permitir select" ON public.assignments FOR SELECT USING (true);
CREATE POLICY "Permitir insert" ON public.assignments FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir update" ON public.assignments FOR UPDATE USING (true);
CREATE POLICY "Permitir delete" ON public.assignments FOR DELETE USING (true);

-- (Repetir para las demás tablas si es necesario)
