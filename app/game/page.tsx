"use client";

import { useEffect } from "react";

export default function GameRedirect() {
  useEffect(() => {
    // Перенаправляем на игру внутри приложения, а не на прямой URL
    window.location.href = "/game-static/index.html";
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-xl">Загрузка игры...</p>
    </div>
  );
}