import { createContext, useContext, useState, useCallback, useEffect } from "react";

const FavoritesContext = createContext(null);

// There's no sign-in on this site, so "your favorites" can only ever mean
// "favorites saved on this browser" — localStorage is the right (and only
// sensible) place for that, not a Supabase table tied to a user who
// doesn't exist.
const STORAGE_KEY = "bsi_favorites";

function readStoredFavorites() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const ids = raw ? JSON.parse(raw) : [];
    return Array.isArray(ids) ? new Set(ids) : new Set();
  } catch {
    // Corrupted JSON, storage disabled (private browsing in some browsers),
    // or unavailable entirely — start empty rather than crash the app over
    // a wishlist.
    return new Set();
  }
}

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState(readStoredFavorites);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...favorites]));
    } catch {
      // Storage full or unavailable — favorites still work for the rest of
      // this session in memory, they just won't persist across reloads.
    }
  }, [favorites]);

  const toggleFavorite = useCallback((id) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const removeFavorite = useCallback((id) => {
    setFavorites((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const clearFavorites = useCallback(() => setFavorites(new Set()), []);

  return (
    <FavoritesContext.Provider
      value={{ favorites, toggleFavorite, removeFavorite, clearFavorites }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
}
