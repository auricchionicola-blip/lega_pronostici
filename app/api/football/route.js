import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  let endpoint = searchParams.get('endpoint') || 'competitions/SA/matches';

  // Pulizia da eventuali caratteri estranei o parentesi nel parametro
  endpoint = endpoint.replace(/[\[\]\(\)]/g, '').trim();

  const apiParams = new URLSearchParams(searchParams);
  apiParams.delete('endpoint');

  const queryString = apiParams.toString();
  const apiUrl = `https://api.football-data.org/v4/${endpoint}${queryString ? `?${queryString}` : ''}`;

  const apiKey = process.env.FOOTBALL_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'FOOTBALL_API_KEY non trovata nelle variabili d\'ambiente di Vercel.' },
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
      next: { revalidate: 60 },
    });

    const responseText = await response.text();

    // Tenta il parsing JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      return NextResponse.json(
        { error: `Risposta non valida dall'API (${response.status}): ${responseText.slice(0, 150)}` },
        { status: response.status || 500 }
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || `Errore HTTP ${response.status}` },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Errore durante la connessione a Football-Data.org' },
      { status: 500 }
    );
  }
}
