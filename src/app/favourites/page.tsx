import type { Metadata } from "next";
import { FavouritesScreen } from "@/components/favourites/favourites-screen";

export const metadata: Metadata = {
  title: "Favourites",
  description: "The activities you've saved, stored on your device.",
};

export default function FavouritesPage() {
  return <FavouritesScreen />;
}
