import React from "react";

const MusicPlayer = ({ songTitle }) => {
  return (
    <div className="music-player">
      <h3>🎵 {songTitle}</h3>
      <p>Écoute et devine le titre !</p>
    </div>
  );
};

export default MusicPlayer;
