'use client';

import React, { useState, useEffect } from 'react';
import { Trophy, Calendar, Users, RefreshCw, Settings, Database, Share2, Copy, Check, UserCheck, LogOut, User } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('matches');
  const [selectedLeague, setSelectedLeague] = useState('SA');
  const [targetSyncLeague, setTargetSyncLeague] = useState('SA');
  const [matchday, setMatchday] = useState(null);
  const [standingsType, setStandingsType] = useState('matchday');
  const [userPredictions, setUserPredictions] = useState({});
  const [copied, setCopied] = useState(false);

  // Stato Utente e Lega
  const [userName, setUserName] = useState('');
  const [joinedLeagueCode, setJoinedLeagueCode] = useState('');
  const [inputName, setInputName] = useState('');
  const [inputCode, setInputCode] = useState('');

  // Dati condivisi della Lega da Supabase
  const [allLeaguePredictions, setAllLeaguePredictions] = useState([]);
  const [leagueMembers, setLeagueMembers] = useState([]);

  // Stato API
  const [matches, setMatches] = useState([]);
  const [teamsSquads, setTeamsSquads] = useState({});
  const [loading, setLoading] = useState(true);
  const [syncingSquads, setSyncingSquads] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  const [error, setError] = useState(null);

  // Configurazione Supabase
  const baseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://ciklkrqvzaputhoilstl.supabase.co').replace(/\/rest\/v1\/?$/, '');
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.ANON_KEY;

  const leagues = [
    { id: 'SA', name: 'Serie A', country: '🇮🇹' },
    { id: 'PL', name: 'Premier League', country: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
    { id: 'PD', name: 'La Liga', country: '🇪🇸' },
    { id: 'FL1', name: 'Ligue 1', country: '🇫🇷' },
    { id: 'CL', name: 'Champions League', country: '🇪🇺' },
    { id: 'EL', name: 'Europa League', country: '🇪🇺' },
  ];

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const codeFromUrl = urlParams.get('code');
    if (codeFromUrl) setInputCode(codeFromUrl.toUpperCase());

    const savedName = localStorage.getItem('user_nickname');
    const savedLeague = localStorage.getItem('user_league_code');

    if (savedName) setUserName(savedName);
    if (savedLeague) setJoinedLeagueCode(savedLeague);
  }, []);

  // Carica i Membri e i Pronostici della Lega da Supabase
  const fetchLeagueData = async () => {
    if (!joinedLeagueCode || !supabaseKey) return;

    try {
      // 1. Carica Membri della Lega
      const resMembers = await fetch(
        `${baseUrl}/rest/v1/league_members?league_code=eq.${joinedLeagueCode}&select=*`,
        {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
        }
      );
      const dataMembers = await resMembers.json();
      if (Array.isArray(dataMembers)) {
        setLeagueMembers(dataMembers);
      }

      // 2. Carica Pronostici di tutti
      const resPreds = await fetch(
        `${baseUrl}/rest/v1/predictions?league_code=eq.${joinedLeagueCode}&select=*`,
        {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
        }
      );
      const dataPreds = await resPreds.json();
      if (Array.isArray(dataPreds)) {
        setAllLeaguePredictions(dataPreds);

        // Estrai i pronostici dell'utente attivo
        const myPreds = {};
        dataPreds
          .filter((item) => item.nickname === userName)
          .forEach((item) => {
            myPreds[item.match_id] = {
              homeScore: item.home_score ?? '',
              awayScore: item.away_score ?? '',
              outcome: item.outcome ?? '',
              scorer: item.scorer ?? '',
            };
          });
        setUserPredictions(myPreds);
      }
    } catch (e) {
      console.error('Errore caricamento Supabase:', e);
    }
  };

  useEffect(() => {
    if (userName && joinedLeagueCode) {
      fetchLeagueData();
    }
  }, [userName, joinedLeagueCode, matches]);

  // Registra un nuovo utente nella lega su Supabase
  const registerMemberOnSupabase = async (nickname, code) => {
    if (!supabaseKey) return;
    try {
      await fetch(`${baseUrl}/rest/v1/league_members`, {
        method: 'POST',
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          Prefer: 'ignore-duplicates',
        },
        body: JSON.stringify({
          league_code: code,
          nickname: nickname,
        }),
      });
    } catch (e) {
      console.error('Errore registrazione membro:', e);
    }
  };

  // Salva un pronostico su Supabase
  const savePredictionToSupabase = async (matchId, predData) => {
    if (!joinedLeagueCode || !userName || !supabaseKey) return;

    try {
      const payload = {
        league_code: joinedLeagueCode,
        nickname: userName,
        match_id: String(matchId),
        home_score: predData.homeScore !== '' ? parseInt(predData.homeScore, 10) : null,
        away_score: predData.awayScore !== '' ? parseInt(predData.awayScore, 10) : null,
        outcome: predData.outcome || null,
        scorer: predData.scorer || null,
      };

      await fetch(`${baseUrl}/rest/v1/predictions`, {
        method: 'POST',
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates',
        },
        body: JSON.stringify(payload),
      });

      fetchLeagueData();
    } catch (e) {
      console.error('Errore salvataggio pronostico:', e);
    }
  };

  // Ingresso in Lega
  const handleJoinLeague = async (e) => {
    e.preventDefault();
    if (!inputName.trim()) return;

    const finalCode = inputCode.trim() ? inputCode.trim().toUpperCase() : 'LEGA-8492';
    const nick = inputName.trim();

    localStorage.setItem('user_nickname', nick);
    localStorage.setItem('user_league_code', finalCode);

    setUserName(nick);
    setJoinedLeagueCode(finalCode);

    await registerMemberOnSupabase(nick, finalCode);
    fetchLeagueData();
  };

  const handleLeaveLeague = () => {
    localStorage.removeItem('user_nickname');
    localStorage.removeItem('user_league_code');
    setUserName('');
    setJoinedLeagueCode('');
  };

  // Condivisione
  const handleCopyLink = () => {
    const inviteUrl = `${window.location.origin}/?code=${joinedLeagueCode || 'LEGA-8492'}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const inviteUrl = `${window.location.origin}/?code=${joinedLeagueCode || 'LEGA-8492'}`;
    const message = encodeURIComponent(
      `🏆 Entra nella mia Lega Pronostici!\nClicca qui per giocare con me: ${inviteUrl}`
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  // Carica le Partite Live da Football-Data.org
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

  // CALCOLO CLASSIFICA UNIFICATA DI GRUPPO
  const calculateGroupLeaderboard = () => {
    const userScores = {};

    // Inizializza tutti i membri registrati a 0 punti
    leagueMembers.forEach((member) => {
      userScores[member.nickname] = { name: member.nickname, matchdayPts: 0, exactScores: 0 };
    });

    allLeaguePredictions.forEach((pred) => {
      if (!userScores[pred.nickname]) {
        userScores[pred.nickname] = { name: pred.nickname, matchdayPts: 0, exactScores: 0 };
      }

      const match = matches.find((m) => String(m.id) === String(pred.match_id));
      if (!match || match.status !== 'FINISHED') return;

      const realHome = match.score.fullTime.home;
      const realAway = match.score.fullTime.away;

      let realOutcome = 'X';
      if (realHome > realAway) realOutcome = '1';
      if (realHome < realAway) realOutcome = '2';

      const isExactScore = pred.home_score === realHome && pred.away_score === realAway;

      if (isExactScore) {
        userScores[pred.nickname].matchdayPts += 3;
        userScores[pred.nickname].exactScores += 1;
      } else if (pred.outcome === realOutcome) {
        userScores[pred.nickname].matchdayPts += 1;
      }

      if (pred.scorer && match.goals && Array.isArray(match.goals)) {
        const hasScored = match.goals.some((g) =>
          g.scorer?.name?.toLowerCase().includes(pred.scorer.toLowerCase())
        );
        if (hasScored) {
          userScores[pred.nickname].matchdayPts += 2;
        }
      }
    });

    return Object.values(userScores).sort((a, b) => b.matchdayPts - a.matchdayPts);
  };

  const leaderboard = calculateGroupLeaderboard();

  // Gestione Input Pronostico
  const calculateOutcome = (homeVal, awayVal) => {
    if (homeVal === '' || awayVal === '') return null;
    const h = parseInt(homeVal, 10);
    const a = parseInt(awayVal, 10);
    if (isNaN(h) || isNaN(a)) return null;
    if (h > a) return '1';
    if (h < a) return '2';
    return 'X';
  };

  const handleScoreChange = (matchId, team, value) => {
    const currentPred = userPredictions[matchId] || { homeScore: '', awayScore: '', scorer: '' };
    const updated = { ...currentPred, [team]: value };
    updated.outcome = calculateOutcome(updated.homeScore, updated.awayScore);

    setUserPredictions((prev) => ({ ...prev, [matchId]: updated }));
    savePredictionToSupabase(matchId, updated);
  };

  const handleScorerChange = (matchId, value) => {
    const currentPred = userPredictions[matchId] || { homeScore: '', awayScore: '', scorer: '' };
    const updated = { ...currentPred, scorer: value };

    setUserPredictions((prev) => ({ ...prev, [matchId]: updated }));
    savePredictionToSupabase(matchId, updated);
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
      <header className="bg-gradient-to-r from-emerald-700 to-teal-800 text-white p-4 shadow-md sticky top-0 z-50 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Trophy className="w-6 h-6 text-amber-300" />
          <div>
            <h1 className="font-bold text-sm tracking-wide leading-none">Lega Pronostici</h1>
            <span className="text-[10px] text-emerald-200 font-medium">Codice: {joinedLeagueCode}</span>
          </div>
        </div>
        <button
          onClick={() => {
            fetchMatches(matchday);
            fetchLeagueData();
          }}
          className="bg-emerald-900/60 hover:bg-emerald-900 text-emerald-100 p-1.5 rounded-full border border-emerald-400/30 transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </header>

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

      <main className="p-4">
        {/* TAB 1: PARTITE */}
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

            {!loading &&
              matches.map((match) => {
                const currentPred = userPredictions[match.id] || {};
                const currentOutcome = currentPred.outcome;
                const isFinished = match.status === 'FINISHED';

                const homeName = match.homeTeam?.shortName || match.homeTeam?.name || 'Casa';
                const awayName = match.awayTeam?.shortName || match.awayTeam?.name || 'Trasferta';

                const homeSquad = teamsSquads[match.homeTeam?.id] || [];
                const awaySquad = teamsSquads[match.awayTeam?.id] || [];

                return (
                  <div key={match.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 space-y-3">
                    <div className="flex justify-between items-center text-xs text-slate-500 border-b border-slate-100 pb-2">
                      <span className="font-medium">{formatDate(match.utcDate)}</span>
                      <span className={`font-bold px-2 py-0.5 rounded-md text-[11px] ${isFinished ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {isFinished ? 'Finale' : 'In Programma'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-1">
                      <span className="font-bold text-slate-800 text-sm w-1/3 text-right">{homeName}</span>
                      <div className="bg-slate-100 px-3 py-1.5 rounded-xl font-mono font-bold text-sm text-center border border-slate-200 min-w-[60px]">
                        {isFinished ? `${match.score.fullTime.home} - ${match.score.fullTime.away}` : 'VS'}
                      </div>
                      <span className="font-bold text-slate-800 text-sm w-1/3 text-left">{awayName}</span>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl space-y-3 border border-slate-200/80">
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

                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                        <span className="text-xs text-slate-500 font-medium">Esito:</span>
                        <div className="grid grid-cols-3 gap-1.5 w-36">
                          {['1', 'X', '2'].map((outcome) => (
                            <div
                              key={outcome}
                              className={`py-1.5 rounded-lg text-center text-xs font-black transition-all border ${
                                currentOutcome === outcome
                                  ? 'bg-emerald-500 text-white border-emerald-600 shadow-md scale-105'
                                  : 'bg-slate-200/70 text-slate-400 border-slate-200'
                              }`}
                            >
                              {outcome}
                            </div>
                          ))}
                        </div>
                      </div>

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
          </div>
        )}

        {/* TAB 2: CLASSIFICA CONDIVISA DI GRUPPO */}
        {activeTab === 'standings' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 p-3 border-b border-slate-200 font-bold text-xs text-slate-700 flex justify-between items-center">
                <span>Classifica Gruppo ({joinedLeagueCode})</span>
                <span className="text-xs text-slate-400">{leaderboard.length} Partecipanti</span>
              </div>
              {leaderboard.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  Nessun iscritto ha ancora inviato pronostici per questa lega.
                </div>
              ) : (
                leaderboard.map((user, idx) => (
                  <div
                    key={user.name}
                    className={`flex items-center justify-between p-3.5 border-b border-slate-100 ${
                      user.name === userName ? 'bg-amber-50/80 font-bold' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className={`w-6 text-center font-extrabold text-xs rounded-full py-1 ${idx === 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-sm text-slate-800">
                        {user.name} {user.name === userName ? '(Tu)' : ''}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-xs text-slate-400">{user.exactScores} esatti</span>
                      <span className="font-extrabold text-emerald-700 text-base font-mono">
                        {user.matchdayPts} pt
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 3: LEGA E MEMBRI ISCRITTI */}
        {activeTab === 'league' && (
          <div className="space-y-4">
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
              <button onClick={handleLeaveLeague} className="text-red-500 hover:bg-red-50 p-2 rounded-xl transition-all" title="Esci dalla lega">
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            {/* Elenco Partecipanti Iscritti */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 space-y-3">
              <h3 className="font-bold text-sm text-slate-800">Partecipanti alla Lega ({leagueMembers.length})</h3>
              <div className="divide-y divide-slate-100">
                {leagueMembers.map((m) => (
                  <div key={m.nickname} className="py-2 flex items-center space-x-2 text-xs">
                    <User className="w-4 h-4 text-emerald-600" />
                    <span className="font-semibold text-slate-700">{m.nickname}</span>
                    {m.nickname === userName && <span className="text-[10px] text-emerald-600 font-bold">(Tu)</span>}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 space-y-3">
              <h3 className="font-bold text-sm text-slate-800">Invita Amici via WhatsApp</h3>
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
      </main>

      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur border-t border-slate-200 grid grid-cols-3 py-2 z-50 shadow-lg">
        <button onClick={() => setActiveTab('matches')} className={`flex flex-col items-center space-y-1 ${activeTab === 'matches' ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
          <Calendar className="w-5 h-5" />
          <span className="text-[10px]">Partite</span>
        </button>

        <button onClick={() => setActiveTab('standings')} className={`flex flex-col items-center space-y-1 ${activeTab === 'standings' ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
          <Trophy className="w-5 h-5" />
          <span className="text-[10px]">Classifica</span>
        </button>

        <button onClick={() => setActiveTab('league')} className={`flex flex-col items-center space-y-1 ${activeTab === 'league' ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
          <Users className="w-5 h-5" />
          <span className="text-[10px]">Lega</span>
        </button>
      </nav>
    </div>
  );
}
