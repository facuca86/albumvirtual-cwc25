// ─────────────────────────────────────────────────────────────────────────────
// Configuración del álbum — FIFA World Cup Qatar 2022
//
// Para adaptar a otro torneo (Eurocopa, Copa América, Mundial de Clubes, etc.):
//   1. Copiar este archivo con un nuevo nombre (ej: albumConfig_CWC2025.js)
//   2. Actualizar todos los valores a continuación
//   3. Crear teamThemes_*.js y playerNames_*.js para el nuevo torneo
//   4. Crear firebase_*.js con la configuración de Firebase del nuevo proyecto
//   5. Copiar panini_virtual_album_2022_app.jsx con nuevo nombre y
//      cambiar las 5 líneas de import al tope del archivo
// ─────────────────────────────────────────────────────────────────────────────

export const albumConfig = {

  // ── Identidad y almacenamiento ───────────────────────────────────────────────
  id: 'paniniWorldCup2022',         // clave usada en localStorage y Firestore
  owner: 'Facundo',
  title: 'ÁLBUM VIRTUAL 2022',
  subtitle: 'FIFA WORLD CUP · QATAR',
  repetidasSubtitle: 'FIFA World Cup 2022 · Qatar',
  exportFileName: 'panini2022_backup.json',

  // ── Conteo de figuritas ──────────────────────────────────────────────────────
  teamStickerCount: 19,   // figuritas por equipo (1 escudo + 18 jugadores)
  totalStickers: 638,     // total sin contar sección promo
  promoCodePrefix: 'CC',  // prefijo de la sección promo, excluida del total

  // ── Navegación ───────────────────────────────────────────────────────────────
  lastSectionCode: 'COCA',  // al hacer "siguiente" desde aquí vuelve al inicio

  // ── Figuritas brillantes (foil) ───────────────────────────────────────────────
  brillanteStickerPrefix: 'FWC',  // prefijo de los brillantes especiales
  brillanteStickerCount: 29,      // FWC1 … FWC29

  // ── Secciones especiales (no son equipos competidores) ───────────────────────
  // Para secciones con lista explícita de figuritas, usar { count, stickers: [...] }
  // Para secciones generadas automáticamente, usar { count, codePrefix, codeStart, type, horizontal, getLabel }
  // Para secciones con nombres de jugadores, usar { ..., playerNamesKey: 'KEY' }
  specialSections: {
    FWCI: {
      count: 8,
      stickers: [
        { code: 'PANINI', label: 'PANINI',          repetidasLabel: 'PANINI', type: 'panini',  horizontal: false },
        { code: 'FWC1',   label: 'Logo FIFA',        repetidasLabel: 'FWC1',  type: 'fwc',     horizontal: false },
        { code: 'FWC2',   label: 'Copa del Mundo',   repetidasLabel: 'FWC2',  type: 'fwc',     horizontal: true  },
        { code: 'FWC3',   label: 'Copa del Mundo',   repetidasLabel: 'FWC3',  type: 'fwc',     horizontal: true  },
        { code: 'FWC4',   label: 'Mascota',          repetidasLabel: 'FWC4',  type: 'fwc',     horizontal: true  },
        { code: 'FWC5',   label: 'Mascota',          repetidasLabel: 'FWC5',  type: 'fwc',     horizontal: true  },
        { code: 'FWC6',   label: 'Logo Competición', repetidasLabel: 'FWC6',  type: 'fwc',     horizontal: true  },
        { code: 'FWC7',   label: 'Logo Competición', repetidasLabel: 'FWC7',  type: 'fwc',     horizontal: true  },
      ],
    },
    ESTADIOS: {
      count: 11,
      codePrefix: 'FWC',
      codeStart: 8,
      type: 'estadio',
      horizontal: true,
      getLabel: (i) => i <= 10 ? `Estadio ${i}` : 'Balón Oficial',
    },
    FWCH: {
      count: 11,
      codePrefix: 'FWC',
      codeStart: 19,
      type: 'museum',
      horizontal: false,
      getLabel: (i) => `Copa ${i}`,
    },
    COCA: {
      count: 8,
      codePrefix: 'CC',
      codeStart: 1,
      type: 'coca',
      horizontal: false,
      playerNamesKey: 'CC',  // clave en el objeto playerNames
    },
  },

  // ── Temas visuales de secciones especiales ────────────────────────────────────
  // themeKey: clave en teamThemes_*.js para el gradiente (null = sin gradiente)
  // solidBg:  clase Tailwind de fondo sólido (sobreescribe el gradiente si está definida)
  // innerPanel: clase Tailwind del panel interior (null = usa el default según darkMode)
  sectionThemes: {
    FWCI:     { themeKey: 'FWCI2022', solidBg: null,            innerPanel: 'bg-[#1a1a2e]' },
    ESTADIOS: { themeKey: 'FWCI2022', solidBg: 'bg-[#0d2167]',  innerPanel: 'bg-[#1a1a2e]' },
    FWCH:     { themeKey: 'FWCH2022', solidBg: 'bg-[#7c3d00]',  innerPanel: 'bg-[#2d1500]' },
    COCA:     { themeKey: null,       solidBg: 'bg-[#e41f1f]',  innerPanel: null            },
  },

  // ── Etiquetas en el buscador para secciones especiales ───────────────────────
  searchConfig: {
    FWCI:     { teamName: 'Intro FWC',   teamFlag: '⚽' },
    ESTADIOS: { teamName: 'Estadios',    teamFlag: '🏟️' },
    FWCH:     { teamName: 'FIFA Museum', teamFlag: '⭐' },
    COCA:     { teamName: 'Coca-Cola',   teamFlag: '🥤' },
  },

  // ── Configuración de estadísticas ────────────────────────────────────────────
  // { key, emoji, name, fixedCodes } — códigos explícitos
  // { key, emoji, name, codePrefix, codeStart, count } — códigos generados
  // { key: '__TEAMS__' } — marcador donde se insertan los equipos competidores
  statsConfig: [
    { key: 'PANINI',    emoji: '⚽', name: 'PANINI',     fixedCodes: ['PANINI'] },
    { key: 'FWC_INTRO', emoji: '⚽', name: 'FWC INTRO',  codePrefix: 'FWC', codeStart: 1,  count: 7  },
    { key: '__TEAMS__' },
    { key: 'ESTADIOS',  emoji: '🏟️', name: 'ESTADIOS',   codePrefix: 'FWC', codeStart: 8,  count: 11 },
    { key: 'FWCH',      emoji: '⭐', name: 'FIFA MUSEUM', codePrefix: 'FWC', codeStart: 19, count: 11 },
    { key: 'COCA',      emoji: '🥤', name: 'COCA-COLA',   codePrefix: 'CC',  codeStart: 1,  count: 8  },
  ],

  // ── Equipos competidores ──────────────────────────────────────────────────────
  competingTeams: [
    'QAT', 'ECU', 'SEN', 'NED',
    'ENG', 'IRN', 'USA', 'WAL',
    'ARG', 'KSA', 'MEX', 'POL',
    'FRA', 'AUS', 'DEN', 'TUN',
    'ESP', 'CRC', 'GER', 'JPN',
    'BEL', 'CAN', 'MAR', 'CRO',
    'BRA', 'SRB', 'SUI', 'CMR',
    'POR', 'GHA', 'URU', 'KOR',
  ],

  // ── Datos de todos los equipos (incluyendo secciones especiales) ─────────────
  teamData: {
    FWCI:     { name: 'Intro',       federation: 'Opening Section',                                    flag: '🏆' },
    ESTADIOS: { name: 'Estadios',    federation: 'Estadios Qatar 2022',                                flag: '🏟️' },
    FWCH:     { name: 'FIFA Museum', federation: 'World Champions',                                    flag: '⭐' },
    COCA:     { name: 'Coca-Cola',   federation: 'Promotional Collection',                             flag: '🥤' },

    QAT: { name: 'Catar',              federation: 'Qatar Football Association',                       flag: '🇶🇦' },
    ECU: { name: 'Ecuador',            federation: 'Federación Ecuatoriana de Fútbol',                flag: '🇪🇨' },
    SEN: { name: 'Senegal',            federation: 'Fédération Sénégalaise de Football',              flag: '🇸🇳' },
    NED: { name: 'Países Bajos',       federation: 'Koninklijke Nederlandse Voetbalbond',             flag: '🇳🇱' },
    ENG: { name: 'Inglaterra',         federation: 'The Football Association',                        flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
    IRN: { name: 'Irán',               federation: 'Football Federation Islamic Republic of Iran',    flag: '🇮🇷' },
    USA: { name: 'Estados Unidos',     federation: 'U.S. Soccer Federation',                         flag: '🇺🇸' },
    WAL: { name: 'Gales',              federation: 'Football Association of Wales',                   flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿' },
    ARG: { name: 'Argentina',          federation: 'Asociación del Fútbol Argentino',                flag: '🇦🇷' },
    KSA: { name: 'Arabia Saudita',     federation: 'Saudi Arabian Football Federation',              flag: '🇸🇦' },
    MEX: { name: 'México',             federation: 'Federación Mexicana de Fútbol',                  flag: '🇲🇽' },
    POL: { name: 'Polonia',            federation: 'Polski Związek Piłki Nożnej',                    flag: '🇵🇱' },
    FRA: { name: 'Francia',            federation: 'Fédération Française de Football',               flag: '🇫🇷' },
    AUS: { name: 'Australia',          federation: 'Football Australia',                              flag: '🇦🇺' },
    DEN: { name: 'Dinamarca',          federation: 'Dansk Boldspil-Union',                           flag: '🇩🇰' },
    TUN: { name: 'Túnez',              federation: 'Fédération Tunisienne de Football',              flag: '🇹🇳' },
    ESP: { name: 'España',             federation: 'Real Federación Española de Fútbol',             flag: '🇪🇸' },
    CRC: { name: 'Costa Rica',         federation: 'Federación Costarricense de Fútbol',             flag: '🇨🇷' },
    GER: { name: 'Alemania',           federation: 'Deutscher Fußball-Bund',                         flag: '🇩🇪' },
    JPN: { name: 'Japón',              federation: 'Japan Football Association',                      flag: '🇯🇵' },
    BEL: { name: 'Bélgica',            federation: 'Koninklijke Belgische Voetbalbond',              flag: '🇧🇪' },
    CAN: { name: 'Canadá',             federation: 'Canada Soccer Association',                       flag: '🇨🇦' },
    MAR: { name: 'Marruecos',          federation: 'Fédération Royale Marocaine de Football',        flag: '🇲🇦' },
    CRO: { name: 'Croacia',            federation: 'Hrvatski nogometni savez',                        flag: '🇭🇷' },
    BRA: { name: 'Brasil',             federation: 'Confederação Brasileira de Futebol',             flag: '🇧🇷' },
    SRB: { name: 'Serbia',             federation: 'Fudbalski savez Srbije',                         flag: '🇷🇸' },
    SUI: { name: 'Suiza',              federation: 'Schweizerischer Fussballverband',                flag: '🇨🇭' },
    CMR: { name: 'Camerún',            federation: 'Fédération Camerounaise de Football',            flag: '🇨🇲' },
    POR: { name: 'Portugal',           federation: 'Federação Portuguesa de Futebol',                flag: '🇵🇹' },
    GHA: { name: 'Ghana',              federation: 'Ghana Football Association',                      flag: '🇬🇭' },
    URU: { name: 'Uruguay',            federation: 'Asociación Uruguaya de Fútbol',                  flag: '🇺🇾' },
    KOR: { name: 'República de Corea', federation: 'Korea Football Association',                      flag: '🇰🇷' },
  },

  // ── Asignación de grupos por equipo ──────────────────────────────────────────
  teamGroups: {
    QAT: { group: 'A', members: ['Catar',      'Ecuador',       'Senegal',       'Países Bajos'   ] },
    ECU: { group: 'A', members: ['Catar',      'Ecuador',       'Senegal',       'Países Bajos'   ] },
    SEN: { group: 'A', members: ['Catar',      'Ecuador',       'Senegal',       'Países Bajos'   ] },
    NED: { group: 'A', members: ['Catar',      'Ecuador',       'Senegal',       'Países Bajos'   ] },
    ENG: { group: 'B', members: ['Inglaterra', 'Irán',          'Estados Unidos','Gales'          ] },
    IRN: { group: 'B', members: ['Inglaterra', 'Irán',          'Estados Unidos','Gales'          ] },
    USA: { group: 'B', members: ['Inglaterra', 'Irán',          'Estados Unidos','Gales'          ] },
    WAL: { group: 'B', members: ['Inglaterra', 'Irán',          'Estados Unidos','Gales'          ] },
    ARG: { group: 'C', members: ['Argentina',  'Arabia Saudita','México',        'Polonia'        ] },
    KSA: { group: 'C', members: ['Argentina',  'Arabia Saudita','México',        'Polonia'        ] },
    MEX: { group: 'C', members: ['Argentina',  'Arabia Saudita','México',        'Polonia'        ] },
    POL: { group: 'C', members: ['Argentina',  'Arabia Saudita','México',        'Polonia'        ] },
    FRA: { group: 'D', members: ['Francia',    'Australia',     'Dinamarca',     'Túnez'          ] },
    AUS: { group: 'D', members: ['Francia',    'Australia',     'Dinamarca',     'Túnez'          ] },
    DEN: { group: 'D', members: ['Francia',    'Australia',     'Dinamarca',     'Túnez'          ] },
    TUN: { group: 'D', members: ['Francia',    'Australia',     'Dinamarca',     'Túnez'          ] },
    ESP: { group: 'E', members: ['España',     'Costa Rica',    'Alemania',      'Japón'          ] },
    CRC: { group: 'E', members: ['España',     'Costa Rica',    'Alemania',      'Japón'          ] },
    GER: { group: 'E', members: ['España',     'Costa Rica',    'Alemania',      'Japón'          ] },
    JPN: { group: 'E', members: ['España',     'Costa Rica',    'Alemania',      'Japón'          ] },
    BEL: { group: 'F', members: ['Bélgica',    'Canadá',        'Marruecos',     'Croacia'        ] },
    CAN: { group: 'F', members: ['Bélgica',    'Canadá',        'Marruecos',     'Croacia'        ] },
    MAR: { group: 'F', members: ['Bélgica',    'Canadá',        'Marruecos',     'Croacia'        ] },
    CRO: { group: 'F', members: ['Bélgica',    'Canadá',        'Marruecos',     'Croacia'        ] },
    BRA: { group: 'G', members: ['Brasil',     'Serbia',        'Suiza',         'Camerún'        ] },
    SRB: { group: 'G', members: ['Brasil',     'Serbia',        'Suiza',         'Camerún'        ] },
    SUI: { group: 'G', members: ['Brasil',     'Serbia',        'Suiza',         'Camerún'        ] },
    CMR: { group: 'G', members: ['Brasil',     'Serbia',        'Suiza',         'Camerún'        ] },
    POR: { group: 'H', members: ['Portugal',   'Ghana',         'Uruguay',       'Rep. de Corea'  ] },
    GHA: { group: 'H', members: ['Portugal',   'Ghana',         'Uruguay',       'Rep. de Corea'  ] },
    URU: { group: 'H', members: ['Portugal',   'Ghana',         'Uruguay',       'Rep. de Corea'  ] },
    KOR: { group: 'H', members: ['Portugal',   'Ghana',         'Uruguay',       'Rep. de Corea'  ] },
  },

  // ── Grupos del torneo ────────────────────────────────────────────────────────
  groups: {
    A: { color: '#73BB6A', teams: ['QAT', 'ECU', 'SEN', 'NED'] },
    B: { color: '#E30613', teams: ['ENG', 'IRN', 'USA', 'WAL'] },
    C: { color: '#B8D94A', teams: ['ARG', 'KSA', 'MEX', 'POL'] },
    D: { color: '#0A4E97', teams: ['FRA', 'AUS', 'DEN', 'TUN'] },
    E: { color: '#E55C0B', teams: ['ESP', 'CRC', 'GER', 'JPN'] },
    F: { color: '#006B63', teams: ['BEL', 'CAN', 'MAR', 'CRO'] },
    G: { color: '#5B2E87', teams: ['BRA', 'SRB', 'SUI', 'CMR'] },
    H: { color: '#E4326C', teams: ['POR', 'GHA', 'URU', 'KOR'] },
  },

};

// Orden completo de navegación del álbum
albumConfig.teams = [
  'FWCI', 'ESTADIOS',
  ...albumConfig.competingTeams,
  'FWCH', 'COCA',
];
