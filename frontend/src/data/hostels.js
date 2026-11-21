/**
 * Confirmed Chitkara University Campus Directory
 * 
 * Strict Requirement:
 * Retain boys' and girls' hostel messes.
 * No individual hostel descriptions, unverified locations, or operational details.
 */

export const HOSTEL_CATEGORIES = {
  BOYS: 'BOYS_HOSTEL_MESS',
  GIRLS: 'GIRLS_HOSTEL_MESS',
};

export const CHITKARA_CAMPUS_DIRECTORY = [
  // Boys' Hostel Messes
  {
    id: 'mess-b-franklin',
    name: 'Franklin Mess',
    category: HOSTEL_CATEGORIES.BOYS,
    categoryLabel: "Boys' Hostel",
  },
  {
    id: 'mess-b-alfred',
    name: 'Alfred Mess',
    category: HOSTEL_CATEGORIES.BOYS,
    categoryLabel: "Boys' Hostel",
  },
  {
    id: 'mess-b-magellan',
    name: 'Magellan Mess',
    category: HOSTEL_CATEGORIES.BOYS,
    categoryLabel: "Boys' Hostel",
  },
  {
    id: 'mess-b-archimedes',
    name: 'Archimedes Mess',
    category: HOSTEL_CATEGORIES.BOYS,
    categoryLabel: "Boys' Hostel",
  },

  // Girls' Hostel Messes
  {
    id: 'mess-g-pi',
    name: 'Pi Mess',
    category: HOSTEL_CATEGORIES.GIRLS,
    categoryLabel: "Girls' Hostel",
  },
  {
    id: 'mess-g-ibn',
    name: 'IBN Mess',
    category: HOSTEL_CATEGORIES.GIRLS,
    categoryLabel: "Girls' Hostel",
  },
  {
    id: 'mess-g-nightingale',
    name: 'Nightingale Mess',
    category: HOSTEL_CATEGORIES.GIRLS,
    categoryLabel: "Girls' Hostel",
  },
];

export const getBoysMesses = () =>
  CHITKARA_CAMPUS_DIRECTORY.filter((m) => m.category === HOSTEL_CATEGORIES.BOYS);

export const getGirlsMesses = () =>
  CHITKARA_CAMPUS_DIRECTORY.filter((m) => m.category === HOSTEL_CATEGORIES.GIRLS);

export const getMessById = (id) =>
  CHITKARA_CAMPUS_DIRECTORY.find((m) => m.id === id);
