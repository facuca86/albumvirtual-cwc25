// ─────────────────────────────────────────────────────────────────────────────
// Configuración del álbum — FIFA Club World Cup 2025
//
// NOTA SOBRE CÓDIGO ESP: En este archivo, ESP refiere a Espérance Sportive de
// Tunis (Túnez). En teamThemes_2022.js existe ESP como España (selección
// nacional). Al ser repositorios y archivos completamente separados, no hay
// colisión funcional, pero se documenta aquí para evitar confusiones.
// ─────────────────────────────────────────────────────────────────────────────

export const albumConfig = {

  // ── Identidad y almacenamiento ───────────────────────────────────────────────
  id: 'paniniCWC2025',
  owner: 'Facundo',
  title: 'ÁLBUM VIRTUAL CWC 2025',
  subtitle: 'FIFA CLUB WORLD CUP · USA',
  repetidasSubtitle: 'FIFA Club World Cup 2025 · USA',
  exportFileName: 'paniniCWC2025_backup.json',

  // ── Conteo de figuritas ──────────────────────────────────────────────────────
  teamStickerCount: 18,
  totalStickers: 550,    // 1 (PANINI) + 3 (INTRO) + 30×18 + 2×3 = 550
  promoCodePrefix: '__NOPROMO__',   // sin sección promo; nunca coincide con código real

  // ── Navegación ───────────────────────────────────────────────────────────────
  lastSectionCode: 'SAL',

  // ── Figuritas brillantes — posiciones dentro de cada club completo ────────────
  brillanteStickerPositions: [12, 15, 18],

  // ── Secciones especiales ─────────────────────────────────────────────────────
  specialSections: {
    PANINI_SECTION: {
      count: 1,
      stickers: [
        { code: '1', label: 'PANINI', repetidasLabel: 'PANINI', type: 'panini', horizontal: false },
      ],
    },
    INTRO: {
      count: 3,
      stickers: [
        { code: 'INTRO1', label: 'Logo',          repetidasLabel: 'INTRO1', type: 'intro', horizontal: false },
        { code: 'INTRO2', label: 'Trofeo',        repetidasLabel: 'INTRO2', type: 'intro', horizontal: false },
        { code: 'INTRO3', label: 'Balón Oficial', repetidasLabel: 'INTRO3', type: 'intro', horizontal: false },
      ],
    },
    MIA: {
      count: 3,
      stickers: [
        { code: 'MIA1', label: 'Jugador 1', repetidasLabel: 'MIA1', type: 'brillante', horizontal: false },
        { code: 'MIA2', label: 'Jugador 2', repetidasLabel: 'MIA2', type: 'brillante', horizontal: false },
        { code: 'MIA3', label: 'Jugador 3', repetidasLabel: 'MIA3', type: 'brillante', horizontal: false },
      ],
    },
    SEA: {
      count: 3,
      stickers: [
        { code: 'SEA1', label: 'Jugador 1', repetidasLabel: 'SEA1', type: 'brillante', horizontal: false },
        { code: 'SEA2', label: 'Jugador 2', repetidasLabel: 'SEA2', type: 'brillante', horizontal: false },
        { code: 'SEA3', label: 'Jugador 3', repetidasLabel: 'SEA3', type: 'brillante', horizontal: false },
      ],
    },
  },

  // ── Temas visuales de secciones especiales ────────────────────────────────────
  sectionThemes: {
    PANINI_SECTION: { themeKey: 'PANINI_SECTION', solidBg: null, innerPanel: 'bg-[#1a0f00]' },
    INTRO:          { themeKey: 'INTRO_CWC2025',  solidBg: null, innerPanel: 'bg-[#1a0f00]' },
  },

  // ── Etiquetas en el buscador para secciones especiales ───────────────────────
  searchConfig: {
    PANINI_SECTION: { teamName: 'PANINI',    teamFlag: '⭐' },
    INTRO:          { teamName: 'Intro CWC', teamFlag: '🏆' },
  },

  // ── Configuración de estadísticas ────────────────────────────────────────────
  statsConfig: [
    { key: 'PANINI_SECTION', emoji: '⭐', name: 'PANINI', fixedCodes: ['1'] },
    { key: 'INTRO',          emoji: '🏆', name: 'INTRO',  fixedCodes: ['INTRO1', 'INTRO2', 'INTRO3'] },
    { key: '__TEAMS__' },
  ],

  // ── Equipos competidores ──────────────────────────────────────────────────────
  competingTeams: [
    'PAL', 'POR', 'AHA', 'MIA',
    'PSG', 'ATM', 'BOT', 'SEA',
    'BAY', 'AUC', 'BOC', 'BEN',
    'FLA', 'ESP', 'CHE', 'LEO',
    'RIV', 'URW', 'MON', 'INT',
    'FLU', 'DOR', 'ULS', 'SUN',
    'MCI', 'WYD', 'AIN', 'JUV',
    'RMA', 'HIL', 'PAC', 'SAL',
  ],

  // ── Datos de todos los equipos ───────────────────────────────────────────────
  teamData: {
    PANINI_SECTION: { name: 'PANINI',              federation: 'Figurita Especial',                               flag: '⭐' },
    INTRO:          { name: 'Intro',               federation: 'FIFA Club World Cup 2025',                        flag: '🏆' },

    PAL: { name: 'Palmeiras',             federation: 'Sociedade Esportiva Palmeiras',                            flag: '🇧🇷' },
    POR: { name: 'Porto',                 federation: 'Futebol Clube do Porto',                                   flag: '🇵🇹' },
    AHA: { name: 'Al Ahly',              federation: 'Al Ahly Sporting Club',                                    flag: '🇪🇬' },
    MIA: { name: 'Inter Miami',           federation: 'Inter Miami CF',                                           flag: '🇺🇸' },
    PSG: { name: 'Paris Saint-Germain',  federation: 'Paris Saint-Germain FC',                                   flag: '🇫🇷' },
    ATM: { name: 'Atlético de Madrid',   federation: 'Club Atlético de Madrid',                                  flag: '🇪🇸' },
    BOT: { name: 'Botafogo',             federation: 'Botafogo de Futebol e Regatas',                             flag: '🇧🇷' },
    SEA: { name: 'Seattle Sounders',     federation: 'Seattle Sounders FC',                                      flag: '🇺🇸' },
    BAY: { name: 'Bayern Munich',        federation: 'FC Bayern München',                                        flag: '🇩🇪' },
    AUC: { name: 'Auckland City',        federation: 'Auckland City FC',                                         flag: '🇳🇿' },
    BOC: { name: 'Boca Juniors',         federation: 'Club Atlético Boca Juniors',                               flag: '🇦🇷' },
    BEN: { name: 'Benfica',              federation: 'Sport Lisboa e Benfica',                                   flag: '🇵🇹' },
    FLA: { name: 'Flamengo',             federation: 'Clube de Regatas do Flamengo',                             flag: '🇧🇷' },
    ESP: { name: 'Espérance de Tunis',   federation: 'Espérance Sportive de Tunis',                             flag: '🇹🇳' },
    CHE: { name: 'Chelsea',              federation: 'Chelsea Football Club',                                    flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
    LEO: { name: 'León',                 federation: 'Club León FC',                                             flag: '🇲🇽' },
    RIV: { name: 'River Plate',          federation: 'Club Atlético River Plate',                                flag: '🇦🇷' },
    URW: { name: 'Urawa Red Diamonds',   federation: 'Urawa Red Diamonds',                                       flag: '🇯🇵' },
    MON: { name: 'Monterrey',            federation: 'Club de Fútbol Monterrey',                                 flag: '🇲🇽' },
    INT: { name: 'Inter de Milán',       federation: 'Football Club Internazionale Milano',                       flag: '🇮🇹' },
    FLU: { name: 'Fluminense',           federation: 'Fluminense Football Club',                                 flag: '🇧🇷' },
    DOR: { name: 'Borussia Dortmund',    federation: 'Borussia Dortmund',                                        flag: '🇩🇪' },
    ULS: { name: 'Ulsan HD',             federation: 'Ulsan HD FC',                                              flag: '🇰🇷' },
    SUN: { name: 'Mamelodi Sundowns',    federation: 'Mamelodi Sundowns FC',                                     flag: '🇿🇦' },
    MCI: { name: 'Manchester City',      federation: 'Manchester City FC',                                       flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
    WYD: { name: 'Wydad Casablanca',     federation: 'Wydad Athletic Club',                                      flag: '🇲🇦' },
    AIN: { name: 'Al Ain',               federation: 'Al Ain FC',                                                flag: '🇦🇪' },
    JUV: { name: 'Juventus',             federation: 'Juventus Football Club',                                   flag: '🇮🇹' },
    RMA: { name: 'Real Madrid',          federation: 'Real Madrid CF',                                           flag: '🇪🇸' },
    HIL: { name: 'Al Hilal',             federation: 'Al-Hilal Saudi FC',                                        flag: '🇸🇦' },
    PAC: { name: 'Pachuca',              federation: 'Club de Fútbol Pachuca',                                   flag: '🇲🇽' },
    SAL: { name: 'FC Salzburg',          federation: 'FC Red Bull Salzburg',                                     flag: '🇦🇹' },
  },

  // ── Asignación de grupos ──────────────────────────────────────────────────────
  teamGroups: {
    PAL: { group: 'A', members: ['Palmeiras',           'Porto',              'Al Ahly',            'Inter Miami'         ] },
    POR: { group: 'A', members: ['Palmeiras',           'Porto',              'Al Ahly',            'Inter Miami'         ] },
    AHA: { group: 'A', members: ['Palmeiras',           'Porto',              'Al Ahly',            'Inter Miami'         ] },
    MIA: { group: 'A', members: ['Palmeiras',           'Porto',              'Al Ahly',            'Inter Miami'         ] },
    PSG: { group: 'B', members: ['Paris Saint-Germain', 'Atlético de Madrid', 'Botafogo',           'Seattle Sounders'    ] },
    ATM: { group: 'B', members: ['Paris Saint-Germain', 'Atlético de Madrid', 'Botafogo',           'Seattle Sounders'    ] },
    BOT: { group: 'B', members: ['Paris Saint-Germain', 'Atlético de Madrid', 'Botafogo',           'Seattle Sounders'    ] },
    SEA: { group: 'B', members: ['Paris Saint-Germain', 'Atlético de Madrid', 'Botafogo',           'Seattle Sounders'    ] },
    BAY: { group: 'C', members: ['Bayern Munich',       'Auckland City',      'Boca Juniors',       'Benfica'             ] },
    AUC: { group: 'C', members: ['Bayern Munich',       'Auckland City',      'Boca Juniors',       'Benfica'             ] },
    BOC: { group: 'C', members: ['Bayern Munich',       'Auckland City',      'Boca Juniors',       'Benfica'             ] },
    BEN: { group: 'C', members: ['Bayern Munich',       'Auckland City',      'Boca Juniors',       'Benfica'             ] },
    FLA: { group: 'D', members: ['Flamengo',            'Espérance de Tunis', 'Chelsea',            'León'                ] },
    ESP: { group: 'D', members: ['Flamengo',            'Espérance de Tunis', 'Chelsea',            'León'                ] },
    CHE: { group: 'D', members: ['Flamengo',            'Espérance de Tunis', 'Chelsea',            'León'                ] },
    LEO: { group: 'D', members: ['Flamengo',            'Espérance de Tunis', 'Chelsea',            'León'                ] },
    RIV: { group: 'E', members: ['River Plate',         'Urawa Red Diamonds', 'Monterrey',          'Inter de Milán'      ] },
    URW: { group: 'E', members: ['River Plate',         'Urawa Red Diamonds', 'Monterrey',          'Inter de Milán'      ] },
    MON: { group: 'E', members: ['River Plate',         'Urawa Red Diamonds', 'Monterrey',          'Inter de Milán'      ] },
    INT: { group: 'E', members: ['River Plate',         'Urawa Red Diamonds', 'Monterrey',          'Inter de Milán'      ] },
    FLU: { group: 'F', members: ['Fluminense',          'Borussia Dortmund',  'Ulsan HD',           'Mamelodi Sundowns'   ] },
    DOR: { group: 'F', members: ['Fluminense',          'Borussia Dortmund',  'Ulsan HD',           'Mamelodi Sundowns'   ] },
    ULS: { group: 'F', members: ['Fluminense',          'Borussia Dortmund',  'Ulsan HD',           'Mamelodi Sundowns'   ] },
    SUN: { group: 'F', members: ['Fluminense',          'Borussia Dortmund',  'Ulsan HD',           'Mamelodi Sundowns'   ] },
    MCI: { group: 'G', members: ['Manchester City',     'Wydad Casablanca',   'Al Ain',             'Juventus'            ] },
    WYD: { group: 'G', members: ['Manchester City',     'Wydad Casablanca',   'Al Ain',             'Juventus'            ] },
    AIN: { group: 'G', members: ['Manchester City',     'Wydad Casablanca',   'Al Ain',             'Juventus'            ] },
    JUV: { group: 'G', members: ['Manchester City',     'Wydad Casablanca',   'Al Ain',             'Juventus'            ] },
    RMA: { group: 'H', members: ['Real Madrid',         'Al Hilal',           'Pachuca',            'FC Salzburg'         ] },
    HIL: { group: 'H', members: ['Real Madrid',         'Al Hilal',           'Pachuca',            'FC Salzburg'         ] },
    PAC: { group: 'H', members: ['Real Madrid',         'Al Hilal',           'Pachuca',            'FC Salzburg'         ] },
    SAL: { group: 'H', members: ['Real Madrid',         'Al Hilal',           'Pachuca',            'FC Salzburg'         ] },
  },

  // ── Grupos del torneo ────────────────────────────────────────────────────────
  groups: {
    A: { color: '#15803d', teams: ['PAL', 'POR', 'AHA', 'MIA'] },
    B: { color: '#1d4ed8', teams: ['PSG', 'ATM', 'BOT', 'SEA'] },
    C: { color: '#dc2626', teams: ['BAY', 'AUC', 'BOC', 'BEN'] },
    D: { color: '#b45309', teams: ['FLA', 'ESP', 'CHE', 'LEO'] },
    E: { color: '#7c3aed', teams: ['RIV', 'URW', 'MON', 'INT'] },
    F: { color: '#0891b2', teams: ['FLU', 'DOR', 'ULS', 'SUN'] },
    G: { color: '#0369a1', teams: ['MCI', 'WYD', 'AIN', 'JUV'] },
    H: { color: '#b91c1c', teams: ['RMA', 'HIL', 'PAC', 'SAL'] },
  },

};

// Orden completo de navegación del álbum
albumConfig.teams = [
  'PANINI_SECTION',
  'INTRO',
  ...albumConfig.competingTeams,
];

// ── Diccionarios bidireccionales de numeración visible ──────────────────────
// codeToNumber: código interno → número visible en el álbum (1–550)
// numberToCode: número visible → código interno
// Reglas: PANINI('1')=1, INTRO1=2, INTRO2=3, INTRO3=4, luego equipos en orden

function _getTeamCodesLocal(team) {
  const section = albumConfig.specialSections[team];
  if (section) {
    if (section.stickers) return section.stickers.map(s => s.code);
    return Array.from({ length: section.count }, (_, i) => `${section.codePrefix}${section.codeStart + i}`);
  }
  return Array.from({ length: albumConfig.teamStickerCount }, (_, i) => `${team}${i + 1}`);
}

export const codeToNumber = {};
export const numberToCode = {};

let _counter = 1;
for (const team of albumConfig.teams) {
  for (const code of _getTeamCodesLocal(team)) {
    codeToNumber[code] = _counter;
    numberToCode[_counter] = code;
    _counter++;
  }
}
// Verificación: _counter debe ser 551 al terminar (1..550 asignados)
