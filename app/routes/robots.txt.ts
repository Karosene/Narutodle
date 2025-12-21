export async function loader() {
  const robotsTxt = `User-agent: *
Allow: /
Disallow: /api/

Sitemap: https://narutodle.app/sitemap.xml

User-agent: Googlebot
Allow: /

User-agent: Mediapartners-Google
Allow: /`;

  return new Response(robotsTxt, {
    status: 200,
    headers: { 'Content-Type': 'text/plain' },
  });
}
