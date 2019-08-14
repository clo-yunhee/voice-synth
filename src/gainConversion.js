function db2amp(dB) {
  return 10 ** (dB / 20);
}

function amp2db(amp) {
  return 20 * Math.log10(amp);
}

export {db2amp, amp2db};