/* ---------------------------------------------------------------------------
   Every service, area and review on the site comes from this one file.
   Adding a service means adding an object here - the home page grid, the
   services page, the detail pages, the header dropdowns, the quote form and
   the footer all read from it.
   --------------------------------------------------------------------------- */

const BUSINESS = {
  name: 'MK Roofing LLC',
  tagline: 'Design and roofing, under one roof',

  // TODO: replace with the US business line before this goes live.
  phone: '(505) 528-5353',
  phoneDial: '+15055285353',

  email: 'mkroofing2023@gmail.com',
  street: '1209 Mountain Road PL NE, Ste R',
  city: 'Albuquerque',
  state: 'NM',
  zip: '87110',
  get address() { return `${this.street}, ${this.city}, ${this.state} ${this.zip}`; },
  region: 'Albuquerque & Central New Mexico',
  regionShort: 'Albuquerque',
  since: 2020,
  warrantyYears: 10,
  // Demo license number - swap for the real NM contractor's license before launch.
  license: 'NM License #GB-098765',
  stats: [
    { n: '350+', label: 'Roofs repaired or replaced' },
    { n: '40+', label: '5-star reviews' },
    { n: '10', label: 'Year workmanship warranty' },
    { n: '24/7', label: 'Emergency call-outs' },
  ],

  facebook: 'https://www.facebook.com/',
  google: 'https://maps.google.com/?q=1209+Mountain+Road+PL+NE+Albuquerque+NM+87110',

  hours: [
    { days: 'Monday – Friday', time: '7:00 am – 6:00 pm' },
    { days: 'Saturday', time: '8:00 am – 4:00 pm' },
    { days: 'Sunday', time: 'Emergency call-outs only' },
  ],
};

/* `group` drives the two header dropdowns: 'design' and 'roofing'.
   `featured: true` puts a service on the home page grid.
   `icon` is the id of a symbol in the sprite at the bottom of each page. */
