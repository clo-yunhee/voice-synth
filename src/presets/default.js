export default {
  name: 'Default',
  frequency: 170,
  source: {
    name: 'LF',
    params: {
      Oq: 0.6
    }
  },
  formants: {
    freqs: [350, 2000, 2800, 3600, 4950],
    bands: [60, 100, 120, 150, 200],
    gains: [0, -20, -15, -40, -56],
  }
}