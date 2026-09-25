import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint') || 'competitions/SA/matches';

  // Rimuoviamo il parametro endpoint prima di inviare i parametri all'API finale
  const apiParams = new URLSearchParams(searchParams);
  apiParams.delete('endpoint');

  const queryString = apiParams.toString();
  const apiUrl = `https://api.football-data.org/v4/${endpoint}${queryString ? `?${queryString}` : ''}`;

  const apiKey = process.env.FOOTBALL_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'FOOTBALL_API_KEY non trovata su Vercel' },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'X-Auth-Token': apiKey.trim(),
        'User-Agent': 'LegaPronosticiApp/1.0',
      },
      next: { revalidate: 60 }, // Cache di 60 secondi
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || `Errore HTTP ${response.status}` },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Errore di connessione con Football-Data.org' },
      { status: 500 }
    );
  }
}
