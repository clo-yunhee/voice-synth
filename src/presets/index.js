export const vowels = [
  '/æ/',
  '/e/',
  '/ʌ/',
  '/i/',
  '/ɪ/',
  '/ɜ/',
  '/ɒ/',
  '/ʊ/',
  '/u/'
];

const Male = {
  key: 'M',
  pitch: 120,
  params: {Oq: 0.3, am: 0.77},
  gains: [0, -15, -18, -20, -30],
  bandwidths: [40, 80, 100, 120, 120],
};

const Female = {
  key: 'F',
  pitch: 220,
  params: {Oq: 0.6, am: 0.77},
  gains: [0, -20, -26, -40, -50],
  bandwidths: [60, 90, 100, 120, 120],
};

export const Masculine = 0;
export const Neutral = 0.5;
export const Feminine = 1;

const makeGen = (gender) => (color) => (vowel, formants) => {
  return {
    gender: gender.key,
    color,
    vowel,
    source: {
      name: 'LiljencrantsFant',
      frequency: gender.pitch,
      params: gender.params,
    },
    formants: {
      freqs: formants,
      bands: gender.bandwidths,
      gains: gender.gains,
    }
  };
};

const makeGenM = makeGen(Male);
const makeGenF = makeGen(Female);

const makeGenMM = makeGenM(Masculine);
const makeGenMN = makeGenM(Neutral);
const makeGenMF = makeGenM(Feminine);

const makeGenFM = makeGenF(Masculine);
const makeGenFN = makeGenF(Neutral);
const makeGenFF = makeGenF(Feminine);

const MaleMasculinePresets = [
  makeGenMM('/æ/', [666, 1400, 2500, 3400, 3600]),
  makeGenMM('/e/', [450, 1750, 2550, 3300, 3600]),
  makeGenMM('/ʌ/', [500, 1250, 2550, 3250, 3600]),
  makeGenMM('/i/', [250, 2200, 2900, 3400, 3600]),
  makeGenMM('/ɪ/', [380, 1900, 2750, 3350, 3600]),
  makeGenMM('/ɜ/', [450, 1300, 2400, 3200, 3600]),
  makeGenMM('/ɒ/', [420, 1050, 2500, 3250, 3600]),
  makeGenMM('/ʊ/', [400, 1300, 2300, 3200, 3600]),
  makeGenMM('/u/', [380, 1400, 2200, 3150, 3600])
];

const MaleNeutralPresets = [
  makeGenMN('/æ/', [750, 1500, 2750, 3900, 4100]),
  makeGenMN('/e/', [500, 1750, 2780, 3800, 4100]),
  makeGenMN('/ʌ/', [550, 1250, 2780, 3750, 4100]),
  makeGenMN('/i/', [300, 2200, 3000, 3800, 4100]),
  makeGenMN('/ɪ/', [400, 2000, 2800, 3900, 4100]),
  makeGenMN('/ɜ/', [450, 1400, 2600, 3600, 4100]),
  makeGenMN('/ɒ/', [500, 1100, 2800, 3700, 4100]),
  makeGenMN('/ʊ/', [400, 1450, 2600, 3600, 4100]),
  makeGenMN('/u/', [300, 1500, 2400, 3600, 4100])
];

const MaleFemininePresets = [
  makeGenMF('/æ/', [800, 1600, 2750, 3900, 4700]),
  makeGenMF('/e/', [550, 1800, 2780, 3800, 4700]),
  makeGenMF('/ʌ/', [600, 1400, 2780, 3750, 4700]),
  makeGenMF('/i/', [400, 2300, 3000, 3800, 4700]),
  makeGenMF('/ɪ/', [450, 2100, 2800, 3900, 4700]),
  makeGenMF('/ɜ/', [550, 1500, 2600, 3600, 4700]),
  makeGenMF('/ɒ/', [530, 1200, 2800, 3700, 4700]),
  makeGenMF('/ʊ/', [450, 1500, 2600, 3600, 4700]),
  makeGenMF('/u/', [440, 1550, 2400, 3600, 4700])
];

