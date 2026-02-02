import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { email, password, nombre, rol, activo_hasta } = await req.json()

    // 1. Create the user in Auth
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { nombre, rol }
    })

    if (userError) throw userError

    // 2. The trigger normally handles profile creation, but if we need specific attributes like 'activo_hasta'
    // we might want to update the profile immediately.
    // Let's retry fetching the profile or updating it directly if it exists.
    if (userData.user && activo_hasta) {
        // Wait a small moment for trigger? Or just upsert
        // Best practice: The trigger creates the row. We update it.
        const { error: updateError } = await supabaseAdmin
            .from('perfiles')
            .update({ activo_hasta })
            .eq('id', userData.user.id)
        
        if (updateError) {
             console.error("Error updating activo_hasta:", updateError)
        }
    }

    return new Response(
      JSON.stringify(userData),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
