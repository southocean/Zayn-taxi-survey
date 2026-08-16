/* ---------------------------------------------------------------
   Field kit data — Stockholm driver interview run
   All fare/distance numbers here are ESTIMATES computed from
   coordinates. The app quote is always the truth. Verify before you
   confirm any booking.
   --------------------------------------------------------------- */

/* Fare models (rough, Stockholm 2026, cheapest tier).
   Used only to pre-warn you. Always trust the in-app quote. */
const FARE = {
  app:  { base: 39, perKm: 11.0, perMin: 2.6, target: 150, lo: 125, hi: 180 },
  /* Calibrated against the jämförpris the traditional companies must
     display: ~320 kr for a 10 km / 15 min trip. */
  trad: { base: 50, perKm: 14.0, perMin: 8.7, target: 285, lo: 230, hi: 310 }
};

/* Road distance ≈ straight line × this. Stockholm's water and
   arterial layout makes this a bit higher than a typical grid city. */
const ROAD_FACTOR = 1.35;

/* Average door-to-door speed on inner-suburb arterials with lights.
   Deliberately NOT motorway speed — see "Field notes". */
const AVG_KMH = 23;

/* ---------------- Points ----------------
   Every point is a real, easy-to-find pickup spot: a centrum, a
   station forecourt, a mall entrance. Pin-friendly = driver finds
   you = no cancellation. */
const P = {
  liljeholmen:  { name: "Liljeholmstorget",            hint: "Bus terminal side, Liljeholmsvägen. Big open kerb.", lat: 59.3105, lng: 18.0225 },
  arstadal:     { name: "Årstadal / Sjöviksvägen",     hint: "Quiet residential kerb, 900 m from Liljeholmstorget.", lat: 59.3070, lng: 18.0330 },
  grondal:      { name: "Gröndals centrum",            hint: "Gröndalsvägen, outside the ICA.", lat: 59.3125, lng: 18.0000 },

  hogdalen:     { name: "Högdalens centrum",           hint: "Outside the T-bana entrance, Rangstaplan.", lat: 59.2640, lng: 18.0430 },
  bandhagen:    { name: "Bandhagens T-bana",           hint: "Trollesundsvägen, station forecourt.", lat: 59.2720, lng: 18.0480 },
  stureby:      { name: "Stureby station",             hint: "Small, quiet. Zero surge.", lat: 59.2760, lng: 18.0400 },

  fruangen:     { name: "Fruängens centrum",           hint: "Bus terminal side, Vantörsvägen.", lat: 59.2856, lng: 17.9646 },
  vastertorp:   { name: "Västertorps T-bana",          hint: "Störtloppsvägen entrance.", lat: 59.2910, lng: 17.9640 },
  hagerstensasen:{ name: "Hägerstensåsens T-bana",     hint: "Personnevägen.", lat: 59.2920, lng: 17.9840 },

  arsta:        { name: "Årsta centrum (Årsta torg)",  hint: "Outside the shopping centre entrance.", lat: 59.2985, lng: 18.0470 },
  arstaberg:    { name: "Årstabergs station",          hint: "Station forecourt, Årstabergsvägen.", lat: 59.3040, lng: 18.0330 },
  ostberga:     { name: "Östberga centrum",            hint: "Very quiet, good for a clean pickup.", lat: 59.2870, lng: 18.0330 },

  sickla:       { name: "Sickla köpkvarter",           hint: "Sickla industriväg, by the Uttern entrance.", lat: 59.3080, lng: 18.1250 },
  nackaforum:   { name: "Nacka Forum",                 hint: "Mall taxi drop-off, Vikdalsvägen.", lat: 59.3100, lng: 18.1640 },
  henriksdal:   { name: "Henriksdal",                  hint: "Kvarnholmsvägen side.", lat: 59.3090, lng: 18.1080 },

  skarpnack:    { name: "Skarpnäcks centrum",          hint: "Skarpnäcks allé, by the T-bana.", lat: 59.2670, lng: 18.1300 },
  bagarmossen:  { name: "Bagarmossens centrum",        hint: "Byälvsvägen.", lat: 59.2740, lng: 18.1290 },
  karrtorp:     { name: "Kärrtorps centrum",           hint: "Kärrtorpsvägen.", lat: 59.2830, lng: 18.1200 },

  hammarby:     { name: "Hammarby Sjöstad — Lumaparken", hint: "Hammarby allé, wide kerb, easy pin.", lat: 59.3040, lng: 18.1000 },
  sicklakaj:    { name: "Sickla Kaj",                  hint: "Waterfront, 600 m from Lumaparken.", lat: 59.3050, lng: 18.0940 },

  bredang:      { name: "Bredängs centrum",            hint: "Bredängs allé, outside the T-bana.", lat: 59.2940, lng: 17.9270 },
  satra:        { name: "Sätra centrum",               hint: "Sätra torg, T-bana entrance.", lat: 59.2830, lng: 17.9200 },
  skarholmen:   { name: "Skärholmens centrum",         hint: "Mall taxi bay, Bodholmsplan.", lat: 59.2760, lng: 17.9070 },
  malarhojden:  { name: "Mälarhöjdens T-bana",         hint: "Slättgårdsvägen.", lat: 59.2985, lng: 17.9530 },

  alvsjo:       { name: "Älvsjö station",              hint: "Johan Skyttes väg, station forecourt. Pendeltåg here.", lat: 59.2790, lng: 18.0100 },
  solberga:     { name: "Solberga",                    hint: "Klippgatan / Folkparksvägen.", lat: 59.2830, lng: 17.9950 },
  orby:         { name: "Örby / Sockenvägen",          hint: "Quiet residential.", lat: 59.2700, lng: 18.0250 },

  telefonplan:  { name: "Telefonplan",                 hint: "LM Ericssons väg, outside Konstfack.", lat: 59.2975, lng: 17.9970 },
  midsommarkr:  { name: "Midsommarkransen",            hint: "Tellusborgsvägen, by the T-bana.", lat: 59.3010, lng: 18.0100 },

  globen:       { name: "Slakthusområdet / Globen",    hint: "Arenavägen, outside Avicii Arena.", lat: 59.2934, lng: 18.0810 },
  gullmarsplan: { name: "Gullmarsplan",                hint: "Busy hub — use only as a backup.", lat: 59.2985, lng: 18.0805 },
  enskedegard:  { name: "Enskede gård",                hint: "Palmfeltsvägen, quiet.", lat: 59.2870, lng: 18.0680 }
};

