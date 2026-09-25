'use client';

import React, { useState, useEffect } from 'react';
import { Trophy, Calendar, Users, RefreshCw, Settings, Database, Share2, Copy, Check, UserCheck, LogOut } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('matches');
  const [selectedLeague, setSelectedLeague] = useState('SA');
  const [targetSyncLeague, setTargetSyncLeague] = useState('SA');
  const [matchday, setMatchday] = useState(null);
  const [standingsType, setStandingsType] = useState('matchday');
  const [userPredictions, setUserPredictions] = useState({});
  const [copied, setCopied] = useState(false);

  // Stato per la gestione dell'Utente e della Lega (Senza Registrazione)
  const [userName, setUserName] = useState('');
  const [joinedLeagueCode, setJoinedLeagueCode] = useState('');
  const [inputName, setInputName] = useState('');
  const [inputCode, setInputCode] = useState('');

  // Stato per i dati dall'API
  const [matches, setMatches] = useState([]);
  const [teamsSquads, setTeamsSquads] = useState({});
  const [loading, setLoading] = useState(true);
  const [syncingSquads, setSyncingSquads] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
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

  // Controlla il link di invito e la sessione salvata all'avvio
  useEffect(() => {
    // 1. Controlla se c'è un codice invito nell'URL (es. ?code=LEGA-8492)
    const urlParams = new URLSearchParams(window.location.search);
    const codeFromUrl = urlParams.get('code');
    if (codeFromUrl) {
      setInputCode(codeFromUrl.toUpperCase());
    }

    // 2. Recupera dati sessione locale
    const savedName = localStorage.getItem('user_nickname');
    const savedLeague = localStorage.getItem('user_league_code');
    if (savedName) setUserName(savedName);
    if (savedLeague) setJoinedLeagueCode(savedLeague);

    // 3. Carica le rose salvate nel localStorage
    const loadedSquads = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('squad_ondemand_')) {
        const teamId = key.replace('squad_ondemand_', '');
        try {
          loadedSquads[teamId] = JSON.parse(localStorage.getItem(key));
        } catch (e) {
          console.error(e);
        }
      }
    }
    setTeamsSquads(loadedSquads);
  }, []);

  // Gestione Ingresso in Lega / Creazione Profilo Rapido
  const handleJoinLeague = (e) => {
    e.preventDefault();
    if (!inputName.trim()) return;

    const finalCode = inputCode.trim() ? inputCode.trim().toUpperCase() : 'LEGA-8492';
    
    localStorage.setItem('user_nickname', inputName.trim());
    localStorage.setItem('user_league_code', finalCode);

    setUserName(inputName.trim());
    setJoinedLeagueCode(finalCode);
  };

  // Logout / Esci dalla Lega
  const handleLeaveLeague = () => {
    localStorage.removeItem('user_nickname');
    localStorage.removeItem('user_league_code');
    setUserName('');
    setJoinedLeagueCode('');
  };

  // Funzioni di Condivisione
  const handleCopyLink = () => {
    const inviteUrl = `${window.location.origin}/?code=${joinedLeagueCode || 'LEGA-8492'}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const inviteUrl = `${window.location.origin}/?code=${joinedLeagueCode || 'LEGA-8492'}`;
    const message = encodeURIComponent(
      `🏆 Entra nella mia Lega Pronostici!\nClicca qui per giocare subito: ${inviteUrl}`
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  // Funzione On-Demand per aggiornare le rose della singola lega selezionata
  const syncSelectedLeagueSquads = async () => {
    setSyncingSquads(true);
    const selectedLeagueName = leagues.find((l) => l.id === targetSyncLeague)?.name || targetSyncLeague;
    setSyncMessage(`Download lista squadre per ${selectedLeagueName}...`);
    const updatedSquads = { ...teamsSquads };

    try {
      const res = await fetch(`/api/football?endpoint=competitions/${targetSyncLeague}/teams`);
      const data = await res.json();

      if (data.error) throw new Error(data.error);

      if (data.teams && data.teams.length > 0) {
        let count = 0;
        for (const team of data.teams) {
          count++;
          setSyncMessage(`[${selectedLeagueName}] Download rosa ${count}/${data.teams.length}: ${team.shortName || team.name}...`);

          try {
            const teamRes = await fetch(`/api/football?endpoint=teams/${team.id}`);
            const teamData = await teamRes.json();

            if (teamData.squad && Array.isArray(teamData.squad)) {
              const players = teamData.squad.map((p) => p.name);
              const cacheKey = `squad_ondemand_${team.id}`;
              localStorage.setItem(cacheKey, JSON.stringify(players));
              updatedSquads[team.id] = players;
            }
          } catch (e) {
            console.error(`Errore caricamento rosa team ${team.id}:`, e);
          }

          await new Promise((resolve) => setTimeout(resolve, 6000));
        }

        setTeamsSquads(updatedSquads);
        setSyncMessage(`Sincronizzazione completata per ${selectedLeagueName}! Rose salvate.`);
      } else {
        setSyncMessage(`Nessuna squadra trovata per ${selectedLeagueName}.`);
      }
    } catch (err) {
      setSyncMessage(`Errore durante il download: ${err.message}`);
    } finally {
      setSyncingSquads(false);
    }
  };

  // Carica la giornata corrente e le relative partite dall'API
  const fetchMatches = async (forcedMatchday = null) => {
    setLoading(true);
    setError(null);
    try {
      let targetMatchday = forcedMatchday || matchday;

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

      if (data.error) throw new Error(data.error);

      if (data.matches && data.matches.length > 0) {
        setMatches(data.matches);
      } else {
        setMatches([]);
      }
    } catch (err) {
      setError(err.message || 'Impossibile caricare il calendario.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMatchday(null);
    fetchMatches(null);
  }, [selectedLeague]);

  // Classifica di prova
  const leaderboard = [
    { rank: 1, name: `${userName || 'Marco'} (Tu)`, matchdayPts: 6, totalPts: 142, exactScores: 2 },
    { rank: 2, name: 'Luca', matchdayPts: 4, totalPts: 138, exactScores: 1 },
    { rank: 3, name: 'Giulia', matchdayPts: 1, totalPts: 130, exactScores: 0 },
    { rank: 4, name: 'Matteo', matchdayPts: 0, totalPts: 125, exactScores: 1 },
  ];

  // Calcola automaticamente l'esito 1X2
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

  // SCHERMATA DI BENVENUTO / INGRESSO SU INVITO
  if (!userName || !joinedLeagueCode) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 text-slate-800 font-sans">
        <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-200 max-w-sm w-full space-y-5 text-center">
          <div className="bg-emerald-100 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto text-emerald-700">
            <Trophy className="w-8 h-8 text-amber-500" />
          </div>

          <div>
            <h1 className="text-xl font-bold text-slate-800">Lega Pronostici</h1>
            <p className="text-xs text-slate-500 mt-1">
              Entra nella lega dei tuoi amici senza bisogno di registrarti!
            </p>
          </div>

          <form onSubmit={handleJoinLeague} className="space-y-3 text-left">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Il tuo Soprannome:</label>
              <input
                type="text"
                required
                placeholder="Es. Bomber99"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Codice Invito Lega:</label>
              <input
                type="text"
                placeholder="Es. LEGA-8492"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-mono font-bold tracking-wider text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-md transition-all text-xs"
            >
              Entra in Gioco
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans pb-24 max-w-md mx-auto shadow-2xl border-x border-slate-200">
      {/* Header chiaro */}
      <header className="bg-gradient-to-r from-emerald-700 to-teal-800 text-white p-4 shadow-md sticky top-0 z-50 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Trophy className="w-6 h-6 text-amber-300" />
          <div>
            <h1 className="font-bold text-sm tracking-wide leading-none">Lega Pronostici</h1>
            <span className="text-[10px] text-emerald-200 font-medium">{joinedLeagueCode}</span>
          </div>
        </div>
        <button
          onClick={() => fetchMatches(matchday)}
          className="bg-emerald-900/60 hover:bg-emerald-900 text-emerald-100 p-1.5 rounded-full border border-emerald-400/30 transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </header>

      {/* Selector Campionato */}
      {activeTab === 'matches' && (
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
      )}

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

                const homeName = match.homeTeam?.shortName || match.homeTeam?.name || 'Casa';
                const awayName = match.awayTeam?.shortName || match.awayTeam?.name || 'Trasferta';

                const homeSquad = teamsSquads[match.homeTeam?.id] || [];
                const awaySquad = teamsSquads[match.awayTeam?.id] || [];

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
                        {homeName}
                      </span>
                      <div className="bg-slate-100 px-3 py-1.5 rounded-xl font-mono font-bold text-sm text-center border border-slate-200 min-w-[60px]">
                        {isFinished
                          ? `${match.score.fullTime.home} - ${match.score.fullTime.away}`
                          : 'VS'}
                      </div>
                      <span className="font-bold text-slate-800 text-sm w-1/3 text-left">
                        {awayName}
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

                      {/* Marcatore con Dati Locali */}
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
                            {homeSquad.map((player, idx) => (
                              <option key={`h-${idx}`} value={player} />
                            ))}
                            {awaySquad.map((player, idx) => (
                              <option key={`a-${idx}`} value={player} />
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
            {/* Box Info Profilo */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-emerald-100 p-2.5 rounded-xl text-emerald-700 font-bold">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-800">{userName}</h4>
                  <p className="text-[11px] text-slate-400">Lega: {joinedLeagueCode}</p>
                </div>
              </div>
              <button
                onClick={handleLeaveLeague}
                className="text-red-500 hover:bg-red-50 p-2 rounded-xl transition-all"
                title="Esci dalla lega"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            {/* Box Invito Amici */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 space-y-3">
              <h3 className="font-bold text-sm text-slate-800">Invita Amici via WhatsApp</h3>
              <p className="text-xs text-slate-500">
                Invia il link diretto ai tuoi amici per farli entrare subito nella tua lega:
              </p>

              <div className="bg-slate-50 p-3 rounded-xl text-center font-mono font-extrabold text-emerald-700 text-lg tracking-widest border border-slate-200">
                {joinedLeagueCode}
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={handleShareWhatsApp}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-all shadow-sm"
                >
                  <Share2 className="w-4 h-4" />
                  <span>WhatsApp</span>
                </button>

                <button
                  onClick={handleCopyLink}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-all border border-slate-200"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copiato!' : 'Copia Link'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: IMPOSTAZIONI */}
        {activeTab === 'settings' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                <Database className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-800">Gestione Dati Rose</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Seleziona una lega alla volta da aggiornare on-demand per i marcatori reali.
              </p>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Lega da aggiornare:</label>
                <select
                  value={targetSyncLeague}
                  onChange={(e) => setTargetSyncLeague(e.target.value)}
                  disabled={syncingSquads}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {leagues.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.country} {l.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={syncSelectedLeagueSquads}
                disabled={syncingSquads}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-bold py-3 rounded-xl shadow-md transition-all text-xs flex items-center justify-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${syncingSquads ? 'animate-spin' : ''}`} />
                <span>{syncingSquads ? 'Sincronizzazione in corso...' : 'Aggiorna Rose di questa Lega'}</span>
              </button>

              {syncMessage && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 space-y-1">
                  <p className="font-bold text-emerald-700">Stato processo:</p>
                  <p>{syncMessage}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
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
          <span className="text-[10px]">Impostazioni</span>
        </button>
      </nav>
    </div>
  );
}
