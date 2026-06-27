export const NORMS = {
  mobility:      { standard: 5,    good: 7,    elite: 8,    pro: 10,   higher: true,  label: 'Mobility Screen',    unit: ''     },
  broad_jump:    { standard: 190,  good: 210,  elite: 230,  pro: 250,  higher: true,  label: 'Broad Jump',         unit: ' cm'  },
  deadlift_1rm:  { standard: 120,  good: 150,  elite: 180,  pro: 200,  higher: true,  label: 'Hexbar Deadlift 1RM', unit: ' kg'  },
  bench_1rm:     { standard: 70,   good: 90,   elite: 110,  pro: 130,  higher: true,  label: 'Bench Press 1RM',    unit: ' kg'  },
  illinois:      { standard: 17.0, good: 16.0, elite: 15.0, pro: 14.5, higher: false, label: 'Illinois Agility',   unit: ' sec' },
  pullup_max:    { standard: 8,    good: 12,   elite: 16,   pro: 20,   higher: true,  label: 'Max Strict Pull-ups', unit: ' reps' },
  bp_bw_reps:    { standard: 10,   good: 15,   elite: 18,   pro: 20,   higher: true,  label: 'Bench @ Lichaamsgewicht', unit: ' reps' },
  dead_hang_sec: { standard: 30,   good: 60,   elite: 90,   pro: 120,  higher: true,  label: 'Dead Hang',          unit: ' sec' },
  plank_sec:     { standard: 60,   good: 120,  elite: 180,  pro: 300,  higher: true,  label: 'Plank Hold',         unit: ' sec' },
  sprint_400m:   { standard: 75,   good: 65,   elite: 58,   pro: 52,   higher: false, label: '400m Sprint',        unit: ' sec' },
  loop_1500m:    { standard: 360,  good: 330,  elite: 300,  pro: 270,  higher: false, label: '1500m Run',          unit: ' sec' },
  farmers_carry: { standard: 50,   good: 100,  elite: 200,  pro: 400,  higher: true,  label: "Farmer's Carry",     unit: ' m'   },
}

export function getLevel(key, value) {
  if (!value && value !== 0) return null
  const n = NORMS[key]
  if (!n) return null
  const v = parseFloat(value)
  if (n.higher) {
    if (v >= n.pro) return 'PRO'
    if (v >= n.elite) return 'ELITE'
    if (v >= n.good) return 'GOOD'
    if (v >= n.standard) return 'STANDARD'
    return 'BELOW'
  } else {
    if (v <= n.pro) return 'PRO'
    if (v <= n.elite) return 'ELITE'
    if (v <= n.good) return 'GOOD'
    if (v <= n.standard) return 'STANDARD'
    return 'BELOW'
  }
}

export const LEVEL_COLORS = { PRO: '#a855f7', ELITE: '#f87171', GOOD: '#fb923c', STANDARD: '#4ade80', BELOW: '#6b7280' }
export const LEVEL_LABELS = { PRO: 'PRO', ELITE: 'ELITE', GOOD: 'GOOD', STANDARD: 'STANDARD', BELOW: 'BELOW' }

export function LevelBadge({ level }) {
  if (!level) return null
  return (
    <span style={{ background: LEVEL_COLORS[level] + '22', color: LEVEL_COLORS[level], border: `1px solid ${LEVEL_COLORS[level]}44`, fontFamily: 'var(--font-barlow), sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: 2, padding: '3px 10px', textTransform: 'uppercase' }}>
      {LEVEL_LABELS[level]}
    </span>
  )
}

// Mapping van test_results-kolomnamen naar NORMS-keys, voor de klant-facing weergave.
export const TEST_RESULT_NORM_FIELDS = [
  { field: 'mobility_score',    normKey: 'mobility'      },
  { field: 'broad_jump_cm',     normKey: 'broad_jump'     },
  { field: 'deadlift_1rm',      normKey: 'deadlift_1rm'   },
  { field: 'bench_1rm',         normKey: 'bench_1rm'      },
  { field: 'illinois_sec',      normKey: 'illinois'       },
  { field: 'pullup_max',        normKey: 'pullup_max'     },
  { field: 'bp_bw_reps',        normKey: 'bp_bw_reps'     },
  { field: 'dead_hang_sec',     normKey: 'dead_hang_sec'  },
  { field: 'plank_sec',         normKey: 'plank_sec'      },
  { field: 'sprint_400m_sec',   normKey: 'sprint_400m'    },
  { field: 'loop_1500m_sec',    normKey: 'loop_1500m'     },
  { field: 'farmers_carry_m',   normKey: 'farmers_carry'  },
]
