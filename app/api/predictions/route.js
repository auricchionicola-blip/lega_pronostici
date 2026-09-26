import { NextResponse } from 'next/server';

const baseUrl = 'https://ciklkrqvzaputhoilstl.supabase.co';
const supabaseKey = 'sb_publishable_XDgb0Vbh_uuKyB9nc1SZCA__xtJcXOK';

const headers = {
  apikey: supabaseKey,
  Authorization: `Bearer ${supabaseKey}`,
  'Content-Type': 'application/json',
  'Prefer': 'resolution=merge-duplicates',
};

// GET: Legge i pronostici o le leghe
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const leagueCode = searchParams.get('league_code');
  const action = searchParams.get('action');
  const username = searchParams.get('username');

  try {
    // 1. Recupera la lista delle leghe di un utente
    if (action === 'get_user_leagues' && username) {
      const res = await fetch(
        `${baseUrl}/rest/v1/user_leagues?username=eq.${encodeURIComponent(username)}&select=*`,
        { headers, cache: 'no-store' }
      );
      const data = await res.json();
      return NextResponse.json(data);
    }

    // 2. Legge i pronostici di una specifica lega
    if (leagueCode) {
      const res = await fetch(
        `${baseUrl}/rest/v1/predictions?league_code=eq.${encodeURIComponent(leagueCode)}&select=*`,
        { headers, cache: 'no-store' }
      );
      const data = await res.json();
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: 'Parametri insufficienti' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Gestisce Login, Registrazione, Adesione Lega e Salvataggio Pronostici
export async function POST(request) {
  try {
    const body = await request.json();
    const { action } = body;

    // 1. REGISTRAZIONE UTENTE
    if (action === 'register') {
      const { username, password } = body;

      // Verifichiamo se l'utente esiste già
      const checkRes = await fetch(
        `${baseUrl}/rest/v1/app_users?username=eq.${encodeURIComponent(username)}&select=*`,
        { headers, cache: 'no-store' }
      );
      const existing = await checkRes.json();

      if (Array.isArray(existing) && existing.length > 0) {
        return NextResponse.json({ error: 'Questo Username è già esistente. Scegli un altro nome o fai il Login.' }, { status: 400 });
      }

      // Inserimento nuovo utente
      const regRes = await fetch(`${baseUrl}/rest/v1/app_users`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ username, password }),
      });

      if (!regRes.ok) {
        const errText = await regRes.text();
        return NextResponse.json({ error: errText }, { status: regRes.status });
      }

      return NextResponse.json({ success: true });
    }

    // 2. LOGIN UTENTE
    if (action === 'login') {
      const { username, password } = body;

      const res = await fetch(
        `${baseUrl}/rest/v1/app_users?username=eq.${encodeURIComponent(username)}&password=eq.${encodeURIComponent(password)}&select=*`,
        { headers, cache: 'no-store' }
      );
      const users = await res.json();

      if (Array.isArray(users) && users.length > 0) {
        return NextResponse.json({ success: true, username: users[0].username });
      } else {
        return NextResponse.json({ error: 'Username o Password errati.' }, { status: 401 });
      }
    }

    // 3. UNIRSI O CREARE UNA NUOVA LEGA
    if (action === 'join_league') {
      const { username, league_code } = body;

      // Inserisce il legame utente <-> lega
      await fetch(`${baseUrl}/rest/v1/user_leagues`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ username, league_code }),
      });

      // Registra anche la riga JOIN_ENTRY nei pronostici
      await fetch(`${baseUrl}/rest/v1/predictions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          league_code,
          nickname: username,
          match_id: 'JOIN_ENTRY',
          home_score: null,
          away_score: null,
          outcome: null,
          scorer: null
        }),
      });

      return NextResponse.json({ success: true });
    }

    // 4. SALVATAGGIO PRONOSTICI (STANDARD)
    const res = await fetch(`${baseUrl}/rest/v1/predictions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ error: errText }, { status: res.status });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
