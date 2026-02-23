import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
	index("routes/home.tsx"),
	route("about", "routes/about.tsx"),
	route("contact", "routes/contact.tsx"),
	route("privacy", "routes/privacy.tsx"),
	route("characters", "routes/characters.tsx"),
	route("play-game", "routes/play-game.tsx"),
	route("card-game", "routes/card-game.tsx"),
	route("online-game", "routes/online-game.tsx"),
	route("online-game/play", "routes/online-game.play.tsx"),
	route("rules", "routes/rules.tsx"),
	route("friends", "routes/friends.tsx"),
	route("login", "routes/login.tsx"),
	route("profile", "routes/profile.tsx"),
	route("admin", "routes/admin.tsx"),
	route("robots.txt", "routes/robots.txt.ts"),
	route("sitemap.xml", "routes/sitemap.xml.ts"),
] satisfies RouteConfig;
