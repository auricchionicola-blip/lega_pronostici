'use client';

import React, { useState, useEffect } from 'react';
import { Trophy, Calendar, Users, Settings, Award, CheckCircle2, ChevronRight, Shield, Flame, Plus } from 'lucide-react';

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
      realScorers: ['Rossi', 'Immobile'],
    },
    {
      id: 2,
      home: 'Inter',
      away: 'Juventus',
      time: 'Oggi 20:45',
      status: 'SCHEDULED',
      realHomeScore: null,
      realAwayScore: null,
      realScorers: [],
    },
    {
      id: 3,
      home: 'Milan',
      away: 'Roma',
      time: 'Dom 15:00',
      status: 'SCHEDULED',
      realHomeScore: null,
      realAwayScore: null,
      realScorers: [],
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
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-24 max-w-md mx-auto border-x border-slate-800">
      {/* Header */}
      <header className="bg-slate-900 p-4 border-b border-slate-800 sticky top-0 z-50 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Trophy className="w-6 h-6 text-amber-400" />
          <h1 className="font-bold text-lg tracking-wide text-white">Lega Pronostici</h1>
        </div>
        <div className="bg-slate-800 text-xs px-2.5 py-1 rounded-full text-amber-400 font-medium border border-amber-500/20">
          Lega #8492
        </div>
      </header>

      {/* Selector Campionato */}
      <div className="p-3 bg-slate-900/50 border-b border-slate-800 flex space-x-2 overflow-x-auto no-scrollbar">
        {leagues.map((league) => (
          <button
            key={league.id}
            onClick={() => setSelectedLeague(league.id)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              selectedLeague === league.id
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
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
            <div className="flex justify-between items-center bg-slate-900 p-3 rounded-xl border border-slate-800">
              <span className="text-sm font-semibold text-slate-300">Giornata {matchday}</span>
              <div className="flex space-x-1">
                <button
                  onClick={() => setMatchday(Math.max(1, matchday - 1))}
                  className="px-2 py-1 bg-slate-800 text-xs rounded hover:bg-slate-700"
                >
                  &lt; Pres
                </button>
                <button
                  onClick={() => setMatchday(matchday + 1)}
                  className="px-2 py-1 bg-slate-800 text-xs rounded hover:bg-slate-700"
                >
                  Succ &gt;
                </button>
              </div>
            </div>

            {matches.map((match) => (
              <div key={match.id} className="bg-slate-900 rounded-xl border border-slate-800 p-4 space-y-3">
                <div className="flex justify-between items-center text-xs text-slate-400 border-b border-slate-800/60 pb-2">
                  <span>{match.time}</span>
                  <span className={match.status === 'FINISHED' ? 'text-emerald-400 font-semibold' : 'text-amber-400'}>
                    {match.status === 'FINISHED' ? 'Finale' : 'Aperto'}
                  </span>
                </div>

                {/* Squadre e Risultati Reali */}
                <div className="flex justify-between items-center py-2">
                  <span className="font-bold text-base w-1/3 text-right">{match.home}</span>
                  <div className="bg-slate-800 px-3 py-1 rounded-lg font-mono font-bold text-sm text-center">
                    {match.status === 'FINISHED' ? `${match.realHomeScore} - ${match.realAwayScore}` : 'VS'}
                  </div>
                  <span className="font-bold text-base w-1/3 text-left">{match.away}</span>
                </div>

                {/* Modulo Pronostico */}
                <div className="bg-slate-950/60 p-3 rounded-lg space-y-2 border border-slate-800/80">
                  <div className="text-xs font-semibold text-slate-400 mb-1">Il tuo Pronostico:</div>
                  
                  {/* Esito 1X2 */}
                  <div className="grid grid-cols-3 gap-2">
                    {['1', 'X', '2'].map((outcome) => (
                      <button
                        key={outcome}
                        onClick={() => handlePredictionChange(match.id, 'outcome', outcome)}
                        className={`py-1.5 rounded text-xs font-bold transition-all ${
                          userPredictions[match.id]?.outcome === outcome
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {outcome}
                      </button>
                    ))}
                  </div>

                  {/* Risultato Esatto */}
                  <div className="flex items-center space-x-2 pt-1">
                    <span className="text-xs text-slate-400 w-24">Risultato:</span>
                    <input
                      type="number"
                      placeholder="0"
                      onChange={(e) => handlePredictionChange(match.id, 'homeScore', e.target.value)}
                      className="w-12 bg-slate-800 text-center text-xs py-1 rounded border border-slate-700 focus:outline-none focus:border-amber-500"
                    />
                    <span className="text-xs text-slate-500">-</span>
                    <input
                      type="number"
                      placeholder="0"
                      onChange={(e) => handlePredictionChange(match.id, 'awayScore', e.target.value)}
                      className="w-12 bg-slate-800 text-center text-xs py-1 rounded border border-slate-700 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Marcatore */}
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-slate-400 w-24">Marcatore:</span>
                    <input
                      type="text"
                      placeholder="Es. Rossi"
                      onChange={(e) => handlePredictionChange(match.id, 'scorer', e.target.value)}
                      className="flex-1 bg-slate-800 px-2 py-1 text-xs rounded border border-slate-700 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>
            ))}

            <button className="w-full bg-amber-500 text-slate-950 font-bold py-3 rounded-xl shadow-lg shadow-amber-500/20 active:scale-95 transition-all">
              Salva Pronostici
            </button>
          </div>
        )}

        {/* TAB 2: CLASSIFICA */}
        {activeTab === 'standings' && (
          <div className="space-y-4">
            <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setStandingsType('matchday')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  standingsType === 'matchday' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'
                }`}
              >
                Giornata {matchday}
              </button>
              <button
                onClick={() => setStandingsType('total')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  standingsType === 'total' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'
                }`}
              >
                Generale
              </button>
            </div>

            <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
              {leaderboard.map((user, idx) => (
                <div
                  key={user.name}
                  className={`flex items-center justify-between p-3.5 border-b border-slate-800/60 ${
                    idx === 0 ? 'bg-amber-500/10' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span
                      className={`w-6 text-center font-bold text-xs ${
                        idx === 0 ? 'text-amber-400' : 'text-slate-500'
                      }`}
                    >
                      {user.rank}
                    </span>
                    <span className="font-semibold text-sm">{user.name}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-xs text-slate-400">{user.exactScores} esatti</span>
                    <span className="font-bold text-amber-400 text-base font-mono">
                      {standingsType === 'matchday' ? `${user.matchdayPts} pt` : `${user.totalPts} pt`}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Regolamento Punteggi */}
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/80 text-xs text-slate-400 space-y-1">
              <div className="font-semibold text-slate-300 mb-2">Regolamento Punteggi:</div>
              <div>• <strong>1 Punto:</strong> Esito 1X2 indovinato</div>
              <div>• <strong>2 Punti:</strong> Marcatore indovinato</div>
              <div>• <strong>3 Punti:</strong> Risultato esatto indovinato</div>
            </div>
          </div>
        )}

        {/* TAB 3: LEGA */}
        {activeTab === 'league' && (
          <div className="space-y-4">
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
              <h3 className="font-bold text-sm text-slate-200">Codice Invito Lega</h3>
              <p className="text-xs text-slate-400">Condividi questo codice con i tuoi amici per farli unire:</p>
              <div className="bg-slate-950 p-3 rounded-lg text-center font-mono font-bold text-amber-400 text-lg tracking-widest border border-slate-800">
                LEGA-8492
              </div>
            </div>

            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
              <h3 className="font-bold text-sm text-slate-200">Unisciti a una Lega</h3>
              <input
                type="text"
                placeholder="Inserisci codice invito"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                className="w-full bg-slate-950 p-2.5 rounded-lg text-xs border border-slate-800 focus:outline-none focus:border-amber-500"
              />
              <button className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold py-2.5 rounded-lg transition-all">
                Entra nella Lega
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: IMPOSTAZIONI */}
        {activeTab === 'settings' && (
          <div className="space-y-4">
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
              <h3 className="font-bold text-sm text-slate-200">Configurazione API Football</h3>
              <p className="text-xs text-slate-400">
                Inserisci qui la tua chiave API per scaricare le partite e i risultati in tempo reale:
              </p>
              <input
                type="password"
                placeholder="API Key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full bg-slate-950 p-2.5 rounded-lg text-xs border border-slate-800 focus:outline-none focus:border-amber-500"
              />
              <button className="w-full bg-amber-500 text-slate-950 text-xs font-bold py-2.5 rounded-lg shadow-lg shadow-amber-500/20">
                Salva Chiave API
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-slate-900/95 backdrop-blur border-t border-slate-800 grid grid-cols-4 py-2 z-50">
        <button
          onClick={() => setActiveTab('matches')}
          className={`flex flex-col items-center space-y-1 ${
            activeTab === 'matches' ? 'text-amber-400' : 'text-slate-500'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[10px] font-medium">Partite</span>
        </button>

        <button
          onClick={() => setActiveTab('standings')}
          className={`flex flex-col items-center space-y-1 ${
            activeTab === 'standings' ? 'text-amber-400' : 'text-slate-500'
          }`}
        >
          <Trophy className="w-5 h-5" />
          <span className="text-[10px] font-medium">Classifica</span>
        </button>

        <button
          onClick={() => setActiveTab('league')}
          className={`flex flex-col items-center space-y-1 ${
            activeTab === 'league' ? 'text-amber-400' : 'text-slate-500'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px] font-medium">Lega</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center space-y-1 ${
            activeTab === 'settings' ? 'text-amber-400' : 'text-slate-500'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px] font-medium">API</span>
        </button>
      </nav>
    </div>
  );
}
