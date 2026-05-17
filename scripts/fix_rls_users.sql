-- ====================================================================
-- SCRIPT DE CONVERGENCIA Y ARREGLO DE RLS PARA WEST HOUSE
-- ====================================================================
-- EJECUTAR ESTO EN EL SQL EDITOR DE SUPABASE (https://supabase.com)
-- Esto desactivará la seguridad de fila (RLS) en todas las tablas
-- para permitir que la aplicación funcione con normalidad tal como lo
-- hacía en SQLite, sin bloquear a los profesores ni alumnos.
-- ====================================================================

ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.events DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_rewards DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_results DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_submissions DISABLE ROW LEVEL SECURITY;

-- Confirmación visual de ejecución exitosa
SELECT '¡Seguridad RLS desactivada con éxito! Los profesores ya pueden ver a todos sus alumnos.' AS Estado;
