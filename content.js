/* Scripts (EN + SV), briefing notes, do's and don'ts, and a plain-English
   guide to what every survey question is actually digging for. */

/* ================= SCRIPTS =================
   sv is a working translation, not the client's official Swedish
   wording — swap it out if they send one. */

const SCRIPT_PRE = [
  { id:"pr-open", tag:"SAY THIS FIRST", title:"At the window — 15 seconds, before you get in",
    tone:"Friendly, quick, slightly apologetic for holding them up. Stand at the open door. Do NOT sit down yet.",
    en:"Hej! Quick thing before we go — I'm doing a paid research project about drivers here in Stockholm. If you're happy to answer some questions during the ride, I'll add a 100 kr tip in the app as a thank you. Is that okay?",
    sv:"Hej! En snabb grej innan vi åker — jag gör ett betalt researchprojekt om förare här i Stockholm. Om du vill svara på några frågor under resan lägger jag till 100 kr i dricks i appen som tack. Är det okej?",
    why:"Ask and reward land in one breath, so there's nothing to weigh up. \"Is that okay?\" is a small yes, not a commitment. Standing outside means a no costs you ten seconds instead of a whole ride." },

  { id:"pr-yes", tag:"IF YES", title:"They say yes",
    tone:"Warm, get moving straight away — don't over-thank.",
    en:"Perfect, thank you! I'll put the tip in at the end, I promise.",
    sv:"Perfekt, tack så mycket! Jag lägger in dricksen på slutet, jag lovar.",
    why:"Naming when the tip happens removes the one doubt they have. Then get in and let them drive." },

  { id:"pr-what", tag:"IF THEY ASK", title:"\"What is it about?\"",
    tone:"Plain and concrete. Never name the company.",
    en:"It's about what drivers actually want from a job — pay, hours, how companies treat you. There's a company looking at starting up here in Sweden, and they want to hear from real drivers before they do anything. Nothing gets recorded, no names unless you want to give one. Ten, fifteen minutes, and you can skip anything.",
    sv:"Det handlar om vad förare faktiskt vill ha av ett jobb — lön, arbetstider, hur bolagen behandlar en. Det finns ett företag som funderar på att starta här i Sverige, och de vill höra från riktiga förare innan de gör något. Inget spelas in, inga namn om du inte själv vill lämna det. Tio, femton minuter, och du kan hoppa över vad som helst.",
    why:"\"Before they do anything\" makes them early, not surveyed. Naming the limits up front — no recording, no names, skippable — is what converts the cautious ones." },

  { id:"pr-hesitant", tag:"IF UNSURE", title:"\"I have to concentrate\" / \"I don't have time\"",
    tone:"Reassuring, and shrink the ask.",
    en:"Totally fine — it's just talking while you drive, nothing to write or fill in. And the moment you need to focus on the road, I shut up. If we only get through half of it, that's fine too.",
    sv:"Det är lugnt — det är bara att prata medan du kör, inget att fylla i. Och så fort du behöver fokusera på trafiken så tystnar jag. Hinner vi bara halva är det också helt okej.",
    why:"Their real objection is workload and safety, not the topic. Take both away and most people say yes." },

  { id:"pr-no", tag:"IF NO", title:"They decline — the hard one",
    tone:"Light, fast, zero guilt on either side. Do not persuade. Do not ask twice.",
    en:"No problem at all, thanks for being straight with me. I should be honest — the ride is part of the project, so I'll cancel this one so you're free for the next job right away. Sorry for the trouble, have a good one!",
    sv:"Ingen fara alls, tack för att du är ärlig. Jag ska vara ärlig tillbaka — resan är en del av projektet, så jag avbokar den här så att du är fri för nästa körning direkt. Ledsen för besväret, ha en bra dag!",
    why:"You cancel, not them, so it isn't a rejection they have to absorb. \"Free for the next job\" reframes it as handing their time back. Cancel in the app while you say it, then step back from the car." },

  { id:"pr-push", tag:"IF PUSHBACK", title:"\"I drove all this way\" / \"You have to pay\"",
    tone:"Concede immediately. You will not win this and you should not try.",
    en:"You're right, that's not fair on you — let's just do the ride, no questions, no problem.",
    sv:"Du har rätt, det är inte schyst mot dig — vi kör bara, inga frågor, ingen fara.",
    why:"Take the ride, pay normally, no survey. Then message the coordinator. Standing instruction from the team: do not argue with drivers." }
];

