import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const EMAIL_DOMAINS: Record<string, string> = {
  event_admin: 'eventadmin.eventify.app',
  avaliador:   'avaliador.eventify.app',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { username, password, eventId, role, name } = await req.json()

    if (!username || !password || !eventId || !role) {
      return new Response(
        JSON.stringify({ error: 'Parâmetros obrigatórios: username, password, eventId, role' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!EMAIL_DOMAINS[role]) {
      return new Response(
        JSON.stringify({ error: 'Role inválido. Use: event_admin ou avaliador' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const email = `${username}@${EMAIL_DOMAINS[role]}`

    // Verificar se username já existe
    const { data: existing } = await supabaseAdmin
      .from('event_roles')
      .select('id')
      .eq('username', username)
      .maybeSingle()

    if (existing) {
      return new Response(
        JSON.stringify({ error: 'USERNAME_TAKEN' }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

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

    const { error: linkError } = await supabaseAdmin
      .from('event_roles')
      .insert({ event_id: eventId, supabase_user_id: authData.user.id, username, role, name: name ?? null })

    if (linkError) {
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      throw linkError
    }

    return new Response(
      JSON.stringify({ userId: authData.user.id, username, email, role }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Erro ao criar usuário de papel:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Erro interno' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
