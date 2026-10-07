import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import type { Database } from '#shared/types/database.types'

export default defineEventHandler(async (event) => {
  // 1. Must be logged in at all
  const requestingUser = await serverSupabaseUser(event)
  if (!requestingUser?.email) {
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  }

  // Service-role client — this bypasses RLS and can call the Auth Admin API,
  // so it must only ever be used server-side, never returned to the client.
  const client = serverSupabaseServiceRole<Database>(event)

  // 2. Re-check admin status server-side. Don't trust the client's own belief
  // that it's allowed to invite people — the route middleware guards the page,
  // but this endpoint needs its own independent check.
  const { data: requester, error: requesterError } = await client
    .from('STAFF')
    .select('authority')
    .eq('email', requestingUser.email)
    .single()

  console.log(requesterError)

  if (requesterError || requester?.authority !== 'OCESL') {
    throw createError({ statusCode: 403, statusMessage: 'Only OCESL admins can invite staff' })
  }

  const body = await readBody<{ email?: string; name?: string }>(event)
  const email = body.email?.trim()
  const name = body.name?.trim()

  if (!email || !name) {
    throw createError({ statusCode: 400, statusMessage: 'Email and name are required' })
  }

  // 3. Send the actual invite email via Supabase Auth
  const { error: inviteError } = await client.auth.admin.inviteUserByEmail(email)
  if (inviteError) {
    throw createError({ statusCode: 500, statusMessage: inviteError.message })
  }

  // 4. Create their STAFF profile row now, so useUserData() resolves correctly
  // by email the moment they accept the invite and log in.
  const { data: staffRow, error: staffError } = await client
    .from('STAFF')
    .insert({ email, name, authority: '', position: null })
    .select()
    .single()

  if (staffError) {
    throw createError({ statusCode: 500, statusMessage: staffError.message })
  }

  return staffRow
})
