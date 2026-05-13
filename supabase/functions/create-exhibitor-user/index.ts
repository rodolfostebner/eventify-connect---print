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
    const { username, password, exhibitorId } = await req.json()

    if (!username || !password || !exhibitorId) {
      return new Response(
        JSON.stringify({ error: 'Parâmetros obrigatórios: username, password, exhibitorId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const email = `${username}@expo.eventify.app`

    // Verificar se username já existe na tabela exhibitor_users
    const { data: existing } = await supabaseAdmin
      .from('exhibitor_users')
      .select('id')
      .eq('username', username)
      .maybeSingle()

    if (existing) {
      return new Response(
        JSON.stringify({ error: 'USERNAME_TAKEN' }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Criar usuário no auth sem confirmação de email
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError) {
      if (authError.message.includes('already registered')) {
        return new Response(
          JSON.stringify({ error: 'USERNAME_TAKEN' }),
          { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      throw authError
    }

    // Vincular usuário ao expositor
    const { error: linkError } = await supabaseAdmin
      .from('exhibitor_users')
      .insert({ exhibitor_id: exhibitorId, supabase_user_id: authData.user.id, username })

    if (linkError) {
      // Rollback: remover usuário criado
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      throw linkError
    }

    return new Response(
      JSON.stringify({ userId: authData.user.id, username, email }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Erro ao criar usuário expositor:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Erro interno' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
