'use client'

import { useState, useEffect } from "react"
import { todayStr } from '@/lib/date-utils'

const C = {
  bg:"#0A0A0A", bg2:"#141414", bd:"#222222",
  tx:"#F0EEE8", wh:"#F0EEE8", mt:"#888888",
  gr:"#3dffa0", ye:"#ffe066", or:"#ff9a3c", re:"#ff5e6b",
  pu:"#a78bfa", cy:"#38e8e8", tl:"#2dd4bf",
}
const DTYPE = {
  strength:        { bg:"rgba(61,255,160,.07)",  bd:"#3dffa0" },
  "strength+bjj":  { bg:"rgba(61,255,160,.07)",  bd:"#3dffa0" },
  "power+lsd+bjj": { bg:"rgba(255,154,60,.07)",  bd:"#ff9a3c" },
  bjj:             { bg:"rgba(167,139,250,.07)", bd:"#a78bfa" },
  vo2:             { bg:"rgba(255,154,60,.07)",  bd:"#ff9a3c" },
  optional:        { bg:"rgba(45,212,191,.07)",  bd:"#2dd4bf" },
  rest:            { bg:"rgba(74,99,128,.07)",   bd:"#888888" },
  test:            { bg:"rgba(255,224,102,.07)", bd:"#ffe066" },
}
const M  = (x={}) => ({ fontFamily:'var(--font-barlow), sans-serif', ...x })
const SY = (x={}) => ({ fontFamily:'var(--font-oswald), Impact, sans-serif', ...x })
const pill = (c, x={}) => ({ background:c+"18", border:`1px solid ${c}44`, color:c, padding:"2px 8px", borderRadius:4, fontSize:9, fontWeight:700, ...M(), ...x })

const r25    = v => Math.round(v / 2.5) * 2.5
const calc1RM= (w, r) => { w=parseFloat(w); r=parseFloat(r); if(!w||!r||isNaN(w)||isNaN(r)) return null; return r===1?w:Math.round(w*(1+r/30)); }
const toSec  = (mn, sc) => { const m=parseFloat(mn)||0, s=parseFloat(sc)||0; return (m||s)?m*60+s:null; }
const fmtSec = s => { const m=Math.floor(s/60), sc=Math.round(s%60); return `${m}:${sc<10?"0":""}${sc}`; }

const DS = { bodyWeight:80.5, maxHR:190, age:30, hrvBaseline:92, rhrBaseline:43, weightTarget:79.5 }
const DD = { hrv:"", weight:"", rhr:"" }
const DC = {
  dlWeight:"", dlReps:"", bpWeight:"", bpReps:"",
  runMin:"", runSec:"", run400:"", pullups:"", bwbench:"",
  broadjump:"", illinois:"", farmerscarry:"",
  dhMin:"", dhSec:"", plankMin:"", plankSec:"",
  mob:{ squat:null, shoulder:null, hip9090:null, thorax:null, hamstring:null },
}

const PHASES = [
  { id:0, lb:"TEST", dates:"1 week · Testweek",      color:"#ffe066", bg:"rgba(255,224,102,.07)", title:"Testweek" },
  { id:1, lb:"F1",   dates:"4 weken · Hypertrofie", color:"#4ade80", bg:"rgba(74,222,128,.07)",  title:"Hypertrofie & Basis" },
  { id:2, lb:"F2",   dates:"4 weken · Kracht", color:"#facc15", bg:"rgba(250,204,21,.07)",  title:"Maximale Kracht" },
  { id:3, lb:"F3",   dates:"4 weken · Power",  color:"#fb923c", bg:"rgba(251,146,60,.07)",  title:"Power & Explosiviteit" },
  { id:4, lb:"F4",   dates:"4 weken · Sport-Specific",   color:"#818cf8", bg:"rgba(129,140,248,.07)", title:"Sport-Specific Peak" },
  { id:5, lb:"F5",   dates:"4 weken · Onderhoud",     color:"#f87171", bg:"rgba(248,113,113,.07)", title:"Onderhoud" },
]

const MOB = [
  { id:"squat",     name:"Overhead Deep Squat",    cue:"Armen gestrekt omhoog, squat tot 90°. Geen hielstijging." },
  { id:"shoulder",  name:"Schouder Reach (Apley)", cue:"Hand over schouder omlaag + andere hand omhoog. Meet gap." },
  { id:"hip9090",   name:"Hip 90/90",              cue:"Zit op grond, beide benen 90°. Rechtop zonder handen." },
  { id:"thorax",    name:"Thoracale Rotatie",      cue:"Zit, armen gekruist op borst. Roteer links/rechts ≥ 45°." },
  { id:"hamstring", name:"Straight Leg Raise",     cue:"Lig op rug. Hef gestrekt been omhoog, doel ≥ 70°." },
]

const TESTS = [
  { id:"mob",         s:1, icon:"🔍", name:"Mobility Screen",      cat:"Bewegingskwaliteit",    type:"mob",
    lvl:{ std:5, good:7, elite:8, pro:10 }, lo:false, color:C.tl },
  { id:"broadjump",   s:1, icon:"🦘", name:"Broad Jump",           cat:"Explosieve Power",      type:"num", unit:"m",   step:0.01,
    lvl:{ std:1.9, good:2.1, elite:2.3, pro:2.5 }, lo:false, color:C.or },
  { id:"illinois",    s:1, icon:"🔄", name:"Illinois Agility",     cat:"Agility",               type:"num", unit:"sec", step:0.1,
    lvl:{ std:17, good:16, elite:15, pro:14.5 }, lo:true, color:C.cy },
  { id:"dl1rm",       s:1, icon:"🏋️", name:"Hexbar DL 1-5RM",     cat:"Max Kracht Lower",      type:"amf", unit:"kg",
    lvl:{ std:120, good:150, elite:180, pro:200 }, lo:false, color:C.gr, wf:"dlWeight", rf:"dlReps" },
  { id:"bp1rm",       s:1, icon:"🏋️", name:"Bench Press 1-5RM",   cat:"Max Kracht Upper",      type:"amf", unit:"kg",
    lvl:{ std:70, good:90, elite:110, pro:130 }, lo:false, color:C.ye, wf:"bpWeight", rf:"bpReps" },
  { id:"pullups",     s:2, icon:"💪", name:"Max Pull-ups",         cat:"Trekkracht Endurance",  type:"num", unit:"reps",
    lvl:{ std:8, good:12, elite:16, pro:20 }, lo:false, color:C.pu },
  { id:"bwbench",     s:2, icon:"💪", name:"BP @ Lichaamsgewicht", cat:"Kracht-Endurance Push", type:"num", unit:"reps",
    lvl:{ std:10, good:15, elite:18, pro:20 }, lo:false, color:C.gr },
  { id:"deadhang",    s:2, icon:"✊", name:"Dead Hang Hold",       cat:"Grip Endurance — BJJ",  type:"time",
    lvl:{ std:30, good:60, elite:90, pro:120 }, lo:false, color:C.cy, mf:"dhMin", sf:"dhSec" },
  { id:"plank",       s:2, icon:"🧱", name:"Plank Hold",           cat:"Core Endurance",        type:"time",
    lvl:{ std:60, good:120, elite:180, pro:300 }, lo:false, color:C.tl, mf:"plankMin", sf:"plankSec" },
  { id:"run400",      s:2, icon:"🏃", name:"400m Sprint",          cat:"Anaeroob Glycolytisch", type:"num", unit:"sec",
    lvl:{ std:75, good:65, elite:58, pro:52 }, lo:true, color:C.re },
  { id:"run1500",     s:2, icon:"🫁", name:"1500m Loop",           cat:"Aeroob / MAS",          type:"run1500",
    lvl:{ std:360, good:330, elite:300, pro:270 }, lo:true, color:C.or, mf:"runMin", sf:"runSec" },
  { id:"farmerscarry",s:2, icon:"🪣", name:"Farmer's Carry",       cat:"Load Carriage",         type:"num", unit:"m",
    lvl:{ std:50, good:100, elite:200, pro:400 }, lo:false, color:C.tl },
]
const LK = ["std","good","elite","pro"]
const LL = ["STD","GOOD","ELITE","PRO"]
const LC = [C.mt, C.gr, C.ye, C.or]

function getLvl(t, raw) {
  if (raw === null || raw === undefined || raw === "") return null
  const v = parseFloat(raw); if (isNaN(v)) return null
  const { lvl, lo } = t
  if (lo) { if(v<=lvl.pro)return 3; if(v<=lvl.elite)return 2; if(v<=lvl.good)return 1; if(v<=lvl.std)return 0; return -1 }
  if(v>=lvl.pro)return 3; if(v>=lvl.elite)return 2; if(v>=lvl.good)return 1; if(v>=lvl.std)return 0; return -1
}

