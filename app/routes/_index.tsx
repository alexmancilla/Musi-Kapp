import {
  ClientLoaderFunctionArgs,
  Form,
  useFetcher,
  useLoaderData,
  useNavigation,
  useSearchParams,
  Link,
} from "@remix-run/react";

import cssSongs from "../css/songs.module.css";
import { useId, useState } from "react";
import { ActionFunctionArgs } from "@remix-run/node";
import { cli } from "@remix-run/dev";

function getSongData(entry) {
  return {
    id: entry.id,
    title: entry.title,
    preview: entry.preview,
    artistName: entry.artist.name,
    albumName: entry.album.title,
    cover: entry.album.cover_xl,
  };
}

function Song(song) {
  const fetcher = useFetcher();
  const { savedSongs } = useLoaderData<typeof clientLoader>();
  if (!savedSongs) {
    return null;
  }
  const intent = fetcher.formData?.get("intent");
  const futureLiked =
    intent === "save" ? true : intent === "unsave" ? false : null;
  const liked = futureLiked ?? savedSongs?.includes(song.title);

  return (
    <article className={cssSongs.songContainer}>
      <div className={song.semiTransparent ? cssSongs.semiTransparent : ""}>
        <div className={cssSongs.songMedia}>
          {/* <h3>{song.title}</h3> */}
          <h3>
            <Link to={'/album/${song.albumId}'}>
              {song.title}
            </Link>
          </h3>
          <h5>
            {song.artistName} - {song.albumName}
          </h5>
          <img src={song.cover} alt={song.albumName} loading="lazy" />
          <audio controls>
            <source src={song.preview} type="audio/mp3" />
            <track kind="captions" />
          </audio>
          <fetcher.Form method="post">
            <input type="hidden" name="song" value={song.title} />
            <input
              type="hidden"
              name="intent"
              value={liked ? "unsave" : "save"}
            />
            {liked ? (
              <button type="submit">♥️</button>
            ) : (
              <button type="submit">♡</button>
            )}
          </fetcher.Form>
        </div>
      </div>
    </article>
  );
}

export async function clientAction({ request }: ActionFunctionArgs) {
  const form = await request.formData();
  const values = Object.fromEntries(form.entries());
  const { song, intent } = values;

  const getAllSavedSongsEncoded = localStorage.getItem("savedSongs");
  let allSavedSongs = getAllSavedSongsEncoded
    ? JSON.parse(getAllSavedSongsEncoded)
    : [];
  allSavedSongs = Array.from(new Set(allSavedSongs));

  

  if (intent === "save") {
    allSavedSongs.push(song);
    console.log("Song saved: ", song);
    localStorage.setItem("savedSongs", JSON.stringify(allSavedSongs));
  } else {
    const remainingSongs = allSavedSongs.filter(
      (savedSong) => savedSong !== song
    );
    console.log("Song unsaved: ", song);
    localStorage.setItem("savedSongs", JSON.stringify(remainingSongs));
  }

  console.log("All saved songs: ", allSavedSongs);

  return null;
}

export async function clientLoader({ serverLoader }: ClientLoaderFunctionArgs) {
  const serverData = await serverLoader();
  const getAllSavedSongsEncoded = localStorage.getItem("savedSongs");
  const savedSongs = getAllSavedSongsEncoded
    ? JSON.parse(getAllSavedSongsEncoded)
    : [];
  return { savedSongs, ...serverData };
}
clientLoader.hydrate = true;

async function loader({ request }) {
  try {
    const userSearch = new URL(request.url).searchParams.get("search");
    const search = userSearch ?? "top songs 2023";
    const url = "https://api.deezer.com/search?q=" + search;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Failed to fetch songs from Deezer API");
    }

    const { data } = await response.json();

    const songs = data.map(getSongData).slice(0, 10);
    return { songs };
  } catch (error) {
    console.error("Error fetching songs:", error.message);
    return { songs: [], error: error.message };
  }
}

function Index() {
  const { songs } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const busy = navigation.state !== "idle";
  const [params] = useSearchParams();

  const id = useId();
  return (
    <main className={cssSongs.container}>
      <h1 className={cssSongs.title}>Musi Kapp</h1>
      <div>
        <p>
          Welcome to Musi Kapp! Search for a song and listen to a preview. You
          can also like a song and it will be saved for you to listen to later.
        </p>
      </div>
      <div className={cssSongs.headerBar}>
        <Form>
          <label htmlFor={id}>Search for a song: </label>
          <input
            type="text"
            name="search"
            id={id}
            defaultValue={params.get("search") ?? ""}
          />
          <button type="submit">🔎</button>
        </Form>

        <Link to="/info">Favoritos</Link>
      </div>

      <div className={cssSongs.songsContainer}>
        {songs.map((song) => (
          <Song semiTransparent={busy} key={song.id} {...song} />
          
        ))}
      </div>
    </main>
  );
}

export { loader };
export default Index;
