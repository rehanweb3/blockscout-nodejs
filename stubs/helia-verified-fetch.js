async function verifiedFetch(url) {
  return fetch(url);
}

module.exports = { verifiedFetch };
