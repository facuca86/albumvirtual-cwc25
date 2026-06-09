import React, { useEffect, useMemo, useRef, useState } from 'react';
import { db, doc, getDoc, setDoc } from './firebase_2022';
import { playerNames } from './playerNames_2022';
import { teamThemes } from './teamThemes_2022';
import { albumConfig } from './albumConfig_2022';

const LOCAL_STORAGE_KEY      = `${albumConfig.id}_stickers`;
const LOCAL_STORAGE_DARK_KEY = `${albumConfig.id}_darkMode`;

const ALBUM_OWNER    = albumConfig.owner;
const VIEW_PARAM     = new URLSearchParams(window.location.search).get('view');
const TOTAL_STICKERS = albumConfig.totalStickers;

const teams      = albumConfig.teams;
const teamData   = albumConfig.teamData;
const teamGroups = albumConfig.teamGroups;
const groups     = albumConfig.groups;

const progressDocRef = db ? doc(db, 'albumProgress', albumConfig.id) : null;
const settingsDocRef = db ? doc(db, 'albumSettings', albumConfig.id) : null;

const getThemeKey = (teamCode) =>
  albumConfig.sectionThemes[teamCode]?.themeKey ?? teamCode;

const getTeamGradientClass = (teamCode) => {
  const theme = albumConfig.sectionThemes[teamCode];
  if (theme?.solidBg) return theme.solidBg;
  const gradient = teamThemes[getThemeKey(teamCode)]?.gradient;
  return gradient ? `bg-gradient-to-r ${gradient}` : 'bg-white';
};

const getInnerPanelClass = (teamCode, darkMode = false) => {
  const inner = albumConfig.sectionThemes[teamCode]?.innerPanel;
  if (inner) return inner;
  return darkMode ? 'bg-[#1e1e30]' : 'bg-[#f7f5f2]';
};

const isTeamDark = (teamCode) => teamThemes[getThemeKey(teamCode)]?.dark === true;

const TAILWIND_HEX = {
  'green-300':'#86efac','green-400':'#4ade80','green-500':'#22c55e','green-600':'#16a34a',
  'red-400':'#f87171','red-500':'#ef4444','red-600':'#dc2626',
  'blue-400':'#60a5fa','blue-500':'#3b82f6','blue-600':'#2563eb','blue-900':'#1e3a5f',
  'yellow-300':'#fde047','yellow-400':'#facc15','yellow-500':'#eab308','yellow-600':'#ca8a04',
  'amber-600':'#d97706','orange-500':'#f97316','rose-400':'#fb7185',
  'sky-200':'#bae6fd','sky-400':'#38bdf8','sky-500':'#0ea5e9',
  'slate-400':'#94a3b8','slate-900':'#0f172a','white':'#ffffff',
};

function getTeamCodes(team) {
  const section = albumConfig.specialSections[team];
  if (section) {
    if (section.stickers) return section.stickers.map(s => s.code);
    return Array.from({length: section.count}, (_, i) => `${section.codePrefix}${section.codeStart + i}`);
  }
  return Array.from({length: albumConfig.teamStickerCount}, (_, i) => `${team}${i + 1}`);
}

function getTeamConfettiColors(teamCode) {
  const gradient = teamThemes[getThemeKey(teamCode)]?.gradient || '';
  const colors = (gradient.match(/(?:from|via|to)-([^\s]+)/g) || [])
    .map(m => TAILWIND_HEX[m.replace(/^(?:from|via|to)-/, '')]).filter(Boolean);
  return colors.length >= 2 ? [...colors, '#ffffff'] : ['#4ade80','#22c55e','#60a5fa','#ffffff'];
}

function getTeamForCode(code) {
  for (const [sectionCode, section] of Object.entries(albumConfig.specialSections)) {
    if (section.stickers) {
      if (section.stickers.some(s => s.code === code)) return sectionCode;
    } else {
      if (code.startsWith(section.codePrefix)) {
        const num = parseInt(code.slice(section.codePrefix.length));
        if (num >= section.codeStart && num < section.codeStart + section.count) return sectionCode;
      }
    }
  }
  const m = code.match(/^([A-Z]+)\d+$/);
  return (m && albumConfig.teamData[m[1]]) ? m[1] : null;
}

// ─────────────────────────────────────────────────────────────────────────────

