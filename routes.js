/* ---------------------------------------------------------------
   Three alternative itineraries — south, central, north.

   PRIORITY ORDER (this drives every route choice):
     1. Time in the car   — 15 min minimum, 15-22 is the target
     2. Fare              — around 150 kr, a bit over is fine
     3. Distance          — barely matters, shorter is fine

   That ranking is why the three routes look so different. Average
   traffic speed varies hugely across Stockholm, so the distance
   needed to buy 15 minutes varies with it:

     Central  ~16 km/h  ->  a 4.5 km ride lasts 17 min and costs 133 kr
     South    ~23 km/h  ->  you need ~6.2 km for the same 16 min
     North    ~28 km/h  ->  you need ~7.2 km for 15 min

   So the central route is the cheapest way to buy talking time, and
   the north route is the most expensive. Distances are haversine x
   1.35; the app's own quote is always the truth.
   --------------------------------------------------------------- */

const FARE = {
  app:  { base: 39, perKm: 11.0, perMin: 2.6,  target: 150, lo: 125, hi: 185 },
  /* Calibrated against the jämförpris the traditional companies must
     display: ~320 kr for a 10 km / 15 min trip. */
  trad: { base: 50, perKm: 14.0, perMin: 8.7,  target: 285, lo: 230, hi: 315 }
};

const ROAD_FACTOR = 1.35;
const MIN_MINUTES = 15;

/* Approximate trängselskatt cordon — the congestion-charge ring around
   the inner city. Traced from the toll station positions (Norrtull,
   Roslagstull, Ropsten, Danvikstull, Skanstull, Liljeholmsbron,
   Essingeleden, Karlberg) and the shoreline between them.

   For orientation only, not a legal boundary. What matters is the
   rule it illustrates: driving entirely inside is free, driving
   entirely outside is free, and only CROSSING the line costs money
   (weekdays 06:30-18:29, up to 45 kr a passage, passed on to you).
   Every route in this kit stays on one side of it. */
const CORDON = [
  [59.3520,18.0400],[59.3490,18.0580],[59.3530,18.0760],[59.3560,18.0900],
  [59.3585,18.1020],[59.3500,18.1120],[59.3300,18.1290],[59.3220,18.1330],
  [59.3200,18.1100],[59.3160,18.0990],[59.3110,18.0980],[59.3050,18.0800],
  [59.3040,18.0640],[59.3060,18.0530],[59.3125,18.0270],[59.3200,18.0180],
  [59.3300,17.9930],[59.3420,18.0020],[59.3450,18.0180]
];

const pt = (name, lat, lng, hint) => ({ name, lat, lng, hint });

/* ================= SOUTH ================= */
const PS = {
  liljeholmen: pt("Liljeholmstorget", 59.3105, 18.0225, "Bus terminal side, Liljeholmsvägen. Big open kerb."),
  bandhagen:   pt("Bandhagens T-bana", 59.2720, 18.0480, "Trollesundsvägen, station forecourt."),
  fruangen:    pt("Fruängens centrum", 59.2856, 17.9646, "Bus terminal side, Vantörsvägen."),
  arsta:       pt("Årsta centrum", 59.2985, 18.0470, "Årsta torg, outside the shopping centre."),
  sickla:      pt("Sickla köpkvarter", 59.3080, 18.1250, "Sickla industriväg, by the Uttern entrance."),
  skarpnack:   pt("Skarpnäcks centrum", 59.2670, 18.1300, "Skarpnäcks allé, by the T-bana."),
  hammarby:    pt("Hammarby Sjöstad", 59.3040, 18.1000, "Lumaparken, Hammarby allé. Wide kerb, easy pin."),
  grondal:     pt("Gröndals centrum", 59.3125, 18.0000, "Gröndalsvägen, outside the ICA."),
  bredang:     pt("Bredängs centrum", 59.2940, 17.9270, "Bredängs allé, outside the T-bana."),
  alvsjo:      pt("Älvsjö station", 59.2790, 18.0100, "Johan Skyttes väg. Pendeltåg here."),
  satra:       pt("Sätra centrum", 59.2830, 17.9200, "Sätra torg, T-bana entrance."),
  telefonplan: pt("Telefonplan", 59.2975, 17.9970, "LM Ericssons väg, outside Konstfack."),
  globen:      pt("Slakthusområdet / Globen", 59.2934, 18.0810, "Arenavägen, outside Avicii Arena.")
};

