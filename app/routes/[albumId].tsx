import { useLoaderData } from "@remix-run/react";

export async function loader({ params }) {
    try {
      const response = await fetch(`https://api.deezer.com/album/${params.albumId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch album details");
      }
      const albumDetails = await response.json();
      return { albumDetails };
    } catch (error) {
      console.error("Error fetching album details:", error.message);
      return { albumDetails: {}, error: error.message };
    }
  }

  function Album() {
    const { albumDetails } = useLoaderData();
    
    return (
      <div>
        <h1>{albumDetails.artist.name} - {albumDetails.title}</h1>
        {}
        {albumDetails.tracks.data.map(track => (
          <div key={track.id}>
            <p>{track.title}</p>
            <audio controls>
              <source src={track.preview} type="audio/mpeg" />
            </audio>
          </div>
        ))}
      </div>
    );
  }

export default Album;
