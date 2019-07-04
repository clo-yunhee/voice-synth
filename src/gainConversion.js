function db2gain(dB) {
  return 10 ** (dB / 20);
}

function gain2db(gain) {
  return 20 * Math.log10(gain);
}

export {db2gain, gain2db};