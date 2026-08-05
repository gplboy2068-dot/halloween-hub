-- Enable Row Level Security for generation_bookmarks
ALTER TABLE public.generation_bookmarks ENABLE ROW LEVEL SECURITY;

-- Policy: Users view own bookmarks
CREATE POLICY "Users view own bookmarks" 
ON public.generation_bookmarks
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Policy: Users bookmark self
CREATE POLICY "Users bookmark self" 
ON public.generation_bookmarks
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Policy: Users unbookmark self
CREATE POLICY "Users unbookmark self" 
ON public.generation_bookmarks
FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);
