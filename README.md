<!-- Improved compatibility of back to top link: See: https://github.com/othneildrew/Best-README-Template/pull/73 -->

<a name="readme-top"></a>

<!-- PROJECT SHIELDS -->
<!--
*** I'm using markdown "reference style" links for readability.
*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).
*** See the bottom of this document for the declaration of the reference variables
*** for contributors-url, forks-url, etc. This is an optional, concise syntax you may use.
*** https://www.markdownguide.org/basic-syntax/#reference-style-links
-->

<!-- [![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url] -->

[![LinkedIn][linkedin-shield]][linkedin-url]

<div align="center">
<h1 align="center">Spotify Pods</h1>
  <p align="center">
    GA SEI Project 2
    <br />
    <br />
    <a href="https://pods-ga.netlify.app/">View Live Site</a>

  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#brief">Brief</a></li>
    <li><a href="#planning">Planning</a></li>
    <li><a href="#build-process">Build Process</a></li>
    <li><a href="#challenges-and-bugs">Challenges and Bugs</a></li>
    <li><a href="#key-takeaways">Key Takeaways</a></li>
    <li><a href="#future-improvements">Future Improvements</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
 
  </ol>
</details>

<!-- ABOUT THE PROJECT -->

## About The Project

[![Product Name Screen Shot][product-screenshot]](https://pods-ga.netlify.app/)

Timeframe: 1 week
Team: Solo

The following General Assembly Software Engineering Immersive Unit 2 project is a full-stack app using the MEVN stack. I chose to include consumption of Spotify’s API and built an app designed to allow groups of friends to create, comment on and share playlists, which could then be synced with user’s individual accounts.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

- Vue.js
- Express.js
- Node.js
- MongoDB
- Bootstrap
<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->

## Getting Started
For ease of deployment, this project is split into two repositories, frontend and backend.
This is the backend repo. Find the frontend repo [here](https://github.com/j-o-phillips/ga-unit_2-frontend).

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Installation

Running this app locally requires running the frontend and backend servers simultaneously. 
1. Clone the frontend repo
   ```sh
   git clone https://github.com/jake-o-phillips/ga-unit_2-frontend.git
   ```
2. Clone the backend repo
   ```sh
   git clone https://github.com/jake-o-phillips/ga-unit_2-backend.git
   ```
   
3. Install NPM packages in the frontend and backend directories
   ```sh
   npm install
   ```
4. Run the backend server from within the backend directory
   ```sh
   node server.js
   ```
5. Run the frontend server from within the frontend directory
   ```sh
   npm serve
   ```
6. Navigate to http://localhost:8080/

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- BRIEF -->

## Brief

The following were the General Assembly requirements for this project:

- Have at least 2 data entities (data resources) in addition to the User Model
- Use OAuth authentication.
- Implement basic authorization that restricts access to features that need a logged in user in order to work. In addition, ensure that editing and deletion of a data resource can only be done by the user that created that data.
- Have full-CRUD data operations somewhere within the app's features.
- Be styled such that the app looks and feels similar to apps we use on a daily basis - in other words, it should have a consistent and polished user interface.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- PLANNING -->

## Planning

- I wanted to make an app that would make spotify a more social experience. I knew the app should have two parts, a part that dealt with the group aspect of creating and sharing playlists and a part that allowed the user to update their personal playlists. I decided to work on the group part first as that involved most of the CRUD operations required in the brief.

- I created an ERD, describing my database model. I decided to use mostly embedded models as it seemed logical as each pod model would contain instances of the other models. However, the User model would be referenced separately as I wanted to be able to quickly access all the users of the site

![ERD Screen shot][erd-screenshot]

- I made a couple of sketches of the page designs and decided to use css grids to build an intuitive UI

![Excalidraw Screen shot][excal-screenshot]

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- BUILD PROCESS -->

## Build Process

### Authentication

For authentication I chose spotify’s authorization code PKCE flow. Spotify’s API docs are very clear and I was able to follow this process from the information available there. To outline the process, I generated a Code challenge which I used to request authorization from Spotify and receive a code. When the user is redirected back to my site’s dashboard page, upon the component mounting, the code is exchanged for an access token which I save to local storage to use in future api calls. In addition to this, when the user hits the dashboard page their spotify profile is received. I save this in a cookie which I can then use to protect the other routes on the frontend, and I use this data update the user model im my database. For a more thorough walk-through of the Spotify authorization PKCE flow follow this link:
[Spotify Docs](https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow)

### Pods

The main part of the app revolves around groups of users which I called ‘pods’. The first routes I wrote handled the creation and reading of these pods from the database. The user who creates the pod is automatically set as an admin, and an initial playlist is assigned to the pod. With these routes in place, I needed to design a page to view the details of the specific pod. I used a grid design to create an intuitive interface for interacting with the pod. One of my learning points for this project is not to base my designs so heavily on grids as the UI worked very well for horizontal screens but less well on mobile.

![Product Name Screen Shot][product-screenshot]

### Spotify

I needed to make sure I was able to access Spotify’s database to be able to search for songs. Again the docs were very clear and I wrote a search function that would return a list of relevant tracks.

```js
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
```

Now that i had this data, I could add it to the pod’s suggestion’s array or to the playlist array, and perform full crud operations on this data. The tracks and the playlist were now saved in my database, but I needed to sync this data with user’s individual spotify accounts. This involved writing logic that checked if the user already had the playlist and only needed to sync the tracks, or create a new playlist if they hadn’t already.

```js
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
```

### UX

The user could now search for songs, add them to suggestions or to a playlist and sync them to their spotify account. However, many of the calls to my mongoDB database were slow and didn’t allow for a slick user experience. To combat this, i decided to split up the front end and the backend. For example, a user could click to add a song from the suggestions box to the playlist box and I would update the frontend immediately. In the background the backend would update the database and when the user left or revisited the page, the frontend and the backend would be synced up. This caused a small problem in that if the user clicked repeatedly and made multiple calls to the database, there would be an error as the backend hadn’t completed the first call yet. However, I disabled the buttons while the backend was working to ensure this wouldn’t happen.

### My playlist

Having written the code to interact with user’s spotify playlists, it was fairly simple to add the second part of the app, focussing on the user’s individual playlists. A lot of the code from the first part was reusable, with the difference that here the playlists are updated immediately when the user clicks to add or remove a song, rather than requiring an extra ‘sync’ step. I implemented the same split of the frontend/backend for a better UX.

### Extras

After finishing the core features of the app, I added a number of extra features, including the ability to search for, join and leave pods from the ‘My Pods’ page, a simple post/comment system that only allows users to delete posts if they themselves have written them, a pod members view in the specific pod page, and a like/dislike system for the song suggestions

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CHALLENGES AND BUGS -->

## Challenges and Bugs

### Authentication

Authentication was a challenge for this project, and initially I was using passport.js with the spotify strategy. I kept getting problems with cors errors and eventually my instructor advised me to interact with Spotify api from the front end instead. This involved a considerable re-write, as well as an investigation of the different ways to authenticate with spotify

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- Key Takeaways -->

## Key Takeaways

One of the things I'm happy with in this project is the way I created a slick and fast user experience by splitting up the frontend UI and calls to the database on the backend.

These were my key takeaways for this project:

- **My mind was opened to the endless possibilities of using external apis in projects**
- **I gained appreciation of the importance of designing layouts that work on all screen sizes**

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- KNOWN BUGS -->

## Known Bugs

There is a problem with the deployed version of this app that doesn’t allow users to interact with the parts of the app that interact with Spotify’s database. I am getting cors errors that neither I or my instructor were able to solve, so I will continue to search for a fix.

In addition, I was unaware until the end of the project that the only people who can interact with the app have to be added to a developer list in Spotify’s developer hub, atleast until I get approval from spotify to publish the app. This obviously makes it difficult fo users to view my site as even the login process requires the spotify api.

<!-- FUTURE IMPORVEMENTS -->

## Future Improvements

- Fix the cors errors in the deployed version
- Add in multiple playlists for the pods
- Add in an invitation system to email other users with an invitation to your pod

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- LICENSE -->

## License

Distributed under the MIT License.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTACT -->

## Contact

Jake Phillips - jphillips@gmail.com

Portfolio Link: [Portfolio](https://github.com/jake-o-phillips/spaceacademy-backend)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[contributors-shield]: https://img.shields.io/github/contributors/jake-o-phillips/spaceacademy-backend.svg?style=for-the-badge
[contributors-url]: https://github.com/j-o-phillips/spaceacademy-backend/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/j-o-phillips/spaceacademy-backend.svg?style=for-the-badge
[forks-url]: https://github.com/j-o-phillips/spaceacademy-backend/network/members
[stars-shield]: https://img.shields.io/github/stars/jake-o-phillips/spaceacademy-backend/.svg?style=for-the-badge
[stars-url]: https://github.com/j-o-phillips/spaceacademy-backend/stargazers
[issues-shield]: https://img.shields.io/github/issues/spaceacademy-backend/spaceacademy-backend.svg?style=for-the-badge
[issues-url]: https://github.com/j-o-phillips/spaceacademy-backend/issues
[license-shield]: https://img.shields.io/github/license/spaceacademy-backend/spaceacademy-backend.svg?style=for-the-badge
[license-url]: https://github.com/j-o-phillips/spaceacademy-backend/blob/master/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://www.linkedin.com/in/jake-phillips-developer/
[product-screenshot]: assets/readme/product.png
[erd-screenshot]: assets/readme/erd.png
[excal-screenshot]: assets/readme/excal1.png
[Next.js]: https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white
[Next-url]: https://nextjs.org/
