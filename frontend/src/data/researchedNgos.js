/**
 * Researched Potential Food Redistribution Organisations
 * 
 * Geographic Context:
 * - Scoped around Chitkara University, Punjab campus (Rajpura, Patiala, Chandigarh, Mohali, Panchkula).
 * 
 * Strict Compliance:
 * - These organisations are researched reference entities operating in the region.
 * - They are NOT registered, authenticated, or verified partners of FoodLoop.
 * - No partnership with Chitkara University or FoodLoop is claimed or fabricated.
 * - Official websites and verified sources are referenced directly.
 */

/**
 * Researched Potential Food Redistribution Organisations & Regulatory References
 * 
 * Geographic Context:
 * - Scoped around Chitkara University, Punjab campus (Rajpura, Patiala, Chandigarh, Mohali, Panchkula).
 * 
 * Strict Compliance:
 * - These organisations are researched reference entities operating in the broader region.
 * - They are NOT registered, authenticated, or verified partners of FoodLoop.
 * - No partnership with Chitkara University or FoodLoop is claimed or fabricated.
 * - FSSAI / IFSA is the national statutory regulatory umbrella and food recovery network,
 *   NOT an individual collection partner or local NGO.
 * - Official websites and verified sources are referenced directly.
 */

export const RESEARCHED_POTENTIAL_NGOS = [
  {
    id: 'res-ngo-rha-tricity',
    name: 'Robin Hood Army — Chandigarh Tricity Chapter',
    serviceArea: 'Chandigarh, Mohali (SAS Nagar), Panchkula',
    type: 'Zero-Funds Volunteer Movement',
    acceptsCookedFood: 'Subject to chapter availability & timely collection',
    activities:
      'Mobilises local volunteer "Robins" to collect surplus cooked meals from university messes, restaurants, banquet halls, and hostels. Food is distributed promptly to night shelters, slum settlements, and community centres before expiry.',
    officialWebsite: 'https://robinhoodarmy.com',
    sourceReference: 'FSSAI IFSA / Robin Hood Army National Registry',
    researchStatus: 'Researched External Organisation (Not an authenticated FoodLoop partner)',
    localChapterActive: 'Unverified frequency (volunteer-dependent)',
    rajpuraCoverage: 'Unverified direct presence; relies on Chandigarh volunteer drives (~35 km)',
    universityPartnership: 'None. External academic research reference only.',
    notes: 'Operates decentralized city teams coordinating time-critical cooked food collections.',
  },
  {
    id: 'res-ngo-rha-patiala',
    name: 'Robin Hood Army — Patiala Chapter',
    serviceArea: 'Patiala (~25 km from Rajpura / Chitkara Campus)',
    type: 'Zero-Funds Volunteer Movement',
    acceptsCookedFood: 'Subject to chapter availability & batch verification',
    activities:
      'Coordinates surplus food drives from student canteens, catering events, and community kitchens across Patiala, redistributing to underprivileged colonies and shelters.',
    officialWebsite: 'https://robinhoodarmy.com',
    sourceReference: 'Robin Hood Army Punjab Regional Chapters',
    researchStatus: 'Researched External Organisation (Not an authenticated FoodLoop partner)',
    localChapterActive: 'Unverified frequency (volunteer-dependent)',
    rajpuraCoverage: 'Closest active volunteer chapter situated southwest of Rajpura (~25 km along NH-7)',
    universityPartnership: 'None. External academic research reference only.',
    notes: 'Closest active volunteer chapter situated southwest of Rajpura along the NH-7 corridor.',
  },
  {
    id: 'res-ngo-feeding-india',
    name: 'Feeding India by Zomato',
    serviceArea: 'Chandigarh Tricity & Regional Network',
    type: 'Non-Profit Food Rescue Organization',
    acceptsCookedFood: 'Subject to institutional hygiene and temperature verification',
    activities:
      'Runs structured food recovery drives connecting institutional kitchens, event caterers, and food donors with vetted hunger-relief beneficiary centres via volunteer "Hunger Heroes".',
    officialWebsite: 'https://www.feedingindia.org',
    sourceReference: 'Eternal Foundation / Feeding India Network Directory',
    researchStatus: 'Researched External Organisation (Not an authenticated FoodLoop partner)',
    localChapterActive: 'Active in Chandigarh/Mohali; Rajpura coverage requires inquiry',
    rajpuraCoverage: 'Requires scheduled transport coordination from Tricity hub',
    universityPartnership: 'None. External academic research reference only.',
    notes: 'Specialises in large-batch surplus collection with strict temperature and hygiene transport protocols.',
  },
  {
    id: 'res-ngo-langar-seva',
    name: 'Community Langar Seva Initiatives',
    serviceArea: 'Rajpura Town & Patiala District',
    type: 'Traditional Community Food Sharing Networks',
    acceptsCookedFood: 'Community kitchen network sharing',
    activities:
      'Traditional community kitchen networks (Gurdwara Langar institutions and local trusts) providing universal, unconditional hot meals daily to all individuals regardless of background.',
    officialWebsite: 'https://www.sgpc.net',
    sourceReference: 'Regional Community Kitchen Network',
    researchStatus: 'Independent Cultural Institution (Not an authenticated FoodLoop partner)',
    localChapterActive: 'Continuous local daily operations in Rajpura and surrounding areas',
    rajpuraCoverage: 'Local in-town presence via historical community dining institutions',
    universityPartnership: 'None. Community cultural reference only.',
    notes: 'Represents the deep-rooted regional tradition of zero-waste community dining in Punjab.',
  },
];

/**
 * Statutory Food Safety & Regulatory Reference
 * Note: FSSAI and IFSA provide the apex regulatory framework, standards, and Good Samaritan protections;
 * they are NOT individual NGO collection partners.
 */
export const STATUTORY_REGULATORY_FRAMEWORKS = [
  {
    id: 'reg-fssai-ifsa',
    name: 'FSSAI Indian Food Sharing Alliance (IFSA)',
    agency: 'Food Safety and Standards Authority of India (FSSAI)',
    classification: 'Statutory Regulatory Authority & National Recovery Umbrella',
    role: 'Apex regulatory initiative under "Save Food, Share Food, Share Joy". Registers credible Food Recovery Agencies (FRAs) and enforces Surplus Food Safety Regulations.',
    officialWebsite: 'https://sharefood.eatrightindia.gov.in',
    statutoryNotice:
      'FSSAI / IFSA is a regulatory body establishing safety standards, FoSTaC hygiene certifications, and Good Samaritan statutory guidance. It does not conduct local physical meal collections as an NGO partner.',
  },
];

export const REGIONAL_INFRASTRUCTURE_NOTE = {
  rajpuraCoverageLimitation:
    'Notice: While Chandigarh, Mohali, and Patiala maintain structured food recovery networks and active volunteer chapters, Rajpura town currently does not host an independent FRA branch. Redistribution from Rajpura relies primarily on cross-city volunteer drives from Patiala (~25 km) or Chandigarh (~35 km), alongside traditional Gurdwara community kitchens.',
  disclaimer:
    'The organisations listed above are researched external entities referenced strictly for academic evaluation and system design. They do not constitute registered, authenticated, or formal partners of FoodLoop or Chitkara University. FoodLoop makes no claims of official endorsement or operational agreements.',
};
