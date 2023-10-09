async function addTrackToPlaylist(podName, trackData, model) {
  const podToUpdate = await model.find({ name: podName });
  //change this when we have multiple playlists
  podToUpdate[0].playlists[0].tracks.push(trackData);
  await podToUpdate[0].save();
}

async function addTrackToSuggestions(podName, trackData, model) {
  const podToUpdate = await model.find({ name: podName });
  //change this when we have multiple playlists
  podToUpdate[0].playlists[0].suggestions.push(trackData);
  await podToUpdate[0].save();
}

async function removeTrackFromPlaylist(podName, trackData, model) {
  const podToUpdate = await model.find({ name: podName });
  //change this when we have multiple playlists
  //find track index
  const index = podToUpdate[0].playlists[0].tracks.findIndex((track) => {
    return track.id === trackData.id;
  });
  console.log(index);
  podToUpdate[0].playlists[0].tracks.splice(index, 1);

  await podToUpdate[0].save();
}

async function removeTrackFromSuggestions(podName, trackData, model) {
  const podToUpdate = await model.find({ name: podName });
  //change this when we have multiple playlists
  //find track index
  const index = podToUpdate[0].playlists[0].suggestions.findIndex((track) => {
    return track.id === trackData.id;
  });
  console.log(index);
  podToUpdate[0].playlists[0].suggestions.splice(index, 1);

  await podToUpdate[0].save();
}

export {
  addTrackToPlaylist,
  addTrackToSuggestions,
  removeTrackFromPlaylist,
  removeTrackFromSuggestions,
};
