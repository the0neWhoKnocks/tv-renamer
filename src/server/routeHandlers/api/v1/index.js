export const checkForCredentials = (res) => {
  // TODO - check for local file containing:
  // apikey, userkey, & username
  // 
  // If it doesn't exist - fail
  // Else, return creds
  res.end();
};

export const getJWT = (res) => {
  // TODO - Use credentials to get JWT `token`
  // Store in credentials with a timestamp. If the token is
  // older than 24 hours, get a new one.
  res.end();
};

export const getSeriesId = (res) => {
  // TODO - Get series `id`
  // - Store name and id in DB to make future lookups faster
  // - Returns an Array, so if there's more than one result, prompt the user
  // to choose.
  res.end();
};

export const getSeriesEpisodes = (res) => {
  // TODO - This returns all episodes for every season, so cache the episode
  // numbers along with their titles.
  // `airedSeason`, `airedEpisodeNumber`, `episodeName`
  res.end();
};