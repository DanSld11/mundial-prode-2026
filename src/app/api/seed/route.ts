import { NextResponse } from 'next/server'

const TEAMS = [
  { name:'Argentina',name_es:'Argentina',code:'ARG',flag_emoji:'🇦🇷',group_name:'A',confederation:'CONMEBOL' },
  { name:'Serbia',name_es:'Serbia',code:'SRB',flag_emoji:'🇷🇸',group_name:'A',confederation:'UEFA' },
  { name:'Cameroon',name_es:'Camerún',code:'CMR',flag_emoji:'🇨🇲',group_name:'A',confederation:'CAF' },
  { name:'New Zealand',name_es:'Nueva Zelanda',code:'NZL',flag_emoji:'🇳🇿',group_name:'A',confederation:'OFC' },
  { name:'Brazil',name_es:'Brasil',code:'BRA',flag_emoji:'🇧🇷',group_name:'B',confederation:'CONMEBOL' },
  { name:'Austria',name_es:'Austria',code:'AUT',flag_emoji:'🇦🇹',group_name:'B',confederation:'UEFA' },
  { name:'Nigeria',name_es:'Nigeria',code:'NGA',flag_emoji:'🇳🇬',group_name:'B',confederation:'CAF' },
  { name:'Uzbekistan',name_es:'Uzbekistán',code:'UZB',flag_emoji:'🇺🇿',group_name:'B',confederation:'AFC' },
  { name:'Uruguay',name_es:'Uruguay',code:'URU',flag_emoji:'🇺🇾',group_name:'C',confederation:'CONMEBOL' },
  { name:'Denmark',name_es:'Dinamarca',code:'DEN',flag_emoji:'🇩🇰',group_name:'C',confederation:'UEFA' },
  { name:'Morocco',name_es:'Marruecos',code:'MAR',flag_emoji:'🇲🇦',group_name:'C',confederation:'CAF' },
  { name:'Costa Rica',name_es:'Costa Rica',code:'CRC',flag_emoji:'🇨🇷',group_name:'C',confederation:'CONCACAF' },
  { name:'Colombia',name_es:'Colombia',code:'COL',flag_emoji:'🇨🇴',group_name:'D',confederation:'CONMEBOL' },
  { name:'Croatia',name_es:'Croacia',code:'CRO',flag_emoji:'🇭🇷',group_name:'D',confederation:'UEFA' },
  { name:'Egypt',name_es:'Egipto',code:'EGY',flag_emoji:'🇪🇬',group_name:'D',confederation:'CAF' },
  { name:'Canada',name_es:'Canadá',code:'CAN',flag_emoji:'🇨🇦',group_name:'D',confederation:'CONCACAF' },
  { name:'Ecuador',name_es:'Ecuador',code:'ECU',flag_emoji:'🇪🇨',group_name:'E',confederation:'CONMEBOL' },
  { name:'Switzerland',name_es:'Suiza',code:'SUI',flag_emoji:'🇨🇭',group_name:'E',confederation:'UEFA' },
  { name:'Senegal',name_es:'Senegal',code:'SEN',flag_emoji:'🇸🇳',group_name:'E',confederation:'CAF' },
  { name:'Jamaica',name_es:'Jamaica',code:'JAM',flag_emoji:'🇯🇲',group_name:'E',confederation:'CONCACAF' },
  { name:'Paraguay',name_es:'Paraguay',code:'PAR',flag_emoji:'🇵🇾',group_name:'F',confederation:'CONMEBOL' },
  { name:'Poland',name_es:'Polonia',code:'POL',flag_emoji:'🇵🇱',group_name:'F',confederation:'UEFA' },
  { name:'Tunisia',name_es:'Túnez',code:'TUN',flag_emoji:'🇹🇳',group_name:'F',confederation:'CAF' },
  { name:'Honduras',name_es:'Honduras',code:'HON',flag_emoji:'🇭🇳',group_name:'F',confederation:'CONCACAF' },
  { name:'Chile',name_es:'Chile',code:'CHI',flag_emoji:'🇨🇱',group_name:'G',confederation:'CONMEBOL' },
  { name:'Wales',name_es:'Gales',code:'WAL',flag_emoji:'🏴󠁧󠁢󠁷󠁬󠁳󠁿',group_name:'G',confederation:'UEFA' },
  { name:'Ivory Coast',name_es:'Costa de Marfil',code:'CIV',flag_emoji:'🇨🇮',group_name:'G',confederation:'CAF' },
  { name:'Trinidad and Tobago',name_es:'Trinidad y Tobago',code:'TRI',flag_emoji:'🇹🇹',group_name:'G',confederation:'CONCACAF' },
  { name:'United States',name_es:'Estados Unidos',code:'USA',flag_emoji:'🇺🇸',group_name:'H',confederation:'CONCACAF' },
  { name:'Turkey',name_es:'Turquía',code:'TUR',flag_emoji:'🇹🇷',group_name:'H',confederation:'UEFA' },
  { name:'Ghana',name_es:'Ghana',code:'GHA',flag_emoji:'🇬🇭',group_name:'H',confederation:'CAF' },
  { name:'Panama',name_es:'Panamá',code:'PAN',flag_emoji:'🇵🇦',group_name:'H',confederation:'CONCACAF' },
  { name:'Mexico',name_es:'México',code:'MEX',flag_emoji:'🇲🇽',group_name:'I',confederation:'CONCACAF' },
  { name:'Belgium',name_es:'Bélgica',code:'BEL',flag_emoji:'🇧🇪',group_name:'I',confederation:'UEFA' },
  { name:'Algeria',name_es:'Argelia',code:'ALG',flag_emoji:'🇩🇿',group_name:'I',confederation:'CAF' },
  { name:'Saudi Arabia',name_es:'Arabia Saudita',code:'KSA',flag_emoji:'🇸🇦',group_name:'I',confederation:'AFC' },
  { name:'Spain',name_es:'España',code:'ESP',flag_emoji:'🇪🇸',group_name:'J',confederation:'UEFA' },
  { name:'Netherlands',name_es:'Holanda',code:'NED',flag_emoji:'🇳🇱',group_name:'J',confederation:'UEFA' },
  { name:'Japan',name_es:'Japón',code:'JPN',flag_emoji:'🇯🇵',group_name:'J',confederation:'AFC' },
  { name:'Qatar',name_es:'Qatar',code:'QAT',flag_emoji:'🇶🇦',group_name:'J',confederation:'AFC' },
  { name:'France',name_es:'Francia',code:'FRA',flag_emoji:'🇫🇷',group_name:'K',confederation:'UEFA' },
  { name:'England',name_es:'Inglaterra',code:'ENG',flag_emoji:'🏴󠁧󠁢󠁥󠁮󠁧󠁿',group_name:'K',confederation:'UEFA' },
  { name:'South Korea',name_es:'Corea del Sur',code:'KOR',flag_emoji:'🇰🇷',group_name:'K',confederation:'AFC' },
  { name:'Australia',name_es:'Australia',code:'AUS',flag_emoji:'🇦🇺',group_name:'K',confederation:'AFC' },
  { name:'Germany',name_es:'Alemania',code:'GER',flag_emoji:'🇩🇪',group_name:'L',confederation:'UEFA' },
  { name:'Italy',name_es:'Italia',code:'ITA',flag_emoji:'🇮🇹',group_name:'L',confederation:'UEFA' },
  { name:'Portugal',name_es:'Portugal',code:'POR',flag_emoji:'🇵🇹',group_name:'L',confederation:'UEFA' },
  { name:'Iran',name_es:'Irán',code:'IRN',flag_emoji:'🇮🇷',group_name:'L',confederation:'AFC' },
]