function calcStatus(d, st) {
  const h = d.hrv ? (parseFloat(d.hrv)>=st.hrvBaseline*.95?"green":parseFloat(d.hrv)>=st.hrvBaseline*.85?"yellow":"red") : null
  const w = d.weight ? (parseFloat(d.weight)<=st.weightTarget?"green":parseFloat(d.weight)<=st.weightTarget+1?"yellow":"red") : null
  const r = d.rhr ? (parseFloat(d.rhr)<=st.rhrBaseline+3?"green":parseFloat(d.rhr)<=st.rhrBaseline+6?"yellow":"red") : null
  const all = [h,w,r].filter(Boolean)
  return { h, w, r, overall: all.includes("red")?"red":all.includes("yellow")?"yellow":all.length?"green":null }
}
const SI = {
  green:  { icon:"🟢", label:"Volledig trainen", desc:"Alle sessies op volledige intensiteit. Maximale belasting.", c:C.gr },
  yellow: { icon:"🟡", label:"Licht aanpassen",  desc:"Volume 20% omlaag. 1 set minder per oefening.", c:C.ye },
  red:    { icon:"🔴", label:"Hersteldag",        desc:"Alleen mobiliteit of lichte BJJ drilling.", c:C.re },
}

function buildWeek(ph, dlORM, bpORM, MAS, st) {
  const bwH=Math.round((parseFloat(st.bodyWeight)||80.5)/2)
  const lsdHR=Math.round((parseFloat(st.maxHR)||190)*.70)
  const intHR=Math.round((parseFloat(st.maxHR)||190)*.90)
  const iDist=MAS?Math.round(240*MAS*.90):null
  const W=p=>dlORM?`${r25(dlORM*p)} kg`:`${Math.round(p*100)}%*`
  const B=p=>bpORM?`${r25(bpORM*p)} kg`:`${Math.round(p*100)}%*`
  const masLvl=MAS?(MAS<=2.84?"Beginner":MAS<=3.89?"Gemiddeld":MAS<=4.96?"Gevorderd":"Elite"):null
  const WU_L=["5 min roeien @ lage intensiteit","Hip circles 10×, leg swings 10×","McGill Big 3: bird dog 3×8, curl-up 3×8, side plank 3×20 sec"]
  const WU_U=["5 min roeier of bike","Schouder rotaties 15×, band pull-aparts 15×","Push-up variaties 10×"]
  const CD_L=["Piriformis stretch 3×60 sec","90/90 heup mobiliteit 3×60 sec","Cat-cow lumbaal 2×10"]
  const CD_U=["Schouder/pec stretch 3×60 sec","Lat stretch aan pull-up stang 2×45 sec"]
  const MA={
    1:[`Hexbar DL: 4×10 @ ${W(.65)}`,`Romanian DL: 3×12 @ ${W(.60)}`,"Split squat: 3×12/been","Hip thrust: 3×15","Dead bug: 3×10"],
    2:[`Hexbar DL: 4×5 @ ${W(.82)}`,`Romanian DL: 3×5 @ ${W(.76)}`,"Split squat: 4×6/been",`Farmer's Walk: 3×30m @ ${bwH}kg/hand`],
    3:[`Hexbar DL EXPLOSIEF: 4×3 @ ${W(.87)}`,`Jump squat: 4×4 @ ${dlORM?r25(dlORM*.30)+"kg":"30%*"}`,"Box jump: 3×5",`Farmer sprint: 3×20m @ ${bwH}kg`],
    4:[`Hexbar DL: 3×3 @ ${W(.90)}`,"KB swing zwaar: 4×10",`Farmer carry: 4×30m @ ${bwH}kg/hand`],
    5:[`Hexbar DL: 2×4 @ ${W(.82)}`,"Hip thrust: 2×8"],
  }
  const WO={
    1:[`Bench Press: 4×10 @ ${B(.65)}`,`Barbell Row: 4×10 @ ${B(.65)}`,"Pull-ups: 4×8",`DB Shoulder Press: 3×12 @ ${B(.55)}`,`Farmer's Walk: 3×25m @ ${bwH}kg`],
    2:[`Bench Press: 5×5 @ ${B(.82)}`,`Barbell Row: 5×5 @ ${B(.82)}`,`Weighted Pull-up: 4×4 (+${bpORM?r25(bpORM*.10):"10%*"}kg)`,`OHP: 4×5 @ ${B(.65)}`,`Farmer's Walk: 4×30m @ ${bwH}kg`],
    3:[`Bench Press EXPLOSIEF: 4×3 @ ${B(.87)}`,`Barbell Row: 4×4 @ ${B(.83)}`,`Weighted Pull-up: 4×3 (+${bpORM?r25(bpORM*.12):"12%*"}kg)`,`OHP: 3×4 @ ${B(.72)}`],
    4:[`Bench Press: 4×4 @ ${B(.82)}`,`Barbell Row: 4×4 @ ${B(.80)}`,`Weighted Pull-up: 4×3 (+${bpORM?r25(bpORM*.15):"15%*"}kg)`],
    5:[`Bench Press: 2×4 @ ${B(.82)}`,`Barbell Row: 2×4 @ ${B(.80)}`,"Pull-ups: 2×max"],
  }
  const VR={
    1:[`Push press: 3×10 @ ${B(.60)}`,"KB swing: 3×15","TRX row: 3×12","MB rotational slam: 3×10/kant"],
    2:[`Hexbar DL: 3×4 @ ${W(.83)}`,`Push press: 4×4 @ ${B(.72)}`,"KB swing: 4×8","TRX row: 3×10"],
    3:[`Circuit A: DL ${W(.88)}×2 / KB swing×10 / box jump×3 — 3 ronden`,`Circuit B: Push press ${B(.72)}×3 / MB slam×6 / pull-up max — 3 ronden`],
    4:[`DL ${W(.90)}×2 / KB×10 / jump×3 — 3 ronden`,`Push press ${B(.72)}×3 / slam×6 / row max — 3 ronden`],
    5:[`DL: 2×3 @ ${W(.82)}`,`Push press: 2×5 @ ${B(.65)}`],
  }
  const DO_IT=ph===1
    ?[`Wk 1–2: 25 min LSD roeien @ ${lsdHR} bpm`,`Wk 3–4: 3×4 min @ ${intHR} bpm, rust 3 min passief`]
    :[`4×4 min @ ${intHR} bpm (90% max HR)`,iDist?`Roeier: ${iDist}m per interval`:"Vul 1500m in voor exacte afstand","Rust: 3 min volledig passief",masLvl?`MAS niveau: ${masLvl}`:""].filter(Boolean)

  if (ph===0) return [
    {day:"MA",lb:"Dag 1",type:"test",title:"🔬 TEST — Sessie 1 + 2",time:"07:00–09:30 · 13:00–15:15",ss:[
      {n:"SESSIE 1 — Mobility + Power + Kracht",it:["🔍 Mobility Screen — 5 checks 🔴/🟡/🟢","🦘 Broad Jump — 3 pogingen, hiel tot lijn","🔄 Illinois Agility — start prone, 2 pogingen","🏋️ AMF Hexbar DL: 60kg×6 → 90kg×3 → 120kg max (1-5 reps = geldig ✓)","🏋️ AMF Bench Press: 45kg×6 → 65kg×3 → 85kg max | spotter verplicht"]},
      {n:"SESSIE 2 — Endurance + Conditie",it:["💪 Max Strict Pull-ups (pronated, dood hang, kin boven stang)",`💪 BP @ lichaamsgewicht max reps — 10 min rust na pull-ups`,"✊ Dead Hang Hold — volledig uitgehangen tot grip verlies","🧱 Plank Hold — neutrale rug, stop bij eerste vormbreuk","🏃 400m Sprint EERST — verse benen! 15 min rust daarna","🫁 1500m Loop — max effort, kalibreert alle interval paces",`🪣 Farmer's Carry — ${bwH}kg/hand, max afstand, 10 min rust`]},
    ]},
    {day:"DI",lb:"Dag 2",type:"bjj",title:"🥋 BJJ — Licht herstel",time:"06:30 of 12:00",ss:[{n:"BJJ",it:["Rustige drilling — geen zwaar sparren"]}]},
    {day:"WO",lb:"Dag 3",type:"rest",title:"🧘 Optioneel Mobiliteit",time:"Flex",ss:[{n:"Optioneel",it:["Mobiliteitswerk op basis van 🔴 scores"]}]},
    {day:"DO",lb:"Dag 4",type:"rest",title:"😴 Rust",time:"—",ss:[{n:"Rust",it:["Volledig herstel"]}]},
    {day:"VR",lb:"Dag 5",type:"rest",title:"🚶 Licht activering",time:"Flex",ss:[{n:"Optioneel",it:["Wandelen 30 min of lichte mobiliteit"]}]},
    {day:"ZA",lb:"Dag 6",type:"rest",title:"😴 Rust",time:"—",ss:[{n:"Rust",it:["Scores bekijken en analyseren"]}]},
    {day:"ZO",lb:"Dag 7",type:"bjj",title:"🥋 BJJ",time:"GI of No-Gi",ss:[{n:"BJJ",it:["Eerste sessie na testweek"]}]},
  ]
  return [
    {day:"MA",lb:"Dag 1",type:"strength",title:"💪 Kracht — Lower Body",time:"07:00–08:30 (werk)",ss:[{n:"Warm-up (15 min)",it:WU_L},{n:`Hoofdtraining (${ph<=2?55:45} min)`,it:MA[ph]||[]},{n:"Cool-down (10 min)",it:CD_L}]},
    {day:"DI",lb:"Dag 2",type:"bjj",title:"🥋 BJJ",time:"06:30 No-Gi of 12:00 GI",ss:[{n:"BJJ Training",it:["06:30 No-Gi of 12:00 GI — keuze op de dag","Thuisdag — family time = herstel","HRV 🔴 = alleen drilling","Geen extra training"]}]},
    {day:"WO",lb:"Dag 3",type:"strength+bjj",title:"💪 Kracht Upper + 🥋 BJJ 19:00",time:"07:00 werk + 19:00 BJJ",ss:[{n:"Warm-up (12 min)",it:WU_U},{n:`Kracht Upper (${ph<=2?55:45} min)`,it:WO[ph]||[]},{n:"Cool-down (8 min)",it:CD_U},{n:"🥋 BJJ 19:00 GI",it:["Technisch + sparren","HRV 🔴 = techniek only"]}]},
    {day:"DO",lb:"Dag 4",type:"vo2",title:"🫁 Noorse 4×4 Intervals",time:"07:00–08:00 (werk)",ss:[{n:"Mobiliteit warm-up (15 min)",it:["Foam roller 5 min","90/90 heupen, thoracale rotatie","Dynamisch stretchen"]},{n:`${ph===1?"Conditie Opbouw":"Noorse 4×4 min"} (30–35 min)`,it:DO_IT},{n:"Cool-down (10 min)",it:["Schouder stretch 3×45 sec","Bewuste ademhaling 5 min"]}]},
    {day:"VR",lb:"Dag 5",type:"power+lsd+bjj",title:"⚡ Power + 🚴 LSD + 🥋 BJJ 19:00",time:"07:00 + 12:00 + 19:00",ss:[{n:"⚡ POWER (07:00–07:45)",it:[...WU_L.slice(0,2),...(VR[ph]||[])]},{n:"🚴 LSD BIKE (12:00–12:45)",it:[`Stationaire bike of roeier @ ${lsdHR} bpm (70% max HR)`,MAS?`Tempo: ~${(MAS*.70*3.6).toFixed(1)} km/h`:"70% max HR — rustig en gecontroleerd","Cadans: 80–90 RPM"]},{n:"🥋 BJJ 19:00 GI",it:["Zwaar sparren","HRV 🔴 = techniek only"]}]},
    {day:"ZA",lb:"Dag 6",type:"optional",title:"🎯 Andere sport / Rust",time:"Keuze",ss:[{n:"Kies op HRV",it:["🧗 Klimmen","🏊 Zwemmen","🏓 Padel","🚵 MTB","😴 Rust als HRV 🟡 of 🔴"]}]},
    {day:"ZO",lb:"Dag 7",type:"bjj",title:"🥋 BJJ — Voorkeur",time:"GI of No-Gi",ss:[{n:"BJJ Training",it:["Voorkeur zondag — GI of No-Gi naar keuze","HRV 🔴 = drilling of rust"]}]},
  ]
}

