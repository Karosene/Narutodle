import type { Route } from "./+types/home";
import Site from "../main/main";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Narutodle Infinite" },
    { name: "description", content: "Guess a random Naruto character on each refresh." },
  ];
} 
export default function Home() {
  return <Site />;
}