/* ---------------- The 14 legs ----------------
   Chain design: every leg starts where the previous one ended.
   Legs 1–10 are app rides (Uber ×5, Bolt ×5) and form a closed
   sub-chain ending at Älvsjö. Legs 11–14 are the traditional
   companies and start at Älvsjö. So if the Carboline app is not
   live yet, you just run 1–10 today and 11–14 tomorrow — nothing
   breaks.

   BACKUPS converge by construction:
     B1 = same drop, different pickup (walk 300–900 m). Chain unaffected.
     B2 = same district, alternate drop point. Next leg's pickup has
          the same alternate, so the chain re-converges immediately.
   Only B3 (hold/reorder) ever touches the itinerary. */
const LEGS = [
  { n: 1,  co: "Uber", pickup: P.liljeholmen, drop: P.bandhagen,
    altPickup: P.arstadal, altDrop: P.hogdalen,
    note: "Warm-up ride. Out via Årstafältet and Sockenvägen — street route, steady lights, good talking pace. Högdalen as the backup drop adds about a kilometre if you need more time." },

  { n: 2,  co: "Bolt", pickup: P.bandhagen, drop: P.fruangen,
    altPickup: P.hogdalen, altDrop: P.vastertorp,
    note: "Straight west along Örbyleden and Vantörsvägen. No motorway, no cordon." },

  { n: 3,  co: "Uber", pickup: P.fruangen, drop: P.arsta,
    altPickup: P.vastertorp, altDrop: P.arstaberg,
    note: "Via Hägerstensvägen + Årstalänken. Reliable ~16 min." },

  { n: 4,  co: "Bolt", pickup: P.arsta, drop: P.sickla,
    altPickup: P.arstaberg, altDrop: P.henriksdal,
    note: "Skirts the south side of the city, outside the cordon. Drivers often take Södra Länken here — it's a fast tunnel, so if the ETA comes back under 12 min, start from Årstaberg instead (B1) to buy back a kilometre." },

  { n: 5,  co: "Uber", pickup: P.sickla, drop: P.skarpnack,
    altPickup: P.henriksdal, altDrop: P.bagarmossen,
    note: "Via Värmdöleden and Sockenvägen. Watch for a fast motorway route — if the ETA is under 12 min, use the alt drop." },

  { n: 6,  co: "Bolt", pickup: P.skarpnack, drop: P.hammarby,
    altPickup: P.bagarmossen, altDrop: P.sicklakaj,
    note: "Back north-west through Björkhagen. Nice steady arterial." },

  { n: 7,  co: "Uber", pickup: P.hammarby, drop: P.bandhagen,
    altPickup: P.sicklakaj, altDrop: P.stureby,
    note: "Cuts across Enskede. Good length, and both ends are low-surge residential — a reliable one to fall back on." },

  { n: 8,  co: "Bolt", pickup: P.bandhagen, drop: P.grondal,
    altPickup: P.stureby, altDrop: P.liljeholmen,
    note: "Longest of the app legs (~7 km). If the quote is high, drop at Liljeholmstorget instead — leg 9's alt pickup is the same." },

  { n: 9,  co: "Uber", pickup: P.grondal, drop: P.bredang,
    altPickup: P.liljeholmen, altDrop: P.satra,
    note: "West along Hägerstensvägen. Avoid an E4 route — ask for the street route if the driver offers." },

  { n: 10, co: "Bolt", pickup: P.bredang, drop: P.alvsjo,
    altPickup: P.satra, altDrop: P.solberga,
    note: "Last app ride. Ends at Älvsjö station — pendeltåg home, and tomorrow starts here." },

  { n: 11, co: "Taxi Stockholm", pickup: P.alvsjo, drop: P.satra,
    altPickup: P.solberga, altDrop: P.bredang,
    note: "First traditional ride. Use the app's FIXED PRICE option if offered — that removes all traffic risk." },

  { n: 12, co: "Taxi Stockholm", pickup: P.satra, drop: P.telefonplan,
    altPickup: P.bredang, altDrop: P.midsommarkr,
    note: "Careful here: Midsommarkransen is FURTHER than Telefonplan, so B2 makes this ride dearer, not cheaper. If the fixed price is over 310 kr, use B1 — start from Bredäng and it drops to roughly 250 kr." },

  { n: 13, co: "Taxi Kurir", pickup: P.telefonplan, drop: P.globen,
    altPickup: P.midsommarkr, altDrop: P.enskedegard,
    note: "Check for an event at Avicii Arena / Tele2 Arena today. If there is one, drop at Enskede gård instead." },

  { n: 14, co: "Sverigetaxi", pickup: P.globen, drop: P.grondal,
    altPickup: P.enskedegard, altDrop: P.liljeholmen,
    note: "Closing leg, back west. Ends at Liljeholmen/Gröndal — done." }
];