function LvlBar({ t, raw }) {
  const lvl=getLvl(t,raw); if(lvl===null||lvl<0) return null
  const lc=LC[lvl], next=LK[lvl+1]
  return (
    <div style={{marginTop:5}}>
      <div style={{height:2,background:C.bd,borderRadius:1,marginBottom:3}}>
        <div style={{height:"100%",width:`${Math.round(((lvl+1)/4)*100)}%`,background:lc,borderRadius:1}}/>
      </div>
      <div style={{display:"flex",justifyContent:"space-between"}}>
        <span style={M({fontSize:9,fontWeight:700,color:lc})}>{LL[lvl]}</span>
        {next ? <span style={M({fontSize:9,color:C.mt})}>→ {LL[lvl+1]}: {["run1500","deadhang","plank"].includes(t.id)?fmtSec(t.lvl[next]):String(t.lvl[next])}</span>
               : <span style={M({fontSize:9,color:C.gr})}>✓ PRO!</span>}
      </div>
    </div>
  )
}


// ══ BJJ FUNDAMENTALS PLAN ══════════════════════════════════════

const BJJ_PHASES = [
  { id:1, label:"FASE 1", title:"Overleven & Ontsnappen", weken:"Weken 1–4", color:"#ff5e6b",
    doel:"Je ontsnapt consistent uit alle dominante posities. Je laat je niet zomaar vasthouden.",
    sparring:"Week 1–2: alleen white belts · Week 3–4: ook blue belts",
    trainingen:[
      { n:"Training 1", focus:"Side Control Escape", doel:"Terugkomen naar guard of half guard vanuit side control" },
      { n:"Training 2", focus:"Mount Escape",        doel:"Hip escape of bridge naar half guard, weg van onder mount" },
      { n:"Training 3", focus:"Back Escape",         doel:"Rug naar mat draaien, in guard komen, seatbelt breken" },
      { n:"Training 4", focus:"Vrij Sparen",         doel:"Doel: niet gesubmit worden. Alle ontsnappingen toepassen." },
    ]},
  { id:2, label:"FASE 2", title:"Guard Spelen & Behouden", weken:"Weken 5–8", color:"#3dffa0",
    doel:"Je guard wordt niet zomaar gepasst. Je bent actief vanuit guard en creëert kansen.",
    sparring:"White belts + blue belts · Bewust vanuit guard spelen",
    trainingen:[
      { n:"Training 1", focus:"Guard Retention",        doel:"Als ze proberen te passen, guard terugkrijgen" },
      { n:"Training 2", focus:"Closed Guard Aanvallen", doel:"Actief werken naar sweep of submission vanuit closed guard" },
      { n:"Training 3", focus:"Half Guard",             doel:"Vanuit half guard: terug naar full guard of sweep initiëren" },
      { n:"Training 4", focus:"Vrij Sparen",            doel:"Doel: guard niet laten passen. Bewust in guard positie beginnen." },
    ]},
  { id:3, label:"FASE 3", title:"Guard Passen & Progressie", weken:"Weken 9–12", color:"#38e8e8",
    doel:"Je past consistent de guard en houdt positie vast na de pass.",
    sparring:"Blue belts + 1x per week purple belt als je er klaar voor bent",
    trainingen:[
      { n:"Training 1", focus:"Guard Breken",           doel:"Guard openen en eerste pass richting inzetten" },
      { n:"Training 2", focus:"Guard Passen",           doel:"Pass afmaken en landen in side control" },
      { n:"Training 3", focus:"Positional Progression", doel:"Na pass: side control → mount → back — positie vasthouden" },
      { n:"Training 4", focus:"Vrij Sparen",            doel:"Doel: altijd proberen te passen + positie zo lang mogelijk vasthouden." },
    ]},
  { id:4, label:"FASE 4", title:"Dominantie & Submissions", weken:"Weken 13–16", color:"#a78bfa",
    doel:"Je houdt dominante positie vast en werkt consequent naar een submission.",
    sparring:"Blue belts + purple belts · Elke spar afronden met submission poging",
    trainingen:[
      { n:"Training 1", focus:"Side Control + Submission", doel:"Positie vasthouden en werken naar een submission vanuit side control" },
      { n:"Training 2", focus:"Mount + Submission",        doel:"Laag naar hoog mount opbouwen en werken naar submission" },
      { n:"Training 3", focus:"Back Control + Submission", doel:"Seatbelt vasthouden, haken controleren, werken naar finish" },
      { n:"Training 4", focus:"Vrij Sparen",               doel:"Doel: elke spar eindigen met een actieve submission poging." },
    ]},
  { id:5, label:"FASE 5", title:"Eigen Game Ontwikkelen", weken:"Weken 17–20", color:"#ffe066",
    doel:"Je identificeert jouw A-game en gaat met specifieke taken de mat op.",
    sparring:"Purple belts · Specifieke opdrachten per spar — strategie bewust testen",
    trainingen:[
      { n:"Training 1", focus:"Guard → Submission",      doel:"Specifieke taak: iemand vanuit guard submitten" },
      { n:"Training 2", focus:"Sterkste Pass Verfijnen", doel:"De pass die voor jou het beste werkt verder slijpen" },
      { n:"Training 3", focus:"Hogere Belt Sparring",    doel:"Tegen purple belt met specifiek doel sparen" },
      { n:"Training 4", focus:"Vrij Sparen",             doel:"Doel: jouw eigen game spelen. Wat werkt voor jouw lichaam en tempo?" },
    ]},
]