const FemaleMasculinePresets = [
  makeGenFM('/æ/', [900, 1650, 2800, 4100, 4500]),
  makeGenFM('/e/', [650, 1900, 2850, 4100, 4500]),
  makeGenFM('/ʌ/', [600, 1500, 2850, 4000, 4500]),
  makeGenFM('/i/', [450, 2500, 3300, 4050, 4500]),
  makeGenFM('/ɪ/', [480, 2200, 3000, 4100, 4500]),
  makeGenFM('/ɜ/', [510, 1600, 2700, 4000, 4500]),
  makeGenFM('/ɒ/', [490, 1350, 2800, 3850, 4500]),
  makeGenFM('/ʊ/', [470, 1700, 2700, 3900, 4500]),
  makeGenFM('/u/', [450, 2000, 2650, 3900, 4500])
];

const FemaleNeutralPresets = [
  makeGenFN('/æ/', [950, 1750, 2800, 4150, 4700]),
  makeGenFN('/e/', [700, 2100, 3000, 4200, 4700]),
  makeGenFN('/ʌ/', [750, 1600, 2900, 4200, 4700]),
  makeGenFN('/i/', [400, 2700, 3300, 4250, 4700]),
  makeGenFN('/ɪ/', [550, 2200, 3100, 4250, 4700]),
  makeGenFN('/ɜ/', [700, 1900, 2800, 4300, 4700]),
  makeGenFN('/ɒ/', [600, 1500, 2900, 4000, 4700]),
  makeGenFN('/ʊ/', [500, 1800, 2800, 4100, 4700]),
  makeGenFN('/u/', [430, 2100, 2700, 3900, 4700])
];

const FemaleFemininePresets = [
  makeGenFF('/æ/', [1000, 1800, 2900, 4200, 4950]),
  makeGenFF('/e/', [900, 2200, 3100, 4200, 4950]),
  makeGenFF('/ʌ/', [950, 1750, 3000, 4300, 4950]),
  makeGenFF('/i/', [550, 2700, 3200, 4100, 4950]),
  makeGenFF('/ɪ/', [600, 2500, 3100, 4400, 4950]),
  makeGenFF('/ɜ/', [750, 1800, 2900, 4200, 4950]),
  makeGenFF('/ɒ/', [700, 1600, 2950, 4100, 4950]),
  makeGenFF('/ʊ/', [550, 1900, 3000, 4400, 4950]),
  makeGenFF('/u/', [450, 2000, 2800, 4000, 4950])
];

function makeSet(...lists) {
  const presets = {
    'M': {
      ...vowels.reduce((acc, v) => {
        acc[v] = {};
        return acc;
      }, {})
    },
    'F': {
      ...vowels.reduce((acc, v) => {
        acc[v] = {};
        return acc;
      }, {})
    }
  };

  for (const list of lists) {
    for (const preset of list) {
      const {gender, vowel, color} = preset;

      presets[gender][vowel][color] = preset;
    }
  }

  return presets;
}

// Aggregate all generated presets into one set.
const finalSet = makeSet(
    MaleMasculinePresets,
    MaleNeutralPresets,
    MaleFemininePresets,
    FemaleMasculinePresets,
    FemaleNeutralPresets,
    FemaleFemininePresets
);

export default finalSet;

// Gender preset getters
export const getPreset = ({gender, vowel, color}) => {
  if (color !== 0 && color !== 0.5 && color !== 1) {
    console.info('Requested vowel interpolation.');
    console.info('Not implemented yet: rounding to nearest preset color.');
    color = Math.round(2 * color) / 2;
  }

  return finalSet[gender][vowel][color];
};

export const defaultPreset = getPreset({gender: 'F', vowel: '/e/', color: Neutral});
