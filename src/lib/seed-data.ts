export const SEED_TEAMS = [
  // Grupo A
  { name:'Mexico',name_es:'México',code:'MEX',flag_emoji:'mx',group_name:'A',confederation:'CONCACAF' },
  { name:'South Africa',name_es:'Sudáfrica',code:'RSA',flag_emoji:'za',group_name:'A',confederation:'CAF' },
  { name:'South Korea',name_es:'Corea del Sur',code:'KOR',flag_emoji:'kr',group_name:'A',confederation:'AFC' },
  { name:'Czech Republic',name_es:'Rep. Checa',code:'CZE',flag_emoji:'cz',group_name:'A',confederation:'UEFA' },
  // Grupo B
  { name:'Canada',name_es:'Canadá',code:'CAN',flag_emoji:'ca',group_name:'B',confederation:'CONCACAF' },
  { name:'Bosnia and Herz.',name_es:'Bosnia y Herz.',code:'BIH',flag_emoji:'ba',group_name:'B',confederation:'UEFA' },
  { name:'Qatar',name_es:'Qatar',code:'QAT',flag_emoji:'qa',group_name:'B',confederation:'AFC' },
  { name:'Switzerland',name_es:'Suiza',code:'SUI',flag_emoji:'ch',group_name:'B',confederation:'UEFA' },
  // Grupo C
  { name:'Brazil',name_es:'Brasil',code:'BRA',flag_emoji:'br',group_name:'C',confederation:'CONMEBOL' },
  { name:'Morocco',name_es:'Marruecos',code:'MAR',flag_emoji:'ma',group_name:'C',confederation:'CAF' },
  { name:'Haiti',name_es:'Haití',code:'HAI',flag_emoji:'ht',group_name:'C',confederation:'CONCACAF' },
  { name:'Scotland',name_es:'Escocia',code:'SCO',flag_emoji:'gb-sct',group_name:'C',confederation:'UEFA' },
  // Grupo D
  { name:'United States',name_es:'Estados Unidos',code:'USA',flag_emoji:'us',group_name:'D',confederation:'CONCACAF' },
  { name:'Paraguay',name_es:'Paraguay',code:'PAR',flag_emoji:'py',group_name:'D',confederation:'CONMEBOL' },
  { name:'Australia',name_es:'Australia',code:'AUS',flag_emoji:'au',group_name:'D',confederation:'AFC' },
  { name:'Turkey',name_es:'Turquía',code:'TUR',flag_emoji:'tr',group_name:'D',confederation:'UEFA' },
  // Grupo E
  { name:'Germany',name_es:'Alemania',code:'GER',flag_emoji:'de',group_name:'E',confederation:'UEFA' },
  { name:'Curacao',name_es:'Curazao',code:'CUW',flag_emoji:'cw',group_name:'E',confederation:'CONCACAF' },
  { name:'Ivory Coast',name_es:'Costa de Marfil',code:'CIV',flag_emoji:'ci',group_name:'E',confederation:'CAF' },
  { name:'Ecuador',name_es:'Ecuador',code:'ECU',flag_emoji:'ec',group_name:'E',confederation:'CONMEBOL' },
  // Grupo F
  { name:'Netherlands',name_es:'Países Bajos',code:'NED',flag_emoji:'nl',group_name:'F',confederation:'UEFA' },
  { name:'Japan',name_es:'Japón',code:'JPN',flag_emoji:'jp',group_name:'F',confederation:'AFC' },
  { name:'Sweden',name_es:'Suecia',code:'SWE',flag_emoji:'se',group_name:'F',confederation:'UEFA' },
  { name:'Tunisia',name_es:'Túnez',code:'TUN',flag_emoji:'tn',group_name:'F',confederation:'CAF' },
  // Grupo G
  { name:'Belgium',name_es:'Bélgica',code:'BEL',flag_emoji:'be',group_name:'G',confederation:'UEFA' },
  { name:'Egypt',name_es:'Egipto',code:'EGY',flag_emoji:'eg',group_name:'G',confederation:'CAF' },
  { name:'Iran',name_es:'Irán',code:'IRN',flag_emoji:'ir',group_name:'G',confederation:'AFC' },
  { name:'New Zealand',name_es:'Nueva Zelanda',code:'NZL',flag_emoji:'nz',group_name:'G',confederation:'OFC' },
  // Grupo H
  { name:'Spain',name_es:'España',code:'ESP',flag_emoji:'es',group_name:'H',confederation:'UEFA' },
  { name:'Cape Verde',name_es:'Cabo Verde',code:'CPV',flag_emoji:'cv',group_name:'H',confederation:'CAF' },
  { name:'Saudi Arabia',name_es:'Arabia Saudita',code:'KSA',flag_emoji:'sa',group_name:'H',confederation:'AFC' },
  { name:'Uruguay',name_es:'Uruguay',code:'URU',flag_emoji:'uy',group_name:'H',confederation:'CONMEBOL' },
  // Grupo I
  { name:'France',name_es:'Francia',code:'FRA',flag_emoji:'fr',group_name:'I',confederation:'UEFA' },
  { name:'Senegal',name_es:'Senegal',code:'SEN',flag_emoji:'sn',group_name:'I',confederation:'CAF' },
  { name:'Iraq',name_es:'Irak',code:'IRQ',flag_emoji:'iq',group_name:'I',confederation:'AFC' },
  { name:'Norway',name_es:'Noruega',code:'NOR',flag_emoji:'no',group_name:'I',confederation:'UEFA' },
  // Grupo J
  { name:'Argentina',name_es:'Argentina',code:'ARG',flag_emoji:'ar',group_name:'J',confederation:'CONMEBOL' },
  { name:'Algeria',name_es:'Argelia',code:'ALG',flag_emoji:'dz',group_name:'J',confederation:'CAF' },
  { name:'Austria',name_es:'Austria',code:'AUT',flag_emoji:'at',group_name:'J',confederation:'UEFA' },
  { name:'Jordan',name_es:'Jordania',code:'JOR',flag_emoji:'jo',group_name:'J',confederation:'AFC' },
  // Grupo K
  { name:'Portugal',name_es:'Portugal',code:'POR',flag_emoji:'pt',group_name:'K',confederation:'UEFA' },
  { name:'DR Congo',name_es:'RD Congo',code:'COD',flag_emoji:'cd',group_name:'K',confederation:'CAF' },
  { name:'Uzbekistan',name_es:'Uzbekistán',code:'UZB',flag_emoji:'uz',group_name:'K',confederation:'AFC' },
  { name:'Colombia',name_es:'Colombia',code:'COL',flag_emoji:'co',group_name:'K',confederation:'CONMEBOL' },
  // Grupo L
  { name:'England',name_es:'Inglaterra',code:'ENG',flag_emoji:'gb-eng',group_name:'L',confederation:'UEFA' },
  { name:'Croatia',name_es:'Croacia',code:'CRO',flag_emoji:'hr',group_name:'L',confederation:'UEFA' },
  { name:'Ghana',name_es:'Ghana',code:'GHA',flag_emoji:'gh',group_name:'L',confederation:'CAF' },
  { name:'Panama',name_es:'Panamá',code:'PAN',flag_emoji:'pa',group_name:'L',confederation:'CONCACAF' },
] as const

