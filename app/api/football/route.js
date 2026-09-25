import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint') || 'fixtures';

  searchParams.delete('endpoint');
  const queryString = searchParams.toString();
  const apiUrl = `https://v3.football.api-sports.io/${endpoint}?${queryString}`;

  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'x-apisports-key': process.env.FOOTBALL_API_KEY,
      },
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Errore nel recupero dati API' }, { status: 500 });
  }
}