export default function PaniniAlbum2022() {
  if (VIEW_PARAM === 'repetidas') return <RepeatidasView />;

  const [currentView, setCurrentView]           = useState('home');
  const [currentTeamIndex, setCurrentTeamIndex] = useState(0);
  const [completed, setCompleted]               = useState({});
  const [showStats, setShowStats]               = useState(false);
  const [importMessage, setImportMessage]       = useState('');
  const [showQR, setShowQR]                     = useState(false);
  const [darkMode, setDarkMode]                 = useState(false);
  const [celebration, setCelebration]           = useState(null);
  const [justPastedCode, setJustPastedCode]     = useState(null);
  const [highlightCode, setHighlightCode]       = useState(null);
  const [searchOpen, setSearchOpen]             = useState(false);
  const [searchQuery, setSearchQuery]           = useState('');
  const isInitialLoad = useRef(true);

  // ── Load progress ──────────────────────────────────────────────────────────
  useEffect(() => {
    const loadFromLocal = () => {
      try {
        const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (localData) {
          const parsed = JSON.parse(localData);
          if (parsed && typeof parsed === 'object') setCompleted(parsed);
        }
      } catch (_) {}
    };

    const loadProgress = async () => {
      try {
        if (progressDocRef) {
          const snap = await getDoc(progressDocRef);
          if (snap.exists()) {
            const data = snap.data();
            if (data?.stickers && typeof data.stickers === 'object') {
              setCompleted(data.stickers);
              return;
            }
          }
        }
        loadFromLocal();
      } catch (error) {
        console.error('Error loading album progress from Firestore:', error);
        loadFromLocal();
      } finally {
        isInitialLoad.current = false;
      }
    };
    loadProgress();
  }, []);

  // ── Load dark mode ─────────────────────────────────────────────────────────
  useEffect(() => {
    const loadDarkMode = async () => {
      try {
        if (settingsDocRef) {
          const snap = await getDoc(settingsDocRef);
          if (snap.exists() && typeof snap.data()?.darkMode === 'boolean') {
            setDarkMode(snap.data().darkMode);
            return;
          }
        }
      } catch {}
      const local = localStorage.getItem(LOCAL_STORAGE_DARK_KEY);
      if (local !== null) setDarkMode(local === 'true');
    };
    loadDarkMode();
  }, []);

  // ── Save progress ──────────────────────────────────────────────────────────
  useEffect(() => {
    const saveProgress = async () => {
      if (isInitialLoad.current) return;
      // Always persist locally first — independent of Firestore availability
      try { localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(completed)); } catch (_) {}
      try {
        if (progressDocRef) await setDoc(progressDocRef, { stickers: completed });
      } catch (error) {
        console.error('Error saving album progress to Firestore:', error);
      }
    };
    saveProgress();
  }, [completed]);

  // ── Derived ────────────────────────────────────────────────────────────────
  const currentTeam     = teams[currentTeamIndex] || teams[0];
  const currentTeamInfo = teamData[currentTeam] || { name: currentTeam, federation: 'Federación Nacional de Fútbol', flag: '🏳️' };

  const stickerCount = albumConfig.specialSections[currentTeam]?.count ?? albumConfig.teamStickerCount;

  const isRepeatedSticker  = (v) => v === 'repeated';
  const isCompletedSticker = (v) => v === true || v === 'repeated';

  // ── Stickers memo ──────────────────────────────────────────────────────────
  const stickers = useMemo(() => {
    const section = albumConfig.specialSections[currentTeam];
    return Array.from({ length: stickerCount }, (_, i) => {
      const id = i + 1;
      let code, type, label, horizontal;

      if (section) {
        if (section.stickers) {
          const def = section.stickers[i];
          code = def.code; label = def.label; type = def.type; horizontal = def.horizontal;
        } else {
          code       = `${section.codePrefix}${section.codeStart + i}`;
          type       = section.type;
          horizontal = section.horizontal;
          label      = section.playerNamesKey
            ? (playerNames[section.playerNamesKey]?.[id] || `Jugador ${id}`)
            : section.getLabel(id);
        }
      } else {
        code       = `${currentTeam}${id}`;
        type       = id === 1 ? 'shield' : 'player';
        label      = id === 1 ? 'Escudo' : (playerNames[currentTeam]?.[id] || `Jugador ${id}`);
        horizontal = false;
      }

      return {
        id,
        code,
        completed:  isCompletedSticker(completed[code]),
        repeated:   isRepeatedSticker(completed[code]),
        type,
        label,
        horizontal,
      };
    });
  }, [currentTeam, completed, stickerCount]);

  // ── Toggle ─────────────────────────────────────────────────────────────────
  const toggleSticker = (code) => {
    const current = completed[code];
    let next;
    if (current === true)         next = { ...completed, [code]: 'repeated' };
    else if (current === 'repeated') { next = { ...completed }; delete next[code]; }
    else                          next = { ...completed, [code]: true };
    setCompleted(next);

    if (!current) {
      setJustPastedCode(code);
      setTimeout(() => setJustPastedCode(null), 450);

      const newCount = Object.entries(next)
        .filter(([c, v]) => !c.startsWith(albumConfig.promoCodePrefix) && isCompletedSticker(v)).length;
      if (newCount === TOTAL_STICKERS) {
        setTimeout(() => setCelebration({ type: 'album' }), 350);
        return;
      }

      const teamForCode = getTeamForCode(code);
      if (teamForCode) {
        const codes = getTeamCodes(teamForCode);
        const wasComplete = codes.every(c => isCompletedSticker(completed[c]));
        const nowComplete = codes.every(c => isCompletedSticker(next[c]));
        if (nowComplete && !wasComplete) {
          setTimeout(() => setCelebration({ type: 'team', team: teamForCode }), 350);
        }
      }
    }
  };

  const toggleDarkMode = async () => {
    const newVal = !darkMode;
    setDarkMode(newVal);
    localStorage.setItem(LOCAL_STORAGE_DARK_KEY, String(newVal));
    if (settingsDocRef) {
      try { await setDoc(settingsDocRef, { darkMode: newVal }, { merge: true }); } catch (_) {}
    }
  };

  const nextTeam = () => {
    window.scrollTo(0, 0);
    if (currentTeam === albumConfig.lastSectionCode) { setCurrentView('home'); return; }
    setCurrentTeamIndex(prev => Math.min(prev + 1, teams.length - 1));
  };

  const prevTeam = () => {
    window.scrollTo(0, 0);
    setCurrentTeamIndex(prev => Math.max(prev - 1, 0));
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(completed)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = albumConfig.exportFileName; a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const parsed = JSON.parse(evt.target.result);
        if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) return;
        setCompleted(parsed);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsed));
        if (progressDocRef) { try { await setDoc(progressDocRef, { stickers: parsed }); } catch (_) {} }
        setImportMessage('✅ Progreso importado');
        setTimeout(() => setImportMessage(''), 2000);
      } catch (_) {}
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // ── Stats ──────────────────────────────────────────────────────────────────
  const completedCount     = Object.entries(completed).filter(([c,v]) => !c.startsWith(albumConfig.promoCodePrefix) && isCompletedSticker(v)).length;
  const repeatedCount      = Object.values(completed).filter(isRepeatedSticker).length;
  const completionPercent  = Math.round((completedCount / TOTAL_STICKERS) * 100);
  const remainingCount     = Math.max(TOTAL_STICKERS - completedCount, 0);

  const selectionTeams = albumConfig.competingTeams;

  // brillantes: escudos de equipos competidores + figuritas especiales foil
  const shieldCodes    = selectionTeams.map(t => `${t}1`);
  const fwcCodes       = Array.from({length: albumConfig.brillanteStickerCount}, (_, i) => `${albumConfig.brillanteStickerPrefix}${i + 1}`);
  const brilliantCodes = [...shieldCodes, ...fwcCodes];
  const brilliantCompletedCount = brilliantCodes.filter(c => isCompletedSticker(completed[c])).length;

  const selectionStats = useMemo(() => {
    const result = [];
    for (const item of albumConfig.statsConfig) {
      if (item.key === '__TEAMS__') {
        selectionTeams.forEach(team => {
          const codes = getTeamCodes(team);
          result.push({ key:team, emoji:albumConfig.teamData[team]?.flag||'🏳️', name:(albumConfig.teamData[team]?.name||team).toUpperCase(), total:codes.length, completed:codes.filter(c=>isCompletedSticker(completed[c])).length });
        });
      } else {
        const codes = item.fixedCodes || Array.from({length:item.count}, (_, i) => `${item.codePrefix}${item.codeStart + i}`);
        result.push({ key:item.key, emoji:item.emoji, name:item.name, total:codes.length, completed:codes.filter(c=>isCompletedSticker(completed[c])).length });
      }
    }
    return result;
  }, [completed, selectionTeams]);

  // ── Search ─────────────────────────────────────────────────────────────────
  const searchIndex = useMemo(() => {
    const entries = [];
    for (const teamCode of teams) {
      const section = albumConfig.specialSections[teamCode];
      const sc      = albumConfig.searchConfig?.[teamCode];
      if (section) {
        const codes = getTeamCodes(teamCode);
        codes.forEach((code, i) => {
          let label;
          if (section.stickers)          label = section.stickers[i].label;
          else if (section.playerNamesKey) label = playerNames[section.playerNamesKey]?.[i + 1] || `Jugador ${i + 1}`;
          else                             label = section.getLabel(i + 1);
          entries.push({ code, label, team: teamCode, teamName: sc?.teamName || teamCode, teamFlag: sc?.teamFlag || '🏳️' });
        });
      } else {
        const info = albumConfig.teamData[teamCode];
        for (let id = 1; id <= albumConfig.teamStickerCount; id++) {
          entries.push({
            code:     `${teamCode}${id}`,
            label:    id === 1 ? 'Escudo' : (playerNames[teamCode]?.[id] || `Jugador ${id}`),
            team:     teamCode,
            teamName: info?.name || teamCode,
            teamFlag: info?.flag || '🏳️',
          });
        }
      }
    }
    return entries;
  }, [selectionTeams]);

  const searchResults = useMemo(() => {
    if (searchQuery.length < 2) return [];
    const q = searchQuery.toLowerCase().trim();
    return searchIndex.filter(e =>
      e.code.toLowerCase().startsWith(q) ||
      e.label.toLowerCase().includes(q) ||
      e.teamName.toLowerCase().includes(q)
    ).slice(0, 6);
  }, [searchQuery, searchIndex]);

  const handleSearchSelect = (entry) => {
    setSearchOpen(false); setSearchQuery('');
    const teamIdx = teams.indexOf(entry.team);
    if (teamIdx >= 0) {
      window.scrollTo(0, 0);
      setCurrentTeamIndex(teamIdx);
      setCurrentView('album');
      setHighlightCode(entry.code);
      setTimeout(() => setHighlightCode(null), 3000);
    }
  };

  // ── currentTeamCompleted ───────────────────────────────────────────────────
  const currentTeamCompleted = stickers.filter(s => s.completed).length;

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-[#0f0f1a] text-white' : 'bg-[#7B1010] text-slate-800'}`}>

      {/* ── HEADER ── */}
      <header className={`border-b shadow-sm sticky top-0 z-50 transition-colors duration-300 ${darkMode ? 'bg-[#1a1a2e] border-[#2a2a4a]' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-4 flex flex-row gap-2 justify-between items-center">
          <div className="min-w-0">
            <h1 className={`text-lg sm:text-3xl font-black italic truncate ${darkMode ? 'text-white' : ''}`}>
              {albumConfig.title}
            </h1>
            <p className={`hidden sm:block text-xs uppercase tracking-[0.3em] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {albumConfig.subtitle}
            </p>
            <div className={`mt-0.5 sm:mt-2 text-xs sm:text-sm font-black ${darkMode ? 'text-amber-400' : 'text-amber-800'}`}>
              {completionPercent}% COMPLETADO
            </div>
            <div className={`mt-1 sm:mt-2 h-2 sm:h-2.5 w-24 sm:w-56 rounded-full overflow-hidden ${darkMode ? 'bg-[#2a2a4a]' : 'bg-slate-200'}`}>
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 transition-all"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 relative">
            {searchOpen && (
              <div className="relative flex items-center gap-1">
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Escape') { setSearchOpen(false); setSearchQuery(''); } }}
                  placeholder="Código o jugador…"
                  className={`px-3 py-2 rounded-xl text-sm font-black border-2 w-32 sm:w-48 outline-none transition-all ${darkMode ? 'bg-[#2a2a4a] border-[#4a4a6a] text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400'}`}
                />
                <button onClick={() => { setSearchOpen(false); setSearchQuery(''); }} className={`font-black text-base leading-none px-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>✕</button>
                {searchResults.length > 0 && (
                  <div className={`absolute top-full right-0 mt-1 w-72 max-w-[calc(100vw-1.5rem)] rounded-2xl shadow-2xl overflow-hidden z-[200] ${darkMode ? 'bg-[#1a1a2e] border border-[#3a3a5a]' : 'bg-white border border-slate-200'}`}>
                    {searchResults.map(entry => (
                      <button key={entry.code} onClick={() => handleSearchSelect(entry)}
                        className={`w-full px-4 py-2.5 text-left flex items-center gap-3 border-b last:border-b-0 transition-colors ${darkMode ? 'border-[#2a2a4a] hover:bg-[#2a2a4a] text-white' : 'border-slate-100 hover:bg-slate-50'}`}>
                        <span className="text-xl leading-none shrink-0">{entry.teamFlag}</span>
                        <div className="min-w-0">
                          <div className={`font-black text-xs uppercase ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>{entry.code}</div>
                          <div className="font-black text-sm truncate">{entry.label}</div>
                          <div className={`text-xs truncate ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{entry.teamName}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            <button onClick={() => setSearchOpen(s => !s)} title="Buscar figurita"
              className={`px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-black text-sm sm:text-base transition-colors duration-300 ${darkMode ? 'bg-white text-slate-900' : 'bg-slate-800 text-white'}`}>
              🔍
            </button>
            <button onClick={toggleDarkMode}
              className={`px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-black text-sm sm:text-base transition-colors duration-300 ${darkMode ? 'bg-white text-slate-900' : 'bg-slate-800 text-white'}`}>
              {darkMode ? '☀️' : '🌙'}
            </button>
            <button onClick={() => setCurrentView('home')}
              className={`px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-black text-sm sm:text-base transition-colors duration-300 ${darkMode ? 'bg-white text-amber-700' : 'bg-amber-700 text-white'}`}>
              HOME
            </button>
          </div>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8">

        {/* HOME */}
        {currentView === 'home' && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <button onClick={() => setCurrentView('groups')}
              className={`rounded-3xl p-8 shadow-xl text-left active:scale-95 transition-colors duration-300 ${darkMode ? 'bg-[#1e1e30] text-white' : 'bg-white'}`}>
              <div className="text-3xl font-black italic uppercase">Explorar Álbum</div>
            </button>
            <button onClick={() => setCurrentView('teams')}
              className={`rounded-3xl p-8 shadow-xl text-left active:scale-95 transition-colors duration-300 ${darkMode ? 'bg-[#1e1e30] text-white' : 'bg-white'}`}>
              <div className="text-3xl font-black italic uppercase">Índice</div>
            </button>
            <button onClick={() => setShowStats(true)}
              className={`rounded-3xl p-8 shadow-xl text-left active:scale-95 transition-colors duration-300 ${darkMode ? 'bg-[#1e1e30] text-white' : 'bg-white'}`}>
              <div className="text-3xl font-black italic uppercase">Estadísticas</div>
            </button>
          </div>
        )}

        {/* STATS SELECCIONES */}
        {currentView === 'stats-selections' && (
          <div className={`rounded-3xl p-6 sm:p-8 shadow-xl max-w-4xl mx-auto transition-colors duration-300 ${darkMode ? 'bg-[#1e1e30] text-white' : 'bg-white'}`}>
            <h2 className="text-3xl font-black italic uppercase mb-6">Estadísticas Selecciones</h2>
            <div className="max-h-[60vh] overflow-y-auto space-y-3 pr-1">
              {selectionStats.map(item => {
                const isComplete = item.completed === item.total;
                return (
                  <div key={item.key} className={`font-black text-lg sm:text-xl flex items-center gap-2 ${isComplete ? 'text-green-500' : ''}`}>
                    <span>{item.emoji} {item.name}: {item.completed} / {item.total}</span>
                    {isComplete && <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full font-black uppercase tracking-wide">Completo</span>}
                  </div>
                );
              })}
            </div>
            <button onClick={() => { setCurrentView('home'); setShowStats(true); }}
              className="mt-6 bg-amber-700 text-white px-6 py-3 rounded-2xl font-black">VOLVER</button>
          </div>
        )}

        {/* ÍNDICE */}
        {currentView === 'teams' && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {teams.map(team => (
              <button key={team}
                onClick={() => { setCurrentTeamIndex(teams.indexOf(team)); setCurrentView('album'); }}
                className={`rounded-2xl p-4 shadow font-black italic active:scale-95 transition-colors duration-300 flex items-center gap-2 ${darkMode ? 'bg-[#1e1e30] text-white' : 'bg-white'}`}>
                <span>{teamData[team]?.flag || '🏳️'}</span>
                <span className="truncate">{teamData[team]?.name || team}</span>
              </button>
            ))}
          </div>
        )}

        {/* GRUPOS */}
        {currentView === 'groups' && (
          <div
            className="rounded-3xl p-4 sm:p-8 pb-24 sm:pb-8 shadow-xl"
            style={{ background: 'radial-gradient(ellipse at center, #7B1010, #B8860B, #7B1010, #DAA520, #8B0000, #FFD700, #A0522D, #CD853F)' }}
          >
            <div className="hidden lg:flex justify-between items-center mb-6">
              <button onClick={() => setCurrentView('home')} className="rounded-full px-6 py-3 shadow font-bold italic bg-white text-black">HOME</button>
              <h2 className="text-3xl font-black italic uppercase text-white drop-shadow-lg">GRUPOS</h2>
              <button onClick={() => { setCurrentTeamIndex(0); setCurrentView('album'); }} className="rounded-full px-6 py-3 shadow font-bold italic bg-white text-black">SIGUIENTE →</button>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <button onClick={() => { setCurrentTeamIndex(0); setCurrentView('album'); }}
                className="col-span-2 rounded-2xl p-4 font-black text-2xl sm:text-3xl active:scale-95 transition-transform"
                style={{ backgroundColor: '#FFD700', color: '#7B1010' }}>
                INTRO
              </button>

              <button onClick={() => { setCurrentTeamIndex(teams.indexOf('ESTADIOS')); setCurrentView('album'); }}
                className="col-span-2 rounded-2xl p-4 font-black text-2xl sm:text-3xl active:scale-95 transition-transform"
                style={{ backgroundColor: '#0d2167', color: '#FFD700' }}>
                ESTADIOS
              </button>

              {Object.entries(groups).map(([letter, group]) => {
                const isLightGroup = false;
                const textColor = '#ffffff';
                return (
                  <button key={letter}
                    onClick={() => { setCurrentTeamIndex(teams.indexOf(group.teams[0])); setCurrentView('album'); }}
                    className="rounded-2xl py-2 px-3 font-black active:scale-95 transition-transform text-left flex gap-2 items-center"
                    style={{ backgroundColor: group.color, color: textColor }}>
                    <span className="text-2xl sm:text-3xl font-black leading-none shrink-0">{letter}</span>
                    <div className="flex flex-col gap-0.5 text-sm leading-tight min-w-0">
                      {group.teams.map(team => (
                        <span key={team}>{teamData[team]?.flag||'🏳️'} {teamData[team]?.name||team}</span>
                      ))}
                    </div>
                  </button>
                );
              })}

              <button onClick={() => { setCurrentTeamIndex(teams.indexOf('FWCH')); setCurrentView('album'); }}
                className="col-span-2 rounded-2xl p-4 font-black text-2xl sm:text-3xl active:scale-95 transition-transform"
                style={{ backgroundColor: '#7c3d00', color: '#FFD700' }}>
                FIFA MUSEUM
              </button>
            </div>
          </div>
        )}

        {/* GRUPOS — mobile bottom nav */}
        {currentView === 'groups' && (
          <div className={`lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t shadow-lg transition-colors duration-300 ${darkMode ? 'bg-[#1a1a2e] border-[#2a2a4a]' : 'bg-white border-slate-200'}`}>
            <div className="flex">
              <button onClick={() => setCurrentView('home')}
                className={`flex-1 py-4 font-black italic text-sm border-r active:bg-slate-100 transition-colors ${darkMode ? 'border-[#2a2a4a] text-white' : 'border-slate-200'}`}>HOME</button>
              <div className={`flex-1 border-r ${darkMode ? 'border-[#2a2a4a]' : 'border-slate-200'}`} />
              <button onClick={() => { setCurrentTeamIndex(0); setCurrentView('album'); }}
                className={`flex-1 py-4 font-black italic text-sm active:bg-slate-100 transition-colors ${darkMode ? 'text-white' : ''}`}>SIGUIENTE →</button>
            </div>
          </div>
        )}

        {/* ÁLBUM */}
        {currentView === 'album' && (
          <AlbumPage
            currentTeam={currentTeam}
            currentTeamInfo={currentTeamInfo}
            stickers={stickers}
            stickerCount={stickerCount}
            currentTeamCompleted={currentTeamCompleted}
            darkMode={darkMode}
            toggleSticker={toggleSticker}
            justPastedCode={justPastedCode}
            highlightCode={highlightCode}
            teamGroups={teamGroups}
            groups={groups}
            teamData={teamData}
            onPrev={() => currentTeam === teams[0] ? setCurrentView('groups') : prevTeam()}
            onNext={nextTeam}
            onIndex={() => setCurrentView('teams')}
          />
        )}

        {/* ÁLBUM — mobile bottom nav */}
        {currentView === 'album' && (
          <div className={`lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t shadow-lg transition-colors duration-300 ${darkMode ? 'bg-[#1a1a2e] border-[#2a2a4a]' : 'bg-white border-slate-200'}`}>
            <div className="flex">
              <button onClick={() => currentTeam === teams[0] ? setCurrentView('groups') : prevTeam()}
                className={`flex-1 py-4 font-black italic text-sm border-r active:bg-slate-100 transition-colors ${darkMode ? 'border-[#2a2a4a] text-white' : 'border-slate-200'}`}>← ANTERIOR</button>
              <button onClick={() => setCurrentView('teams')}
                className={`flex-1 py-4 font-black uppercase text-sm border-r active:bg-slate-100 transition-colors ${darkMode ? 'border-[#2a2a4a] text-white' : 'border-slate-200'}`}>ÍNDICE</button>
              <button onClick={nextTeam}
                className={`flex-1 py-4 font-black italic text-sm active:bg-slate-100 transition-colors ${darkMode ? 'text-white' : ''}`}>
                {currentTeam === albumConfig.lastSectionCode ? 'HOME' : 'SIGUIENTE →'}
              </button>
            </div>
          </div>
        )}

      </main>

      {/* ── MODALES ── */}
      {showStats && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
          <div className={`rounded-3xl p-6 sm:p-8 shadow-2xl w-full max-w-md transition-colors duration-300 ${darkMode ? 'bg-[#1e1e30] text-white' : 'bg-white'}`}>
            <h3 className="text-2xl font-black italic uppercase mb-6">Estadísticas</h3>
            <div className="space-y-3 font-black">
              <div>Figuritas completadas: {completedCount} / {TOTAL_STICKERS}</div>
              <div>
                <div className="flex justify-between mb-1"><span>Progreso</span><span>{completionPercent}%</span></div>
                <div className={`w-full rounded-full h-3 ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`}>
                  <div className="bg-amber-500 h-3 rounded-full transition-all duration-500" style={{ width: `${completionPercent}%` }} />
                </div>
              </div>
              <div>Me faltan: {remainingCount}</div>
              <div>Brillantes: {brilliantCompletedCount} / 61</div>
              <div>Repetidas: {repeatedCount}</div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={handleExport} className="bg-green-600 text-white px-6 py-3 rounded-2xl font-black">EXPORTAR</button>
              <label className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black cursor-pointer">
                IMPORTAR
                <input type="file" accept=".json" className="hidden" onChange={handleImport} />
              </label>
              {importMessage && <span className="w-full text-green-600 font-black">{importMessage}</span>}
            </div>
            <div className={`mt-4 pt-4 border-t ${darkMode ? 'border-slate-700' : 'border-slate-200'} flex flex-wrap gap-3`}>
              <button onClick={() => { setShowStats(false); setCurrentView('stats-selections'); }}
                className="bg-amber-700 text-white px-6 py-3 rounded-2xl font-black">Estadísticas Selecciones</button>
              <button onClick={() => setShowQR(true)} className="bg-purple-600 text-white px-6 py-3 rounded-2xl font-black">Generar QR</button>
              <button onClick={() => setShowStats(false)}
                className={`px-6 py-3 rounded-2xl font-black ${darkMode ? 'bg-slate-600 text-white' : 'bg-slate-300 text-slate-800'}`}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {showQR      && <QRModal onClose={() => setShowQR(false)} />}
      {celebration && <CelebrationModal celebration={celebration} teamData={teamData} teamThemes={teamThemes} getThemeKey={getThemeKey} getTeamConfettiColors={getTeamConfettiColors} onClose={() => setCelebration(null)} />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// AlbumPage — vista de selección/sección
// ═══════════════════════════════════════════════════════════════════════════════
function AlbumPage({ currentTeam, currentTeamInfo, stickers, stickerCount, currentTeamCompleted,
  darkMode, toggleSticker, justPastedCode, highlightCode, teamGroups, groups, teamData,
  onPrev, onNext, onIndex }) {

  const isSpecial  = currentTeam in albumConfig.specialSections;
  const isDarkTeam = isTeamDark(currentTeam);

  const titleColor = isDarkTeam || currentTeam === 'FWCH' || currentTeam === 'ESTADIOS'
    ? 'text-white drop-shadow-lg' : 'text-slate-800';

  return (
    <div className={`rounded-3xl px-4 pt-4 pb-24 sm:px-8 sm:pt-8 sm:pb-8 shadow-xl ${getTeamGradientClass(currentTeam)}`}>

      {/* Desktop nav */}
      <div className="hidden lg:flex justify-between items-center mb-8 gap-4">
        <button onClick={onPrev}
          className={`rounded-full px-6 py-3 shadow font-bold italic transition-colors duration-300 ${darkMode ? 'bg-[#1a1a2e] text-white border border-[#3a3a5a]' : 'bg-white text-black'}`}>
          ← ANTERIOR
        </button>
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <h2 className={`text-3xl sm:text-5xl font-black italic uppercase break-words ${titleColor}`}>
              {currentTeam === 'FWCH' ? 'FIFA MUSEUM' : currentTeamInfo.name}
            </h2>
            <button onClick={onIndex}
              className={`${currentTeam === 'COCA' ? 'bg-white text-amber-700' : 'bg-amber-700 text-white'} px-4 py-2 rounded-2xl font-black uppercase text-lg sm:text-2xl leading-none`}>
              INDICE
            </button>
          </div>
          <div className={`mt-2 text-sm uppercase tracking-[0.25em] ${isDarkTeam || currentTeam === 'FWCH' || currentTeam === 'ESTADIOS' ? 'text-white/80' : 'text-slate-500'}`}>
            {currentTeamInfo.federation}
          </div>
          <div className={`mt-3 text-2xl font-black ${isDarkTeam || currentTeam === 'FWCH' || currentTeam === 'ESTADIOS' ? 'text-white' : 'text-amber-700'}`}>
            {currentTeamCompleted}/{stickerCount}
          </div>
        </div>
        <button onClick={onNext}
          className={`rounded-full px-6 py-3 shadow font-bold italic transition-colors duration-300 ${darkMode ? 'bg-[#1a1a2e] text-white border border-[#3a3a5a]' : 'bg-white text-black'}`}>
          {currentTeam === albumConfig.lastSectionCode ? 'HOME' : 'SIGUIENTE →'}
        </button>
      </div>

      {/* Mobile strip */}
      <div className="lg:hidden flex items-center gap-3 mb-4 px-3 py-2 bg-black/20 rounded-2xl">
        <span className="text-3xl leading-none">{currentTeamInfo.flag}</span>
        <div className="flex-1 min-w-0">
          <div className="font-black italic uppercase text-base leading-none text-white truncate">
            {currentTeam === 'FWCH' ? 'FIFA MUSEUM' : currentTeamInfo.name}
          </div>
          <div className="text-[10px] text-white/75 uppercase tracking-widest mt-0.5 truncate">
            {currentTeamInfo.federation}
          </div>
        </div>
        <div className="font-black text-sm text-white/90 shrink-0">{currentTeamCompleted}/{stickerCount}</div>
      </div>

      {/* Inner panel */}
      <div className={`overflow-hidden rounded-[2rem] border-4 transition-colors duration-300 ${darkMode ? 'border-[#2a2a4a] bg-[#1e1e30]' : 'border-slate-200 bg-white'} grid lg:grid-cols-2`}>
        {currentTeam === 'FWCI' ? (
          <FWCIPanel stickers={stickers} currentTeam={currentTeam} currentTeamInfo={currentTeamInfo}
            darkMode={darkMode} toggleSticker={toggleSticker} justPastedCode={justPastedCode} highlightCode={highlightCode} />
        ) : currentTeam === 'ESTADIOS' ? (
          <EstadiosPanel stickers={stickers} currentTeam={currentTeam}
            darkMode={darkMode} toggleSticker={toggleSticker} justPastedCode={justPastedCode} highlightCode={highlightCode} />
        ) : currentTeam === 'FWCH' ? (
          <FWCHPanel stickers={stickers} currentTeam={currentTeam}
            darkMode={darkMode} toggleSticker={toggleSticker} justPastedCode={justPastedCode} highlightCode={highlightCode} />
        ) : (
          <TeamPanel stickers={stickers} currentTeam={currentTeam} currentTeamInfo={currentTeamInfo}
            darkMode={darkMode} toggleSticker={toggleSticker} justPastedCode={justPastedCode} highlightCode={highlightCode}
            teamGroups={teamGroups} groups={groups} teamData={teamData} />
        )}
      </div>
    </div>
  );
}

// ── FWCI Panel ────────────────────────────────────────────────────────────────
function FWCIPanel({ stickers, currentTeam, currentTeamInfo, darkMode, toggleSticker, justPastedCode, highlightCode }) {
  const bgClass = getInnerPanelClass(currentTeam, darkMode);
  return (
    <>
      {/* Mobile: todos en grid */}
      <div className={`lg:hidden p-3 col-span-2 ${bgClass}`}>
        <div className="grid grid-cols-4 gap-2">
          {stickers.map(s => (
            <div key={s.code} className={s.horizontal ? 'col-span-2' : ''}>
              <Sticker sticker={s} currentTeam={currentTeam} onToggle={toggleSticker}
                darkMode={darkMode} justPasted={justPastedCode===s.code} highlighted={highlightCode===s.code} />
            </div>
          ))}
        </div>
      </div>
      {/* Desktop: panel izquierdo (PANINI + FWC1 + pares FWC2/3) */}
      <div className={`hidden lg:block p-8 border-r transition-colors duration-300 ${darkMode?'border-[#2a2a4a]':'border-slate-300'} ${bgClass}`}>
        <div className="grid grid-cols-4 gap-4">
          <div className="col-span-2">
            <div className="text-5xl font-black uppercase leading-none mb-4 text-white">{currentTeamInfo.name}</div>
            <div className="flex items-center gap-4 mb-4">
              <div className="text-6xl">{currentTeamInfo.flag}</div>
              <div className="font-black uppercase text-sm leading-tight text-white">{currentTeamInfo.federation}</div>
            </div>
          </div>
          {/* PANINI + FWC1 verticales */}
          {stickers.slice(0,2).map(s => (
            <Sticker key={s.code} sticker={s} currentTeam={currentTeam} onToggle={toggleSticker}
              darkMode={darkMode} justPasted={justPastedCode===s.code} highlighted={highlightCode===s.code} />
          ))}
          {/* FWC2+FWC3 horizontales */}
          {stickers.slice(2,4).map(s => (
            <div key={s.code} className="col-span-2">
              <Sticker sticker={s} currentTeam={currentTeam} onToggle={toggleSticker}
                darkMode={darkMode} justPasted={justPastedCode===s.code} highlighted={highlightCode===s.code} />
            </div>
          ))}
        </div>
      </div>
      {/* Desktop: panel derecho (FWC4–FWC7) */}
      <div className={`hidden lg:block p-8 ${bgClass}`}>
        <div className="grid grid-cols-4 gap-4">
          {stickers.slice(4).map(s => (
            <div key={s.code} className="col-span-2">
              <Sticker sticker={s} currentTeam={currentTeam} onToggle={toggleSticker}
                darkMode={darkMode} justPasted={justPastedCode===s.code} highlighted={highlightCode===s.code} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ── Estadios Panel ────────────────────────────────────────────────────────────
function EstadiosPanel({ stickers, currentTeam, darkMode, toggleSticker, justPastedCode, highlightCode }) {
  const bgClass = getInnerPanelClass(currentTeam, darkMode);
  const half = Math.ceil(stickers.length / 2);
  return (
    <>
      {/* Mobile */}
      <div className={`lg:hidden col-span-2 p-3 ${bgClass}`}>
        <div className="text-2xl font-black uppercase text-white mb-3">ESTADIOS</div>
        <div className="grid grid-cols-4 gap-2">
          {stickers.map(s => (
            <div key={s.code} className="col-span-2">
              <Sticker sticker={s} currentTeam={currentTeam} onToggle={toggleSticker}
                darkMode={darkMode} justPasted={justPastedCode===s.code} highlighted={highlightCode===s.code} />
            </div>
          ))}
        </div>
      </div>
      {/* Desktop izquierda */}
      <div className={`hidden lg:block p-8 border-r transition-colors duration-300 ${darkMode?'border-[#2a2a4a]':'border-slate-300'} ${bgClass}`}>
        <div className="text-4xl font-black uppercase text-white mb-6">ESTADIOS</div>
        <div className="grid grid-cols-4 gap-4">
          {stickers.slice(0,half).map(s => (
            <div key={s.code} className="col-span-2">
              <Sticker sticker={s} currentTeam={currentTeam} onToggle={toggleSticker}
                darkMode={darkMode} justPasted={justPastedCode===s.code} highlighted={highlightCode===s.code} />
            </div>
          ))}
        </div>
      </div>
      {/* Desktop derecha */}
      <div className={`hidden lg:block p-8 ${bgClass}`}>
        <div className="grid grid-cols-4 gap-4 mt-[4.5rem]">
          {stickers.slice(half).map(s => (
            <div key={s.code} className="col-span-2">
              <Sticker sticker={s} currentTeam={currentTeam} onToggle={toggleSticker}
                darkMode={darkMode} justPasted={justPastedCode===s.code} highlighted={highlightCode===s.code} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ── FWCH (FIFA Museum) Panel ──────────────────────────────────────────────────
function FWCHPanel({ stickers, currentTeam, darkMode, toggleSticker, justPastedCode, highlightCode }) {
  const bgClass = getInnerPanelClass(currentTeam, darkMode);
  const half = Math.ceil(stickers.length / 2);
  return (
    <>
      {/* Mobile */}
      <div className={`lg:hidden col-span-2 p-3 ${bgClass}`}>
        <div className="text-2xl font-black uppercase text-amber-400 mb-3">FIFA MUSEUM</div>
        <div className="grid grid-cols-4 gap-2">
          {stickers.map(s => (
            <Sticker key={s.code} sticker={s} currentTeam={currentTeam} onToggle={toggleSticker}
              darkMode={darkMode} justPasted={justPastedCode===s.code} highlighted={highlightCode===s.code} />
          ))}
        </div>
      </div>
      {/* Desktop izquierda */}
      <div className={`hidden lg:block p-8 border-r transition-colors duration-300 ${darkMode?'border-[#2a2a4a]':'border-amber-900'} ${bgClass}`}>
        <div className="text-4xl font-black uppercase text-amber-400 mb-6">FIFA MUSEUM</div>
        <div className="grid grid-cols-4 gap-4">
          {stickers.slice(0,half).map(s => (
            <Sticker key={s.code} sticker={s} currentTeam={currentTeam} onToggle={toggleSticker}
              darkMode={darkMode} justPasted={justPastedCode===s.code} highlighted={highlightCode===s.code} />
          ))}
        </div>
      </div>
      {/* Desktop derecha */}
      <div className={`hidden lg:block p-8 ${bgClass}`}>
        <div className="grid grid-cols-4 gap-4 mt-[5.5rem]">
          {stickers.slice(half).map(s => (
            <Sticker key={s.code} sticker={s} currentTeam={currentTeam} onToggle={toggleSticker}
              darkMode={darkMode} justPasted={justPastedCode===s.code} highlighted={highlightCode===s.code} />
          ))}
        </div>
      </div>
    </>
  );
}

// ── Team Panel ────────────────────────────────────────────────────────────────
function TeamPanel({ stickers, currentTeam, currentTeamInfo, darkMode, toggleSticker, justPastedCode,
  highlightCode, teamGroups, groups, teamData }) {

  const bgClass = getInnerPanelClass(currentTeam, darkMode);
  const isCoca  = currentTeam === 'COCA';

  const GroupBox = () => {
    if (!teamGroups[currentTeam]) return null;
    const grpKey = teamGroups[currentTeam].group;
    const grpTeams = groups[grpKey]?.teams || [];
    const currentIdxInGroup = grpTeams.indexOf(currentTeam);
    const grpColor = groups[grpKey]?.color || '#475569';
    return (
      <div className="border-2 rounded-2xl p-2 flex flex-col justify-center"
        style={darkMode ? {backgroundColor:'#2a2a4a',borderColor:'#475569'} : {backgroundColor:'rgba(255,255,255,0.6)',borderColor:'#cbd5e1'}}>
        <div className="font-black uppercase text-[11px] mb-1.5 tracking-widest text-center"
          style={{ color: darkMode ? '#e2e8f0' : grpColor }}>
          GRUPO {grpKey}
        </div>
        <div className="flex flex-col gap-0.5">
          {teamGroups[currentTeam].members.map((member, i) => {
            const isCurrent = i === currentIdxInGroup;
            const flag = teamData[grpTeams[i]]?.flag || '';
            return (
              <div key={i} className={`text-[9px] font-black uppercase leading-tight px-1.5 py-0.5 rounded flex items-center gap-1 ${
                isCurrent ? (darkMode?'bg-white text-slate-800':'bg-black text-white') : (darkMode?'text-slate-300':'text-slate-700')
              }`}>
                <span>{flag}</span><span>{member}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile */}
      {!isCoca && (
        <div className={`lg:hidden col-span-2 p-3 ${bgClass}`}>
          <div className="grid grid-cols-4 gap-2">
            {stickers.map(s => (
              <Sticker key={s.code} sticker={s} currentTeam={currentTeam} onToggle={toggleSticker}
                darkMode={darkMode} justPasted={justPastedCode===s.code} highlighted={highlightCode===s.code} />
            ))}
            {teamGroups[currentTeam] && (
              <div className="col-span-3"><GroupBox /></div>
            )}
          </div>
        </div>
      )}

      {/* Desktop / Coca izquierda */}
      <div className={`p-3 sm:p-8 border-b lg:border-b-0 lg:border-r transition-colors duration-300 ${darkMode?'border-[#2a2a4a]':'border-slate-300'} ${bgClass} ${!isCoca?'hidden lg:block':''}`}>
        <div className="grid grid-cols-4 gap-2 sm:gap-4">
          <div className="col-span-2 hidden lg:block">
            <div className={`text-3xl sm:text-5xl font-black uppercase leading-none mb-4 break-words ${isCoca?'text-black':''}`}>
              {currentTeamInfo.name}
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-4 text-center sm:text-left">
              <div className="text-5xl sm:text-6xl">{currentTeamInfo.flag}</div>
              <div className={`font-black uppercase text-[10px] sm:text-sm leading-tight max-w-[180px] ${isCoca?'text-black':''}`}>
                {currentTeamInfo.federation}
              </div>
            </div>
          </div>
          {/* Escudo + jugadores 2–9 */}
          {stickers.slice(0, 10).map(s => (
            <Sticker key={s.code} sticker={s} currentTeam={currentTeam} onToggle={toggleSticker}
              darkMode={darkMode} justPasted={justPastedCode===s.code} highlighted={highlightCode===s.code} />
          ))}
        </div>
      </div>

      {/* Desktop derecha */}
      <div className={`p-3 sm:p-8 ${bgClass} ${!isCoca?'hidden lg:block':''}`}>
        <div className="grid grid-cols-4 gap-2 sm:gap-4">
          {stickers.slice(10).map(s => (
            <Sticker key={s.code} sticker={s} currentTeam={currentTeam} onToggle={toggleSticker}
              darkMode={darkMode} justPasted={justPastedCode===s.code} highlighted={highlightCode===s.code} />
          ))}
          {teamGroups[currentTeam] && <GroupBox />}
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Sticker component
// ═══════════════════════════════════════════════════════════════════════════════
function Sticker({ sticker, onToggle, currentTeam, darkMode = false, justPasted = false, highlighted = false }) {
  const isPlayerSticker = sticker.type === 'player';
  const isShieldSticker = sticker.type === 'shield';

  const decorColor = sticker.repeated ? '#94a3b8' : sticker.completed ? '#4ade80' : '#cbd5e1';

  const svgStyle = { position:'absolute', top:'6%', left:'20%', width:'60%', opacity:0.5, pointerEvents:'none', zIndex:0 };

  const repeatedBg  = darkMode ? 'bg-slate-300 border-slate-400' : 'bg-slate-500 border-slate-500';
  const emptyBg     = darkMode ? 'bg-[#2a2a4a] border-slate-600' : 'bg-white border-slate-300';
  const completedBg = darkMode ? 'bg-green-900 border-green-500' : 'bg-green-100 border-green-500';

  const repeatedCodeClass  = darkMode ? 'text-slate-700 font-extrabold' : 'text-slate-100 font-extrabold';
  const repeatedLabelClass = darkMode ? 'text-slate-800 font-extrabold' : 'text-slate-100';

  const paniniStyle = sticker.code === 'PANINI' && !sticker.repeated ? {
    background: 'linear-gradient(135deg, #c0c0c0, #f8f8f8, #a8a8a8, #e8e8e8, #c0c0c0)',
    borderColor: '#a0a0a0'
  } : undefined;

  const animClass = justPasted ? 'sticker-paste' : highlighted ? 'sticker-pulse' : '';

  const isHoriz = sticker.horizontal;

  return (
    <button
      onClick={() => onToggle(sticker.code)}
      style={paniniStyle}
      className={`relative border-2 rounded-xl sm:rounded-2xl p-2 sm:p-4 w-full flex items-center justify-center text-center transition active:opacity-60 ${isHoriz ? 'aspect-[3/2]' : 'aspect-[2/3]'} ${
        sticker.repeated ? repeatedBg :
        sticker.code === 'PANINI' ? '' :
        sticker.completed ? completedBg :
        emptyBg
      } ${sticker.completed || sticker.repeated ? 'border-[4px] scale-[1.02]' : 'border-2'} ${animClass}`}
    >
      {isPlayerSticker && (
        <svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={svgStyle}>
          <circle cx="50" cy="35" r="22" fill={decorColor} />
          <path d="M 50 57 C 28 57 10 75 10 120 L 90 120 C 90 75 72 57 50 57 Z" fill={decorColor} />
        </svg>
      )}
      {isShieldSticker && (
        <svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={svgStyle}>
          <path d="M 10 10 L 90 10 L 90 65 Q 90 105 50 118 Q 10 105 10 65 Z" fill={decorColor} />
        </svg>
      )}
      <div style={{ position:'relative', zIndex:1 }}>
        <div className={`text-[9px] sm:text-xs uppercase break-all ${sticker.repeated ? repeatedCodeClass : sticker.completed ? 'text-black font-extrabold' : 'text-slate-400 font-black'}`}>
          {sticker.code}
        </div>
        <div className={`italic uppercase text-[10px] sm:text-sm mt-1 leading-tight ${sticker.completed||sticker.repeated ? 'font-extrabold' : 'font-black'} ${
          sticker.repeated ? repeatedLabelClass :
          currentTeam === 'COCA' || currentTeam === 'FWCH' ? 'text-black' : ''
        }`}>
          {sticker.label}
        </div>
      </div>
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// QRModal
// ═══════════════════════════════════════════════════════════════════════════════
function QRModal({ onClose }) {
  const qrRef = useRef(null);
  const url   = window.location.origin + window.location.pathname + '?view=repetidas';

  useEffect(() => {
    if (qrRef.current && window.QRCode) {
      new window.QRCode(qrRef.current, { text: url, width: 200, height: 200 });
    }
  }, []);

  return (
    <div className="fixed inset-0 z-[70] bg-black/70 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 shadow-2xl flex flex-col items-center gap-4 max-w-xs w-full">
        <h3 className="text-lg font-black italic uppercase">Figuritas Repetidas</h3>
        <div ref={qrRef} />
        <p className="text-xs text-slate-400 text-center break-all">{url}</p>
        <button onClick={onClose} className="bg-amber-700 text-white px-6 py-3 rounded-2xl font-black w-full">Cerrar</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// RepeatidasView
// ═══════════════════════════════════════════════════════════════════════════════
function getPlayerNameForCode(code) {
  for (const [, section] of Object.entries(albumConfig.specialSections)) {
    if (section.stickers) {
      const def = section.stickers.find(s => s.code === code);
      if (def) return def.repetidasLabel ?? def.label;
    } else {
      if (code.startsWith(section.codePrefix)) {
        const num = parseInt(code.slice(section.codePrefix.length));
        if (num >= section.codeStart && num < section.codeStart + section.count) {
          const i = num - section.codeStart + 1;
          if (section.playerNamesKey) return playerNames[section.playerNamesKey]?.[i] || code;
          return section.getLabel(i);
        }
      }
    }
  }
  const team = getTeamForCode(code);
  if (team) {
    const m = code.match(/^[A-Z]+(\d+)$/);
    if (m) {
      const id = parseInt(m[1]);
      if (id === 1) return 'Escudo';
      return playerNames[team]?.[id] || `Jugador ${id}`;
    }
  }
  return code;
}

function RepeatidasView() {
  const [stickerData, setStickerData] = useState(null);

  useEffect(() => {
    const loadFromLocal = () => {
      try {
        const local = localStorage.getItem(LOCAL_STORAGE_KEY);
        setStickerData(local ? JSON.parse(local) : {});
      } catch { setStickerData({}); }
    };

    const load = async () => {
      try {
        if (progressDocRef) {
          const snap = await getDoc(progressDocRef);
          if (snap.exists()) { setStickerData(snap.data()?.stickers || {}); return; }
        }
        loadFromLocal();
      } catch { loadFromLocal(); }
    };
    load();
  }, []);

  const grouped = useMemo(() => {
    if (!stickerData) return [];
    const byTeam = {};
    for (const [code, value] of Object.entries(stickerData)) {
      if (value !== 'repeated') continue;
      const team = getTeamForCode(code);
      if (!team) continue;
      if (!byTeam[team]) byTeam[team] = [];
      byTeam[team].push(code);
    }
    return teams.filter(t => byTeam[t]).map(t => ({ team:t, info:teamData[t], codes:byTeam[t] }));
  }, [stickerData]);

  if (!stickerData) {
    return (
      <div className="min-h-screen bg-[#7B1010] flex items-center justify-center">
        <div className="text-white font-black text-xl">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#7B1010]">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <h1 className="text-lg font-black italic uppercase text-slate-800">Figuritas repetidas de {ALBUM_OWNER}</h1>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest">{albumConfig.repetidasSubtitle}</p>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 py-5 space-y-3">
        {grouped.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center text-slate-800">
            <div className="text-4xl mb-3">🙌</div>
            <div className="font-black text-xl">¡No hay repetidas!</div>
            <div className="text-slate-500 mt-2 text-sm">Cuando tengas figuritas repetidas aparecerán acá.</div>
          </div>
        ) : grouped.map(({ team, info, codes }) => (
          <div key={team} className="bg-white rounded-2xl p-4 shadow">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl leading-none">{info?.flag||'🏳️'}</span>
              <div>
                <div className="font-black uppercase text-sm text-slate-800">{info?.name||team}</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">{codes.length} repetida{codes.length!==1?'s':''}</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {codes.map(code => {
                const name = getPlayerNameForCode(code);
                return (
                  <span key={code} className="bg-slate-500 text-white text-xs font-black px-2.5 py-1 rounded-lg">
                    {code}{name !== code ? ` · ${name}` : ''}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Confetti + CelebrationModal
// ═══════════════════════════════════════════════════════════════════════════════
function Confetti({ colors }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width  = window.innerWidth;
    const H = canvas.height = window.innerHeight;
    const particles = Array.from({length:120}, () => ({
      x: Math.random()*W, y: -10-Math.random()*220,
      w: 7+Math.random()*10, h: 3+Math.random()*6,
      color: colors[Math.floor(Math.random()*colors.length)],
      rot: Math.random()*Math.PI*2, rotSpeed: (Math.random()-0.5)*0.13,
      vx: (Math.random()-0.5)*3.5, vy: 2.5+Math.random()*3.5, alpha:1,
    }));
    let raf; const t0 = Date.now();
    const draw = () => {
      ctx.clearRect(0,0,W,H);
      const elapsed = Date.now()-t0;
      let alive = false;
      for (const p of particles) {
        p.x+=p.vx; p.y+=p.vy; p.rot+=p.rotSpeed;
        if (elapsed>1800) p.alpha=Math.max(0,p.alpha-0.016);
        if (p.alpha>0&&p.y<H+20) alive=true;
        ctx.save(); ctx.globalAlpha=p.alpha; ctx.translate(p.x,p.y); ctx.rotate(p.rot);
        ctx.fillStyle=p.color; ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h); ctx.restore();
      }
      if (alive) raf=requestAnimationFrame(draw);
    };
    raf=requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={canvasRef} style={{position:'fixed',inset:0,width:'100%',height:'100%',pointerEvents:'none',zIndex:190}} />;
}

function CelebrationModal({ celebration, teamData, teamThemes, getThemeKey, getTeamConfettiColors, onClose }) {
  const isAlbum   = celebration.type === 'album';
  const team      = celebration.team;
  const teamInfo  = team ? teamData[team] : null;
  const themeKey  = team ? getThemeKey(team) : null;
  const theme     = themeKey ? teamThemes[themeKey] : null;

  const gradientClass = isAlbum
    ? 'from-yellow-400 via-amber-500 to-red-700'
    : theme?.gradient || 'from-amber-500 to-yellow-600';

  const confettiColors = isAlbum
    ? ['#FFD700','#B8860B','#FF6B6B','#DAA520','#8B0000','#ffffff']
    : team === 'COCA'
    ? ['#e41f1f','#ff4444','#ff6666','#cc0000','#ffffff','#ffcccc']
    : getTeamConfettiColors(team);

  const isDark = isAlbum || theme?.dark;

  return (
    <div className="fixed inset-0 z-[160]">
      <Confetti colors={confettiColors} />
      <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
        <div
          className={`celebrate-card bg-gradient-to-br ${gradientClass} rounded-3xl p-8 shadow-2xl max-w-sm w-full text-center`}
          onClick={e => e.stopPropagation()}
        >
          <div className="text-7xl mb-4 drop-shadow-lg select-none">{isAlbum ? '🏆' : teamInfo?.flag || '🏅'}</div>
          <div className={`text-4xl font-black italic uppercase mb-2 drop-shadow ${isDark ? 'text-white' : 'text-slate-800'}`}>¡Felicitaciones!</div>
          <div className={`text-xl font-black mb-8 ${isDark ? 'text-white/90' : 'text-slate-700'}`}>
            {isAlbum ? '¡Completaste el álbum!' : `¡Completaste ${teamInfo?.name || team}!`}
          </div>
          <button onClick={onClose}
            className={`px-10 py-4 rounded-2xl font-black text-xl shadow-lg active:scale-95 transition-transform ${isDark ? 'bg-white text-slate-800 hover:bg-slate-100' : 'bg-slate-800 text-white hover:bg-slate-700'}`}>
            ¡Gracias! 🎉
          </button>
        </div>
      </div>
    </div>
  );
}