export const GROUPS_FIXTURE: Record<string, Array<{ home: string; away: string; date: string; time: string; venue: string; city: string }>> = {
  A: [
    { home:'MEX',away:'RSA',date:'2026-06-11',time:'13:00',venue:'Estadio Azteca',city:'Mexico City' },
    { home:'KOR',away:'CZE',date:'2026-06-11',time:'20:00',venue:'Estadio Akron',city:'Zapopan' },
    { home:'CZE',away:'RSA',date:'2026-06-18',time:'12:00',venue:'Mercedes-Benz Stadium',city:'Atlanta' },
    { home:'MEX',away:'KOR',date:'2026-06-18',time:'19:00',venue:'Estadio Akron',city:'Zapopan' },
    { home:'CZE',away:'MEX',date:'2026-06-24',time:'19:00',venue:'Estadio Azteca',city:'Mexico City' },
    { home:'RSA',away:'KOR',date:'2026-06-24',time:'19:00',venue:'Estadio BBVA',city:'Guadalupe' },
  ],
  B: [
    { home:'CAN',away:'BIH',date:'2026-06-12',time:'15:00',venue:'BMO Field',city:'Toronto' },
    { home:'QAT',away:'SUI',date:'2026-06-13',time:'12:00',venue:"Levi's Stadium",city:'Santa Clara' },
    { home:'SUI',away:'BIH',date:'2026-06-18',time:'12:00',venue:'SoFi Stadium',city:'Inglewood' },
    { home:'CAN',away:'QAT',date:'2026-06-18',time:'15:00',venue:'BC Place',city:'Vancouver' },
    { home:'SUI',away:'CAN',date:'2026-06-24',time:'12:00',venue:'BC Place',city:'Vancouver' },
    { home:'BIH',away:'QAT',date:'2026-06-24',time:'12:00',venue:'Lumen Field',city:'Seattle' },
  ],
  C: [
    { home:'BRA',away:'MAR',date:'2026-06-13',time:'18:00',venue:'MetLife Stadium',city:'East Rutherford' },
    { home:'HAI',away:'SCO',date:'2026-06-13',time:'21:00',venue:'Gillette Stadium',city:'Foxborough' },
    { home:'SCO',away:'MAR',date:'2026-06-19',time:'18:00',venue:'Gillette Stadium',city:'Foxborough' },
    { home:'BRA',away:'HAI',date:'2026-06-19',time:'20:30',venue:'Lincoln Financial Field',city:'Philadelphia' },
    { home:'SCO',away:'BRA',date:'2026-06-24',time:'18:00',venue:'Hard Rock Stadium',city:'Miami Gardens' },
    { home:'MAR',away:'HAI',date:'2026-06-24',time:'18:00',venue:'Mercedes-Benz Stadium',city:'Atlanta' },
  ],
  D: [
    { home:'USA',away:'PAR',date:'2026-06-12',time:'18:00',venue:'SoFi Stadium',city:'Inglewood' },
    { home:'AUS',away:'TUR',date:'2026-06-13',time:'21:00',venue:'BC Place',city:'Vancouver' },
    { home:'USA',away:'AUS',date:'2026-06-19',time:'12:00',venue:'Lumen Field',city:'Seattle' },
    { home:'TUR',away:'PAR',date:'2026-06-19',time:'20:00',venue:"Levi's Stadium",city:'Santa Clara' },
    { home:'TUR',away:'USA',date:'2026-06-25',time:'19:00',venue:'SoFi Stadium',city:'Inglewood' },
    { home:'PAR',away:'AUS',date:'2026-06-25',time:'19:00',venue:"Levi's Stadium",city:'Santa Clara' },
  ],
  E: [
    { home:'GER',away:'CUW',date:'2026-06-14',time:'12:00',venue:'NRG Stadium',city:'Houston' },
    { home:'CIV',away:'ECU',date:'2026-06-14',time:'19:00',venue:'Lincoln Financial Field',city:'Philadelphia' },
    { home:'GER',away:'CIV',date:'2026-06-20',time:'16:00',venue:'BMO Field',city:'Toronto' },
    { home:'ECU',away:'CUW',date:'2026-06-20',time:'19:00',venue:'Arrowhead Stadium',city:'Kansas City' },
    { home:'CUW',away:'CIV',date:'2026-06-25',time:'16:00',venue:'Lincoln Financial Field',city:'Philadelphia' },
    { home:'ECU',away:'GER',date:'2026-06-25',time:'16:00',venue:'MetLife Stadium',city:'East Rutherford' },
  ],
  F: [
    { home:'NED',away:'JPN',date:'2026-06-14',time:'15:00',venue:'AT&T Stadium',city:'Arlington' },
    { home:'SWE',away:'TUN',date:'2026-06-14',time:'20:00',venue:'Estadio BBVA',city:'Guadalupe' },
    { home:'NED',away:'SWE',date:'2026-06-20',time:'12:00',venue:'NRG Stadium',city:'Houston' },
    { home:'TUN',away:'JPN',date:'2026-06-20',time:'22:00',venue:'Estadio BBVA',city:'Guadalupe' },
    { home:'JPN',away:'SWE',date:'2026-06-25',time:'18:00',venue:'AT&T Stadium',city:'Arlington' },
    { home:'TUN',away:'NED',date:'2026-06-25',time:'18:00',venue:'Arrowhead Stadium',city:'Kansas City' },
  ],
  G: [
    { home:'BEL',away:'EGY',date:'2026-06-15',time:'12:00',venue:'Lumen Field',city:'Seattle' },
    { home:'IRN',away:'NZL',date:'2026-06-15',time:'18:00',venue:'SoFi Stadium',city:'Inglewood' },
    { home:'BEL',away:'IRN',date:'2026-06-21',time:'12:00',venue:'SoFi Stadium',city:'Inglewood' },
    { home:'NZL',away:'EGY',date:'2026-06-21',time:'18:00',venue:'BC Place',city:'Vancouver' },
    { home:'EGY',away:'IRN',date:'2026-06-26',time:'20:00',venue:'Lumen Field',city:'Seattle' },
    { home:'NZL',away:'BEL',date:'2026-06-26',time:'20:00',venue:'BC Place',city:'Vancouver' },
  ],
  H: [
    { home:'ESP',away:'CPV',date:'2026-06-15',time:'12:00',venue:'Mercedes-Benz Stadium',city:'Atlanta' },
    { home:'KSA',away:'URU',date:'2026-06-15',time:'18:00',venue:'Hard Rock Stadium',city:'Miami Gardens' },
    { home:'ESP',away:'KSA',date:'2026-06-21',time:'12:00',venue:'Mercedes-Benz Stadium',city:'Atlanta' },
    { home:'URU',away:'CPV',date:'2026-06-21',time:'18:00',venue:'Hard Rock Stadium',city:'Miami Gardens' },
    { home:'CPV',away:'KSA',date:'2026-06-26',time:'19:00',venue:'NRG Stadium',city:'Houston' },
    { home:'URU',away:'ESP',date:'2026-06-26',time:'18:00',venue:'Estadio Akron',city:'Zapopan' },
  ],
  I: [
    { home:'FRA',away:'SEN',date:'2026-06-16',time:'15:00',venue:'MetLife Stadium',city:'East Rutherford' },
    { home:'IRQ',away:'NOR',date:'2026-06-16',time:'18:00',venue:'Gillette Stadium',city:'Foxborough' },
    { home:'FRA',away:'IRQ',date:'2026-06-22',time:'17:00',venue:'Lincoln Financial Field',city:'Philadelphia' },
    { home:'NOR',away:'SEN',date:'2026-06-22',time:'20:00',venue:'MetLife Stadium',city:'East Rutherford' },
    { home:'NOR',away:'FRA',date:'2026-06-26',time:'15:00',venue:'Gillette Stadium',city:'Foxborough' },
    { home:'SEN',away:'IRQ',date:'2026-06-26',time:'15:00',venue:'BMO Field',city:'Toronto' },
  ],
  J: [
    { home:'ARG',away:'ALG',date:'2026-06-16',time:'20:00',venue:'Arrowhead Stadium',city:'Kansas City' },
    { home:'AUT',away:'JOR',date:'2026-06-16',time:'21:00',venue:"Levi's Stadium",city:'Santa Clara' },
    { home:'ARG',away:'AUT',date:'2026-06-22',time:'12:00',venue:'AT&T Stadium',city:'Arlington' },
    { home:'JOR',away:'ALG',date:'2026-06-22',time:'20:00',venue:"Levi's Stadium",city:'Santa Clara' },
    { home:'ALG',away:'AUT',date:'2026-06-27',time:'21:00',venue:'Arrowhead Stadium',city:'Kansas City' },
    { home:'JOR',away:'ARG',date:'2026-06-27',time:'21:00',venue:'AT&T Stadium',city:'Arlington' },
  ],
  K: [
    { home:'POR',away:'COD',date:'2026-06-17',time:'12:00',venue:'NRG Stadium',city:'Houston' },
    { home:'UZB',away:'COL',date:'2026-06-17',time:'20:00',venue:'Estadio Azteca',city:'Mexico City' },
    { home:'POR',away:'UZB',date:'2026-06-23',time:'12:00',venue:'NRG Stadium',city:'Houston' },
    { home:'COL',away:'COD',date:'2026-06-23',time:'20:00',venue:'Estadio Akron',city:'Zapopan' },
    { home:'COL',away:'POR',date:'2026-06-27',time:'19:30',venue:'Hard Rock Stadium',city:'Miami Gardens' },
    { home:'COD',away:'UZB',date:'2026-06-27',time:'19:30',venue:'Mercedes-Benz Stadium',city:'Atlanta' },
  ],
  L: [
    { home:'ENG',away:'CRO',date:'2026-06-17',time:'15:00',venue:'AT&T Stadium',city:'Arlington' },
    { home:'GHA',away:'PAN',date:'2026-06-17',time:'19:00',venue:'BMO Field',city:'Toronto' },
    { home:'ENG',away:'GHA',date:'2026-06-23',time:'16:00',venue:'Gillette Stadium',city:'Foxborough' },
    { home:'PAN',away:'CRO',date:'2026-06-23',time:'19:00',venue:'BMO Field',city:'Toronto' },
    { home:'PAN',away:'ENG',date:'2026-06-27',time:'17:00',venue:'MetLife Stadium',city:'East Rutherford' },
    { home:'CRO',away:'GHA',date:'2026-06-27',time:'17:00',venue:'Lincoln Financial Field',city:'Philadelphia' },
  ],
}