/* ---------------- Scripts ----------------
   Cards are independent on purpose. Reorder the "In the cab" and
   "Questions" blocks freely with the arrows — the pre-ride block is
   the only one with a fixed order. */

const SCRIPT_PRERIDE = [
  {
    id: "pr-open",
    tag: "SAY THIS FIRST",
    title: "At the window — 15 seconds, before you get in",
    tone: "Friendly, quick, slightly apologetic for holding them up. Stand at the open door or front window. Do NOT sit down yet.",
    big: "Hej! Quick thing before we go — I'm doing a paid research project about drivers here in Stockholm. If you're happy to answer some questions during the ride, I'll add a 100 kr tip in the app as a thank you. Is that okay?",
    why: "Ask and reward land in one breath, so there's nothing to weigh up. \"Is that okay?\" is a small yes, not a commitment. Standing outside means a no costs you 10 seconds instead of a whole ride."
  },
  {
    id: "pr-yes",
    tag: "IF YES",
    title: "They say yes",
    tone: "Warm, get moving straight away — don't over-thank.",
    big: "Perfect, thank you! I'll put the tip in at the end, I promise.",
    why: "Naming when the tip happens removes the one doubt they have. Then get in and let them drive."
  },
  {
    id: "pr-what",
    tag: "IF THEY ASK",
    title: "\"What is it about?\"",
    tone: "Plain and concrete. Don't say the word survey twice.",
    big: "It's about what drivers actually want from a job — pay, hours, how companies treat you. There's a company looking at starting up here in Sweden, and they want to hear from real drivers before they do anything. Nothing gets recorded, no names unless you want to give one. Ten, fifteen minutes, and you can skip anything.",
    why: "\"Before they do anything\" makes them early, not surveyed. Naming the limits up front (no recording, no names, skippable) is what actually converts the cautious ones."
  },
  {
    id: "pr-hesitant",
    tag: "IF UNSURE",
    title: "\"I have to concentrate\" / \"I don't have time\"",
    tone: "Reassuring, and shrink the ask.",
    big: "Totally fine — it's just talking while you drive, nothing to write or fill in. And the moment you need to focus on the road, I shut up. If we only get through half of it, that's fine too.",
    why: "Their real objection is workload and safety, not the topic. Take both away and most people say yes."
  },
  {
    id: "pr-no",
    tag: "IF NO",
    title: "They decline — the hard one",
    tone: "Light, fast, zero guilt on either side. Do not persuade. Do not ask twice.",
    big: "No problem at all, thanks for being straight with me. I should be honest — the ride is part of the project, so I'll cancel this one so you're free for the next job right away. Sorry for the trouble, have a good one!",
    why: "You cancel, not them — so it isn't a rejection they have to absorb. \"Free for the next job\" reframes it as you handing their time back. Cancel in the app while you say it, then step back from the car."
  },
  {
    id: "pr-push",
    tag: "IF PUSHBACK",
    title: "\"I drove all this way\" / \"You have to pay\"",
    tone: "Immediately concede. You are never going to win this and you shouldn't try.",
    big: "You're right, that's not fair on you — let's just do the ride, no questions, no problem.",
    why: "Take the ride, pay normally, no survey. Then message the coordinator afterwards. Standing instruction from the team: do not argue with drivers."
  },
  {
    id: "pr-swedish",
    tag: "SWEDISH",
    title: "If they'd rather speak Swedish",
    tone: "Rough working version — swap in the official Swedish script when it lands.",
    big: "Hej! Innan vi åker — jag gör en undersökning om förare i Stockholm. Om du vill svara på några frågor under resan lägger jag till 100 kr i dricks i appen. Är det okej?\n\n· Det är helt frivilligt — du kan hoppa över vilken fråga som helst.\n· Ingen fara, tack ändå! (if they decline)",
    why: "If they switch to Swedish, use the Swedish form. The team wants to know which language drivers prefer — that's part of the data."
  }
];