const SCRIPT_CAB = [
  { id:"ic-seat", tag:"FIRST 20 SEC", title:"Get in the front if you can",
    tone:"Ask, don't assume.",
    en:"Is it okay if I sit in the front? Much easier to talk.",
    sv:"Är det okej om jag sitter fram? Det är mycket lättare att prata.",
    why:"A back-seat interview through a headrest gets you short answers. The front seat roughly doubles how much people say." },

  { id:"ic-warm", tag:"WARM-UP", title:"Thirty seconds of nothing important",
    tone:"Genuinely casual. Let them settle.",
    en:"Busy today? … How long have you been driving?",
    sv:"Mycket att göra idag? … Hur länge har du kört?",
    why:"Two throwaway questions that are also questions 1 and 2 on the form. Never open cold." },

  { id:"ic-frame", tag:"BRIDGE", title:"Set the shape of the next 15 minutes",
    tone:"Light, businesslike, then get out of the way.",
    en:"So — a few quick ones first, then a couple where I just want your opinion. Stop me any time you need the road. Nothing's recorded and there's no right answer, I just want what you actually think.",
    sv:"Så — några snabba först, sen ett par där jag bara vill höra vad du tycker. Avbryt mig när du behöver kolla trafiken. Inget spelas in och det finns inga rätt eller fel svar, jag vill bara veta vad du faktiskt tycker.",
    why:"People answer better when they know how long it lasts and that it ends. \"No right answer\" stops them guessing what you want to hear." },

  { id:"ic-preframe", tag:"DO NOT SKIP", title:"Pre-frame the contact ask — early",
    tone:"Throwaway tone. One sentence, then move straight on.",
    en:"Oh and at the very end I'll ask if you want your details passed on to the company — completely up to you either way.",
    sv:"Och på slutet frågar jag om du vill att jag skickar vidare dina uppgifter till företaget — helt upp till dig.",
    why:"The single highest-value line in the script. Flagging it now means the ask at the end isn't a surprise, and surprise is what makes people refuse reflexively. Say it once, then don't mention it again until the close." },

  { id:"ic-transition", tag:"TRANSITIONS", title:"Moving between sections",
    tone:"Keep momentum. Don't announce every question.",
    en:"· Okay, next few are about pay…\n· Right, changing tack a bit…\n· Last few, then I'll leave you alone.\n· That's really useful, thanks.",
    sv:"· Okej, nästa par handlar om lön…\n· Vi byter spår lite…\n· Sista frågorna, sen lämnar jag dig i fred.\n· Det där var verkligen användbart, tack.",
    why:"Signposting keeps them oriented so they don't wonder how much is left. \"Last few\" buys real attention for the questions that matter most." },

  { id:"ic-repair", tag:"REPAIR", title:"When it goes sideways",
    tone:"Never correct them, never argue, never lead.",
    en:"· They don't understand → \"Sorry, that was a badly worded question. What I mean is…\"\n· One-word answers → \"How come?\" or just stay quiet for three seconds.\n· They ramble → \"That's interesting — can I bring you back to…\"\n· They get suspicious → \"Fair enough. Honestly, it's just research. Skip it and we'll move on.\"\n· They ask what you think → \"I genuinely don't know, I'm just collecting this. What do you reckon?\"",
    sv:"· De förstår inte → \"Ursäkta, det var en dåligt formulerad fråga. Det jag menar är…\"\n· Enstaviga svar → \"Hur kommer det sig?\" eller var bara tyst i tre sekunder.\n· De pratar på → \"Intressant — får jag bara ta dig tillbaka till…\"\n· De blir misstänksamma → \"Helt förståeligt. Ärligt talat är det bara research. Vi hoppar över den.\"\n· De frågar vad du tycker → \"Jag vet faktiskt inte, jag bara samlar in det här. Vad tror du?\"",
    why:"\"That was a badly worded question\" is the most useful sentence in interviewing — it protects them from feeling stupid, which is the main reason people shut down." },

  { id:"ic-safety", tag:"SAFETY", title:"Traffic, roundabouts, navigation",
    tone:"Stop talking mid-sentence if you have to.",
    en:"Take your time — I'll wait.",
    sv:"Ta den tid du behöver — jag väntar.",
    why:"Explicit team rule: no questions while they're handling something. It also builds more trust than anything you could say." },

  { id:"ic-wrap", tag:"2 MIN OUT", title:"Wrap up while still moving",
    tone:"Signal the end so the close doesn't feel rushed.",
    en:"That's everything on my list — thank you, that was genuinely useful. Anything you'd want a new company to know that I didn't ask about?",
    sv:"Det var allt på min lista — tack, det där var verkligen värdefullt. Något du skulle vilja att ett nytt bolag visste, som jag inte frågade om?",
    why:"That last open question is where the best quotes come from, every time. It also warms them up right before the contact ask." }
];

