import type { Match, Team } from '@/types'

export interface GroupStanding {
  team: Team
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
}

export function buildGroupStandings(teams: Team[], matches: Match[]) {
  const standings = new Map<string, GroupStanding>()

  teams.forEach((team) => {
    standings.set(team.id, {
      team,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
    })
  })

  matches
    .filter((match) => {
      return (
        match.stage === 'group' &&
        match.status === 'finished' &&
        match.home_team_id &&
        match.away_team_id &&
        match.home_score !== null &&
        match.away_score !== null
      )
    })
    .forEach((match) => {
      const home = standings.get(match.home_team_id!)
      const away = standings.get(match.away_team_id!)
      if (!home || !away) return

      const homeScore = match.home_score ?? 0
      const awayScore = match.away_score ?? 0

      home.played += 1
      away.played += 1
      home.goalsFor += homeScore
      home.goalsAgainst += awayScore
      away.goalsFor += awayScore
      away.goalsAgainst += homeScore

      if (homeScore > awayScore) {
        home.won += 1
        home.points += 3
        away.lost += 1
      } else if (awayScore > homeScore) {
        away.won += 1
        away.points += 3
        home.lost += 1
      } else {
        home.drawn += 1
        away.drawn += 1
        home.points += 1
        away.points += 1
      }

      home.goalDifference = home.goalsFor - home.goalsAgainst
      away.goalDifference = away.goalsFor - away.goalsAgainst
    })

  return Array.from(standings.values()).sort((a, b) => {
    return (
      b.points - a.points ||
      b.goalDifference - a.goalDifference ||
      b.goalsFor - a.goalsFor ||
      a.team.name_es.localeCompare(b.team.name_es, 'es')
    )
  })
}
