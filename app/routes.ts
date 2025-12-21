import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
	index("routes/home.tsx"),
	route("about", "routes/about.tsx"),
	route("contact", "routes/contact.tsx"),
	route("privacy", "routes/privacy.tsx"),
	route("robots.txt", "routes/robots.txt.ts"),
	route("sitemap.xml", "routes/sitemap.xml.ts"),
] satisfies RouteConfig;
