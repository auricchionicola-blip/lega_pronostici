import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint') || 'competitions/SA/matches';

  searchParams.delete('endpoint');
  const queryString = searchParams.toString();
  const apiUrl = `https://api.football-data.org/v4/${endpoint}${queryString ? `?${queryString}` : ''}`;

  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'X-Auth-Token': process.env.FOOTBALL_API_KEY,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Errore API Football-Data: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Errore durante la connessione a Football-Data.org' },
      { status: 500 }
    );
  }
}
