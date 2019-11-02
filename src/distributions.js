/**
 * Generate an array from random length between `min` and `max`, calling `fct`
 * to populate each item.
 *
 * TODO: Support more than just uniform distribution
 *
 * @param {function} fct
 * @param {function} dist
 */
function several(fct = () => undefined, dist = uniform) {
  const rand = dist();
  const length = Math.max(Math.floor(rand), 0);
  return Array.from(new Array(length), fct);
}

function uniform(min = 0, max = 10) {
  return Math.random() * max + min;
}

// https://github.com/robbrit/randgen/blob/master/lib/randgen.js#L21-L49
// Generate normally-distributed random nubmers
// Algorithm adapted from:
// http://c-faq.com/lib/gaussian.html
function normal(mean = 0.0, stdev = 1.0) {
  var u1, u2, v1, v2, s;
  if (normal.v2 === undefined) {
    do {
      u1 = Math.random();
      u2 = Math.random();

      v1 = 2 * u1 - 1;
      v2 = 2 * u2 - 1;
      s = v1 * v1 + v2 * v2;
    } while (s === 0 || s >= 1);

    normal.v2 = v2 * Math.sqrt((-2 * Math.log(s)) / s);
    return stdev * v1 * Math.sqrt((-2 * Math.log(s)) / s) + mean;
  }

  v2 = normal.v2;
  normal.v2 = undefined;
  return stdev * v2 + mean;
}

// https://github.com/robbrit/randgen/blob/master/lib/randgen.js#L67-L81
function poisson(lambda = 1) {
  var l = Math.exp(-lambda),
    k = 0,
    p = 1.0;
  do {
    k++;
    p *= Math.random();
  } while (p > l);

  return k - 1;
}

function pick(array, dist = () => uniform(0, array.length - 1)) {
  const rand = dist();
  const index = Math.max(0, Math.min(Math.floor(rand), array.length - 1));
  return array[index];
}

module.exports = {
  pick,
  several,
  uniform,
  normal,
  poisson
};
