"use client";

import { useEffect } from "react";

export default function GamePage() {
  useEffect(() => {

    // window.location.href = "/game-static/index.html";
  }, []);

  return (
    <div className="game-container flex items-center justify-center min-h-screen" style={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
      <iframe
        src="/game-static/index.html"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
        title="Life of Duckie Game"
        allowFullScreen
        onLoad={() => console.log("Game loaded")} // Для отладки
      />

      <div className="absolute flex items-center justify-center min-h-screen">
        <p className="text-xl">Загрузка игры...</p>
      </div>
    </div>
  );
}