/* ================= CENTRAL ================= */
const PC = {
  hornstull:   pt("Hornstull", 59.3155, 18.0345, "Hornsgatan by the T-bana. Easy kerb, west Södermalm."),
  karlaplan:   pt("Karlaplan", 59.3370, 18.0900, "The roundabout, Karlavägen side."),
  skanstull:   pt("Skanstull", 59.3080, 18.0760, "Ringvägen / Götgatan corner, south Södermalm."),
  fridhemsplan:pt("Fridhemsplan", 59.3340, 18.0270, "St Eriksgatan side. Big junction, easy pickup."),
  djurgarden:  pt("Djurgården (Skansen)", 59.3260, 18.1030, "Djurgårdsvägen, outside the Skansen gates."),
  odenplan:    pt("Odenplan", 59.3430, 18.0490, "Karlbergsvägen side, away from the bus lanes."),
  danvikstull: pt("Danvikstull", 59.3145, 18.0960, "Danviksbron, east end of Södermalm."),
  medborgar:   pt("Medborgarplatsen", 59.3145, 18.0720, "Folkungagatan side, not the square itself."),
  gardet:      pt("Gärdet", 59.3480, 18.0960, "Valhallavägen / Erik Dahlbergsgatan."),
  zinkensdamm: pt("Zinkensdamm", 59.3175, 18.0490, "Hornsgatan, by the T-bana."),
  ostermalmstorg: pt("Östermalmstorg", 59.3355, 18.0740, "Nybrogatan side of the square.")
};

/* ================= NORTH ================= */
const PN = {
  alvik:       pt("Alvik", 59.3335, 17.9800, "Gustavslundsvägen, by the T-bana / Tvärbana."),
  blackeberg:  pt("Blackebergs centrum", 59.3390, 17.8880, "Blackebergs torg."),
  sundbyberg:  pt("Sundbybergs centrum", 59.3610, 17.9710, "Sturegatan, by the station."),
  danderyd:    pt("Mörby centrum", 59.3970, 18.0400, "Mall entrance, Golfvägen side."),
  kista:       pt("Kista galleria", 59.4030, 17.9430, "Danmarksgatan, mall taxi bay."),
  brommablocks:pt("Bromma Blocks", 59.3540, 17.9430, "Ulvsundavägen, outside the retail park."),
  bergshamra:  pt("Bergshamra", 59.3860, 18.0300, "Bergshamra torg, by the T-bana."),
  solnastrand: pt("Solna strand", 59.3540, 17.9760, "Solna strandväg, by the T-bana."),
  vallingby:   pt("Vällingby centrum", 59.3640, 17.8720, "Vällingbyplan, outside the T-bana.")
};

const CO = ["Uber","Bolt","Uber","Bolt","Uber","Bolt","Uber","Bolt","Uber","Bolt",
            "Taxi Stockholm","Taxi Stockholm","Taxi Kurir","Sverigetaxi"];

/* Turn a list of 15 stops into 14 numbered, company-tagged legs. */
const chain = (stops, notes) => stops.slice(0, -1).map((from, i) => ({
  n: i + 1, co: CO[i], from, to: stops[i + 1], note: notes[i] || ""
}));

