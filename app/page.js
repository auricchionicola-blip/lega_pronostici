'use client';

import React, { useState, useEffect } from 'react';
import { Trophy, Calendar, Users, RefreshCw } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('matches');
  const [selectedLeague, setSelectedLeague] = useState('SA');
  const [matchday, setMatchday] = useState(null);
  const [standingsType, setStandingsType] = useState('matchday');
  const [userPredictions, setUserPredictions] = useState({});
  const [inviteCode, setInviteCode] = useState('');

  // Stato per i dati dall'API
  const [matches, setMatches] = useState([]);
  const [teamsSquads, setTeamsSquads] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Campionati supportati
  const leagues = [
    { id: 'SA', name: 'Serie A', country: '🇮🇹' },
    { id: 'PL', name: 'Premier League', country: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
    { id: 'PD', name: 'La Liga', country: '🇪🇸' },
    { id: 'FL1', name: 'Ligue 1', country: '🇫🇷' },
    { id: 'CL', name: 'Champions League', country: '🇪🇺' },
    { id: 'EL', name: 'Europa League', country: '🇪🇺' },
  ];

  // Carica le rose dal localStorage o dall'API se assenti
  const loadSquadForTeam = async (teamId) => {
    if (!teamId || teamsSquads[teamId]) return;

    const cacheKey = `squad_v1_${teamId}`;
    const cachedSquad = localStorage.getItem(cacheKey);

    if (cachedSquad) {
      try {
        const parsed = JSON.parse(cachedSquad);
        setTeamsSquads((prev) => ({ ...prev, [teamId]: parsed }));
        return;
      } catch (e) {
        localStorage.removeItem(cacheKey);
      }
    }

    try {
      const res = await fetch(`/api/football?endpoint=teams/${teamId}`);
      const data = await res.json();
      if (data.squad) {
        const players = data.squad.map((p) => p.name);
        localStorage.setItem(cacheKey, JSON.stringify(players));
        setTeamsSquads((prev) => ({ ...prev, [teamId]: players }));
      }
    } catch (err) {
      console.error('Errore caricamento rosa:', err);
    }
  };

  // Carica la giornata corrente e le relative partite dall'API
  const fetchMatches = async (forcedMatchday = null) => {
    setLoading(true);
    setError(null);
    try {
      let targetMatchday = forcedMatchday || matchday;

      // Se la giornata non è definita, chiediamo la stagione per conoscere quella corrente
      if (!targetMatchday) {
        const compRes = await fetch(`/api/football?endpoint=competitions/${selectedLeague}`);
        const compData = await compRes.json();
        if (compData.currentSeason?.currentMatchday) {
          targetMatchday = compData.currentSeason.currentMatchday;
          setMatchday(targetMatchday);
        } else {
          targetMatchday = 1;
          setMatchday(1);
        }
      }

      const res = await fetch(
        `/api/football?endpoint=competitions/${selectedLeague}/matches&matchday=${targetMatchday}`
      );
      const data = await res.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.matches && data.matches.length > 0) {
        setMatches(data.matches);
        data.matches.forEach((m) => {
          if (m.homeTeam?.id) loadSquadForTeam(m.homeTeam.id);
          if (m.awayTeam?.id) loadSquadForTeam(m.awayTeam.id);
        });
      } else {
        setMatches([]);
      }
    } catch (err) {
      setError(err.message || 'Impossibile caricare il calendario.');
    } finally {
      setLoading(false);
    }
  };

  // Cambio campionato
  useEffect(() => {
    setMatchday(null);
    fetchMatches(null);
  }, [selectedLeague]);

  // Classifica di prova
  const leaderboard = [
    { rank: 1, name: 'Marco (Tu)', matchdayPts: 6, totalPts: 142, exactScores: 2 },
    { rank: 2, name: 'Luca', matchdayPts: 4, totalPts: 138, exactScores: 1 },
    { rank: 3, name: 'Giulia', matchdayPts: 1, totalPts: 130, exactScores: 0 },
    { rank: 4, name: 'Matteo', matchdayPts: 0, totalPts: 125, exactScores: 1 },
  ];

  // Calcola automaticamente l'esito 1X2 considerando 0 di default
  const calculateOutcome = (homeVal, awayVal) => {
    const isHomeEmpty = homeVal === '' || homeVal === undefined || homeVal === null;
    const isAwayEmpty = awayVal === '' || awayVal === undefined || awayVal === null;

    if (isHomeEmpty && isAwayEmpty) return null;

    const h = isHomeEmpty ? 0 : parseInt(homeVal, 10);
    const a = isAwayEmpty ? 0 : parseInt(awayVal, 10);

    if (isNaN(h) || isNaN(a)) return null;
    if (h > a) return '1';
    if (h < a) return '2';
    return 'X';
  };

  const handleScoreChange = (matchId, team, value) => {
    setUserPredictions((prev) => {
      const currentMatchPred = prev[matchId] || { homeScore: '', awayScore: '', scorer: '' };
      const updatedMatchPred = {
        ...currentMatchPred,
        [team]: value,
      };

      const computedOutcome = calculateOutcome(
        updatedMatchPred.homeScore,
        updatedMatchPred.awayScore
      );

      return {
        ...prev,
        [matchId]: {
          ...updatedMatchPred,
          outcome: computedOutcome,
        },
      };
    });
  };

  const handleScorerChange = (matchId, value) => {
    setUserPredictions((prev) => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        scorer: value,
      },
    }));
  };

  const handleMatchdayChange = (newMatchday) => {
    const validMatchday = Math.max(1, newMatchday);
    setMatchday(validMatchday);
    fetchMatches(validMatchday);
  };

  const formatDate = (utcDate) => {
    if (!utcDate) return '';
    const d = new Date(utcDate);
    return d.toLocaleDateString('it-IT', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans pb-24 max-w-md mx-auto shadow-2xl border-x border-slate-200">
      {/* Header chiaro con gradiente sportivo */}
      <header className="bg-gradient-to-r from-emerald-700 to-teal-800 text-white p-4 shadow-md sticky top-0 z-50 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Trophy className="w-6 h-6 text-amber-300" />
          <h1 className="font-bold text-lg tracking-wide">Lega Pronostici</h1>
        </div>
        <button
          onClick={() => fetchMatches(matchday)}
          className="bg-emerald-900/60 hover:bg-emerald-900 text-emerald-100 p-1.5 rounded-full border border-emerald-400/30 transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
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
              <span className="text-sm font-bold text-slate-700">
                {matchday ? `Giornata ${matchday}` : 'Caricamento...'}
              </span>
              <div className="flex space-x-1">
                <button
                  onClick={() => handleMatchdayChange((matchday || 1) - 1)}
                  className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs rounded-lg font-semibold hover:bg-slate-200 border border-slate-200"
                >
                  &lt; Pres
                </button>
                <button
                  onClick={() => handleMatchdayChange((matchday || 1) + 1)}
                  className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs rounded-lg font-semibold hover:bg-slate-200 border border-slate-200"
                >
                  Succ &gt;
                </button>
              </div>
            </div>

            {loading && (
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center text-slate-500 space-y-2">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-600" />
                <p className="text-xs font-semibold">Caricamento partite in corso...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-2xl border border-red-200 text-xs text-center font-medium">
                {error}
              </div>
            )}

            {!loading && !error && matches.length === 0 && (
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center text-slate-500 text-xs">
                Nessuna partita trovata per questa giornata.
              </div>
            )}

            {!loading &&
              !error &&
              matches.map((match) => {
                const currentPred = userPredictions[match.id] || {};
                const currentOutcome = currentPred.outcome;
                const isFinished = match.status === 'FINISHED';

                const homeSquad = teamsSquads[match.homeTeam?.id] || [];
                const awaySquad = teamsSquads[match.awayTeam?.id] || [];
                const combinedSquad = [...homeSquad, ...awaySquad];

                return (
                  <div
                    key={match.id}
                    className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 space-y-3"
                  >
                    <div className="flex justify-between items-center text-xs text-slate-500 border-b border-slate-100 pb-2">
                      <span className="font-medium">{formatDate(match.utcDate)}</span>
                      <span
                        className={`font-bold px-2 py-0.5 rounded-md text-[11px] ${
                          isFinished
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {isFinished ? 'Finale' : 'In Programma'}
                      </span>
                    </div>

                    {/* Squadre e Risultati Reali */}
                    <div className="flex justify-between items-center py-1">
                      <span className="font-bold text-slate-800 text-sm w-1/3 text-right">
                        {match.homeTeam?.shortName || match.homeTeam?.name}
                      </span>
                      <div className="bg-slate-100 px-3 py-1.5 rounded-xl font-mono font-bold text-sm text-center border border-slate-200 min-w-[60px]">
                        {isFinished
                          ? `${match.score.fullTime.home} - ${match.score.fullTime.away}`
                          : 'VS'}
                      </div>
                      <span className="font-bold text-slate-800 text-sm w-1/3 text-left">
                        {match.awayTeam?.shortName || match.awayTeam?.name}
                      </span>
                    </div>

                    {/* Modulo Pronostico */}
                    <div className="bg-slate-50 p-3 rounded-xl space-y-3 border border-slate-200/80">
                      {/* Risultato Esatto */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-600 font-semibold">Risultato Esatto:</span>
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            min="0"
                            placeholder="0"
                            value={currentPred.homeScore ?? ''}
                            onChange={(e) => handleScoreChange(match.id, 'homeScore', e.target.value)}
                            className="w-12 bg-white text-center text-xs py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold shadow-sm"
                          />
                          <span className="text-xs text-slate-400 font-bold">-</span>
                          <input
                            type="number"
                            min="0"
                            placeholder="0"
                            value={currentPred.awayScore ?? ''}
                            onChange={(e) => handleScoreChange(match.id, 'awayScore', e.target.value)}
                            className="w-12 bg-white text-center text-xs py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold shadow-sm"
                          />
                        </div>
                      </div>

                      {/* Esito 1X2 Evidenziato di Verde */}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                        <span className="text-xs text-slate-500 font-medium">Esito:</span>
                        <div className="grid grid-cols-3 gap-1.5 w-36">
                          {['1', 'X', '2'].map((outcome) => {
                            const isActive = currentOutcome === outcome;
                            return (
                              <div
                                key={outcome}
                                className={`py-1.5 rounded-lg text-center text-xs font-black transition-all border ${
                                  isActive
                                    ? 'bg-emerald-500 text-white border-emerald-600 shadow-md scale-105'
                                    : 'bg-slate-200/70 text-slate-400 border-slate-200'
                                }`}
                              >
                                {outcome}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Marcatore con Suggerimenti Dinamici */}
                      <div className="flex items-center space-x-2 pt-1 border-t border-slate-200/60">
                        <span className="text-xs text-slate-600 w-24 font-medium">Marcatore:</span>
                        <div className="flex-1">
                          <input
                            type="text"
                            list={`players-${match.id}`}
                            placeholder="Digita o seleziona..."
                            value={currentPred.scorer ?? ''}
                            onChange={(e) => handleScorerChange(match.id, e.target.value)}
                            className="w-full bg-white px-2.5 py-1 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
                          />
                          <datalist id={`players-${match.id}`}>
                            {combinedSquad.map((player, idx) => (
                              <option key={idx} value={player} />
                            ))}
                          </datalist>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

            {!loading && matches.length > 0 && (
              <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-md active:scale-95 transition-all text-sm">
                Salva Pronostici
              </button>
            )}
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
                Giornata {matchday || 1}
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
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur border-t border-slate-200 grid grid-cols-3 py-2 z-50 shadow-lg">
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
      </nav>
    </div>
  );
}
