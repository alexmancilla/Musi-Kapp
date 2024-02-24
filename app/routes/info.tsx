import { useEffect, useState } from "react";
import { Link } from "@remix-run/react";
import cssSongs from "../css/songs.module.css";


export default function Info() {
  const [savedSongs, setSavedSongs] = useState([]);

  useEffect(() => {
    const getAllSavedSongsEncoded = localStorage.getItem("savedSongs");
    if (getAllSavedSongsEncoded) {
      const savedSongs = JSON.parse(getAllSavedSongsEncoded);
      setSavedSongs(savedSongs);
    }
  }, []);

  return (
    <div className={cssSongs.container}>
      <h1>Favoritos</h1>
      <br />
      <Link  to="/">Volver a Inicio</Link>
        <br />
      <ul className={cssSongs.lista}>
        {savedSongs.map((song, index) => (
          <li key={index}>{song}</li>
        ))}
      </ul>
      
    </div>
  );
}