function BJJPlan({ bjp, setBjp, bjpEval, setBjpEval, bjpShowEval, setBjpShowEval, bjpActivePhase, setBjpActivePhase }) {
  const C2 = { bg:"#0A0A0A", bg2:"#141414", bd:"#222222", tx:"#F0EEE8", mt:"#888888" }
  const mo = (x={}) => ({ fontFamily:'var(--font-barlow), sans-serif', ...x })
  const sy = (x={}) => ({ fontFamily:'var(--font-oswald), Impact, sans-serif', ...x })
  const scoreColors = ["","#ff5e6b","#ff9a3c","#ffe066","#3dffa0","#38e8e8"]
  const scoreLabels = ["","Niet goed","Matig","Oké","Goed","Top!"]
  const curPh = BJJ_PHASES.find(p=>p.id===bjp.currentPhase)||BJJ_PHASES[0]

  const saveEval = () => {
    if(!bjpEval.tekst.trim()) return
    setBjp(p=>({ ...p, evaluations:[
      { phase:bjp.currentPhase, week:bjp.currentWeek, score:bjpEval.score,
        tekst:bjpEval.tekst.trim(), bijz:bjpEval.bijzonderheden.trim(),
        datum:todayStr() },
      ...p.evaluations].slice(0,40) }))
    setBjpEval({ score:3, tekst:"", bijzonderheden:"" })
    setBjpShowEval(false)
  }

  return (
    <div>
      <div style={mo({fontSize:9,letterSpacing:3,color:"#a78bfa",marginBottom:16,fontWeight:600})}>🥋 BJJ FUNDAMENTALS PLAN — 5 MAANDEN</div>

      {/* Progress */}
      <div style={{background:C2.bg2,border:"1px solid #a78bfa33",borderRadius:10,padding:"14px 16px",marginBottom:12}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div>
            <div style={mo({fontSize:8,letterSpacing:2,color:"#a78bfa",marginBottom:3})}>HUIDIGE POSITIE</div>
            <div style={sy({fontSize:15,fontWeight:700,color:"#F0EEE8"})}>{curPh.label}: {curPh.title}</div>
            <div style={mo({fontSize:9,color:"#888888",marginTop:2})}>Week {bjp.currentWeek} van 4 · {curPh.weken}</div>
          </div>
          <button onClick={()=>setBjpShowEval(v=>!v)}
            style={mo({background:"#a78bfa22",border:"1px solid #a78bfa44",borderRadius:6,padding:"7px 12px",color:"#a78bfa",cursor:"pointer",fontSize:9,fontWeight:700,letterSpacing:2})}>
            + EVALUATIE
          </button>
        </div>
        <div style={{display:"flex",gap:3,marginBottom:4}}>
          {BJJ_PHASES.map(ph=>(
            <div key={ph.id} style={{flex:1,height:3,borderRadius:2,
              background:ph.id<bjp.currentPhase?ph.color:ph.id===bjp.currentPhase?ph.color+"88":"#222222"}}/>
          ))}
        </div>
        <div style={{display:"flex",justifyContent:"space-between"}}>
          {BJJ_PHASES.map(ph=>(
            <div key={ph.id} style={mo({fontSize:7,color:ph.id===bjp.currentPhase?ph.color:"#888888",letterSpacing:1})}>{ph.label}</div>
          ))}
        </div>
      </div>

      {/* Fase + week navigator */}
      <div style={{display:"flex",gap:6,marginBottom:12,alignItems:"center",flexWrap:"wrap"}}>
        <div style={mo({fontSize:8,letterSpacing:2,color:"#888888"})}>FASE:</div>
        {BJJ_PHASES.map(ph=>(
          <button key={ph.id} onClick={()=>setBjp(p=>({...p,currentPhase:ph.id,currentWeek:1}))}
            style={mo({padding:"4px 8px",borderRadius:4,border:`1px solid ${bjp.currentPhase===ph.id?ph.color:C2.bd}`,
              background:bjp.currentPhase===ph.id?ph.color+"18":"transparent",
              color:bjp.currentPhase===ph.id?ph.color:"#888888",cursor:"pointer",fontSize:9,fontWeight:600})}>
            {ph.label}
          </button>
        ))}
        <div style={mo({fontSize:8,letterSpacing:2,color:"#888888",marginLeft:6})}>WEEK:</div>
        {[1,2,3,4].map(w=>(
          <button key={w} onClick={()=>setBjp(p=>({...p,currentWeek:w}))}
            style={mo({padding:"4px 8px",borderRadius:4,border:`1px solid ${bjp.currentWeek===w?curPh.color:C2.bd}`,
              background:bjp.currentWeek===w?curPh.color+"18":"transparent",
              color:bjp.currentWeek===w?curPh.color:"#888888",cursor:"pointer",fontSize:9,fontWeight:600})}>
            W{w}
          </button>
        ))}
      </div>

      {/* Eval form */}
      {bjpShowEval&&(
        <div style={{background:C2.bg2,border:"1px solid #a78bfa33",borderRadius:10,padding:"14px 16px",marginBottom:12}}>
          <div style={mo({fontSize:8,letterSpacing:3,color:"#a78bfa",marginBottom:10,fontWeight:600})}>EVALUATIE — {curPh.label} WEEK {bjp.currentWeek}</div>
          <div style={{marginBottom:10}}>
            <div style={mo({fontSize:8,letterSpacing:2,color:"#888888",marginBottom:6})}>SCORE</div>
            <div style={{display:"flex",gap:6}}>
              {[1,2,3,4,5].map(v=>(
                <button key={v} onClick={()=>setBjpEval(e=>({...e,score:v}))}
                  style={{flex:1,padding:"8px",borderRadius:6,border:`1px solid ${bjpEval.score===v?scoreColors[v]:C2.bd}`,
                    background:bjpEval.score===v?scoreColors[v]+"22":"transparent",
                    color:bjpEval.score===v?scoreColors[v]:"#888888",cursor:"pointer",
                    fontFamily:'var(--font-barlow), sans-serif',fontSize:12,fontWeight:700}}>
                  {v}
                </button>
              ))}
            </div>
            {bjpEval.score>0&&<div style={mo({fontSize:9,color:scoreColors[bjpEval.score],marginTop:4})}>{scoreLabels[bjpEval.score]}</div>}
          </div>
          <div style={{marginBottom:8}}>
            <div style={mo({fontSize:8,letterSpacing:2,color:"#888888",marginBottom:5})}>HOE GING HET?</div>
            <textarea rows={3} value={bjpEval.tekst} onChange={e=>setBjpEval(ev=>({...ev,tekst:e.target.value}))}
              placeholder="Wat werkte? Waar loop je tegenaan? Wat viel op?"
              style={{width:"100%",background:"#0A0A0A",border:"1px solid #222222",borderRadius:6,color:"#F0EEE8",
                fontFamily:'var(--font-barlow), sans-serif',fontSize:11,padding:"8px 10px",resize:"vertical",outline:"none",colorScheme:"dark"}}/>
          </div>
          <div style={{marginBottom:10}}>
            <div style={mo({fontSize:8,letterSpacing:2,color:"#888888",marginBottom:5})}>BIJZONDERHEDEN (optioneel)</div>
            <input type="text" value={bjpEval.bijzonderheden} onChange={e=>setBjpEval(ev=>({...ev,bijzonderheden:e.target.value}))}
              placeholder="Blessure, doorbraak, iets wat klikte..."
              style={{width:"100%",background:"#0A0A0A",border:"1px solid #222222",borderRadius:6,color:"#F0EEE8",
                fontFamily:'var(--font-barlow), sans-serif',fontSize:11,padding:"8px 10px",outline:"none",colorScheme:"dark"}}/>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={saveEval}
              style={mo({flex:1,background:"#a78bfa22",border:"1px solid #a78bfa55",borderRadius:6,padding:"8px",color:"#a78bfa",cursor:"pointer",fontSize:9,fontWeight:700,letterSpacing:2})}>
              OPSLAAN
            </button>
            <button onClick={()=>setBjpShowEval(false)}
              style={mo({background:"transparent",border:"1px solid #222222",borderRadius:6,padding:"8px 14px",color:"#888888",cursor:"pointer",fontSize:9})}>
              Annuleer
            </button>
          </div>
        </div>
      )}

      {/* Phase cards */}
      <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:14}}>
        {BJJ_PHASES.map(ph=>{
          const isActive=ph.id===bjp.currentPhase
          const isDone=ph.id<bjp.currentPhase
          const isOpen=bjpActivePhase===ph.id
          return (
            <div key={ph.id} style={{background:C2.bg2,border:`1px solid ${isActive?ph.color+"44":isDone?ph.color+"22":C2.bd}`,borderRadius:10,overflow:"hidden"}}>
              <button onClick={()=>setBjpActivePhase(isOpen?null:ph.id)}
                style={{width:"100%",background:"transparent",border:"none",padding:"12px 14px",cursor:"pointer",textAlign:"left",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:30,height:30,borderRadius:6,background:ph.color+"18",border:`1px solid ${ph.color}33`,
                    display:"flex",alignItems:"center",justifyContent:"center",
                    fontFamily:'var(--font-barlow), sans-serif',fontSize:9,fontWeight:700,color:ph.color,flexShrink:0}}>
                    {isDone?"✓":ph.id}
                  </div>
                  <div>
                    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
                      <span style={mo({fontSize:9,letterSpacing:2,color:ph.color,fontWeight:700})}>{ph.label}</span>
                      {isActive&&<span style={{...mo({fontSize:8}),background:ph.color+"18",border:`1px solid ${ph.color}33`,color:ph.color,padding:"1px 6px",borderRadius:3}}>ACTIEF</span>}
                      {isDone&&<span style={{...mo({fontSize:8}),background:"#3dffa018",border:"1px solid #3dffa033",color:"#3dffa0",padding:"1px 6px",borderRadius:3}}>VOLTOOID</span>}
                    </div>
                    <div style={sy({fontSize:13,fontWeight:700,color:"#F0EEE8"})}>{ph.title}</div>
                    <div style={mo({fontSize:9,color:"#888888",marginTop:1})}>{ph.weken}</div>
                  </div>
                </div>
                <div style={mo({fontSize:10,color:"#888888"})}>{isOpen?"▲":"▼"}</div>
              </button>
              {isOpen&&(
                <div style={{padding:"0 14px 14px",borderTop:`1px solid ${ph.color}22`}}>
                  <div style={{background:"#0A0A0A",border:`1px solid ${ph.color}22`,borderRadius:7,padding:"10px 12px",margin:"12px 0"}}>
                    <div style={mo({fontSize:8,letterSpacing:2,color:ph.color,marginBottom:4,fontWeight:600})}>FASE DOELSTELLING</div>
                    <div style={mo({fontSize:11,color:"#F0EEE8",lineHeight:1.6})}>{ph.doel}</div>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:5,marginBottom:10}}>
                    {ph.trainingen.map((t,i)=>(
                      <div key={i} style={{display:"flex",gap:10,padding:"9px 12px",background:"#0A0A0A",border:`1px solid ${C2.bd}`,borderRadius:7,alignItems:"flex-start"}}>
                        <div style={{minWidth:70,flexShrink:0}}>
                          <div style={mo({fontSize:8,letterSpacing:1,color:ph.color,fontWeight:700})}>{t.n}</div>
                          <div style={mo({fontSize:10,color:"#F0EEE8",fontWeight:600,marginTop:2})}>{t.focus}</div>
                        </div>
                        <div style={mo({fontSize:10,color:"#888888",lineHeight:1.5,flex:1})}>→ {t.doel}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{background:"#0A0A0A",border:`1px solid ${C2.bd}`,borderRadius:7,padding:"8px 12px"}}>
                    <div style={mo({fontSize:8,letterSpacing:2,color:"#888888",marginBottom:3,fontWeight:600})}>SPARRING OPBOUW</div>
                    <div style={mo({fontSize:10,color:"#F0EEE8",lineHeight:1.5})}>{ph.sparring}</div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* History */}
      {bjp.evaluations.length>0&&(
        <div>
          <div style={mo({fontSize:8,letterSpacing:3,color:"#888888",marginBottom:8,fontWeight:600})}>EVALUATIE GESCHIEDENIS</div>
          <div style={{display:"flex",flexDirection:"column",gap:5}}>
            {bjp.evaluations.slice(0,8).map((ev,i)=>{
              const phD=BJJ_PHASES.find(p=>p.id===ev.phase)||BJJ_PHASES[0]
              return (
                <div key={i} style={{background:C2.bg2,border:`1px solid ${phD.color}22`,borderRadius:8,padding:"10px 14px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                    <div style={{display:"flex",gap:8,alignItems:"center"}}>
                      <span style={mo({fontSize:8,color:phD.color,fontWeight:700,letterSpacing:1})}>{phD.label} W{ev.week}</span>
                      <span style={{...mo({fontSize:8,fontWeight:700}),color:scoreColors[ev.score]}}>{scoreLabels[ev.score]}</span>
                    </div>
                    <span style={mo({fontSize:8,color:"#888888"})}>{ev.datum}</span>
                  </div>
                  <div style={mo({fontSize:10,color:"#F0EEE8",lineHeight:1.5})}>{ev.tekst}</div>
                  {ev.bijz&&<div style={mo({fontSize:9,color:"#888888",marginTop:3,fontStyle:"italic"})}>↗ {ev.bijz}</div>}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function Schema() {
  const [tab,setTab]=useState("dash")
  const [phase,setPhase]=useState(0)
  const [activeDay,setActiveDay]=useState("MA")
  const [settings,setSettings]=useState(DS)
  const [daily,setDaily]=useState(DD)
  const [scores,setScores]=useState(DC)
  const [expandedTest,setExpandedTest]=useState(null)
  const [mounted,setMounted]=useState(false)
  const BJP_DEFAULT = { currentPhase:1, currentWeek:1, evaluations:[], startDate:null }
  const [bjp,setBjp]=useState(BJP_DEFAULT)
  const [bjpEval,setBjpEval]=useState({ score:3, tekst:"", bijzonderheden:"" })
  const [bjpShowEval,setBjpShowEval]=useState(false)
  const [bjpActivePhase,setBjpActivePhase]=useState(null)

  useEffect(()=>{
    setMounted(true)
    try {
      const saved=localStorage.getItem("megafit_v1")
      if(saved){
        const p=JSON.parse(saved)
        if(p.settings) setSettings(s=>({...DS,...s,...p.settings}))
        if(p.daily)    setDaily(d=>({...DD,...d,...p.daily}))
        if(p.scores)   setScores(s=>({...DC,...s,...p.scores,mob:{...DC.mob,...(p.scores.mob||{})}}))
        if(p.phase!==undefined) setPhase(p.phase)
        if(p.activeDay) setActiveDay(p.activeDay)
      }
    } catch(e){}
    try {
      const savedBjp=localStorage.getItem("bjj_plan_v1")
      if(savedBjp) setBjp(p=>({...BJP_DEFAULT,...JSON.parse(savedBjp)}))
    } catch(e){}
  },[])

  useEffect(()=>{
    if(!mounted) return
    try { localStorage.setItem("megafit_v1",JSON.stringify({settings,daily,scores,phase,activeDay})) }
    catch(e){}
  },[settings,daily,scores,phase,activeDay,mounted])

  useEffect(()=>{
    if(!mounted) return
    try { localStorage.setItem("bjj_plan_v1",JSON.stringify(bjp)) }
    catch(e){}
  },[bjp,mounted])

  const updS=(k,v)=>setSettings(s=>({...s,[k]:parseFloat(v)||v}))
  const updD=(k,v)=>setDaily(d=>({...d,[k]:v}))
  const updC=(k,v)=>setScores(s=>({...s,[k]:v}))
  const updMob=(k,v)=>setScores(s=>({...s,mob:{...s.mob,[k]:s.mob[k]===v?null:v}}))

  const dlORM=calc1RM(scores.dlWeight,scores.dlReps)
  const bpORM=calc1RM(scores.bpWeight,scores.bpReps)
  const run1500s=toSec(scores.runMin,scores.runSec)
  const MAS=run1500s?1500/run1500s:null
  const masLvl=MAS?(MAS<=2.84?"Beginner":MAS<=3.89?"Gemiddeld":MAS<=4.96?"Gevorderd":"Elite"):null
  const iDist=MAS?Math.round(240*MAS*.90):null

  function getRaw(t){
    if(t.id==="dl1rm")    return dlORM
    if(t.id==="bp1rm")    return bpORM
    if(t.id==="run1500")  return run1500s
    if(t.id==="deadhang") return toSec(scores.dhMin,scores.dhSec)
    if(t.id==="plank")    return toSec(scores.plankMin,scores.plankSec)
    if(t.id==="mob"){
      const f=Object.values(scores.mob).filter(v=>v!==null).length
      return f===5?Object.values(scores.mob).reduce((a,v)=>a+(v||0),0):null
    }
    const v=parseFloat(scores[t.id]); return isNaN(v)?null:v
  }
  function fmtRaw(t,raw){
    if(raw===null) return null
    if(["run1500","deadhang","plank"].includes(t.id)) return fmtSec(raw)
    if(t.id==="mob") return `${raw}/10`
    return String(raw)
  }

  const scored=TESTS.filter(t=>getRaw(t)!==null)
  const proCount=scored.filter(t=>getLvl(t,getRaw(t))===3).length
  const {h,w,r,overall}=calcStatus(daily,settings)
  const si=overall?SI[overall]:null
  const week=buildWeek(phase,dlORM,bpORM,MAS,settings)
  const ph=PHASES[phase]
  const tod=week.find(d=>d.day===activeDay)||week[0]
  const dc=DTYPE[tod.type]||DTYPE.rest
  const SC={green:C.gr,yellow:C.ye,red:C.re}

  if(!mounted) return(
    <div style={{background:C.bg,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",color:C.tl,...M({fontSize:14})}}>
      LADEN...
    </div>
  )

  return (
    <div style={M({minHeight:"100vh",background:C.bg,color:C.tx})}>

      {/* HEADER */}
      <div style={{background:"linear-gradient(160deg,#1a1208,#0A0A0A)",borderBottom:`1px solid ${C.bd}`,padding:"15px 14px 12px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-30,right:-30,width:180,height:180,background:"radial-gradient(circle,rgba(61,255,160,.06),transparent 65%)",pointerEvents:"none"}}/>
        <div style={{maxWidth:920,margin:"0 auto"}}>
          <div style={M({fontSize:8,letterSpacing:4,color:C.gr,marginBottom:3})}>GBRS+ · AMF · NSCA · BJJ · MILITAIR</div>
          <div style={SY({fontSize:"clamp(15px,4vw,22px)",fontWeight:800,color:C.wh,letterSpacing:-0.5,marginBottom:8})}>MEGA FIT SCHEMA 2026</div>
          <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
            {[
              [`📊 ${scored.length}/12`,C.ye],[`🏆 ${proCount} PRO`,C.gr],
              [dlORM?`DL ${dlORM}kg`:"DL —",C.gr],[bpORM?`BP ${bpORM}kg`:"BP —",C.ye],
              [MAS?`MAS ${MAS.toFixed(2)}`:"MAS —",C.tl],
              [si?si.icon+" "+si.label:"Check-in →",si?si.c:C.mt],
            ].map(([v,c])=><span key={v} style={pill(c)}>{v}</span>)}
          </div>
        </div>
      </div>

      <div style={{maxWidth:920,margin:"0 auto",padding:"12px 12px 40px"}}>

        {/* TABS */}
        <div style={{display:"flex",gap:4,marginBottom:14}}>
          {[["dash","📊 Dashboard"],["tests","🔬 Tests"],["schema","📅 Schema"],["bjj","🥋 BJJ Plan"],["inst","⚙️ Instellingen"]].map(([id,lb])=>(
            <button key={id} onClick={()=>setTab(id)}
              style={M({flex:1,background:tab===id?"#111d2e":"transparent",border:`1px solid ${tab===id?"#2a3d55":C.bd}`,borderRadius:6,padding:"8px 4px",cursor:"pointer",color:tab===id?C.tx:C.mt,fontSize:10,fontWeight:600})}>
              {lb}
            </button>
          ))}
        </div>

        {/* ══ DASHBOARD ══ */}
        {tab==="dash"&&(
          <div>
            {/* Check-in */}
            <div style={{background:C.bg2,border:`1px solid ${C.bd}`,borderRadius:10,padding:"14px 14px 12px",marginBottom:12}}>
              <div style={M({fontSize:9,letterSpacing:3,color:C.mt,marginBottom:12,fontWeight:600})}>DAGELIJKSE CHECK-IN</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:10}}>
                {[
                  {f:"hrv",lb:"HRV",unit:"ms",ph:"92",st:h,hint:`Baseline ${settings.hrvBaseline}ms`},
                  {f:"weight",lb:"Gewicht",unit:"kg",ph:"80.5",st:w,hint:`Doel ≤${settings.weightTarget}kg`},
                  {f:"rhr",lb:"RHR",unit:"bpm",ph:"43",st:r,hint:`Basis ${settings.rhrBaseline}bpm`},
                ].map(({f,lb,unit,ph:p,st:s,hint})=>(
                  <div key={f} style={{background:s?SC[s]+"12":C.bg,border:`1px solid ${s?SC[s]+"55":C.bd}`,borderRadius:8,padding:"10px 8px 8px",textAlign:"center",transition:"all .2s"}}>
                    <div style={M({fontSize:8,color:C.mt,marginBottom:4})}>{lb}</div>
                    <input type="number" step="0.1" value={daily[f]} onChange={e=>updD(f,e.target.value)} placeholder={p}
                      style={M({background:"transparent",border:"none",outline:"none",color:s?SC[s]:C.tx,fontSize:22,fontWeight:800,width:"100%",textAlign:"center"})}/>
                    <div style={M({fontSize:8,color:C.mt,marginTop:2})}>{unit}</div>
                    {s&&<div style={{fontSize:14,marginTop:3}}>{s==="green"?"🟢":s==="yellow"?"🟡":"🔴"}</div>}
                    <div style={M({fontSize:7,color:C.mt,marginTop:2})}>{hint}</div>
                  </div>
                ))}
              </div>
              {si&&(
                <div style={{background:si.c+"12",border:`1px solid ${si.c}44`,borderLeft:`3px solid ${si.c}`,borderRadius:7,padding:"10px 12px"}}>
                  <div style={SY({fontSize:13,fontWeight:700,color:si.c,marginBottom:2})}>{si.icon} {si.label}</div>
                  <div style={M({fontSize:10,color:"#aaaaaa"})}>{si.desc}</div>
                </div>
              )}
              {!overall&&<div style={M({fontSize:10,color:C.mt,marginTop:8,textAlign:"center"})}>Vul HRV, gewicht en RHR in voor je trainingstatus van vandaag</div>}
            </div>

            {/* Berekeningen */}
            {(dlORM||bpORM||MAS)&&(
              <div style={{background:"rgba(45,212,191,.06)",border:`1px solid ${C.tl}33`,borderLeft:`3px solid ${C.tl}`,borderRadius:7,padding:"10px 12px",marginBottom:12}}>
                <div style={M({fontSize:9,color:C.mt,marginBottom:7,letterSpacing:2,fontWeight:600})}>GECONNECTEERDE BEREKENINGEN</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(108px,1fr))",gap:5}}>
                  {[
                    dlORM&&["DL 1RM",`${dlORM} kg`,C.gr],
                    bpORM&&["BP 1RM",`${bpORM} kg`,C.ye],
                    MAS&&["MAS",`${MAS.toFixed(2)} m/s`,C.tl],
                    MAS&&["Niveau",masLvl,C.tl],
                    iDist&&["4×4 interval",`${iDist}m`,C.or],
                    MAS&&["LSD HR",`${Math.round(settings.maxHR*.70)} bpm`,C.gr],
                    MAS&&["Interval HR",`${Math.round(settings.maxHR*.90)} bpm`,C.re],
                  ].filter(Boolean).map(([l,v,c])=>(
                    <div key={l} style={{background:C.bg,borderRadius:5,padding:"6px 8px"}}>
                      <div style={M({fontSize:8,color:C.mt})}>{l}</div>
                      <div style={SY({fontSize:13,fontWeight:700,color:c})}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Week */}
            <div style={M({fontSize:9,letterSpacing:2,color:C.mt,marginBottom:8,fontWeight:600})}>DEZE WEEK — KLIK OP EEN DAG</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4,marginBottom:12}}>
              {week.map(d=>{
                const dc_=DTYPE[d.type]||DTYPE.rest, a=activeDay===d.day
                return(
                  <div key={d.day} onClick={()=>{setActiveDay(d.day);setTab("schema")}}
                    style={{background:a?dc_.bg:C.bg2,border:`1px solid ${a?dc_.bd:C.bd}`,borderRadius:6,padding:"7px 4px",cursor:"pointer",textAlign:"center"}}>
                    <div style={M({fontSize:10,fontWeight:700,color:a?dc_.bd:C.mt})}>{d.day}</div>
                    <div style={{width:5,height:5,borderRadius:"50%",background:dc_.bd,margin:"3px auto",opacity:a?1:0.4}}/>
                    <div style={M({fontSize:7,color:C.mt,marginTop:1,lineHeight:1.3})}>{d.lb.split(" ")[0]}</div>
                  </div>
                )
              })}
            </div>

            {/* Test scores */}
            <div style={M({fontSize:9,letterSpacing:2,color:C.mt,marginBottom:8,fontWeight:600})}>TEST SCORES — KLIK OM IN TE VULLEN</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:5}}>
              {TESTS.map(t=>{
                const raw=getRaw(t),lvl=getLvl(t,raw),lc=lvl>=0?LC[lvl]:C.mt
                return(
                  <div key={t.id} onClick={()=>setTab("tests")} style={{background:C.bg2,border:`1px solid ${lc}33`,borderRadius:7,padding:"8px 10px",cursor:"pointer"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:2}}>
                      <span style={M({fontSize:9,color:C.mt})}>{t.icon} {t.name.slice(0,16)}</span>
                      {lvl>=0&&<span style={{...pill(lc),padding:"1px 5px",fontSize:8}}>{LL[lvl]}</span>}
                    </div>
                    {raw!==null&&<div style={{height:2,background:C.bd,borderRadius:1,marginBottom:2}}>
                      <div style={{height:"100%",width:`${Math.min(100,Math.round(((Math.max(0,lvl)+1)/4)*100))}%`,background:lc,borderRadius:1}}/>
                    </div>}
                    <div style={M({fontSize:8,color:C.mt})}>{raw!==null?fmtRaw(t,raw):"Invullen →"}</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ══ TESTS ══ */}
        {tab==="tests"&&(
          <div>
            <div style={M({fontSize:9,letterSpacing:3,color:C.mt,marginBottom:4,fontWeight:600})}>12 TESTS · 2 SESSIES · MAANDAG 9 JUNI</div>

            {/* Mobility */}
            <div style={{background:C.bg2,border:`1px solid ${C.tl}33`,borderLeft:`3px solid ${C.tl}`,borderRadius:9,padding:"13px 14px",marginBottom:14}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <div style={SY({fontSize:12,fontWeight:700,color:C.tl})}>🔍 Mobility Screen — SESSIE 1</div>
                {(()=>{
                  const s=Object.values(scores.mob).reduce((a,v)=>a+(v||0),0)
                  const f=Object.values(scores.mob).filter(v=>v!==null).length
                  return f>0&&<div style={SY({fontSize:16,fontWeight:800,color:s>=8?C.gr:s>=5?C.ye:C.re})}>{s}/10</div>
                })()}
              </div>
              <div style={M({fontSize:10,color:"#aaaaaa",marginBottom:10})}>🔴 Beperkt = 0 pt · 🟡 Matig = 1 pt · 🟢 Goed = 2 pt</div>
              {MOB.map(m=>(
                <div key={m.id} style={{background:C.bg,borderRadius:7,padding:"9px 11px",marginBottom:6}}>
                  <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:8,alignItems:"center"}}>
                    <div>
                      <div style={M({fontSize:11,fontWeight:700,color:C.wh})}>{m.name}</div>
                      <div style={M({fontSize:9,color:C.mt,marginTop:2})}>{m.cue}</div>
                    </div>
                    <div style={{display:"flex",gap:5}}>
                      {[{s:0,l:"🔴",c:C.re},{s:1,l:"🟡",c:C.ye},{s:2,l:"🟢",c:C.gr}].map(opt=>(
                        <button key={opt.s} onClick={()=>updMob(m.id,opt.s)}
                          style={M({background:scores.mob[m.id]===opt.s?opt.c+"30":"transparent",border:`1px solid ${scores.mob[m.id]===opt.s?opt.c:C.bd}`,borderRadius:5,padding:"5px 10px",cursor:"pointer",color:scores.mob[m.id]===opt.s?opt.c:C.mt,fontSize:12})}>
                          {opt.l}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Sessie 1 & 2 */}
            {[1,2].map(sess=>(
              <div key={sess} style={{marginBottom:14}}>
                <div style={{background:sess===1?"rgba(255,224,102,.05)":"rgba(61,255,160,.05)",border:`1px solid ${sess===1?C.ye:C.gr}33`,borderLeft:`3px solid ${sess===1?C.ye:C.gr}`,borderRadius:7,padding:"9px 12px",marginBottom:8}}>
                  <div style={SY({fontSize:12,fontWeight:700,color:sess===1?C.ye:C.gr})}>
                    SESSIE {sess} — {sess===1?"07:00–09:30 · Power + Kracht":"13:00–15:15 · Endurance + Conditie + Carry"}
                  </div>
                </div>
                {TESTS.filter(t=>t.s===sess&&t.type!=="mob").map(t=>{
                  const raw=getRaw(t),lvl=getLvl(t,raw),lc=lvl>=0?LC[lvl]:C.mt,isOpen=expandedTest===t.id
                  const tName=t.id==="bwbench"?`BP @ ${settings.bodyWeight}kg`:t.id==="farmerscarry"?`Farmer's Carry (${Math.round(settings.bodyWeight/2)}kg/h)`:t.name
                  return(
                    <div key={t.id} style={{background:C.bg2,border:`1px solid ${lc}33`,borderLeft:`3px solid ${lc}`,borderRadius:8,padding:"11px 13px",marginBottom:6}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer",flexWrap:"wrap",gap:8}}
                        onClick={()=>setExpandedTest(isOpen?null:t.id)}>
                        <div style={{display:"flex",gap:8,alignItems:"center"}}>
                          <span style={{fontSize:18}}>{t.icon}</span>
                          <div>
                            <div style={SY({fontSize:12,fontWeight:700,color:C.wh})}>{tName}</div>
                            <div style={M({fontSize:9,color:C.mt})}>{t.cat}</div>
                          </div>
                        </div>
                        <div style={{display:"flex",gap:5,alignItems:"center"}}>
                          {LK.map((k,i)=>t.lvl&&(
                            <div key={k} style={{textAlign:"center"}}>
                              <div style={M({fontSize:7,color:C.mt})}>{LL[i]}</div>
                              <div style={M({fontSize:9,fontWeight:700,color:LC[i]})}>{["run1500","deadhang","plank"].includes(t.id)?fmtSec(t.lvl[k]):String(t.lvl[k])}</div>
                            </div>
                          ))}
                          {raw!==null&&<span style={pill(lc,{padding:"2px 7px"})}>{lvl>=0?LL[lvl]:"—"}</span>}
                          <span style={M({color:C.mt,fontSize:10})}>{isOpen?"▲":"▼"}</span>
                        </div>
                      </div>
                      {raw!==null&&<LvlBar t={t} raw={raw}/>}
                      {isOpen&&(
                        <div style={{marginTop:10,paddingTop:10,borderTop:`1px solid ${C.bd}`}}>
                          <div style={M({fontSize:9,color:C.mt,letterSpacing:1,marginBottom:8,fontWeight:600})}>SCORE INVULLEN</div>
                          {t.type==="amf"&&(()=>{
                            const orm=t.id==="dl1rm"?dlORM:bpORM
                            return(
                              <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"}}>
                                {[["Gewicht",t.wf,"kg"],["Reps",t.rf,"reps"]].map(([l,f,u])=>(
                                  <div key={f} style={{display:"flex",gap:6,alignItems:"center"}}>
                                    <span style={M({fontSize:10,color:C.mt,minWidth:55})}>{l}</span>
                                    <input type="number" value={scores[f]} onChange={e=>updC(f,e.target.value)} placeholder="0"
                                      style={M({background:C.bg,border:`1px solid ${C.bd}`,borderRadius:5,color:C.tx,padding:"5px 8px",fontSize:14,fontWeight:700,width:68,textAlign:"center"})}/>
                                    <span style={M({fontSize:9,color:C.mt})}>{u}</span>
                                  </div>
                                ))}
                                {orm&&<div style={SY({fontSize:20,fontWeight:800,color:lc})}>{orm} kg 1RM</div>}
                              </div>
                            )
                          })()}
                          {t.type==="num"&&(
                            <div style={{display:"flex",gap:8,alignItems:"center"}}>
                              <input type="number" step={t.step||1} value={scores[t.id]||""} onChange={e=>updC(t.id,e.target.value)} placeholder="0"
                                style={M({background:C.bg,border:`1px solid ${C.bd}`,borderRadius:5,color:C.tx,padding:"5px 9px",fontSize:14,fontWeight:700,width:85,textAlign:"center"})}/>
                              <span style={M({fontSize:10,color:C.mt})}>{t.unit}</span>
                            </div>
                          )}
                          {t.type==="time"&&(
                            <div style={{display:"flex",gap:6,alignItems:"center"}}>
                              <input type="number" value={scores[t.mf]||""} onChange={e=>updC(t.mf,e.target.value)} placeholder="0"
                                style={M({background:C.bg,border:`1px solid ${C.bd}`,borderRadius:5,color:C.tx,padding:"5px 8px",fontSize:14,fontWeight:700,width:55,textAlign:"center"})}/>
                              <span style={M({fontSize:10,color:C.mt})}>min</span>
                              <input type="number" value={scores[t.sf]||""} onChange={e=>updC(t.sf,e.target.value)} placeholder="00"
                                style={M({background:C.bg,border:`1px solid ${C.bd}`,borderRadius:5,color:C.tx,padding:"5px 8px",fontSize:14,fontWeight:700,width:55,textAlign:"center"})}/>
                              <span style={M({fontSize:10,color:C.mt})}>sec</span>
                            </div>
                          )}
                          {t.type==="run1500"&&(
                            <div>
                              <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap",marginBottom:8}}>
                                <input type="number" value={scores.runMin||""} onChange={e=>updC("runMin",e.target.value)} placeholder="5"
                                  style={M({background:C.bg,border:`1px solid ${C.bd}`,borderRadius:5,color:C.tx,padding:"5px 8px",fontSize:14,fontWeight:700,width:55,textAlign:"center"})}/>
                                <span style={M({fontSize:10,color:C.mt})}>min</span>
                                <input type="number" value={scores.runSec||""} onChange={e=>updC("runSec",e.target.value)} placeholder="15"
                                  style={M({background:C.bg,border:`1px solid ${C.bd}`,borderRadius:5,color:C.tx,padding:"5px 8px",fontSize:14,fontWeight:700,width:55,textAlign:"center"})}/>
                                <span style={M({fontSize:10,color:C.mt})}>sec</span>
                              </div>
                              {MAS&&<div style={M({fontSize:10,color:C.tl,lineHeight:1.6})}>
                                ✓ MAS: {MAS.toFixed(2)} m/s · {masLvl} · Interval: {iDist}m · LSD: {Math.round(settings.maxHR*.70)}bpm
                              </div>}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        )}

        {/* ══ SCHEMA ══ */}
        {tab==="schema"&&(
          <>
            <div style={{display:"flex",marginBottom:6,borderRadius:3,overflow:"hidden"}}>
              {PHASES.map(p=><div key={p.id} onClick={()=>{setPhase(p.id);setActiveDay("MA")}} style={{flex:1,height:4,background:p.color,opacity:phase===p.id?1:0.2,cursor:"pointer"}}/>)}
            </div>
            <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:10}}>
              {PHASES.map(p=>(
                <button key={p.id} onClick={()=>{setPhase(p.id);setActiveDay("MA")}}
                  style={M({flex:1,minWidth:70,background:phase===p.id?p.bg:C.bg2,border:`1px solid ${phase===p.id?p.color:C.bd}`,borderRadius:6,padding:"6px 6px",cursor:"pointer",color:phase===p.id?p.color:C.mt,fontSize:8,fontWeight:700,textAlign:"left"})}>
                  <div style={{fontSize:7,opacity:.7,marginBottom:1}}>{p.dates}</div>
                  <div>{p.lb}</div>
                </button>
              ))}
            </div>
            <div style={{background:ph.bg,border:`1px solid ${ph.color}22`,borderLeft:`3px solid ${ph.color}`,borderRadius:7,padding:"8px 12px",marginBottom:10}}>
              <div style={SY({fontSize:13,fontWeight:700,color:C.wh})}>{ph.lb} — {ph.title}</div>
              <div style={M({fontSize:9,color:C.mt})}>{ph.dates}</div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4,marginBottom:10}}>
              {week.map(d=>{
                const dc_=DTYPE[d.type]||DTYPE.rest, a=activeDay===d.day
                return(
                  <div key={d.day} onClick={()=>setActiveDay(d.day)}
                    style={{background:a?dc_.bg:C.bg2,border:`1px solid ${a?dc_.bd:C.bd}`,borderRadius:6,padding:"7px 4px",cursor:"pointer",textAlign:"center"}}>
                    <div style={M({fontSize:10,fontWeight:700,color:a?dc_.bd:C.mt})}>{d.day}</div>
                    <div style={{width:5,height:5,borderRadius:"50%",background:dc_.bd,margin:"3px auto",opacity:a?1:0.4}}/>
                    <div style={M({fontSize:7,color:C.mt,marginTop:1})}>{d.lb.split(" ")[0]}</div>
                  </div>
                )
              })}
            </div>
            <div style={{background:dc.bg,border:`1px solid ${dc.bd}33`,borderTop:`2px solid ${dc.bd}`,borderRadius:9,padding:13}}>
              <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:6,marginBottom:10}}>
                <div>
                  <div style={SY({fontSize:14,fontWeight:700,color:C.wh,marginBottom:2})}>{tod.title}</div>
                  <div style={M({fontSize:9,color:C.mt})}>{tod.lb} · {tod.time}</div>
                </div>
                {si&&<span style={pill(si.c)}>{si.icon} {si.label}</span>}
              </div>
              {tod.ss.map((s,i)=>(
                <div key={i} style={{background:C.bg,borderRadius:6,padding:"9px 10px",border:`1px solid ${C.bd}`,marginBottom:6}}>
                  <div style={M({fontSize:10,fontWeight:700,color:dc.bd,marginBottom:5})}>{s.n}</div>
                  {s.it.map((item,j)=>(
                    <div key={j} style={{display:"flex",gap:6,marginBottom:3}}>
                      <span style={M({color:dc.bd,fontSize:9,flexShrink:0,marginTop:1})}>→</span>
                      <span style={M({fontSize:10,color:"#aaaaaa",lineHeight:1.5})}>{item}</span>
                    </div>
                  ))}
                </div>
              ))}
              {(!dlORM||!bpORM||!MAS)&&phase>0&&(
                <div style={M({fontSize:9,color:C.mt,fontStyle:"italic",marginTop:4})}>
                  * Vul AMF + 1500m scores in bij Tests tab → gewichten verschijnen automatisch
                </div>
              )}
            </div>
          </>
        )}


        {/* ══ BJJ PLAN ══ */}
        {tab==="bjj"&&(
          <div>
            <BJJPlan bjp={bjp} setBjp={setBjp} bjpEval={bjpEval} setBjpEval={setBjpEval}
              bjpShowEval={bjpShowEval} setBjpShowEval={setBjpShowEval}
              bjpActivePhase={bjpActivePhase} setBjpActivePhase={setBjpActivePhase} />
          </div>
        )}

        {/* ══ INSTELLINGEN ══ */}
        {tab==="inst"&&(
          <div>
            <div style={M({fontSize:9,letterSpacing:3,color:C.mt,marginBottom:12,fontWeight:600})}>INSTELLINGEN — ALLES BEÏNVLOEDT HET SCHEMA</div>
            {[
              {title:"Lichaamssamenstelling",fields:[
                {k:"bodyWeight",lb:"Lichaamsgewicht",unit:"kg",desc:`Farmer's Carry = ${Math.round(settings.bodyWeight/2)}kg/hand · BP@BW = ${settings.bodyWeight}kg`,step:0.5},
                {k:"weightTarget",lb:"Gewichtsdoel",unit:"kg",desc:"Dashboard 🟢 = op of onder doel",step:0.5},
              ]},
              {title:"Cardio Basislijn",fields:[
                {k:"maxHR",lb:"Max Hartslag",unit:"bpm",desc:`Interval HR = ${Math.round(settings.maxHR*.90)}bpm · LSD HR = ${Math.round(settings.maxHR*.70)}bpm`,step:1},
                {k:"age",lb:"Leeftijd",unit:"jaar",desc:"AMF VO2max normalisatie",step:1},
              ]},
              {title:"HRV & Herstel Basislijn",fields:[
                {k:"hrvBaseline",lb:"HRV 7d gemiddelde",unit:"ms",desc:`🟢 ≥${Math.round(settings.hrvBaseline*.95)} · 🟡 ${Math.round(settings.hrvBaseline*.85)}–${Math.round(settings.hrvBaseline*.95)-1} · 🔴 <${Math.round(settings.hrvBaseline*.85)}ms`,step:1},
                {k:"rhrBaseline",lb:"RHR basislijn",unit:"bpm",desc:`🟢 ≤${settings.rhrBaseline+3} · 🟡 ≤${settings.rhrBaseline+6} · 🔴 >${settings.rhrBaseline+6}bpm`,step:1},
              ]},
            ].map(({title,fields})=>(
              <div key={title} style={{background:C.bg2,border:`1px solid ${C.bd}`,borderRadius:9,padding:"13px 14px",marginBottom:10}}>
                <div style={SY({fontSize:12,fontWeight:700,color:C.wh,marginBottom:12})}>{title}</div>
                {fields.map(({k,lb,unit,desc,step})=>(
                  <div key={k} style={{marginBottom:12,paddingBottom:12,borderBottom:`1px solid ${C.bd}`}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
                      <div>
                        <div style={M({fontSize:11,fontWeight:700,color:C.tx})}>{lb}</div>
                        <div style={M({fontSize:9,color:C.mt,marginTop:3})}>{desc}</div>
                      </div>
                      <div style={{display:"flex",gap:6,alignItems:"center"}}>
                        <input type="number" step={step} value={settings[k]} onChange={e=>updS(k,e.target.value)}
                          style={M({background:C.bg,border:`1px solid ${C.bd}`,borderRadius:5,color:C.tx,padding:"6px 9px",fontSize:14,fontWeight:700,width:80,textAlign:"center"})}/>
                        <span style={M({fontSize:10,color:C.mt})}>{unit}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        <div style={M({fontSize:8,color:"#1a2e48",textAlign:"center",marginTop:14,letterSpacing:1})}>
          GBRS+ · AMF · NSCA TACTICAL S&C · 2026
        </div>
      </div>
    </div>
  )
}

// ─── PAGE WRAPPER MET BACK BUTTON ─────────────────────────────────────────────
export default function EigenTrainingsplanPage() {
  return (
    <>
      <div style={{ background:'#141414', borderBottom:'1px solid rgba(212,168,87,0.12)', padding:'12px 24px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <svg width="22" height="20" viewBox="0 0 36 34">
            <polygon points="18,2 13,28 23,28" fill="#D4A857"/>
            <polygon points="5,7 0,28 14,28" fill="#D4A857" opacity="0.5"/>
            <polygon points="31,7 23,28 36,28" fill="#D4A857" opacity="0.5"/>
          </svg>
          <span style={{ fontFamily:'var(--font-oswald),sans-serif', fontSize:14, letterSpacing:3, fontWeight:700, color:'#F0EEE8' }}>GV PERFORMANCE</span>
          <span style={{ fontFamily:'var(--font-barlow),sans-serif', fontSize:10, letterSpacing:2, color:'#D4A857', textTransform:'uppercase' }}>Eigen Training</span>
        </div>
        <a href="/dashboard/coach" style={{ fontFamily:'var(--font-barlow),sans-serif', fontSize:11, letterSpacing:2, textTransform:'uppercase', color:'#888888', textDecoration:'none' }}>
          ← Coach dashboard
        </a>
      </div>
      <Schema />
    </>
  )
}