export async function GET(request: Request) {
  const action = new URL(request.url).searchParams.get('action')
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!baseUrl || !serviceKey) {
    return NextResponse.json({ error: 'Missing env vars' }, { status: 500 })
  }

  const headers = {
    'Authorization': `Bearer ${serviceKey}`,
    'apikey': serviceKey,
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal',
  }

  try {
    if (action === 'teams') {
      // Insertar equipos uno por uno (más confiable)
      let count = 0
      let errors: string[] = []
      for (const t of TEAMS) {
        const res = await fetch(`${baseUrl}/rest/v1/teams`, {
          method: 'POST',
          headers,
          body: JSON.stringify(t),
        })
        if (!res.ok) {
          const err = await res.text()
          errors.push(`${t.code}: ${res.status} ${err}`)
        } else {
          count++
        }
      }
      return NextResponse.json({ success: count === 48, count, errors: errors.length > 0 ? errors.slice(0, 5) : undefined })
    }

    if (action === 'matches') {
      // Obtener equipos existentes
      const res = await fetch(`${baseUrl}/rest/v1/teams?select=id,code`, { headers })
      const teams = await res.json()
      
      if (!Array.isArray(teams) || teams.length === 0) {
        return NextResponse.json({ error: 'No hay equipos' }, { status: 400 })
      }

      const teamMap = new Map(teams.map((t: any) => [t.code, t.id]))
      const venues = [
        {venue:'AT&T Stadium',city:'Arlington, TX'},{venue:'SoFi Stadium',city:'Inglewood, CA'},
        {venue:'MetLife Stadium',city:'East Rutherford, NJ'},{venue:'Hard Rock Stadium',city:'Miami, FL'},
        {venue:'Mercedes-Benz Stadium',city:'Atlanta, GA'},{venue:'NRG Stadium',city:'Houston, TX'},
        {venue:"Levi's Stadium",city:'Santa Clara, CA'},{venue:'Lumen Field',city:'Seattle, WA'},
        {venue:'Gillette Stadium',city:'Foxborough, MA'},{venue:'Soldier Field',city:'Chicago, IL'},
        {venue:'Azteca Stadium',city:'Mexico City, MX'},{venue:'Akron Stadium',city:'Guadalajara, MX'},
        {venue:'BMO Field',city:'Toronto, CA'},{venue:'BC Place',city:'Vancouver, CA'},
      ]
      const groups = ['A','B','C','D','E','F','G','H','I','J','K','L']
      const baseDate = new Date('2026-06-11T13:00:00-04:00')
      const matches: any[] = []
      let n = 1
      groups.forEach((group, gi) => {
        const gt = TEAMS.filter(t => t.group_name === group)
        const [t1,t2,t3,t4] = gt
        const pairs = [[t1,t2],[t3,t4],[t1,t3],[t2,t4],[t1,t4],[t2,t3]]
        pairs.forEach(([h,a], idx) => {
          const d = new Date(baseDate.getTime() + Math.floor((gi*6+idx)/4)*86400000 + (idx%4)*3*3600000)
          const v = venues[(n-1)%venues.length]
          matches.push({match_number:n++,stage:'group',group_name:group,home_team_id:teamMap.get(h.code),away_team_id:teamMap.get(a.code),match_date:d.toISOString(),venue:v.venue,city:v.city})
        })
      })
      
      let count = 0
      let errors: string[] = []
      for (const m of matches) {
        const res = await fetch(`${baseUrl}/rest/v1/matches`, {
          method: 'POST',
          headers,
          body: JSON.stringify(m),
        })
        if (!res.ok) {
          const err = await res.text()
          errors.push(`#${m.match_number}: ${res.status} ${err}`)
        } else {
          count++
        }
      }
      return NextResponse.json({ success: count === 72, count, errors: errors.length > 0 ? errors.slice(0, 5) : undefined })
    }

    return NextResponse.json({ error: 'Use action=teams or action=matches' }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
