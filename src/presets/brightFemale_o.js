export default {
  name: 'Bright female /o/',
  frequency: 208,
  source: {
    name: 'LF',
    params: {
      Oq: 0.5,
      am: 0.8
    }
  },
  formants: {
    freqs: [730, 850, 1800, 3800, 4950],
    bands: [40, 60, 100, 130, 135],
    gains: [0, -9, -22, -22, -50],
  }
}