const SCRIPT_INCAB = [
  {
    id: "ic-seat",
    tag: "FIRST 20 SEC",
    title: "Get in the front if you can",
    tone: "Ask, don't assume.",
    big: "Is it okay if I sit in the front? Much easier to talk.",
    why: "A back-seat interview through a headrest gets you short answers. The front seat roughly doubles how much people say."
  },
  {
    id: "ic-warm",
    tag: "WARM-UP",
    title: "Thirty seconds of nothing important",
    tone: "Genuinely casual. Let them settle.",
    big: "Busy today? … How long have you been driving?",
    why: "Two throwaway questions that are also real data. Never open cold with question one."
  },
  {
    id: "ic-frame",
    tag: "BRIDGE",
    title: "Set the shape of the next 15 minutes",
    tone: "Light, businesslike, then get out of the way.",
    big: "So — a few quick ones first, then a couple where I just want your opinion. Stop me any time you need the road. Nothing's recorded and there's no right answer, I just want what you actually think.",
    why: "People answer better when they know how long it lasts and that it ends. \"No right answer\" is what stops them guessing what you want to hear."
  },
  {
    id: "ic-preframe",
    tag: "DO NOT SKIP",
    title: "Pre-frame the contact ask — early",
    tone: "Throwaway tone. One sentence, then move straight on.",
    big: "Oh and at the very end I'll ask if you want your details passed on to the company — completely up to you either way.",
    why: "This is the single highest-value line in the whole script. Flagging it now means the ask at the end isn't a surprise, and surprise is what makes people say no reflexively. Say it once, casually, then never mention it again until the close."
  },
  {
    id: "ic-transition",
    tag: "TRANSITIONS",
    title: "Moving between sections",
    tone: "Keep momentum. Don't announce every question.",
    big: "· Okay, next few are about pay…\n· Right, changing tack a bit…\n· Last few, then I'll leave you alone.\n· That's really useful, thanks.",
    why: "Signposting keeps them oriented so they don't wonder how much is left. \"Last few\" buys you real attention for the questions that matter most."
  },
  {
    id: "ic-repair",
    tag: "REPAIR",
    title: "When it goes sideways",
    tone: "Never correct them, never argue, never lead.",
    big: "· They don't understand the question → \"Sorry, that was a badly worded question. What I mean is…\" (take the blame, then use plain words)\n· One-word answers → \"How come?\" or just stay quiet for three seconds.\n· They ramble → \"That's interesting — can I bring you back to…\"\n· They get suspicious → \"Fair enough. Honestly, it's just research. Skip it and we'll move on.\"\n· They ask what you think → \"I genuinely don't know, I'm just collecting this. What do you reckon?\"",
    why: "\"That was a badly worded question\" is the most useful sentence in interviewing — it protects them from feeling stupid, which is the main reason people shut down."
  },
  {
    id: "ic-safety",
    tag: "SAFETY",
    title: "Traffic, roundabouts, navigation",
    tone: "Stop talking mid-sentence if you have to.",
    big: "Take your time — I'll wait.",
    why: "Explicit team rule: no questions while they're handling something. It also builds more trust than anything you could say."
  },
  {
    id: "ic-wrap",
    tag: "2 MIN OUT",
    title: "Wrap up while still moving",
    tone: "Signal the end so the close doesn't feel rushed.",
    big: "That's everything on my list — thank you, that was genuinely useful. Anything you'd want a new company to know that I didn't ask about?",
    why: "That last open question is where the best quotes come from, every single time. It also warms them up right before the contact ask."
  }
];