const SERVICES = [
  // ------------------------------------------------------------- design side
  {
    slug: 'architectural-design',
    name: 'Architectural Design',
    group: 'design',
    icon: 'compass',
    featured: true,
    short: 'Full architectural drawings for new builds, additions and remodels.',
    body: [
      'We take a project from first sketch through to a permit-ready drawing set — floor plans, elevations, sections and the details your contractor and the city will both ask for.',
      'Whether it is a ground-up build, a second-storey addition or opening up the back of an existing house, the drawings are prepared to work within Albuquerque and Bernalillo County requirements.',
    ],
    includes: [
      'Concept design and floor plans',
      'Elevations, sections and construction details',
      'Permit-ready drawing sets',
      'Coordination with your builder',
    ],
  },
  {
    slug: '3d-visualization',
    name: '3D Visualization',
    group: 'design',
    icon: 'cube',
    featured: true,
    short: 'Photoreal renders and walkthroughs, so you see it before it is built.',
    body: [
      'Plans are hard to read if you do not do it for a living. A render is not — you see the materials, the light and the proportions the way they will actually be.',
      'We produce stills, 360° views and walkthrough animations from your drawings, and they double as marketing material if the project is for sale or for lease.',
    ],
    includes: [
      'Photorealistic exterior and interior stills',
      '360° panoramas and walkthrough video',
      'Material and finish options side by side',
      'Renders sized for print and for listings',
    ],
  },
  {
    slug: 'interior-planning',
    name: 'Interior Planning',
    group: 'design',
    icon: 'ruler',
    featured: true,
    short: 'Layouts, finishes and lighting planned room by room.',
    body: [
      'Interior planning is what turns a floor plan into somewhere that works — where the light falls, where the storage goes, how people move through the space.',
      'We work to your budget and give you a finish schedule your trades can actually order from, rather than a mood board that leaves the decisions to them.',
    ],
    includes: [
      'Space planning and furniture layouts',
      'Finish, fixture and colour schedules',
      'Lighting and power planning',
      'Supplier and budget guidance',
    ],
  },

  // ------------------------------------------------------------ roofing side
  {
    slug: 'roof-inspection',
    name: 'Roof Inspection',
    group: 'roofing',
    icon: 'search',
    featured: true,
    short: 'A free, no-obligation inspection with photos of everything we find.',
    body: [
      'We start every roofing job the same way: up on the roof with a camera. You get a written summary and the photos to go with it, so you can see the condition of the shingles, flashing, valleys and gutters for yourself.',
      'There is no charge and no obligation. If the roof is sound we will tell you that, and you will have it in writing for your records.',
    ],
    includes: [
      'Full exterior roof and gutter check',
      'Photo report of every fault found',
      'Written estimate with itemized pricing',
      'Advice on what needs doing now and what can wait',
    ],
  },
  {
    slug: 'roof-repair',
    name: 'Roof Repair',
    group: 'roofing',
    icon: 'hammer',
    featured: true,
    short: 'Cracked shingles, failed flashing and storm damage put right.',
    body: [
      'Most leaks come down to a handful of causes: broken or lifted shingles, failed flashing around a chimney or vent, split seams on a flat roof, or a valley that has rusted through. We find the cause rather than patching the symptom.',
      'Repairs are done with materials matched to your existing roof so the work does not stand out once it is finished.',
    ],
    includes: [
      'Shingle and tile replacement',
      'Flashing repair and resealing',
      'Valley and vent repairs',
      'Storm and hail damage repair',
    ],
  },
  {
    slug: 'roof-replacement',
    name: 'Roof Replacement',
    group: 'roofing',
    icon: 'layers',
    featured: true,
    short: 'A full re-roof in shingle, metal or flat membrane.',
    body: [
      'When a roof has reached the end of its life, replacing it is cheaper than repairing it again and again. We strip the old roof, check and repair the decking underneath, and install the new one.',
      'We work in asphalt shingle, standing-seam metal and flat membrane, and we will tell you honestly which makes the most sense for your building and budget.',
    ],
    includes: [
      'Full tear-off and disposal',
      'Decking inspection and repair',
      'New underlayment and roofing system',
      'All flashing and edge metal renewed',
    ],
  },
  {
    slug: 'roof-restoration',
    name: 'Roof Restoration',
    group: 'roofing',
    icon: 'sparkle',
    short: 'Clean, repair and coat — years added, at a fraction of a replacement.',
    body: [
      'A restoration brings a tired roof back without the cost and disruption of replacing it. We clean the surface, replace what is broken, reseal the penetrations, then coat the whole roof.',
      'On the flat and low-slope roofs common around Albuquerque, a good coating also reflects a great deal of summer heat back off the building.',
    ],
    includes: [
      'Surface clean and preparation',
      'Repairs to seams and penetrations',
      'Primer plus reflective top coats',
      'Extends roof life without a full tear-off',
    ],
  },
  {
    slug: 'roof-leak-repair',
    name: 'Roof Leak Repair',
    group: 'roofing',
    icon: 'drop',
    short: 'Leak traced and fixed — emergency call-outs available.',
    body: [
      'Water rarely enters where the stain appears on your ceiling. We trace the leak back to its source rather than guessing, using a hose test where the cause is not obvious.',
      'For storm damage and active leaks we can get a temporary cover on the same day and come back to do the permanent repair.',
    ],
    includes: [
      'Leak tracing and hose testing',
      'Emergency temporary covering',
      'Permanent repair once the roof is dry',
      'Documentation for your insurance claim',
    ],
  },
  {
    slug: 'flat-roof-coating',
    name: 'Flat Roof & Coating',
    group: 'roofing',
    icon: 'brush',
    short: 'Elastomeric and silicone coatings for flat and low-slope roofs.',
    body: [
      'Flat roofs are the norm on a lot of Albuquerque housing stock, and they live or die on their coating. Once it chalks and cracks, water sits and finds its way in.',
      'We recoat with elastomeric or silicone systems, repairing the seams and flashings first so the coating goes onto a sound surface.',
    ],
    includes: [
      'Seam and flashing repair first',
      'Elastomeric or silicone systems',
      'Reflective finish that cuts cooling load',
      'Ponding areas built up and drained',
    ],
  },
  {
    slug: 'metal-roofing',
    name: 'Metal Roofing',
    group: 'roofing',
    icon: 'panel',
    short: 'Standing-seam and metal panel installation, repair and re-screwing.',
    body: [
      'Metal stands up well to New Mexico sun and hail, but fastenings loosen, panels dent and the ends of a run corrode where water sits.',
      'We replace individual panels, renew fastenings and seals, and install complete standing-seam roofs.',
    ],
    includes: [
      'Standing-seam installation',
      'Panel replacement and re-screwing',
      'Rust treatment and repair',
      'Full re-sheet where needed',
    ],
  },
  {
    slug: 'gutter-fascia',
    name: 'Gutter & Fascia',
    group: 'roofing',
    icon: 'gutter',
    short: 'Gutters, downspouts, fascia and gutter guard.',
    body: [
      'Blocked or sagging gutters push water back under the roof line and down the wall, which is how fascia rots and foundations get wet.',
      'We clean, repair and replace guttering, fascia and downspouts, and fit gutter guard where leaf litter is a recurring problem.',
    ],
    includes: [
      'Gutter cleaning and re-levelling',
      'Gutter and downspout replacement',
      'Fascia repair and capping',
      'Gutter guard installation',
    ],
  },
  {
    slug: 'stucco-parapet-repair',
    name: 'Stucco & Parapet Repair',
    group: 'roofing',
    icon: 'ridge',
    short: 'Parapet walls, canales and stucco repaired where the roof meets the wall.',
    body: [
      'On flat-roofed adobe and stucco homes, most leaks start at the parapet — cracked stucco, a failed canale, or coping that has let go.',
      'We repair the parapet, reseal canales and scuppers and patch the stucco so the detail sheds water again.',
    ],
    includes: [
      'Parapet crack repair and sealing',
      'Canale and scupper reflashing',
      'Coping repair and replacement',
      'Colour-matched stucco patching',
    ],
  },
  {
    slug: 'pergola',
    name: 'Pergola & Patio Covers',
    group: 'roofing',
    icon: 'pergola',
    short: 'New patio covers and pergolas, plus repairs to existing structures.',
    body: [
      'We build and repair pergolas and patio covers to match the house, in metal, polycarbonate or timber.',
      'That includes re-roofing an existing cover, replacing rotted posts and beams, and adding guttering where it drains badly.',
    ],
    includes: [
      'New pergolas and patio covers',
      'Re-roofing existing structures',
      'Post and beam replacement',
      'Guttering and drainage',
    ],
  },
];

