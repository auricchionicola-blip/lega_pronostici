'use client';

import React, { useState, useEffect } from 'react';
import { Trophy, Calendar, Users, RefreshCw, Settings, Database, Share2, Copy, Check, UserCheck, LogOut, User, AlertCircle, CheckCircle, Save, Play, ChevronRight, Eye, PlusCircle, Layers, Lock } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('matches');
  const [selectedLeague, setSelectedLeague] = useState('SA');
  const [targetSyncLeague, setTargetSyncLeague] = useState('SA');
  const [matchday, setMatchday] = useState(null);
  const [userPredictions, setUserPredictions] = useState({});
  const [copied, setCopied] = useState(false);

  // Stato Scommessa Attiva (Default: bloccata finché non si clicca Pronostica)
  const [isEditingPredictions, setIsEditingPredictions] = useState(false);

  // Profilo Utente Univoco & Leghe Iscritte
  const [userName, setUserName] = useState('');
  const [inputName, setInputName] = useState('');
  
  const [userLeagues, setUserLeagues] = useState([]);
  const [activeLeagueCode, setActiveLeagueCode] = useState('');
  const [inputNewCode, setInputNewCode] = useState('');
  
  const [showAddLeagueModal, setShowAddLeagueModal] = useState(false);

  // Dettaglio Utente Selezionato per consultazione schedine
  const [selectedMemberDetail, setSelectedMemberDetail] = useState(null);

  // Stato Debug e Log
  const [dbStatus, setDbStatus] = useState(null);
  const [savingLega, setSavingLega] = useState(false);
  const [savingPredictions, setSavingPredictions] = useState(false);

  // Dati condivisi della Lega da Supabase
  const [allLeaguePredictions, setAllLeaguePredictions] = useState([]);

  // Stato API e Rose
  const [matches, setMatches] = useState([]);
  const [teamsSquads, setTeamsSquads] = useState({});
  const [loading, setLoading] = useState(true);
  const [syncingSquads, setSyncingSquads] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  // Campionati supportati
  const leagues = [
    { id: 'SA', name: 'Serie A', country: '🇮🇹' },
    { id: 'UNL', name: 'Nations League', country: '🇪🇺' },
    { id: 'PL', name: 'Premier League', country: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
    { id: 'PD', name: 'La Liga', country: '🇪🇸' },
    { id: 'FL1', name: 'Ligue 1', country: '🇫🇷' },
    { id: 'CL', name: 'Champions League', country: '🇪🇺' },
    { id: 'EL', name: 'Europa League', country: '🇪🇺' },
  ];

  // Partite Nations League
  const nationsLeagueMatches = [
    {
      id: 'unl-1',
      homeTeam: { name: 'Italia', shortName: 'Italia', id: 'ITA' },
      awayTeam: { name: 'Belgio', shortName: 'Belgio', id: 'BEL' },
      utcDate: '2026-09-25T20:45:00Z',
      status: 'FINISHED',
      score: { fullTime: { home: 2, away: 2 } },
      goals: [{ scorer: { name: 'Moise Kean' } }, { scorer: { name: 'Giacomo Raspadori' } }, { scorer: { name: 'Kevin De Bruyne' } }, { scorer: { name: 'Romelu Lukaku' } }]
    },
    {
      id: 'unl-2',
      homeTeam: { name: 'Turchia', shortName: 'Turchia', id: 'TUR' },
      awayTeam: { name: 'Francia', shortName: 'Francia', id: 'FRA' },
      utcDate: '2026-09-25T20:45:00Z',
      status: 'FINISHED',
      score: { fullTime: { home: 1, away: 2 } },
      goals: [{ scorer: { name: 'Arda Güler' } }, { scorer: { name: 'Kylian Mbappé' } }, { scorer: { name: 'Marcus Thuram' } }]
    },
    {
      id: 'unl-3',
      homeTeam: { name: 'Ungheria', shortName: 'Ungheria', id: 'HUN' },
      awayTeam: { name: 'Ucraina', shortName: 'Ucraina', id: 'UKR' },
      utcDate: '2026-09-25T20:45:00Z',
      status: 'FINISHED',
      score: { fullTime: { home: 1, away: 1 } },
      goals: [{ scorer: { name: 'Dominik Szoboszlai' } }, { scorer: { name: 'Artem Dovbyk' } }]
    },
    {
      id: 'unl-4',
      homeTeam: { name: 'Svezia', shortName: 'Svezia', id: 'SWE' },
      awayTeam: { name: 'Romania', shortName: 'Romania', id: 'ROU' },
      utcDate: '2026-09-25T20:45:00Z',
      status: 'FINISHED',
      score: { fullTime: { home: 3, away: 0 } },
      goals: [{ scorer: { name: 'Viktor Gyökeres' } }, { scorer: { name: 'Alexander Isak' } }]
    },
    {
      id: 'unl-5',
      homeTeam: { name: 'Polonia', shortName: 'Polonia', id: 'POL' },
      awayTeam: { name: 'Bosnia', shortName: 'Bosnia', id: 'BIH' },
      utcDate: '2026-09-25T20:45:00Z',
      status: 'FINISHED',
      score: { fullTime: { home: 2, away: 0 } },
      goals: [{ scorer: { name: 'Robert Lewandowski' } }]
    },
    {
      id: 'unl-6',
      homeTeam: { name: 'Georgia', shortName: 'Georgia', id: 'GEO' },
      awayTeam: { name: 'Irlanda Nord', shortName: 'Irlanda Nord', id: 'NIR' },
      utcDate: '2026-09-25T18:00:00Z',
      status: 'FINISHED',
      score: { fullTime: { home: 1, away: 0 } },
      goals: [{ scorer: { name: 'Khvicha Kvaratskhelia' } }]
    }
  ];

  // Convocati Nazionali
  const nationalSquads = {
    ITA: ['Moise Kean', 'Gianluca Scamacca', 'Giacomo Raspadori', 'Francesco Pio Esposito', 'Daniel Maldini', 'Nicolò Zaniolo', 'Nicolò Barella', 'Davide Frattesi', 'Sandro Tonali', 'Riccardo Calafiori', 'Alessandro Bastoni', 'Giovanni Di Lorenzo'],
    BEL: ['Romelu Lukaku', 'Loïs Openda', 'Kevin De Bruyne', 'Jeremy Doku', 'Leandro Trossard', 'Youri Tielemans', 'Amadou Onana', 'Timothy Castagne'],
    TUR: ['Arda Güler', 'Barış Alper Yılmaz', 'Kenan Yıldız', 'Hakan Çalhanoğlu', 'Kerem Aktürkoğlu', 'Cenk Tosun', 'Orkun Kökçü'],
    FRA: ['Kylian Mbappé', 'Marcus Thuram', 'Randal Kolo Muani', 'Antoine Griezmann', 'Ousmane Dembélé', 'Bradley Barcola', 'Eduardo Camavinga'],
    HUN: ['Dominik Szoboszlai', 'Barnabás Varga', 'Roland Sallai', 'András Schäfer'],
    UKR: ['Artem Dovbyk', 'Roman Yaremchuk', 'Mykhailo Mudryk', 'Viktor Tsygankov', 'Heorhiy Sudakov', 'Oleksandr Zinchenko'],
    SWE: ['Viktor Gyökeres', 'Alexander Isak', 'Dejan Kulusevski', 'Anthony Elanga', 'Emil Forsberg'],
    ROU: ['Denis Drăguș', 'George Pușcaș', 'Dennis Man', 'Valentin Mihăilă', 'Răzvan Marin', 'Nicolae Stanciu'],
    POL: ['Robert Lewandowski', 'Karol Świderski', 'Krzysztof Piątek', 'Piotr Zieliński', 'Sebastian Szymański'],
    BIH: ['Edin Džeko', 'Ermedin Demirović', 'Rade Krunić', 'Benjamin Tahirović'],
    GEO: ['Khvicha Kvaratskhelia', 'Georges Mikautadze', 'Zuriko Davitashvili'],
    NIR: ['Dion Charles', 'Josh Magennis', 'Isaac Price', 'Shea Charles']
  };

  // Caricamento Iniziale Profilo Utente & Leghe
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const codeFromUrl = urlParams.get('code');
    if (codeFromUrl) setInputNewCode(codeFromUrl.toUpperCase());

    const savedName = localStorage.getItem('user_nickname');
    const savedLeaguesJson = localStorage.getItem('user_leagues_list');
    const savedActiveLeague = localStorage.getItem('user_active_league_code');

    if (savedName) setUserName(savedName);

    let parsedLeagues = [];
    if (savedLeaguesJson) {
      try {
        parsedLeagues = JSON.parse(savedLeaguesJson);
      } catch (e) {
        console.error(e);
      }
    }

    if (parsedLeagues.length > 0) {
      setUserLeagues(parsedLeagues);
      setActiveLeagueCode(savedActiveLeague || parsedLeagues[0]);
    }

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

  // Carica i Pronostici della Lega Attiva da Supabase
  const fetchLeagueData = async () => {
    if (!activeLeagueCode) return;

    try {
      const res = await fetch(`/api/predictions?league_code=${activeLeagueCode}`);
      const dataPreds = await res.json();

      if (Array.isArray(dataPreds)) {
        setAllLeaguePredictions(dataPreds);

        const myPreds = {};
        dataPreds
          .filter((item) => item.nickname === userName)
          .forEach((item) => {
            if (item.match_id !== 'JOIN_ENTRY') {
              myPreds[item.match_id] = {
                homeScore: item.home_score !== null ? String(item.home_score) : '0',
                awayScore: item.away_score !== null ? String(item.away_score) : '0',
                outcome: item.outcome || 'X',
                scorer: item.scorer || '',
              };
            }
          });
        setUserPredictions(myPreds);
      }
    } catch (e) {
      console.error('Errore caricamento dati:', e);
    }
  };

  useEffect(() => {
    if (userName && activeLeagueCode) {
      fetchLeagueData();
    }
  }, [userName, activeLeagueCode, matches]);

  // CREAZIONE PROFILO E PRIMA LEGA
  const handleInitialUserRegister = async (e) => {
    e.preventDefault();
    if (!inputName.trim()) return;

    setSavingLega(true);
    setDbStatus(null);

    const nick = inputName.trim();
    const firstLeagueCode = inputNewCode.trim() ? inputNewCode.trim().toUpperCase() : 'LEGA-8492';

    try {
      const res = await fetch('/api/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          league_code: firstLeagueCode,
          nickname: nick,
          match_id: 'JOIN_ENTRY',
          home_score: null,
          away_score: null,
          outcome: null,
          scorer: null
        }),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        localStorage.setItem('user_nickname', nick);
        
        const newLeaguesList = [firstLeagueCode];
        localStorage.setItem('user_leagues_list', JSON.stringify(newLeaguesList));
        localStorage.setItem('user_active_league_code', firstLeagueCode);

        setUserName(nick);
        setUserLeagues(newLeaguesList);
        setActiveLeagueCode(firstLeagueCode);

        setDbStatus({ type: 'success', text: `Profilo "${nick}" creato e iscritto alla lega ${firstLeagueCode}!` });
        fetchLeagueData();
      } else {
        setDbStatus({ type: 'error', text: `Errore Registrazione: ${result.error || JSON.stringify(result)}` });
      }
    } catch (err) {
      setDbStatus({ type: 'error', text: `Errore Rete: ${err.message}` });
    } finally {
      setSavingLega(false);
    }
  };

  // AGGIUNGI NUOVA LEGA A UTENTE ESISTENTE
  const handleAddNewLeague = async (e) => {
    e.preventDefault();
    if (!inputNewCode.trim()) return;

    setSavingLega(true);
    setDbStatus(null);

    const code = inputNewCode.trim().toUpperCase();

    if (userLeagues.includes(code)) {
      setActiveLeagueCode(code);
      localStorage.setItem('user_active_league_code', code);
      setShowAddLeagueModal(false);
      setInputNewCode('');
      setSavingLega(false);
      return;
    }

    try {
      const res = await fetch('/api/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          league_code: code,
          nickname: userName,
          match_id: 'JOIN_ENTRY',
          home_score: null,
          away_score: null,
          outcome: null,
          scorer: null
        }),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        const updatedLeagues = [...userLeagues, code];
        setUserLeagues(updatedLeagues);
        setActiveLeagueCode(code);

        localStorage.setItem('user_leagues_list', JSON.stringify(updatedLeagues));
        localStorage.setItem('user_active_league_code', code);

        setShowAddLeagueModal(false);
        setInputNewCode('');
        setDbStatus({ type: 'success', text: `Ti sei unito alla nuova lega ${code}!` });
        fetchLeagueData();
      } else {
        setDbStatus({ type: 'error', text: `Errore iscrizione lega: ${result.error || JSON.stringify(result)}` });
      }
    } catch (err) {
      setDbStatus({ type: 'error', text: `Errore Rete: ${err.message}` });
    } finally {
      setSavingLega(false);
    }
  };

  // SELEZIONA LEGA ATTIVA DALLA LISTA
  const handleSelectActiveLeague = (code) => {
    setActiveLeagueCode(code);
    localStorage.setItem('user_active_league_code', code);
    setDbStatus({ type: 'success', text: `Passato alla lega ${code}` });
  };

  // RESET COMPLETO PROFILO
  const handleResetFullProfile = () => {
    if (confirm('Sei sicuro di voler resettare il tuo profilo utente su questo dispositivo?')) {
      localStorage.clear();
      setUserName('');
      setUserLeagues([]);
      setActiveLeagueCode('');
      setUserPredictions({});
      setAllLeaguePredictions([]);
    }
  };

  // VERIFICA SE LA GIORNATA È GIÀ INIZIATA O PASSATA
  const isMatchdayStartedOrFinished = () => {
    if (!matches || matches.length === 0) return false;
    const now = new Date();

    // Se c'è almeno una partita FINISHED o TIMED passata rispetto all'ora attuale
    return matches.some((m) => {
      if (m.status === 'FINISHED' || m.status === 'IN_PLAY' || m.status === 'PAUSED') return true;
      if (m.utcDate) {
        const matchTime = new Date(m.utcDate);
        return now >= matchTime;
      }
      return false;
    });
  };

  // INIZIALIZZA PRONOSTICI PER LA GIORNATA ("Pronostica")
  const handleStartPredictionsForMatchday = () => {
    if (isMatchdayStartedOrFinished()) {
      setDbStatus({ type: 'error', text: 'Impossibile pronosticare: la prima partita di questa giornata è già iniziata!' });
      return;
    }

    if (!matches || matches.length === 0) return;

    const initialPreds = { ...userPredictions };
    matches.forEach((m) => {
      if (!initialPreds[m.id]) {
        initialPreds[m.id] = {
          homeScore: '0',
          awayScore: '0',
          outcome: 'X',
          scorer: ''
        };
      }
    });

    setUserPredictions(initialPreds);
    setIsEditingPredictions(true);
    setDbStatus({ type: 'success', text: 'Modalità scommessa attivata! Modifica i risultati e clicca "Salva Tutti i Pronostici".' });
  };

  // SALVA TUTTI I PRONOSTICI DELLA LEGA CORRENTE
  const handleSaveAllPredictions = async () => {
    if (isMatchdayStartedOrFinished()) {
      setDbStatus({ type: 'error', text: 'Tempo scaduto! La giornata è già iniziata e non è più possibile salvare i pronostici.' });
      setIsEditingPredictions(false);
      return;
    }

    if (!activeLeagueCode || !userName) return;

    setSavingPredictions(true);
    setDbStatus(null);

    const recordsToSave = Object.keys(userPredictions).map((matchId) => {
      const pred = userPredictions[matchId];
      return {
        league_code: activeLeagueCode,
        nickname: userName,
        match_id: String(matchId),
        home_score: pred.homeScore !== '' ? parseInt(pred.homeScore, 10) : 0,
        away_score: pred.awayScore !== '' ? parseInt(pred.awayScore, 10) : 0,
        outcome: pred.outcome || calculateOutcome(pred.homeScore, pred.awayScore) || 'X',
        scorer: pred.scorer || null
      };
    });

    if (recordsToSave.length === 0) {
      setDbStatus({ type: 'error', text: 'Nessun pronostico inserito. Clicca su "Pronostica".' });
      setSavingPredictions(false);
      return;
    }

    try {
      const res = await fetch('/api/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recordsToSave),
      });

      const resJson = await res.json();

      if (res.ok && resJson.success) {
        setDbStatus({ type: 'success', text: `Pronostici salvati per la lega ${activeLeagueCode}!` });
        setIsEditingPredictions(false);
        fetchLeagueData();
      } else {
        setDbStatus({ type: 'error', text: `Errore Salvataggio: ${resJson.error || JSON.stringify(resJson)}` });
      }
    } catch (e) {
      setDbStatus({ type: 'error', text: `Errore Connessione: ${e.message}` });
    } finally {
      setSavingPredictions(false);
    }
  };

  // Sincronizzazione On-Demand delle Rose di Club
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

  // Condivisione
  const handleCopyLink = () => {
    const inviteUrl = `${window.location.origin}/?code=${activeLeagueCode || 'LEGA-8492'}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const inviteUrl = `${window.location.origin}/?code=${activeLeagueCode || 'LEGA-8492'}`;
    const message = encodeURIComponent(
      `🏆 Entra nella mia Lega Pronostici!\nClicca qui per giocare con me: ${inviteUrl}`
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  // CARICA PARTITE (CON AUTOFOCUS SULLA PRIMA GIORNATA FUTURA/IN CORSO)
  const fetchMatches = async (forcedMatchday = null) => {
    setLoading(true);
    setIsEditingPredictions(false);

    if (selectedLeague === 'UNL') {
      setMatches(nationsLeagueMatches);
      setMatchday(1);
      setLoading(false);
      return;
    }

    try {
      let targetMatchday = forcedMatchday;

      if (!targetMatchday) {
        // Scarichiamo tutto il calendario della competizione per trovare la prima giornata futura/in corso
        const compRes = await fetch(`/api/football?endpoint=competitions/${selectedLeague}/matches`);
        const compData = await compRes.json();

        if (compData.matches && compData.matches.length > 0) {
          const now = new Date();
          // Troviamo la prima partita in programma nel futuro o in corso
          const upcomingMatch = compData.matches.find((m) => {
            const mDate = new Date(m.utcDate);
            return mDate >= now || m.status === 'TIMED' || m.status === 'IN_PLAY';
          });

          if (upcomingMatch && upcomingMatch.matchday) {
            targetMatchday = upcomingMatch.matchday;
          } else {
            // Se tutte le partite sono concluse, prendiamo l'ultima giornata
            const lastMatch = compData.matches[compData.matches.length - 1];
            targetMatchday = lastMatch?.matchday || 1;
          }
        } else {
          targetMatchday = 1;
        }

        setMatchday(targetMatchday);
      }

      // Ora scarichiamo le partite per la giornata identificata
      const res = await fetch(
        `/api/football?endpoint=competitions/${selectedLeague}/matches&matchday=${targetMatchday}`
      );
      const data = await res.json();

      if (data.matches && data.matches.length > 0) {
        setMatches(data.matches);
      } else {
        setMatches([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMatchday(null);
    fetchMatches(null);
  }, [selectedLeague]);

  // Partecipanti Unici della Lega Attiva
  const leagueMembersList = Array.from(new Set(allLeaguePredictions.map(p => p.nickname)));

  // Calcolo Classifica
  const calculateGroupLeaderboard = () => {
    const userScores = {};

    leagueMembersList.forEach((nick) => {
      userScores[nick] = { name: nick, matchdayPts: 0, exactScores: 0 };
    });

    allLeaguePredictions.forEach((pred) => {
      if (pred.match_id === 'JOIN_ENTRY') return;

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

  const calculateOutcome = (homeVal, awayVal) => {
    if (homeVal === '' || awayVal === '' || homeVal === null || awayVal === null) return 'X';
    const h = parseInt(homeVal, 10);
    const a = parseInt(awayVal, 10);
    if (isNaN(h) || isNaN(a)) return 'X';
    if (h > a) return '1';
    if (h < a) return '2';
    return 'X';
  };

  const handleScoreChange = (matchId, team, value) => {
    if (!isEditingPredictions) return;
    const currentPred = userPredictions[matchId] || { homeScore: '0', awayScore: '0', scorer: '' };
    const updated = { ...currentPred, [team]: value };
    updated.outcome = calculateOutcome(updated.homeScore, updated.awayScore);

    setUserPredictions((prev) => ({ ...prev, [matchId]: updated }));
  };

  const handleScorerChange = (matchId, value) => {
    if (!isEditingPredictions) return;
    const currentPred = userPredictions[matchId] || { homeScore: '0', awayScore: '0', scorer: '' };
    const updated = { ...currentPred, scorer: value };

    setUserPredictions((prev) => ({ ...prev, [matchId]: updated }));
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

  const matchdayStarted = isMatchdayStartedOrFinished();

  // PRIMA REGISTRAZIONE UTENTE (Se non esiste un nome salvato nel dispositivo)
  if (!userName) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 text-slate-800 font-sans">
        <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-200 max-w-sm w-full space-y-5 text-center">
          <div className="bg-emerald-100 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto text-emerald-700">
            <Trophy className="w-8 h-8 text-amber-500" />
          </div>

          <div>
            <h1 className="text-xl font-bold text-slate-800">Crea il tuo Profilo</h1>
            <p className="text-xs text-slate-500 mt-1">
              Scegli il tuo Soprannome univoco. Ti accompagnerà in tutte le tue leghe!
            </p>
          </div>

          {dbStatus && (
            <div className={`p-3 rounded-xl text-left text-xs font-semibold flex items-start space-x-2 border ${
              dbStatus.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              {dbStatus.type === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />}
              <span className="break-words">{dbStatus.text}</span>
            </div>
          )}

          <form onSubmit={handleInitialUserRegister} className="space-y-3 text-left">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Il tuo Soprannome Univoco:</label>
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
              <label className="text-xs font-bold text-slate-700 block mb-1">Codice Prima Lega (Invito o Nuova):</label>
              <input
                type="text"
                placeholder="Es. LEGA-8492"
                value={inputNewCode}
                onChange={(e) => setInputNewCode(e.target.value.toUpperCase())}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-mono font-bold tracking-wider text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={savingLega}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-bold py-3 rounded-xl shadow-md transition-all text-xs flex items-center justify-center space-x-2"
            >
              {savingLega ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Creazione Profilo in corso...</span>
                </>
              ) : (
                <span>Crea Profilo e Inizia</span>
              )}
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
            <span className="text-[10px] text-emerald-200 font-medium">Lega Attiva: {activeLeagueCode}</span>
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

      {/* FEEDBACK A SCHERMO */}
      {dbStatus && (
        <div className={`m-3 p-3 rounded-xl text-xs font-semibold flex items-center justify-between border ${
          dbStatus.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          <div className="flex items-center space-x-2">
            {dbStatus.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
            <span className="break-words">{dbStatus.text}</span>
          </div>
          <button onClick={() => setDbStatus(null)} className="text-slate-400 hover:text-slate-600 ml-2">✕</button>
        </div>
      )}

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
              <span className="text-xs font-bold text-slate-700">
                {selectedLeague === 'UNL' ? 'Nations League' : matchday ? `Giornata ${matchday}` : 'Caricamento...'}
              </span>

              <div className="flex space-x-1.5 items-center">
                {selectedLeague !== 'UNL' && (
                  <>
                    <button
                      onClick={() => handleMatchdayChange((matchday || 1) - 1)}
                      className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-lg font-semibold hover:bg-slate-200 border border-slate-200"
                    >
                      &lt;
                    </button>
                    <button
                      onClick={() => handleMatchdayChange((matchday || 1) + 1)}
                      className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-lg font-semibold hover:bg-slate-200 border border-slate-200"
                    >
                      &gt;
                    </button>
                  </>
                )}

                {/* PULSANTE "PRONOSTICA" O STATO BLOCCATO */}
                {matchdayStarted ? (
                  <div className="bg-slate-100 text-slate-500 border border-slate-200 px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center space-x-1">
                    <Lock className="w-3 h-3 text-red-500" />
                    <span>Iniziata</span>
                  </div>
                ) : (
                  <button
                    onClick={handleStartPredictionsForMatchday}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1 shadow-sm transition-all ${
                      isEditingPredictions
                        ? 'bg-emerald-700 text-white ring-2 ring-emerald-400'
                        : 'bg-amber-500 hover:bg-amber-600 text-white'
                    }`}
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>{isEditingPredictions ? 'Modifica In Corso' : 'Pronostica'}</span>
                  </button>
                )}
              </div>
            </div>

            {matchdayStarted && (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 p-2.5 rounded-xl text-xs flex items-center space-x-2">
                <Lock className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>La giornata è iniziata. I pronostici per queste partite sono bloccati.</span>
              </div>
            )}

            {loading && (
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center text-slate-500 space-y-2">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-600" />
                <p className="text-xs font-semibold">Caricamento partite in corso...</p>
              </div>
            )}

            {!loading &&
              matches.map((match) => {
                const currentPred = userPredictions[match.id] || {};
                const currentOutcome = currentPred.outcome || 'X';
                const isFinished = match.status === 'FINISHED';

                const homeName = match.homeTeam?.shortName || match.homeTeam?.name || 'Casa';
                const awayName = match.awayTeam?.shortName || match.awayTeam?.name || 'Trasferta';

                const homeSquad = selectedLeague === 'UNL' 
                  ? (nationalSquads[match.homeTeam.id] || []) 
                  : (teamsSquads[match.homeTeam?.id] || []);
                  
                const awaySquad = selectedLeague === 'UNL' 
                  ? (nationalSquads[match.awayTeam.id] || []) 
                  : (teamsSquads[match.awayTeam?.id] || []);

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
                            disabled={!isEditingPredictions || matchdayStarted}
                            value={currentPred.homeScore ?? '0'}
                            onChange={(e) => handleScoreChange(match.id, 'homeScore', e.target.value)}
                            className="w-12 bg-white text-center text-xs py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold shadow-sm disabled:bg-slate-100 disabled:text-slate-500"
                          />
                          <span className="text-xs text-slate-400 font-bold">-</span>
                          <input
                            type="number"
                            min="0"
                            placeholder="0"
                            disabled={!isEditingPredictions || matchdayStarted}
                            value={currentPred.awayScore ?? '0'}
                            onChange={(e) => handleScoreChange(match.id, 'awayScore', e.target.value)}
                            className="w-12 bg-white text-center text-xs py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold shadow-sm disabled:bg-slate-100 disabled:text-slate-500"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                        <span className="text-xs text-slate-500 font-medium">Esito (Calcolato):</span>
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
                            disabled={!isEditingPredictions || matchdayStarted}
                            placeholder={isEditingPredictions ? "Digita o seleziona..." : "Nessun marcatore"}
                            value={currentPred.scorer ?? ''}
                            onChange={(e) => handleScorerChange(match.id, e.target.value)}
                            className="w-full bg-white px-2.5 py-1 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm disabled:bg-slate-100 disabled:text-slate-500"
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

            {/* TASTO "SALVA TUTTI I PRONOSTICI" VISIBILE SOLO IN MODALITÀ EDITING */}
            {!loading && matches.length > 0 && isEditingPredictions && !matchdayStarted && (
              <div className="pt-2">
                <button
                  onClick={handleSaveAllPredictions}
                  disabled={savingPredictions}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-bold py-3.5 rounded-2xl shadow-lg transition-all text-xs flex items-center justify-center space-x-2"
                >
                  {savingPredictions ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Invio a Supabase...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Salva Tutti i Pronostici</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CLASSIFICA CONDIVISA DI GRUPPO */}
        {activeTab === 'standings' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 p-3 border-b border-slate-200 font-bold text-xs text-slate-700 flex justify-between items-center">
                <span>Classifica Gruppo ({activeLeagueCode})</span>
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

        {/* TAB 3: LEGA E MULTI-LEGA */}
        {activeTab === 'league' && (
          <div className="space-y-4">
            {/* PROFILO UTENTE FISSO E SELETTORE LEGHE */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-3">
                  <div className="bg-emerald-100 p-2.5 rounded-xl text-emerald-700 font-bold">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800">{userName}</h4>
                    <p className="text-[11px] text-slate-400">Utente Registrato</p>
                  </div>
                </div>
                <button
                  onClick={handleResetFullProfile}
                  className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg transition-all"
                  title="Reset Profilo"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              {/* LISTA E SELEZIONE DELLE LEGHE ISCRITTE */}
              <div className="space-y-2 pt-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-700 flex items-center space-x-1">
                    <Layers className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Le Mie Leghe ({userLeagues.length})</span>
                  </span>
                  <button
                    onClick={() => setShowAddLeagueModal(true)}
                    className="text-xs text-emerald-600 font-bold hover:underline flex items-center space-x-1"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>+ Nuova Lega</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {userLeagues.map((code) => (
                    <button
                      key={code}
                      onClick={() => handleSelectActiveLeague(code)}
                      className={`p-2.5 rounded-xl border text-xs font-mono font-bold tracking-wider transition-all flex items-center justify-between ${
                        code === activeLeagueCode
                          ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span>{code}</span>
                      {code === activeLeagueCode && <Check className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* MODALE PER AGGIUNGERE NUOVA LEGA */}
            {showAddLeagueModal && (
              <div className="bg-emerald-50/90 border border-emerald-200 p-4 rounded-2xl space-y-3">
                <h4 className="font-bold text-xs text-emerald-900">Unisciti o Crea una Nuova Lega</h4>
                <form onSubmit={handleAddNewLeague} className="flex space-x-2">
                  <input
                    type="text"
                    required
                    placeholder="Codice es. LEGA-99"
                    value={inputNewCode}
                    onChange={(e) => setInputNewCode(e.target.value.toUpperCase())}
                    className="flex-1 bg-white border border-emerald-300 rounded-xl p-2.5 text-xs font-mono font-bold focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={savingLega}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 rounded-xl text-xs font-bold transition-all"
                  >
                    Unisciti
                  </button>
                </form>
              </div>
            )}

            {/* VISTA DETTAGLIO SCHEDINA UTENTE SELEZIONATO */}
            {selectedMemberDetail ? (
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 space-y-3">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-emerald-600" />
                    <h3 className="font-bold text-sm text-slate-800">Schedina di {selectedMemberDetail}</h3>
                  </div>
                  <button
                    onClick={() => setSelectedMemberDetail(null)}
                    className="text-xs text-emerald-600 font-bold hover:underline"
                  >
                    Torna all'elenco
                  </button>
                </div>

                <div className="space-y-2">
                  {allLeaguePredictions
                    .filter((p) => p.nickname === selectedMemberDetail && p.match_id !== 'JOIN_ENTRY')
                    .map((p) => (
                      <div key={p.match_id} className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                        <div className="flex justify-between font-bold text-slate-700">
                          <span>Partita: #{p.match_id}</span>
                          <span className="text-emerald-700">{p.home_score} - {p.away_score} ({p.outcome})</span>
                        </div>
                        {p.scorer && (
                          <p className="text-slate-500 text-[11px]">Marcatore: <span className="font-semibold text-slate-700">{p.scorer}</span></p>
                        )}
                      </div>
                    ))}

                  {allLeaguePredictions.filter((p) => p.nickname === selectedMemberDetail && p.match_id !== 'JOIN_ENTRY').length === 0 && (
                    <p className="text-xs text-slate-400 p-2 text-center">Nessun pronostico inviato per questa lega.</p>
                  )}
                </div>
              </div>
            ) : (
              /* ELENCO PARTECPANTI DELLA LEGA ATTIVA */
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 space-y-3">
                <h3 className="font-bold text-sm text-slate-800">Membri in {activeLeagueCode} ({leagueMembersList.length})</h3>
                <p className="text-[11px] text-slate-400">Clicca su un partecipante per consultare i suoi pronostici.</p>

                <div className="divide-y divide-slate-100">
                  {leagueMembersList.map((nick) => (
                    <div
                      key={nick}
                      onClick={() => setSelectedMemberDetail(nick)}
                      className="py-2.5 flex items-center justify-between text-xs cursor-pointer hover:bg-slate-50 px-2 rounded-lg transition-all"
                    >
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-emerald-600" />
                        <span className="font-semibold text-slate-700">{nick}</span>
                        {nick === userName && <span className="text-[10px] text-emerald-600 font-bold">(Tu)</span>}
                      </div>
                      <div className="flex items-center space-x-1 text-slate-400">
                        <Eye className="w-3.5 h-3.5" />
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 space-y-3">
              <h3 className="font-bold text-sm text-slate-800">Invita Amici in {activeLeagueCode}</h3>
              <div className="bg-slate-50 p-3 rounded-xl text-center font-mono font-extrabold text-emerald-700 text-lg tracking-widest border border-slate-200">
                {activeLeagueCode}
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
                Seleziona una lega alla volta da aggiornare on-demand per i marcatori reali dei club.
              </p>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Lega da aggiornare:</label>
                <select
                  value={targetSyncLeague}
                  onChange={(e) => setTargetSyncLeague(e.target.value)}
                  disabled={syncingSquads}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {leagues.filter(l => l.id !== 'UNL').map((l) => (
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

      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur border-t border-slate-200 grid grid-cols-4 py-2 z-50 shadow-lg">
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

        <button onClick={() => setActiveTab('settings')} className={`flex flex-col items-center space-y-1 ${activeTab === 'settings' ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
          <Settings className="w-5 h-5" />
          <span className="text-[10px]">Impostazioni</span>
        </button>
      </nav>
    </div>
  );
}