export function generateGroupMatches(_teams: typeof SEED_TEAMS = SEED_TEAMS) {
  const teamCodes = new Set<string>(_teams.map((team) => team.code))
  const matches: Array<{
    match_number: number
    stage: 'group'
    group_name: string
    home_team_code: string
    away_team_code: string
    match_date: string
    venue: string
    city: string
  }> = []

  let matchNumber = 1

  for (const [group, fixtures] of Object.entries(GROUPS_FIXTURE)) {
    for (const fixture of fixtures) {
      if (!teamCodes.has(fixture.home) || !teamCodes.has(fixture.away)) continue

      let tz = '-04:00'
      if (
        fixture.city.includes('Vancouver') ||
        fixture.city.includes('Seattle') ||
        fixture.city.includes('Santa Clara') ||
        fixture.city.includes('Inglewood') ||
        fixture.city.includes('San')
      ) {
        tz = '-07:00'
      } else if (
        fixture.city.includes('Mexico') ||
        fixture.city.includes('Zapopan') ||
        fixture.city.includes('Guadalupe') ||
        fixture.city.includes('Kansas') ||
        fixture.city.includes('Arlington') ||
        fixture.city.includes('Houston')
      ) {
        tz = '-05:00'
      }

      matches.push({
        match_number: matchNumber++,
        stage: 'group',
        group_name: group,
        home_team_code: fixture.home,
        away_team_code: fixture.away,
        match_date: `${fixture.date}T${fixture.time}:00${tz}`,
        venue: fixture.venue,
        city: fixture.city,
      })
    }
  }

  return matches
}