const SCRIPT_CLOSE = [
  { id:"cl-tip", tag:"DO THIS FIRST", title:"Add the tip BEFORE you ask for details",
    tone:"Show them the screen if it's natural.",
    en:"Right, tip's gone in — thanks a lot for doing this.",
    sv:"Så, dricksen är inlagd — tack så mycket för att du ställde upp.",
    why:"You promised it, so deliver it visibly and early. Doing it before the ask means you're not dangling it, and the goodwill is banked when the ask lands." },

  { id:"cl-ask", tag:"THE ASK", title:"Contact details — the main version",
    tone:"Relaxed, slightly under-sold. Give them the exit before they need it.",
    en:"Last thing. The company I'm doing this for is planning to launch here and they'll be looking for drivers. I can't promise anything and I'm not recruiting — but they asked me to pass on details for anyone who wants to hear from them first. Costs you nothing, you're not signing up to anything, and if they call and it's not for you, you just say no. Want me to put your name down?",
    sv:"En sista sak. Företaget jag gör det här för planerar att starta här och kommer att behöva förare. Jag kan inte lova något och jag rekryterar inte — men de bad mig skicka vidare uppgifter på dem som vill höra från dem först. Det kostar dig ingenting, du binder dig inte till något, och om de ringer och det inte passar så säger du bara nej. Vill du att jag skriver upp dig?",
    why:"Four levers in one paragraph: early access (\"first\"), honesty (\"I can't promise anything\" — this is what makes the rest believable), zero risk, and a pre-approved exit. The exit removes the fear of ending up on a call list." },

  { id:"cl-callback", tag:"STRONGEST VERSION", title:"If they complained about anything during the ride",
    tone:"Call back to their exact words. Converts far better than the generic version.",
    en:"You said the commission takes too much / the hours are brutal / nobody listens to drivers — that's exactly the kind of thing they're trying to get right. Want to be on the list so you hear about it first?",
    sv:"Du sa att provisionen tar för mycket / att tiderna är tuffa / att ingen lyssnar på förarna — det är precis sånt de försöker göra annorlunda. Vill du stå med på listan så du hör om det först?",
    why:"Use whatever they actually complained about, in their words. You stop asking a favour and start offering the thing they just told you they want. Listen for one gripe during the ride and save it for here." },

  { id:"cl-yes", tag:"IF YES", title:"Capture it properly",
    tone:"Careful and deliberate — it makes the whole thing feel legitimate.",
    en:"Great — first name, and the best number? … Let me read that back: [name], [number]. Right?\n\nAnd it only goes to the team on this project, nothing else. If they get in touch and you've changed your mind, just tell them to delete it.",
    sv:"Toppen — förnamn, och bästa numret? … Jag läser upp det: [namn], [nummer]. Stämmer det?\n\nOch det går bara till teamet i det här projektet, inget annat. Ändrar du dig, säg bara åt dem att radera det.",
    why:"Reading it back stops typos that cost you the bonus. The line about deletion is honest, takes three seconds, and reassures the ones who half-regret saying yes — otherwise they give you a wrong digit." },

  { id:"cl-soft", tag:"IF HESITANT", title:"One softer option — then stop",
    tone:"Offer, don't push. Once only.",
    en:"Or if you'd rather — just a number without your name, or an email. Whatever you're comfortable with.",
    sv:"Eller om du hellre vill — bara ett nummer utan namn, eller en mejladress. Vad du är bekväm med.",
    why:"Email counts as a lead too. Lowering the format is allowed; asking again is not. If this doesn't land, drop it immediately." },

  { id:"cl-no", tag:"IF NO", title:"Take the no cleanly",
    tone:"Genuinely unbothered. Stay warm — people change their mind at the kerb.",
    en:"No problem at all. Thanks a lot for your time, this was really helpful — have a good day out there.",
    sv:"Ingen fara alls. Tack så mycket för din tid, det här var verkligen till hjälp — ha en bra dag där ute.",
    why:"Never ask twice. But a warm no often turns into \"actually, go on then\" as you're getting out, so don't go cold on them." },

  { id:"cl-after", tag:"AFTER", title:"Before you start walking",
    tone:"—",
    en:"1. Tip actually sent? Check.\n2. Fill the form NOW, standing on the pavement. Not later.\n3. Log the fare and the driver's details in this app.\n4. Rate the driver 5 stars.",
    sv:"1. Dricksen skickad? Kolla.\n2. Fyll i formuläret NU, stående på trottoaren. Inte sen.\n3. Logga priset och förarens uppgifter i appen.\n4. Ge föraren 5 stjärnor.",
    why:"Batching forms at the end of the day is how details get mixed up between rides — and the 150 kr bonus depends on matching the right name to the right survey." }
];

