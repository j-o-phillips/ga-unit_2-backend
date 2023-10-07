const SPOTIFY_API_URL = "https://api.spotify.com/v1";

async function searchSpotify(query, accessToken) {
  const url = new URL(`${SPOTIFY_API_URL}/search`);
  url.searchParams.append("q", query);
  url.searchParams.append("type", "track");
  url.searchParams.append("limit", 10);

  const config = {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };
  //make api fetch request
  const response = await fetch(url, config);
  const data = await response.json();
  return data.tracks.items;
}

export { searchSpotify };
