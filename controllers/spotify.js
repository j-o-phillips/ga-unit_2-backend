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

async function syncPlaylist(data, accessToken, userId) {
  const ROOT_URL = "https://api.spotify.com/v1";
  const config = {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };
  let newId;
  //format data
  const mapped = data.playlistData.map((track) => {
    return track.uri;
  });
  const toObj = { uris: mapped };
  console.log(data.playlistId);

  if (data.playlistId) {
    //?if a playlistid is present ie the playlist has been created
    //find the playlist
    await fetch(`${ROOT_URL}/playlists/${data.playlistId}`, config).then(
      (res) => res.json()
    );
    //populate it with our data
    await fetch(`${ROOT_URL}/playlists/${data.playlistId}/tracks`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(toObj),
    });
  } else {
    //create new playlist
    console.log("create new");
    const postData = {
      name: data.playlistName,
      public: false,
    };
    console.log(postData);
    console.log(userId);
    await fetch(`${ROOT_URL}/users/${userId}/playlists`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(postData),
    })
      .then((res) => res.json())
      .then((res) => (newId = res.id))
      .then((res) => console.log(res));

    //populate playlist with our data
    await fetch(`${ROOT_URL}/playlists/${newId}/tracks`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(toObj),
    });
  }
  return newId;
}

export { searchSpotify, syncPlaylist };