/* ================= DO'S AND DON'TS ================= */
const DOS = [
  "Introduce yourself politely and explain the purpose before asking anything.",
  "Make it clear that taking part is completely voluntary.",
  "Tell them about the 100 SEK tip — but only after you've explained what this is.",
  "Follow the questionnaire in the order it's written.",
  "Record answers exactly as given, without interpreting or tidying them up.",
  "Stay polite, neutral and professional the whole way through.",
  "Respect their right to skip any question or stop entirely.",
  "Only ask for contact details after clear, voluntary consent.",
  "Thank them for their time whether or not they took part."
];

const DONTS = [
  "Don't pressure, persuade, or ask again once a driver has declined.",
  "Don't offer the 100 SEK tip before you've explained the interview and its purpose.",
  "Don't ask questions while they're dealing with traffic, navigation, or anything safety-critical.",
  "Don't argue with, correct, or judge an answer.",
  "Don't lead them toward a particular response.",
  "Don't record audio, video, photos, or personal details without explicit consent.",
  "Don't share answers or contact details outside the research team.",
  "Don't promise employment, opportunities or benefits — nothing has been confirmed.",
  "Don't continue if they seem uncomfortable or ask you to stop.",
  "Never name the company. \"A company preparing to enter the Swedish market\" is all they get."
];

