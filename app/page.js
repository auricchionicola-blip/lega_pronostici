'use client';

import React, { useState } from 'react';
import { Trophy, Calendar, Users, Settings } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('matches');
  const [selectedLeague, setSelectedLeague] = useState('SA');
  const [matchday, setMatchday] = useState(28);
  const [standingsType, setStandingsType] = useState('matchday');
  const [userPredictions, setUserPredictions] = useState({});
  const [inviteCode, setInviteCode] = useState('');
  const [apiKey, setApiKey] = useState('');

  // Campionati supportati
  const leagues = [
    { id: 'SA', name: 'Serie A', country: '🇮🇹' },
    { id: 'PL', name: 'Premier League', country: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
    { id: 'PD', name: 'La Liga', country: '🇪🇸' },
    { id: 'FL1', name: 'Ligue 1', country: '🇫🇷' },
    { id: 'CL', name: 'Champions League', country: '🇪🇺' },
    { id: 'EL', name: 'Europa League', country: '🇪🇺' },
  ];

  // Dati di esempio per le partite
  const matches = [
    {
      id: 1,
      home: 'Parma',
      away: 'Lazio',
      time: 'Oggi 18:00',
      status: 'FINISHED',
      realHomeScore: 2,
      realAwayScore: 1,
    },
    {
      id: 2,
      home: 'Inter',
      away: 'Juventus',
      time: 'Oggi 20:45',
      status: 'SCHEDULED',
      realHomeScore: null,
      realAwayScore: null,
    },
    {
      id: 3,
      home: 'Milan',
      away: 'Roma',
      time: 'Dom 15:00',
      status: 'SCHEDULED',
      realHomeScore: null,
      realAwayScore: null,
    },
  ];

  // Classifica di prova
  const leaderboard = [
    { rank: 1, name: 'Marco (Tu)', matchdayPts: 6, totalPts: 142, exactScores: 2 },
    { rank: 2, name: 'Luca', matchdayPts: 4, totalPts: 138, exactScores: 1 },
    { rank: 3, name: 'Giulia', matchdayPts: 1, totalPts: 130, exactScores: 0 },
    { rank: 4, name: 'Matteo', matchdayPts: 0, totalPts: 125, exactScores: 1 },
  ];

  const handlePredictionChange = (matchId, field, value) => {
    setUserPredictions((prev) => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [field]: value,
      },
    }));
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans pb-24 max-w-md mx-auto shadow-2xl border-x border-slate-200">
      {/* Header chiaro con gradiente sportivo */}
      <header className="bg-gradient-to-r from-emerald-700 to-teal-800 text-white p-4 shadow-md sticky top-0 z-50 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Trophy className="w-6 h-6 text-amber-300" />
          <h1 className="font-bold text-lg tracking-wide">Lega Pronostici</h1>
        </div>
        <div className="bg-emerald-900/60 text-emerald-100 text-xs px-3 py-1 rounded-full font-medium border border-emerald-400/30">
          Lega #8492
        </div>
      </header>

      {/* Selector Campionato */}
      <div className="p-3 bg-white border-b border-slate-200 flex space-x-2 overflow-x-auto shadow-sm">
        {leagues.map((league) => (
          <button
            key={league.id}
            onClick={() => setSelectedLeague(league.id)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              selectedLeague === league.id
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>{league.country}</span>
            <span>{league.name}</span>
          </button>
        ))}
      </div>

      {/* Contenuto Principale */}
      <main className="p-4">
        {/* TAB 1: PARTITE E PRONOSTICI */}
        {activeTab === 'matches' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm border border-slate-200">
              <span className="text-sm font-bold text-slate-700">Giornata {matchday}</span>
              <div className="flex space-x-1">
                <button
                  onClick={() => setMatchday(Math.max(1, matchday - 1))}
                  className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs rounded-lg font-semibold hover:bg-slate-200 border border-slate-200"
                >
                  &lt; Pres
                </button>
                <button
                  onClick={() => setMatchday(matchday + 1)}
                  className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs rounded-lg font-semibold hover:bg-slate-200 border border-slate-200"
                >
                  Succ &gt;
                </button>
              </div>
            </div>

            {matches.map((match) => (
              <div key={match.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 space-y-3">
                <div className="flex justify-between items-center text-xs text-slate-500 border-b border-slate-100 pb-2">
                  <span className="font-medium">{match.time}</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded-md text-[11px] ${
                      match.status === 'FINISHED'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {match.status === 'FINISHED' ? 'Finale' : 'Aperto'}
                  </span>
                </div>

                {/* Squadre e Risultati Reali */}
                <div className="flex justify-between items-center py-1">
                  <span className="font-bold text-slate-800 text-base w-1/3 text-right">{match.home}</span>
                  <div className="bg-slate-100 px-3 py-1.5 rounded-xl font-mono font-bold text-sm text-center border border-slate-200 min-w-[60px]">
                    {match.status === 'FINISHED' ? `${match.realHomeScore} - ${match.realAwayScore}` : 'VS'}
                  </div>
                  <span className="font-bold text-slate-800 text-base w-1/3 text-left">{match.away}</span>
                </div>

                {/* Modulo Pronostico */}
                <div className="bg-slate-50 p-3 rounded-xl space-y-2 border border-slate-200/80">
                  <div className="text-xs font-semibold text-slate-500 mb-1">Il tuo Pronostico:</div>

                  {/* Esito 1X2 */}
                  <div className="grid grid-cols-3 gap-2">
                    {['1', 'X', '2'].map((outcome) => (
                      <button
                        key={outcome}
                        onClick={() => handlePredictionChange(match.id, 'outcome', outcome)}
                        className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                          userPredictions[match.id]?.outcome === outcome
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {outcome}
                      </button>
                    ))}
                  </div>

                  {/* Risultato Esatto */}
                  <div className="flex items-center space-x-2 pt-1">
                    <span className="text-xs text-slate-600 w-24 font-medium">Risultato:</span>
                    <input
                      type="number"
                      placeholder="0"
                      onChange={(e) => handlePredictionChange(match.id, 'homeScore', e.target.value)}
                      className="w-12 bg-white text-center text-xs py-1 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                    />
                    <span className="text-xs text-slate-400 font-bold">-</span>
                    <input
                      type="number"
                      placeholder="0"
                      onChange={(e) => handlePredictionChange(match.id, 'awayScore', e.target.value)}
                      className="w-12 bg-white text-center text-xs py-1 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                    />
                  </div>

                  {/* Marcatore */}
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-slate-600 w-24 font-medium">Marcatore:</span>
                    <input
                      type="text"
                      placeholder="Es. Rossi"
                      onChange={(e) => handlePredictionChange(match.id, 'scorer', e.target.value)}
                      className="flex-1 bg-white px-2.5 py-1 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>
            ))}

            <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-md active:scale-95 transition-all text-sm">
              Salva Pronostici
            </button>
          </div>
        )}

        {/* TAB 2: CLASSIFICA */}
        {activeTab === 'standings' && (
          <div className="space-y-4">
            <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200">
              <button
                onClick={() => setStandingsType('matchday')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  standingsType === 'matchday' ? 'bg-emerald-600 text-white' : 'text-slate-500'
                }`}
              >
                Giornata {matchday}
              </button>
              <button
                onClick={() => setStandingsType('total')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  standingsType === 'total' ? 'bg-emerald-600 text-white' : 'text-slate-500'
                }`}
              >
                Generale
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              {leaderboard.map((user, idx) => (
                <div
                  key={user.name}
                  className={`flex items-center justify-between p-3.5 border-b border-slate-100 ${
                    idx === 0 ? 'bg-amber-50/60' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span
                      className={`w-6 text-center font-extrabold text-xs rounded-full py-1 ${
                        idx === 0
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {user.rank}
                    </span>
                    <span className="font-semibold text-sm text-slate-800">{user.name}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-xs text-slate-400">{user.exactScores} esatti</span>
                    <span className="font-extrabold text-emerald-700 text-base font-mono">
                      {standingsType === 'matchday' ? `${user.matchdayPts} pt` : `${user.totalPts} pt`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: LEGA */}
        {activeTab === 'league' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 space-y-3">
              <h3 className="font-bold text-sm text-slate-800">Codice Invito Lega</h3>
              <p className="text-xs text-slate-500">Condividi questo codice con i tuoi amici:</p>
              <div className="bg-slate-50 p-3 rounded-xl text-center font-mono font-extrabold text-emerald-700 text-lg tracking-widest border border-slate-200">
                LEGA-8492
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 space-y-3">
              <h3 className="font-bold text-sm text-slate-800">Unisciti a una Lega</h3>
              <input
                type="text"
                placeholder="Inserisci codice invito"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                className="w-full bg-slate-50 p-2.5 rounded-xl text-xs border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button className="w-full bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold py-2.5 rounded-xl transition-all">
                Entra nella Lega
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: IMPOSTAZIONI */}
        {activeTab === 'settings' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 space-y-3">
              <h3 className="font-bold text-sm text-slate-800">Configurazione API Football</h3>
              <p className="text-xs text-slate-500">
                Inserisci qui la tua chiave API per scaricare le partite in tempo reale:
              </p>
              <input
                type="password"
                placeholder="API Key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full bg-slate-50 p-2.5 rounded-xl text-xs border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button className="w-full bg-emerald-600 text-white text-xs font-bold py-2.5 rounded-xl shadow-sm hover:bg-emerald-700">
                Salva Chiave API
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation chiara */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur border-t border-slate-200 grid grid-cols-4 py-2 z-50 shadow-lg">
        <button
          onClick={() => setActiveTab('matches')}
          className={`flex flex-col items-center space-y-1 ${
            activeTab === 'matches' ? 'text-emerald-600 font-bold' : 'text-slate-400'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[10px]">Partite</span>
        </button>

        <button
          onClick={() => setActiveTab('standings')}
          className={`flex flex-col items-center space-y-1 ${
            activeTab === 'standings' ? 'text-emerald-600 font-bold' : 'text-slate-400'
          }`}
        >
          <Trophy className="w-5 h-5" />
          <span className="text-[10px]">Classifica</span>
        </button>

        <button
          onClick={() => setActiveTab('league')}
          className={`flex flex-col items-center space-y-1 ${
            activeTab === 'league' ? 'text-emerald-600 font-bold' : 'text-slate-400'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px]">Lega</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center space-y-1 ${
            activeTab === 'settings' ? 'text-emerald-600 font-bold' : 'text-slate-400'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px]">API</span>
        </button>
      </nav>
    </div>
  );
}