const ROUTES = [
  {
    id: "south", name: "South", kmh: 23,
    area: "Liljeholmen · Enskede · Hammarby · Sickla · Bredäng",
    blurb: "The inner-suburb ring, entirely outside the congestion cordon. Arterial streets with traffic lights — fast enough to be predictable, slow enough that ~6.2 km buys you 16 minutes. The safest default: plenty of cars, low surge, and almost no chance of a fare surprise.",
    watch: "Legs 4–6 can be routed through the Södra Länken tunnel, which is quick. If an ETA comes back under 13 min, ask the driver for the surface route.",
    legs: chain(
      [PS.liljeholmen, PS.bandhagen, PS.fruangen, PS.arsta, PS.sickla, PS.skarpnack, PS.hammarby,
       PS.bandhagen, PS.grondal, PS.bredang, PS.alvsjo, PS.satra, PS.telefonplan, PS.globen, PS.grondal],
      ["Warm-up. Out via Årstafältet and Sockenvägen — street route, steady lights.",
       "Straight west along Örbyleden and Vantörsvägen.",
       "Via Hägerstensvägen and Årstalänken. Reliable timing.",
       "South side of the city, outside the cordon. Watch for the tunnel route.",
       "Via Sockenvägen. Surface roads keep this near 16 min.",
       "North-west through Björkhagen. Steady arterial.",
       "Cuts across Enskede. Both ends are low-surge residential.",
       "Longest leg of the ten. Still comfortably in band.",
       "West along Hägerstensvägen. Ask for the street route, not the E4.",
       "Last app ride. Ends at Älvsjö — pendeltåg home, and day two starts here.",
       "First traditional ride. Take the app's fixed-price option if offered.",
       "Short and cheap by traditional standards. Good one to settle into.",
       "Check for an event at Avicii or Tele2 Arena before booking this one.",
       "Closing leg, back west. Ends where leg 9 started."]
    )
  },
  {
    id: "central", name: "Central", kmh: 16,
    area: "Södermalm · Kungsholmen · Vasastan · Östermalm · Djurgården",
    blurb: "Entirely inside the congestion-charge ring — which sounds expensive but isn't. You only pay to cross the cordon, never to drive around inside it, so a route that stays in costs nothing extra. And city traffic is slow, so 4.5 km already buys you 17 minutes. Cheapest fares of the three and the shortest walks between legs.",
    watch: "Avoid the absolute core — T-Centralen, Drottninggatan, Gamla Stan, Slussen. Pins there are often unreachable and drivers cancel. Every stop below is deliberately just outside that. Surge is higher here than the suburbs, so check the quote every time.",
    legs: chain(
      [PC.hornstull, PC.karlaplan, PC.skanstull, PC.fridhemsplan, PC.djurgarden, PC.odenplan,
       PC.danvikstull, PC.fridhemsplan, PC.medborgar, PC.gardet, PC.zinkensdamm, PC.djurgarden,
       PC.odenplan, PC.hornstull, PC.ostermalmstorg],
      ["Across the water and up through the city. Slow traffic works for you here.",
       "Down Birger Jarlsgatan and over to south Södermalm.",
       "West along Ringvägen, over Västerbron.",
       "Through the city out to Djurgården. Scenic, and reliably slow.",
       "Back over Djurgårdsbron and up through Vasastan.",
       "Down through the city and across to east Södermalm.",
       "Back west along Söder and over the bridge.",
       "Short hop back into Södermalm.",
       "Up through Östermalm to Gärdet.",
       "Long diagonal back down to south-west Södermalm.",
       "First traditional ride. Short leg — traditional fares climb fast in slow traffic.",
       "Keep these traditional legs short. 4–5 km is the sweet spot at city speeds.",
       "Straight down through Vasastan to Södermalm.",
       "Closing leg, back up to Östermalm."]
    )
  },
  {
    id: "north", name: "North", kmh: 28,
    area: "Solna · Sundbyberg · Bromma · Kista · Danderyd",
    blurb: "Fast open roads north and west of the city, well outside the cordon. The catch is the speed: at 28 km/h you need a full 7–8 km to buy 15 minutes, so fares run at the top of the band. Use this one if the south and central routes are surging, or if you want a completely different driver population — Kista and Sundbyberg pull a different crowd.",
    watch: "This is the least forgiving route. Legs are long, so a quiet road can finish in 13 minutes and cost you the interview. Ask drivers to avoid the motorway where there's a surface alternative, and expect fares nearer 165 kr than 150.",
    legs: chain(
      [PN.alvik, PN.blackeberg, PN.sundbyberg, PN.danderyd, PN.kista, PN.brommablocks, PN.bergshamra,
       PN.kista, PN.solnastrand, PN.vallingby, PN.sundbyberg, PN.blackeberg, PN.solnastrand,
       PN.kista, PN.bergshamra],
      ["West along Bergslagsvägen. Traffic lights most of the way.",
       "North across Bromma. Good steady pace.",
       "Up the E18 corridor — this one will be quick, so don't waste the first minute.",
       "Across the top of the city. Long but reliable.",
       "South down Ulvsundavägen.",
       "North-east past Solna. One of the longer legs.",
       "Back north-west to Kista.",
       "South to Solna strand along the Tvärbana corridor.",
       "Long west run out to Vällingby.",
       "Back east. Last app ride.",
       "First traditional ride. Long legs make these expensive — check the fixed price.",
       "North-east back towards Solna.",
       "Up to Kista again.",
       "Closing leg, east to Bergshamra."]
    )
  }
];