/* ================= BRIEFING NOTES ================= */
const NOTES = [
  { id:"n-priority", h:"What actually matters, in order",
    b:"<b>1. Fifteen minutes in the car.</b> Everything else bends around this. A ride that finishes in eleven minutes is a wasted ride even if the price was perfect.<br><br><b>2. Around 150 kr</b> (300 kr on the traditional companies). A bit over is fine.<br><br><b>3. Distance — barely matters.</b> Three kilometres in heavy traffic is a better ride than eight on a motorway. Stop thinking in kilometres and think in minutes." },

  { id:"n-speed", h:"Why the three routes have different leg lengths",
    b:"Average traffic speed is what decides how far you must travel to buy fifteen minutes:<br><br>· <b>Central ~16 km/h</b> — 4.5 km lasts 17 minutes and costs about 133 kr<br>· <b>South ~23 km/h</b> — you need about 6.2 km for the same 16 minutes<br>· <b>North ~28 km/h</b> — you need a full 7.2 km, and fares run near 165 kr<br><br>Central is the cheapest way to buy talking time. North is the most expensive and the least forgiving — a quiet road there can finish in thirteen minutes." },

  { id:"n-congestion", h:"The congestion charge, and why \"central\" is not the trap it sounds like",
    b:"Stockholm's trängselskatt cordon rings the inner city. It's charged <b>weekdays 06:30–18:29</b>, up to 45 kr a crossing, and it's passed on to your fare.<br><br>The thing people get wrong: driving <i>within</i> the zone is free, and driving entirely <i>outside</i> it is free. Only <b>crossing the line</b> costs money.<br><br>So the central route — which stays inside the ring the whole time — pays no congestion charge at all, and neither do south or north, which stay outside. What you must never do is improvise a leg that crosses the cordon." },

  { id:"n-toocentral", h:"The bit of the centre to actually avoid",
    b:"T-Centralen, Sergels torg, Drottninggatan, Gamla Stan, Slussen. Not because of the charge — because pickups fail there. Pedestrian streets and the Slussen roadworks mean the pin is often unreachable, the driver circles, and then cancels.<br><br>Every stop on the central route is deliberately just outside that core: Hornstull, Zinkensdamm, Skanstull, Fridhemsplan, Odenplan, Karlaplan, Gärdet. Close enough for slow traffic, far enough for a clean kerb." },

  { id:"n-rush", h:"When to go out",
    b:"Avoid <b>07:15–09:15</b> and <b>15:30–18:15</b>. Not for the traffic — slow traffic helps you — but because both apps surge hard and a 6 km ride can take 35 minutes, which pushes the fare well past the band.<br><br>Best windows: <b>09:45–11:30</b>, <b>12:30–15:00</b>, and <b>after 19:00</b>.<br><br>Rough plan: Monday 09:45–12:15 for legs 1–5, break, 12:45–15:15 for legs 6–10. Tuesday 09:45–12:00 for the four traditional rides." },

  { id:"n-spikes", h:"Things that spike prices without warning",
    b:"· <b>Rain.</b> Check the forecast — heavy rain surges the whole city.<br>· <b>Events</b> at Avicii Arena and Tele2 Arena (both at Globen, south route legs 13–14) and Friends Arena (north route, near Solna).<br>· <b>Airport corridors.</b> Never route toward Arlanda or Bromma airport; fixed high pricing.<br>· <b>Essingeleden</b> carries its own charge on top of the cordon." },

  { id:"n-outofband", h:"If a quote comes back wrong",
    b:"<b>Too expensive?</b> Walk 300–500 m away from where you are and re-quote — surge is very local. Or wait eight minutes; multipliers decay fast. Or switch between Uber and Bolt, which rarely surge together.<br><br><b>ETA too short?</b> This is the one people ignore. Under 13 minutes means you lose the interview. Pick a stop from a different route, or ask the driver to take the surface road instead of the motorway or tunnel.<br><br><b>Still stuck?</b> Switch to a different route variant entirely — all three are self-contained, so you can start any of them from wherever you are." },

  { id:"n-cancel", h:"Cancellations — protect yourself",
    b:"You've been told cancellations won't be charged. Log them anyway: screenshot the cancellation screen and note the time and leg.<br><br>If a driver pushes back, take the ride and call the coordinator. Do not argue — that's a standing instruction.<br><br>Repeated cancellations can also flag an account. If you hit a fourth or fifth, message the coordinator before it becomes a problem." },

  { id:"n-tips", h:"Two things to confirm with the coordinator",
    b:"<b>1. How do you tip on the traditional apps?</b> Uber and Bolt both have in-app tipping. Taxi Stockholm, Taxi Kurir and Sverigetaxi via Carboline may not — and you'll have promised 100 kr out loud before you find out. Cash, or added to the card payment?<br><br><b>2. \"Student\" or \"researcher\"?</b> The do's list says introduce yourself as a student doing a school project. The actual script says you're a researcher working with a company entering the market — and the closing <i>needs</i> that company to exist so you can offer to pass details on. These contradict each other. This kit uses the researcher version, because it's true and because the student version makes the lead collection impossible." },

  { id:"n-q1", h:"One oddity in the form",
    b:"Question 1 asks whether they currently drive in Stockholm, and says to thank them and end the ride if the answer is no. In practice everyone you meet in a moving cab is currently driving, so it should never fire.<br><br>Worth knowing anyway, because the briefing email says they also want people who <i>hold a licence but aren't driving right now</i> — which question 1 would screen out. Not your problem on the day; just don't panic if it comes up." },

  { id:"n-deadline", h:"The deadline",
    b:"All 14 surveys submitted by <b>Wednesday 09:00</b>. Email the coordinator the list of drivers who shared contact details — the Leads section here will format that for you.<br><br>Pay: 150 kr per completed survey, plus 150 kr for every lead. Paid 25 September." }
];

