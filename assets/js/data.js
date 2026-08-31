/* ---------------------------------------------------------------------------
   Every service, suburb and review on the site comes from this one file.
   Adding a service means adding an object here - the home page grid, the
   services page, the detail pages, the quote form's dropdown and the footer
   all read from it, so nothing has to be edited in more than one place.
   --------------------------------------------------------------------------- */

const BUSINESS = {
  name: 'MK Roofing AUS',
  tagline: 'Canberra roofing, done properly',
  phone: '0484 736 023',
  phoneDial: '+61484736023',
  email: 'mkroofing2023@gmail.com',
  address: '4 Bancroft St, Dickson ACT 2602',
  region: 'Canberra & the ACT',
  since: 2020,
  warrantyYears: 10,
  rating: '4.2',
  ratingCount: 10,
  abn: '',
  facebook: 'https://www.facebook.com/',
  google: 'https://maps.google.com/?q=MK+Roofing+AUS+Dickson+ACT',
  hours: [
    { days: 'Monday – Friday', time: '7:00 am – 6:00 pm' },
    { days: 'Saturday', time: '8:00 am – 4:00 pm' },
    { days: 'Sunday', time: 'Emergency call-outs only' },
  ],
};

/* `featured: true` puts a service on the home page. `icon` is the id of a
   symbol in the sprite at the bottom of each page. */
const SERVICES = [
  {
    slug: 'roof-inspection',
    name: 'Roof Inspection',
    icon: 'search',
    featured: true,
    short: 'A free, no-obligation inspection with photos of anything we find.',
    body: [
      'We start every job the same way: up on the roof with a camera. You get a written summary and the photos to go with it, so you can see the condition of your tiles, ridge caps, flashings, valleys and gutters for yourself.',
      'There is no charge and no obligation. If the roof is sound we will tell you that, and you will have it in writing for your records.',
    ],
    includes: [
      'Full external roof and gutter check',
      'Photo report of every fault found',
      'Written quote with itemised pricing',
      'Advice on what needs doing now and what can wait',
    ],
  },
  {
    slug: 'roof-repair',
    name: 'Roof Repair',
    icon: 'hammer',
    featured: true,
    short: 'Cracked tiles, slipped ridge caps and failed flashings put right.',
    body: [
      'Most leaks come down to a handful of causes: broken or slipped tiles, cracked mortar on the ridge, rusted valleys, or flashing that has pulled away from a wall or chimney. We find the cause rather than patching the symptom.',
      'Repairs are done with materials matched to your existing roof so the work does not stand out once it is finished.',
    ],
    includes: [
      'Cracked and slipped tile replacement',
      'Ridge cap re-bedding and re-pointing',
      'Valley iron replacement',
      'Flashing repair and resealing',
    ],
  },
  {
    slug: 'roof-restoration',
    name: 'Roof Restoration',
    icon: 'sparkle',
    featured: true,
    short: 'Pressure clean, repair, re-point and coat — years added, at a fraction of a replacement.',
    body: [
      'A restoration brings a tired roof back without the cost and disruption of replacing it. We clean off the moss and lichen, replace what is broken, re-bed and re-point the ridge caps, then seal and coat the whole roof.',
      'The finish is a full colour change if you want one, and the coating protects the tiles from further weathering.',
    ],
    includes: [
      'High-pressure clean and moss treatment',
      'Broken tile replacement',
      'Ridge re-bedding and flexible re-pointing',
      'Primer plus two coats of membrane',
    ],
  },
  {
    slug: 'roof-replacement',
    name: 'Roof Replacement',
    icon: 'layers',
    featured: true,
    short: 'A full re-roof in tile or Colorbond when repair no longer stacks up.',
    body: [
      'When a roof has reached the end of its life, replacing it is cheaper than repairing it again and again. We strip the old roof, check and repair the battens and sarking underneath, and install the new one.',
      'We work in both tile and Colorbond, and we will tell you honestly which makes more sense for your house and budget.',
    ],
    includes: [
      'Full strip and disposal of the old roof',
      'Batten and sarking inspection and repair',
      'New tile or Colorbond installation',
      'All flashings, ridge caps and capping renewed',
    ],
  },
  {
    slug: 'roof-leak-repair',
    name: 'Roof Leak Repair',
    icon: 'drop',
    featured: true,
    short: 'Leak found and fixed — emergency call-outs available.',
    body: [
      'Water rarely enters where the stain appears on your ceiling. We trace the leak back to its source rather than guessing, using a hose test where the cause is not obvious.',
      'For storm damage and active leaks we can get a temporary cover on the same day and come back to do the permanent repair.',
    ],
    includes: [
      'Leak tracing and hose testing',
      'Emergency temporary covering',
      'Permanent repair once the roof is dry',
      'Advice for your insurance claim if you need it',
    ],
  },
  {
    slug: 'roof-painting',
    name: 'Roof Painting & Coating',
    icon: 'brush',
    featured: true,
    short: 'A sealed, UV-stable finish in the colour you choose.',
    body: [
      'Roof coating is not just cosmetic. The membrane seals porous tiles, stops water soaking in and reflects heat away from the roof cavity.',
      'We use a primer and two top coats, sprayed for an even finish, with your choice of colour.',
    ],
    includes: [
      'Pressure clean and surface preparation',
      'Sealer or primer coat',
      'Two coats of UV-stable membrane',
      'Full colour range',
    ],
  },
  {
    slug: 'colorbond-roofing',
    name: 'Colorbond Roof Repair',
    icon: 'panel',
    short: 'Repairs, re-sheeting and upgrades to Colorbond metal roofing.',
    body: [
      'Colorbond stands up well to Canberra conditions, but fixings loosen, sheets dent in hail and the ends of a run can corrode where water sits.',
      'We replace individual sheets, renew fastenings and seals, and can re-sheet a whole roof where that is the better option.',
    ],
    includes: [
      'Individual sheet replacement',
      'Fastener and seal renewal',
      'Rust treatment and repair',
      'Full re-sheet where needed',
    ],
  },
  {
    slug: 'roof-bedding-pointing',
    name: 'Roof Bedding & Ridge Capping',
    icon: 'ridge',
    short: 'Re-bedding and flexible re-pointing that stops the ridge letting go.',
    body: [
      'Ridge caps sit on a bed of mortar and are sealed with pointing. Mortar cracks with age and movement, and once it does, water gets under the caps and the caps themselves start to slip.',
      'We re-bed the caps where the mortar has failed and re-point with a flexible compound that moves with the roof rather than cracking again.',
    ],
    includes: [
      'Old pointing removed',
      'Ridge caps re-bedded in fresh mortar',
      'Flexible pointing compound',
      'Colour matched to your roof',
    ],
  },
  {
    slug: 'gutter-fascia',
    name: 'Gutter & Fascia Repair',
    icon: 'gutter',
    short: 'Guttering, downpipes, fascia and gutter guard.',
    body: [
      'Blocked or sagging gutters push water back under the roof line and down the wall, which is how fascia boards rot and foundations get wet.',
      'We clean, repair and replace guttering, fascia and downpipes, and fit gutter guard where leaf litter is a recurring problem.',
    ],
    includes: [
      'Gutter cleaning and re-levelling',
      'Gutter and downpipe replacement',
      'Fascia repair and capping',
      'Gutter guard installation',
    ],
  },
  {
    slug: 'broken-tiles',
    name: 'Replacing Broken Tiles',
    icon: 'tile',
    short: 'Matched replacement tiles, including older discontinued profiles.',
    body: [
      'A single cracked tile is enough to let water into the roof cavity. We carry and source matching tiles across the common profiles, including a lot of the older ones no longer in production.',
      'Small jobs are welcome — this is often the cheapest repair you will ever do on a roof.',
    ],
    includes: [
      'Profile and colour matched tiles',
      'Discontinued profiles sourced',
      'Surrounding tiles checked while we are up there',
      'Small jobs welcome',
    ],
  },
  {
    slug: 'pressure-washing',
    name: 'Roof Pressure Washing',
    icon: 'spray',
    short: 'Moss, lichen and grime cleaned off without damaging the tiles.',
    body: [
      'Moss and lichen hold moisture against the tiles and lift them over time. A pressure clean removes the growth and the years of grime that come with it.',
      'We work at a pressure the tiles can take, and we protect your gardens and windows while we do it.',
    ],
    includes: [
      'Moss and lichen treatment',
      'High-pressure wash',
      'Gutters flushed afterwards',
      'Surrounds protected and cleaned down',
    ],
  },
  {
    slug: 'pergola',
    name: 'Pergola Repair & Installation',
    icon: 'pergola',
    short: 'New pergolas, patio roofing and repairs to existing structures.',
    body: [
      'We build and repair pergolas and patio roofing to match the house, in Colorbond, polycarbonate or timber.',
      'That includes re-roofing an existing pergola, replacing rotted posts and beams, and adding guttering where it drains badly.',
    ],
    includes: [
      'New pergola and patio roofing',
      'Re-roofing existing structures',
      'Post and beam replacement',
      'Guttering and drainage',
    ],
  },
];

