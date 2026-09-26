import { NextResponse } from 'next/server';

const baseUrl = 'https://ciklkrqvzaputhoilstl.supabase.co';
const supabaseKey = 'sb_publishable_XDgb0Vbh_uuKyB9nc1SZCA__xtJcXOK';

// GET: Legge i pronostici di una specifica lega oppure di un utente
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const leagueCode = searchParams.get('league_code');
  const nickname = searchParams.get('nickname');

  try {
    let url = `${baseUrl}/rest/v1/predictions?select=*`;
    
    if (leagueCode) {
      url += `&league_code=eq.${encodeURIComponent(leagueCode)}`;
    } else if (nickname) {
      url += `&nickname=eq.${encodeURIComponent(nickname)}`;
    } else {
      return NextResponse.json({ error: 'Parametro mancante (league_code o nickname)' }, { status: 400 });
    }

    const res = await fetch(url, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
      cache: 'no-store',
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Salva o aggiorna un pronostico (o array) su Supabase con Upsert
export async function POST(request) {
  try {
    const body = await request.json();

    const res = await fetch(`${baseUrl}/rest/v1/predictions`, {
      method: 'POST',
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Errore Supabase POST:', errText);
      return NextResponse.json({ error: errText }, { status: res.status });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