const SCRIPT_CLOSE = [
  {
    id: "cl-tip",
    tag: "DO THIS FIRST",
    title: "Add the tip BEFORE you ask for details",
    tone: "Show them the screen if it's natural.",
    big: "Right, tip's gone in — thanks a lot for doing this.",
    why: "You promised it, so deliver it visibly and early. Doing it before the ask means you're not dangling it, and the goodwill is already banked when the ask lands."
  },
  {
    id: "cl-ask",
    tag: "THE ASK",
    title: "Contact details — the main version",
    tone: "Relaxed, slightly under-sold. Give them the exit before they need it.",
    big: "Last thing. The company I'm doing this for is planning to launch here and they'll be looking for drivers. I can't promise anything and I'm not recruiting — but they asked me to pass on details for anyone who wants to hear from them first. Costs you nothing, you're not signing up to anything, and if they call and it's not for you, you just say no. Want me to put your name down?",
    why: "Four levers in one paragraph: early access (\"first\"), honesty (\"I can't promise anything\" — this is what makes the rest believable), zero risk (\"not signing up\"), and a pre-approved exit (\"you just say no\"). The exit is what removes the fear of being trapped on a call list."
  },
  {
    id: "cl-callback",
    tag: "STRONGEST VERSION",
    title: "If they complained about anything during the ride",
    tone: "Call back to their exact words. This converts far better than the generic version.",
    big: "You said the commission takes too much / the hours are brutal / nobody listens to drivers — that's exactly the kind of thing they're trying to get right. Want to be on the list so you hear about it first?",
    why: "Use whatever they actually complained about, in their words. You're no longer asking for a favour, you're offering a route to the thing they just told you they want. Listen for one gripe during the ride and save it for here."
  },
  {
    id: "cl-yes",
    tag: "IF YES",
    title: "Capture it properly",
    tone: "Careful and deliberate — it makes the whole thing feel legitimate.",
    big: "Great — first name, and the best number? … Let me read that back: [name], [number]. Right?\n\nAnd it only goes to the team on this project, nothing else. If they get in touch and you've changed your mind, just tell them to delete it.",
    why: "Reading it back stops typos that cost you the bonus. The line about deletion is honest, takes three seconds, and reassures the ones who half-regret saying yes — those are the ones who otherwise give a wrong digit."
  },
  {
    id: "cl-soft",
    tag: "IF HESITANT",
    title: "One softer option — then stop",
    tone: "Offer, don't push. Once only.",
    big: "Or if you'd rather — just a number without your name, or an email. Whatever you're comfortable with.",
    why: "Email counts as a lead too. Lowering the format is allowed; asking again is not. If this doesn't land, drop it immediately."
  },
  {
    id: "cl-no",
    tag: "IF NO",
    title: "Take the no cleanly",
    tone: "Genuinely unbothered. Stay warm — people sometimes change their mind at the kerb.",
    big: "No problem at all. Thanks a lot for your time, this was really helpful — have a good day out there.",
    why: "Never ask twice. But a warm no often turns into \"actually, go on then\" as you're getting out, so don't go cold on them."
  },
  {
    id: "cl-after",
    tag: "AFTER",
    title: "Before you start walking",
    tone: "—",
    big: "1. Tip actually sent? Check.\n2. Fill the form NOW, standing on the pavement. Not later.\n3. Log the fare, the driver's name/number and which company they drive for.\n4. Rate the driver 5 stars.",
    why: "Batching forms at the end of the day is how details get mixed up between rides — and the 150 kr bonus depends on matching the right name to the right survey."
  }
];

