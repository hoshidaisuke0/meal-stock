import { createSupabaseClient } from '@/supabase/client';

export default defineNuxtPlugin(() => {
  const supabase = createSupabaseClient();

  return {
    provide: {
      supabase,
    },
  };
});
