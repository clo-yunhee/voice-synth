export default {
  name: 'Dark male /a/',
  frequency: 110,
  source: {
    name: 'LF',
    params: {
      Oq: 0.2,
      am: 0.75
    }
  },
  formants: {
    freqs: [500, 830, 1850, 2450, 2750],
    bands: [60, 70, 110, 120, 130],
    gains: [0, -7, -9, -9, -20],
  }
}