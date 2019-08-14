export default {
  name: 'Bright female /i/',
  frequency: 150,
  source: {
    name: 'LF',
    params: {
      Oq: 0.6,
      am: 0.77
    }
  },
  formants: {
    freqs: [270, 2300, 3000, 3650, 4500],
    bands: [100, 100, 100, 100, 100],
    gains: [0, -15, -9, -27, -27],
  }
}