const AREAS = [
  'Albuquerque', 'Rio Rancho', 'Northeast Heights', 'North Valley', 'South Valley',
  'Nob Hill', 'Old Town', 'Westside', 'Corrales', 'Los Ranchos', 'Bernalillo',
  'Placitas', 'Sandia Park', 'Tijeras',
];

/* Placeholder reviews, written to read like real Albuquerque customers so the
   layout, line lengths and tone can be checked before real ones replace them.
   None of these people exist - swap every entry for a real review (and its
   real star rating, if you add one) before this site goes live. See README. */
const REVIEWS = [
  {
    name: 'Denise Alarid',
    source: 'Google',
    text: "Our flat roof was ponding water every monsoon season and two other companies just wanted to tar over the problem. MK actually rebuilt the drainage slope before recoating it. It's been through two summers now with zero leaks. Fair price, showed up when they said they would.",
  },
  {
    name: 'Robert Trujillo',
    source: 'Google',
    text: 'Hired them for a full re-roof on our place near Nob Hill after the hailstorm last spring. Dealt directly with our insurance adjuster and the paperwork matched up perfectly. Crew was done in two days and cleaned up every bit of the old shingle off the driveway.',
  },
  {
    name: 'Sandra Bencomo',
    source: 'Facebook',
    text: 'We used the design side for a casita addition - they did the drawings, gave us a 3D walkthrough so we could see the layout before committing, and the same crew handled the roof tie-in when it was built. Having one company do both saved us a lot of back and forth.',
  },
  {
    name: 'James Whitfield',
    source: 'Google',
    text: "Stucco crack around our parapet had been leaking into the bedroom closet for over a year. Previous handyman patched it twice and it kept coming back. MK found a failed scupper behind the stucco that nobody else checked. Fixed properly, matched the texture, no more stains.",
  },
  {
    name: 'Maria Chavez-Ortega',
    source: 'Google',
    text: "Free inspection was exactly that - no pressure, no upsell. They told us our roof had another 5+ years in it and just needed the flashing around the swamp cooler redone. Could have easily sold us a full replacement and we wouldn't have known better.",
  },
];

const FAQS = [
  {
    q: 'Is the roof inspection really free?',
    a: 'Yes. We inspect the roof, photograph anything we find and give you a written estimate at no charge. If nothing needs doing we will say so.',
  },
  {
    q: 'Do you handle both design work and roofing?',
    a: 'We do. Architectural design, 3D visualization and interior planning sit alongside the roofing side, so a remodel can be drawn, visualized and roofed by the same team.',
  },
  {
    q: 'How long does a re-roof take?',
    a: 'A typical single-family home is two to three days once materials are on site. Weather can stretch that out, and we will keep you posted if it does.',
  },
  {
    q: 'What does the warranty cover?',
    a: `We warrant our workmanship for ${BUSINESS.warrantyYears} years. Manufacturer warranties on materials run separately and we pass those on to you in writing.`,
  },
  {
    q: 'Do you work with insurance claims?',
    a: 'We do. After a hail or wind event we document the damage the way adjusters want it — dated photos, a written cause-of-damage summary and an itemized estimate.',
  },
  {
    q: 'Are drawings permit-ready?',
    a: 'Yes. Drawing sets are prepared to submit for permit in Albuquerque and Bernalillo County, and we will work through any review comments with you.',
  },
];
