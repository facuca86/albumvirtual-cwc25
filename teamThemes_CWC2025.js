// Paleta general CWC2025: negro y dorado como dominante.
// Los gradientes respetan colores institucionales de cada club.
// Clubs con colores muy claros reciben toque dorado o negro para coherencia.

export const teamThemes = {

  // ── GRUPO A ──────────────────────────────────────────────────────────────────
  PAL: { gradient: 'from-green-800 via-white to-green-700' },                            // Palmeiras: verde y blanco
  POR: { gradient: 'from-blue-900 via-white to-yellow-500' },                            // Porto: azul y blanco con dorado
  AHA: { gradient: 'from-red-700 via-red-400 to-slate-900',   dark: true },             // Al Ahly: rojo y negro
  MIA: { gradient: 'from-pink-600 via-slate-900 to-pink-700', dark: true },             // Inter Miami: rosa y negro

  // ── GRUPO B ──────────────────────────────────────────────────────────────────
  PSG: { gradient: 'from-blue-900 via-red-600 to-blue-800',   dark: true },             // PSG: azul marino y rojo
  ATM: { gradient: 'from-red-600 via-white to-red-700' },                                // Atlético Madrid: rojo y blanco
  BOT: { gradient: 'from-slate-900 via-white to-slate-800',   dark: true },             // Botafogo: negro y blanco
  SEA: { gradient: 'from-green-600 via-sky-200 to-blue-700' },                           // Seattle Sounders: verde y azul

  // ── GRUPO C ──────────────────────────────────────────────────────────────────
  BAY: { gradient: 'from-red-700 via-white to-red-600' },                                // Bayern Munich: rojo y blanco
  AUC: { gradient: 'from-yellow-400 via-slate-900 to-yellow-500', dark: true },         // Auckland City: amarillo y negro
  BOC: { gradient: 'from-blue-900 via-yellow-400 to-blue-800',    dark: true },         // Boca Juniors: azul y amarillo
  BEN: { gradient: 'from-red-600 via-white to-red-700' },                                // Benfica: rojo y blanco

  // ── GRUPO D ──────────────────────────────────────────────────────────────────
  FLA: { gradient: 'from-red-700 via-slate-900 to-red-600',   dark: true },             // Flamengo: rojo y negro
  ESP: { gradient: 'from-red-600 via-yellow-400 to-red-700' },                           // Espérance de Tunis: rojo y amarillo
  CHE: { gradient: 'from-blue-700 via-blue-500 to-blue-800',  dark: true },             // Chelsea: azul
  LEO: { gradient: 'from-green-700 via-white to-green-600' },                            // León: verde y blanco

  // ── GRUPO E ──────────────────────────────────────────────────────────────────
  RIV: { gradient: 'from-white via-red-500 to-white' },                                  // River Plate: blanco y rojo
  URW: { gradient: 'from-red-700 via-red-400 to-red-600' },                              // Urawa Red Diamonds: rojo
  MON: { gradient: 'from-blue-700 via-white to-blue-800' },                              // Monterrey: azul y blanco
  INT: { gradient: 'from-slate-900 via-blue-600 to-slate-800', dark: true },            // Inter Milán: negro y azul

  // ── GRUPO F ──────────────────────────────────────────────────────────────────
  FLU: { gradient: 'from-rose-900 via-green-600 to-white' },                             // Fluminense: granate, verde y blanco
  DOR: { gradient: 'from-yellow-400 via-slate-900 to-yellow-500', dark: true },         // Borussia Dortmund: amarillo y negro
  ULS: { gradient: 'from-blue-700 via-white to-blue-600' },                              // Ulsan HD: azul y blanco
  SUN: { gradient: 'from-yellow-400 via-green-600 to-yellow-500' },                     // Mamelodi Sundowns: amarillo y verde

  // ── GRUPO G ──────────────────────────────────────────────────────────────────
  MCI: { gradient: 'from-sky-400 via-white to-sky-500' },                                // Manchester City: celeste
  WYD: { gradient: 'from-red-600 via-white to-red-700' },                                // Wydad Casablanca: rojo y blanco
  AIN: { gradient: 'from-rose-900 via-yellow-400 to-rose-800' },                         // Al Ain: granate y dorado
  JUV: { gradient: 'from-slate-900 via-white to-slate-800',   dark: true },             // Juventus: negro y blanco

  // ── GRUPO H ──────────────────────────────────────────────────────────────────
  RMA: { gradient: 'from-white via-yellow-400 to-yellow-600' },                          // Real Madrid: blanco y dorado
  HIL: { gradient: 'from-blue-700 via-white to-blue-800' },                              // Al Hilal: azul y blanco
  PAC: { gradient: 'from-blue-800 via-white to-blue-700' },                              // Pachuca: azul marino y blanco
  SAL: { gradient: 'from-red-600 via-white to-red-700' },                                // FC Salzburg: rojo y blanco

  // ── Secciones especiales — paleta negro y dorado ─────────────────────────────
  PANINI_SECTION: { gradient: 'from-yellow-600 via-yellow-400 to-yellow-700', dark: true },
  INTRO_CWC2025:  { gradient: 'from-slate-900 via-yellow-500 to-slate-800',   dark: true },
};
