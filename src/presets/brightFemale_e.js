export default {
  name: 'Bright female /e/',
  frequency: 245,
  source: {
    name: 'LF',
    params: {
      Oq: 0.68,
      am: 0.74
    }
  },
  formants: {
    freqs: [700, 2300, 3250, 3600, 4950],
    bands: [60, 90, 120, 150, 200],
    gains: [0, -20, -15, -40, -56],
  }
}