const SUBURBS = [
  'Belconnen', 'Gungahlin', 'Woden', 'Tuggeranong', 'Dickson', 'Braddon',
  'Kingston', 'Weston Creek', 'Molonglo', 'Queanbeyan', 'Yass', 'Murrumbateman',
];

const REVIEWS = [
  {
    name: 'Madhu Mitha',
    source: 'Facebook',
    text: 'Thank you MK Roofing team. All did teamwork which is fantastic, and very professional. They matched our existing painted roof colour and replaced all the broken tiles, cleaned and resealed the ridge capping and patching works. I highly recommend these guys.',
  },
  {
    name: 'Greg Turnbull',
    source: 'Facebook',
    text: 'Thank you to Faisal and his team for a very good professional job. Faisal was reliable and punctual and delivered the job very much to my satisfaction. It’s great to have a refurbished roof and broken tiles removed and replaced. Good communication and prompt service.',
  },
];

const FAQS = [
  {
    q: 'Is the inspection really free?',
    a: 'Yes. We inspect the roof, photograph anything we find and give you a written quote at no charge. If nothing needs doing we will say so.',
  },
  {
    q: 'How long does a restoration take?',
    a: 'Most homes take three to four days: a day to clean, a day for repairs and re-pointing, then coating. Weather can stretch that out, and we will keep you posted if it does.',
  },
  {
    q: 'What does the warranty cover?',
    a: `We warrant our workmanship for ${BUSINESS.warrantyYears} years. Manufacturer warranties on materials such as membranes and Colorbond sheeting run separately and we will pass those on to you in writing.`,
  },
  {
    q: 'Do you work with insurance claims?',
    a: 'We do. After storm damage we can document the damage properly and provide the photos and itemised quote your insurer will ask for.',
  },
  {
    q: 'Can you match my existing roof colour?',
    a: 'In most cases yes, both for replacement tiles and for coating. We will confirm the match before starting.',
  },
  {
    q: 'Do you charge for quotes outside Canberra?',
    a: `We cover ${BUSINESS.region} and the surrounding NSW towns at no charge. Further out, give us a call and we will let you know.`,
  },
];
