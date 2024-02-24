import { useFetcher, useLoaderData } from "@remix-run/react";
import cssSongs from "../css/songs.module.css"; // Asegúrate de ajustar la ruta si es necesario


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
            <h3>{song.title}</h3>
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
  
export default Song;
