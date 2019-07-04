export default {
  name: 'Bright female /e/',
  frequency: 245,
  source: {
    name: 'LF',
    params: {
      Oq: 0.65
    }
  },
  formants: {
    freqs: [540, 2900, 3250, 3600, 4950],
    bands: [60, 90, 120, 150, 200],
    gains: [0, -20, -15, -40, -56],
  }
}