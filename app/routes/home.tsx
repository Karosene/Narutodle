import type { Route } from "./+types/home";
import Site from "../main/main";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Narutodle - Naruto Character Guessing Game" },
    { name: "description", content: "Test your Naruto knowledge! Guess the character based on their attributes. A fun, family-friendly fan-made quiz game featuring characters from the Naruto series." },
  ];
} 
export default function Home() {
  return <Site />;
}
