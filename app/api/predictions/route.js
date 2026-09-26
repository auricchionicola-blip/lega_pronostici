import { NextResponse } from 'next/server';

const baseUrl = 'https://ciklkrqvzaputhoilstl.supabase.co';
const supabaseKey = 'sb_publishable_XDgb0Vbh_uuKyB9nc1SZCA__xtJcXOK';

// GET: Legge tutti i pronostici della lega
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const leagueCode = searchParams.get('league_code');

  if (!leagueCode) {
    return NextResponse.json({ error: 'Codice lega mancante' }, { status: 400 });
  }

  try {
    const res = await fetch(
      `${baseUrl}/rest/v1/predictions?league_code=eq.${leagueCode}&select=*`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
        cache: 'no-store',
      }
    );
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Salva o aggiorna un pronostico su Supabase con Upsert
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
      return NextResponse.json({ error: errText }, { status: res.status });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