/* Field notes — the "what to avoid" briefing */
const NOTES = [
  {
    h: "Rush hours to avoid",
    b: "<b>07:15–09:15</b> and <b>15:30–18:15</b> on weekdays. Both apps surge, and worse, a 6 km ride can take 30 minutes — which pushes the fare well past 150 kr because you're paying per minute too.<br><br>Best windows: <b>09:45–11:30</b>, <b>12:30–15:00</b>, and <b>after 19:00</b>. The plan is built around these."
  },
  {
    h: "The congestion charge is the hidden cost",
    b: "Stockholm's trängselskatt cordon rings the inner city — Norrmalm, Östermalm, Vasastan, Kungsholmen, Södermalm, Djurgården. It's charged <b>weekdays 06:30–18:29</b>, up to 45 kr per crossing, and it gets passed on to your fare.<br><br>Driving <i>within</i> the zone is free, and driving entirely <i>outside</i> it is free. The expensive thing is crossing in or out.<br><br><b>Every leg in this plan stays entirely outside the cordon.</b> That alone is worth 20–45 kr a ride. If you improvise a leg, keep both ends on the same side of the line."
  },
  {
    h: "\"Too central\" — why it's a problem",
    b: "T-Centralen, Sergels torg, Drottninggatan, Gamla Stan, Slussen. Four separate issues stack up there:<br><br>· Highest surge in the city, all day<br>· Pedestrian streets and roadworks mean the pin is often unreachable — the driver circles, then cancels<br>· Stop-start traffic inflates the per-minute charge<br>· You'd cross the cordon on almost any route out<br><br>The whole plan sits in the ring of inner suburbs 4–9 km out, where cars are plentiful but none of this applies."
  },
  {
    h: "Counter-intuitive: you WANT some traffic",
    b: "You need 15+ minutes in the car. A 7 km run down Nynäsvägen or the E4 takes nine minutes and you lose the interview.<br><br>So prefer <b>arterial streets with traffic lights</b> over motorway routes. Every leg here is designed for a street route at roughly 23 km/h. If the app's ETA comes back under 12 minutes, use the alternate drop point to lengthen it, or ask the driver to take the local road."
  },
  {
    h: "Things that spike prices without warning",
    b: "· <b>Rain.</b> Check the forecast in the morning — heavy rain surges the whole city.<br>· <b>Events</b> at Avicii Arena, Tele2 Arena (both at Globen — leg 13/14) and Friends Arena. Check before those legs.<br>· <b>Airport corridors.</b> Never route anything towards Arlanda or Bromma; fixed high pricing.<br>· <b>Essingeleden</b> carries its own charge on top of the cordon."
  },
  {
    h: "If the quote is out of band — decision order",
    b: "<b>1. Change pickup (B1).</b> Walk 300–900 m to the alternate pickup. Surge is very local; this fixes it more often than anything else. Chain unaffected.<br><br><b>2. Change drop (B2).</b> Use the alternate drop point. It's in the same district, and the <i>next</i> leg lists that same point as its alternate pickup — so you re-converge immediately.<br><br><b>3. Wait 8–10 minutes.</b> Surge multipliers decay fast.<br><br><b>4. Switch operator.</b> Uber and Bolt rarely surge together. Swap this leg with the next one's operator and swap back later — you still end on 5/5.<br><br>Only if all four fail: reorder legs, and tell the coordinator."
  },
  {
    h: "Cancellations — protect yourself",
    b: "You've been told cancellations won't be charged, but log everything anyway: screenshot the cancellation screen, note the time and which leg. If a driver pushes back, take the ride and call the coordinator — do not argue.<br><br>Also worth knowing: repeated cancellations can flag an account. If a fourth or fifth cancellation comes up, message the coordinator before it becomes a problem."
  },
  {
    h: "Two things to ask the coordinator tonight",
    b: "<b>1. Tipping on the traditional apps.</b> Uber and Bolt both have in-app tipping. Taxi Stockholm / Kurir / Sverigetaxi via Carboline may not — so how do you deliver the promised 100 kr on legs 11–14? Cash, or added to the card payment? Ask before tomorrow, because you'll have promised it out loud.<br><br>· <b>2. \"Student\" vs \"researcher\".</b> The do's list says introduce yourself as a student doing a school project, but the actual script says you're a researcher working with a company entering the market — and the closing <i>needs</i> the company to exist so you can offer to pass on details. These contradict each other. This kit uses the researcher version, because it's true and because the student version makes the lead-collection close impossible. Worth confirming."
  },
  {
    h: "Hard rules from the brief",
    b: "· <b>Never name the company.</b> \"A company preparing to enter the Swedish market\" is all they get.<br>· Explain the project <i>before</i> mentioning the 100 kr.<br>· Never ask a declining driver twice.<br>· No recording of audio, video or photos.<br>· Never promise a job or any benefit.<br>· Stop the moment they seem uncomfortable.<br>· All 14 surveys submitted by <b>Wednesday 09:00</b>."
  },
  {
    h: "Realistic timing",
    b: "Per ride: ~17 min in the car + ~7 min waiting for pickup + ~4 min filling the form + walking = <b>roughly 30 minutes</b>.<br><br>10 app rides ≈ 5 hours. 4 traditional rides ≈ 2 hours.<br><br>Suggested: <b>Monday</b> 09:45–12:15 (legs 1–5), break, 12:45–15:15 (legs 6–10). <b>Tuesday</b> 09:45–12:00 (legs 11–14). That keeps you clear of both rush hours with slack to spare."
  }
];
