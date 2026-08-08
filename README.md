# tunirsaha.com

Personal portfolio. Single page, hand-written HTML, CSS and JavaScript —
zero dependencies, no framework, no build step. The site is the work sample.

## Layout

```
index.html      the whole page
404.html        our own error page (see .htaccess ErrorDocument)
css/styles.css  design system + every component
js/main.js      progressive enhancement only; the page is complete without it
.htaccess       transport, caching, headers, 404 handling
robots.txt      27 named AI crawlers, all allowed
sitemap.xml     4 URLs, lastmod kept honest
llms.txt        plain-text brief written for answer engines
assets/         fonts (self-hosted woff2), employer logos, og image
```

`projects/` lives on the server only — it is not in this repo and not in the
deploy package. An overwrite deploy leaves it untouched; a directory swap
would not.

## Docs

- `PRODUCT.md` — who the site is for and what it has to do.
- `DESIGN.md` — the design system, as named rules.

Both are read automatically by the `impeccable` critique skill at the start of
a session, so a rule written there is a rule it will hold the work to. That is
the point of writing them down: constraints belong somewhere a reviewer reads,
not somewhere a person has to remember.

## Deploy

```sh
./deploy.sh
```

Builds `tunirsaha-deploy.zip` with entries at the archive root. Upload to
hPanel → File Manager → `public_html` → Extract → overwrite, then delete the
zip. Turn on "show hidden files" first, or `.htaccess` will not extract — that
file carries the https redirect, HSTS and the 404 handler.

The script refuses to package if a payload is missing or if any local `href`
or `src` in `index.html` does not resolve.

## Verify after deploy

```sh
curl -sI https://tunirsaha.com/ | grep -i strict-transport
curl -so /dev/null -w '%{http_code}\n' https://tunirsaha.com/no-such-page   # 404, ours
curl -sI -A 'ClaudeBot/1.0' https://tunirsaha.com/ | head -1                # 200
```
