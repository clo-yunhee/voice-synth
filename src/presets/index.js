function makeF(F0, label, formants, gains, bandwidths, sourceParams) {
  sourceParams = sourceParams || {};

  return {
    name: label,
    frequency: F0,
    source: {
      name: 'LF',
      params: {
        Oq: sourceParams.Oq || 0.6,
        am: sourceParams.am || 0.8,
      }
    },
    formants: {
      freqs: formants,
      bands: bandwidths,
      gains: gains,
    }
  }
}

function makeSet(...lists) {
  const set = {};
  for (const list of lists) {
    for (const preset of list) {
      set[preset.name] = preset;
    }
  }
  return set;
}

// Average pitches
const Bass = 100;
const Tenor = 280;
const CounterTenor = 320;
const Alto = 380;
const Soprano = 580;

// Generate vowels by voice type
const VowelPresets = [
  makeF(Soprano, 'Soprano /a/', [800, 1150, 2900, 3900, 4950], [0, -6, -32, -20, -50], [80, 90, 120, 130, 140]),
  makeF(Soprano, 'Soprano /e/', [350, 2000, 2800, 3600, 4950], [0, -20, -15, -40, -56], [60, 100, 120, 150, 200]),
  makeF(Soprano, 'Soprano /i/', [270, 2140, 2950, 3900, 4950], [0, -12, -26, -26, -44], [60, 90, 100, 120, 120]),
  makeF(Soprano, 'Soprano /o/', [450, 800, 2830, 3800, 4950], [0, -11, -22, -22, -50], [70, 80, 100, 130, 135]),
  makeF(Soprano, 'Soprano /u/', [325, 700, 2700, 3800, 4950], [0, -16, -35, -40, -60], [50, 60, 170, 180, 200]),
  makeF(Alto, 'Alto /a/', [800, 1150, 2800, 3500, 4950], [0, -4, -20, -36, -60], [80, 90, 120, 130, 140]),
  makeF(Alto, 'Alto /e/', [400, 1600, 2700, 3300, 4950], [0, -24, -30, -35, -60], [60, 80, 120, 150, 200]),
  makeF(Alto, 'Alto /i/', [350, 1700, 2700, 3700, 4950], [0, -20, -30, -36, -60], [50, 100, 120, 150, 200]),
  makeF(Alto, 'Alto /o/', [450, 800, 2830, 3500, 4950], [0, -9, -16, -28, -55], [70, 80, 100, 130, 135]),
  makeF(Alto, 'Alto /u/', [325, 700, 2530, 3500, 4950], [0, -12, -30, -40, -64], [50, 60, 170, 180, 200]),
  makeF(CounterTenor, 'Counter-tenor /a/', [660, 1120, 2750, 3000, 3350], [0, -6, -23, -24, -38], [80, 90, 120, 130, 140]),
  makeF(CounterTenor, 'Counter-tenor /e/', [440, 1800, 2700, 3000, 3300], [0, -14, -18, -20, -20], [70, 80, 100, 120, 120]),
  makeF(CounterTenor, 'Counter-tenor /i/', [270, 1850, 2900, 3350, 3590], [0, -24, -24, -36, -36], [40, 90, 100, 120, 120]),
  makeF(CounterTenor, 'Counter-tenor /o/', [430, 820, 2700, 3000, 3300], [0, -10, -26, -22, -34], [40, 80, 100, 120, 120]),
  makeF(CounterTenor, 'Counter-tenor /u/', [370, 630, 2750, 3000, 3400], [0, -20, -23, -30, -34], [40, 60, 100, 120, 120]),
  makeF(Tenor, 'Tenor /a/', [650, 1080, 2650, 2900, 3250], [0, -6, -7, -8, -22], [80, 90, 120, 130, 140]),
  makeF(Tenor, 'Tenor /e/', [400, 1700, 2600, 3200, 3580], [0, -14, -12, -14, -20], [70, 80, 100, 120, 120]),
  makeF(Tenor, 'Tenor /i/', [290, 1870, 2800, 3250, 3540], [0, -15, -18, -20, -30], [40, 90, 100, 120, 120]),
  makeF(Tenor, 'Tenor /o/', [400, 800, 2600, 2800, 3000], [0, -10, -12, -12, -26], [40, 80, 100, 120, 120]),
  makeF(Tenor, 'Tenor /u/', [350, 600, 2700, 2900, 3300], [0, -20, -17, -14, -26], [40, 60, 100, 120, 120]),
  makeF(Bass, 'Bass /a/', [600, 1040, 2250, 2450, 2750], [0, -7, -9, -9, -20], [60, 70, 110, 120, 130]),
  makeF(Bass, 'Bass /e/', [400, 1620, 2400, 2800, 3100], [0, -12, -9, -12, -18], [40, 80, 100, 120, 120]),
  makeF(Bass, 'Bass /i/', [250, 1750, 2600, 3050, 3340], [0, -30, -16, -22, -28], [60, 90, 100, 120, 120]),
  makeF(Bass, 'Bass /o/', [400, 750, 2400, 2600, 2900], [0, -11, -21, -20, -40], [40, 80, 100, 120, 120]),
  makeF(Bass, 'Bass /u/', [350, 600, 2400, 2675, 2950], [0, -20, -32, -28, -36], [40, 80, 100, 120, 120]),
];

// Aggregate all generated presets into one set.
const FinalSet = makeSet(VowelPresets);

// Export with default.
export default ({
  ...FinalSet,
  default: FinalSet['Alto /a/']
});