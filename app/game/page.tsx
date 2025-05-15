"use client";

import { useEffect } from "react";

export default function GameRedirect() {
  useEffect(() => {
    // Перенаправляем на статическую страницу с игрой
    window.location.href = "/game-static/index.html";
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-lg">Загрузка игры...</p>
    </div>
  );
}