/* ================= QUESTION GUIDE =================
   What each question is really digging for, and how to get more than
   the form asks for. */

const QGUIDE = [
{ sec:"Before anything — what this survey is actually for",
  intro:"Read this once and the rest makes sense. A company is preparing to launch a ride-hailing or taxi operation in Sweden. Before they commit they need four numbers: what it costs to run a driver, what package would make a driver switch, which legal structure to hire under, and where to advertise. Every question below feeds one of those four. Once you can see which one a question serves, you'll know what a good answer looks like — and what to ask next.<br><br><b>Five Swedish words that unlock most of this:</b><br>· <b>Åkeri</b> — a small taxi firm that holds the traffic permit. Most drivers can't legally operate alone, so they either get their own permit or attach to an åkeri and hand over a cut.<br>· <b>Beställningscentral</b> — a dispatch centre. Taxi Stockholm, Taxi Kurir and Sverigetaxi are dispatch centres, <i>not</i> employers. Drivers and åkerier affiliate with them and pay for the jobs they get.<br>· <b>Friåkare</b> — someone driving on their own permit with no dispatch centre at all.<br>· <b>Kollektivavtal</b> — the collective agreement. Sets a wage floor, pension, sick pay and insurance.<br>· <b>Mil</b> — ten kilometres. Swedes quote fares per mil, not per km. If someone says \"120 spänn milen\" they mean 120 kr per 10 km.",
  items:[] },

{ sec:"Q1–Q5 · Who am I actually talking to",
  intro:"Screening plus the platform mix. The company needs to know how many drivers are realistically reachable, and whether drivers stack platforms — because if most run two apps at once, a new entrant doesn't have to win them away from anyone. It just has to become app number three. That's a far cheaper market to enter, and it's probably the single most useful thing these five questions establish.",
  items:[
  { n:"1", q:"Currently driving in Stockholm?", a:"A screening question. Everyone in a moving cab says yes.", probe:"Skip past it quickly — don't make it feel like an eligibility test." },
  { n:"2", q:"How long driving professionally?", a:"Separates the lifers from the newcomers. Their answers to everything later split hard along this line: a twenty-year veteran judges a new company on respect and stability, someone two years in judges it on commission.", probe:"Note the number, then use it: \"So you've seen a few of these companies come and go, then?\" It's the fastest way to get someone talking honestly." },
  { n:"3", q:"Which company or platform?", a:"Market share, but more importantly the frame for everything after. \"Uber\" and \"Taxi Stockholm\" are completely different working lives.", probe:"If they say a traditional company, remember they may be talking about the dispatch centre, not their employer. Their actual boss is often an åkeri you'd never hear about unless you ask." },
  { n:"4", q:"A second platform at the same time?", a:"The big one. If drivers routinely run two apps, market entry is far cheaper — the new company only needs to be worth adding, not worth switching to.", probe:"\"Do you have both running at once, or do you switch depending on the time of day?\" The answer tells them whether drivers cherry-pick by fare." },
  { n:"5", q:"Which second platform?", a:"Which pairs of companies actually coexist in one driver's day.", probe:"Worth asking why that one and not another — the answer is usually about commission or how quickly they get paid." }] },

{ sec:"Q6–Q10 · How they're employed, and what the car costs them",
  intro:"This is the cost-structure block, and it's the most technical part of the survey. Swedish taxi has several stacked arrangements and drivers sit in very different ones. The company is working out which structure to hire under — and how much of a driver's money currently disappears before they see it.",
  items:[
  { n:"6", q:"Current work arrangement?", a:"The four options are genuinely different lives.<br>· <b>Self-employed, no fleet</b> — own permit, keeps everything, carries all the risk.<br>· <b>Self-employed but attached to an åkeri</b> — the most common, and gives away a revenue share.<br>· <b>Employed with kollektivavtal</b> — wage floor, pension, sick pay, insurance.<br>· <b>Employed without</b> — none of that protection.", probe:"Many drivers don't know which box they're in. Ask it plainly: \"Do you get a payslip, or do you invoice?\" That single question sorts employed from self-employed faster than reading the options out." },
  { n:"7", q:"Own or rent the vehicle?", a:"The largest single cost in the job. A driver renting from an åkeri may be paying several thousand kronor a week before earning anything.", probe:"If they rent, ask what it costs per week. It's not on the form, and it's the number that makes \"we provide the car\" either a great offer or a pointless one." },
  { n:"8", q:"Share of revenue kept after the fleet's cut?", a:"Straight to the point — how much the åkeri takes. Combined with Q16 this gives the company the full stack of deductions.", probe:"People get cagey here. Ask it as a comparison instead: \"Is that better or worse than where you were before?\" You'll often get the real number as a by-product." },
  { n:"9", q:"EV, hybrid or petrol/diesel?", a:"The company is almost certainly bringing electric vehicles. This measures how far the market has already moved.", probe:"If they drive an EV, ask about charging — where, how long, whether it eats into their earning hours. That is the number one complaint of EV taxi drivers everywhere and it isn't on the form." },
  { n:"10", q:"Has the environmental zone affected you?", a:"Stockholm restricts which vehicles may drive in parts of the centre, and the rules tighten over time. The company wants to know whether this is already a live business problem — because if it is, \"we give you an EV that can go anywhere\" becomes a recruiting pitch rather than a green talking point.", probe:"Ask for a story rather than a yes/no: \"Has it ever meant you couldn't take a job?\"" }] },

{ sec:"Q11–Q16 · Workload and unit economics",
  intro:"How much work goes in, how much money comes out, and how much of it survives the deductions. The company is building a model of what a driver's week looks like — so it can work out what it would have to pay to beat it.",
  items:[
  { n:"11", q:"Hours and days per week?", a:"Sets up the hourly maths. Expect long answers — 10–12 hour days, 5–6 days a week is normal in this trade.", probe:"Ask whether that's what they want or what they have to do. The gap between the two is where a new company competes." },
  { n:"12", q:"Trips per day?", a:"Combined with Q14 gives daily gross. Also reveals dead time — a driver doing 12 trips in ten hours is spending most of the day waiting.", probe:"\"How much of the day are you actually driving someone?\" Idle time is the industry's real problem and drivers love being asked about it." },
  { n:"13", q:"Share of trips from app / street hail / pre-booked?", a:"How much of their income the platform actually controls. A driver with regular pre-booked customers has independent value; one who's 100% app is entirely dependent — and much easier to recruit.", probe:"If they mention regulars, ask how they built that up. It's a good conversation and it tells the company whether loyalty is even possible in this market." },
  { n:"14", q:"Average fare before deductions?", a:"The gross unit of the business.", probe:"They may quote a range. Take the middle and note the range in your comments." },
  { n:"15", q:"Average trip length, and fare per mil?", a:"Standardises pricing across companies. Remember: <b>a mil is 10 km.</b><br><br>Genuinely useful shortcut — every Swedish taxi must display a <b>jämförpris</b> on a sticker in the window: the price for a standard 10 km, 15 minute trip. You can read the number off the glass while you're sitting there.", probe:"\"Is that your jämförpris on the window?\" Drivers are usually pleased you know what it is, and it saves them doing maths while driving." },
  { n:"16", q:"What % of each fare do you personally keep?", a:"The headline number of the whole survey. Platform commission plus any åkeri share. Uber and Bolt commission is the thing drivers complain about most — this quantifies it.", probe:"Ask what they think would be fair. That's the number the company needs and the form never asks for it." }] },

{ sec:"Q17–Q18 · What they actually earn",
  intro:"The bottom line. Everything above exists to make sense of these two.",
  items:[
  { n:"17", q:"Gross monthly income?", a:"Banded, with a \"prefer not to say\" — because this is the question people refuse.", probe:"Read the bands out rather than asking for a number; picking a band is far easier than saying it out loud. If they hesitate, move on immediately — pushing here can lose you the contact details at the end." },
  { n:"18", q:"Gross hourly earning?", a:"The comparable figure across every arrangement, and the one a competing offer gets measured against.", probe:"Most won't know. \"Not sure\" is a perfectly good answer — you can work it out later from Q11 and Q17, so don't make them struggle." }] },

{ sec:"Q19–Q21 · Organisation, and how they got the job",
  intro:"Two separate things: whether the workforce is organised, and the recruitment channel that actually works. That last one has direct commercial value — it tells the company where to spend its hiring budget.",
  items:[
  { n:"19", q:"Union or association member?", a:"Whether the company will be negotiating with organised labour, and whether \"good relations with the unions\" is worth advertising (Q27 tests exactly that).", probe:"Neutral tone, no opinion either way. If they're not a member, ask whether they've considered it — the answer says a lot about how the workforce sees itself." },
  { n:"20", q:"Which union?", a:"Transport and Taxiunionen are the usual names.", probe:"—" },
  { n:"21", q:"How did you find your current company?", a:"Quietly one of the most valuable questions here. If most drivers came through referral or a Facebook group, that's the entire recruitment strategy — and it's cheap.", probe:"Ask whether they've ever referred someone themselves, and whether they got anything for it. Referral bonuses are the standard tool and this tells them what it's worth." }] },

{ sec:"Q22–Q24 · What would make them switch",
  intro:"The commercial heart of the survey. Everything before this is context for these three.",
  items:[
  { n:"22", q:"Employee status or self-employed — which do you prefer?", a:"The central strategic choice. Employment means a wage floor, pension and sick pay but a rota. Self-employment means freedom and no safety net. The company genuinely does not know which way the Stockholm market leans, and this decides how they structure the business.", probe:"Whatever they answer, ask why. The reason matters far more than the choice, and this is where the best quotes in the whole interview come from." },
  { n:"23", q:"Minimum monthly income to consider switching?", a:"Their price. Literally what it would cost to hire them away.", probe:"If they resist a number, anchor it against Q17: \"More than you're on now, or about the same with better conditions?\" Plenty of drivers would move sideways on money for better terms — and that's a very valuable finding." },
  { n:"24", q:"Besides income, what else?", a:"Open text, and often the most revealing answer of the ride. Expect respect, being able to reach a human at the company, fair scheduling, not being deactivated without explanation.", probe:"Stay quiet after they answer. Three seconds of silence usually produces a second, better answer." }] },

{ sec:"Q25–Q27 · How to reach them, and what they value",
  intro:"Operational marketing questions. Where to advertise, in what language, and which promises to lead with.",
  items:[
  { n:"25", q:"Where do you look for driving jobs?", a:"Multi-select. Facebook and WhatsApp groups dominate this trade — often closed, language-specific groups an outsider would never find.", probe:"Ask which group, by name. A named group is worth more to them than the whole category, and it's not on the form." },
  { n:"26", q:"Preferred language for work information?", a:"Swedish, English, Arabic, Somali, Farsi/Dari, Kurdish. Stockholm's driver population is heavily multilingual and support in the wrong language is a real barrier.", probe:"Note which language <i>you</i> actually conducted the interview in as well — the team wants that comparison, and it's the reason there are two versions of this form." },
  { n:"27", q:"Rate eight factors from 1 to 5", a:"The priority-ranking grid, and the single densest question on the form: lower commission, guaranteed minimum income, formal employment, flexible hours, transparent fees, EV support, faster payment, good union relations. Each is a lever the company can pull, and this tells them which ones actually move a driver.", probe:"<b>Don't read all eight out.</b> It's exhausting and you'll get flat 4s and 5s. Say \"I'll read eight things, just tell me which two or three actually matter to you\" — then mark the rest from what they've already said during the ride. Faster, and far more honest data.<br><br>Note that <b>faster payment</b> is easy to underrate. For a driver covering weekly car rent, being paid weekly instead of monthly is a cash-flow difference that beats a headline pay rise." }] },

{ sec:"Q28 · The lead",
  intro:"",
  items:[
  { n:"28", q:"Interested in hearing more? Name and phone number.", a:"Your 150 kr bonus, and the whole commercial point of the exercise for them.", probe:"See the closing script. The short version: pre-frame it early in the ride, send the tip before you ask, and if they complained about anything during the ride, quote it back at them when you ask." }] }
];
