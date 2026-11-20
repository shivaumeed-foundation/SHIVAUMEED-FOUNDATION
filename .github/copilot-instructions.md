# Copilot Instructions

## Project Shape

- This is a static, framework-free charity website. `index.html` contains the page structure and inline content; `style.css` contains all styling; `script.js` contains browser behavior.
- The site is deployed as static files. `CNAME`, `robots.txt`, `sitemap.xml`, and `site.webmanifest` are deployment/SEO metadata, not application code.
- Images are organized by purpose under `images/`, with gallery folders containing the seva and school photo assets. Preserve existing folder names, including spaces and duplicate hyphenated variants.
- `Certifications/` and `Certifications Thumbnails/` are user-facing document/media assets. Do not rename or reorganize them without updating every HTML reference.

## Editing Conventions

- Preserve the existing plain HTML/CSS/JavaScript approach. Do not introduce a framework, bundler, package manager, or build output for small site changes.
- Keep JavaScript compatible with normal browser execution: the file uses immediately-invoked sections, `var`, DOM queries, event listeners, and defensive null checks.
- Use the existing class naming conventions, especially section-specific prefixes such as `donate-`, `gallery-`, and `contact-`; add styles near related rules in `style.css`.
- Keep public asset paths relative to the repository root, for example `images/gallery/food seva/...`.
- Avoid changing organization contact details, account details, certification links, or image paths unless the task explicitly requests it.

## Donation Area

- The donation section is in `index.html` near the `donate` section. It currently exposes only the bank account number and IFSC for transfer details.
- Payment gateways, QR generation, UPI deep links, and PayPal links are legacy implementation paths and must remain disabled/hidden when editing the donation area.
- Copy buttons use `data-copy` values and are handled by the copy-button logic in `script.js`. Keep account and IFSC copying working.
- Do not add payment-provider icons, payment URLs, QR APIs, or transaction processing unless the user explicitly reverses the bank-details-only requirement.

## Verification

- There is no package manifest, test suite, or build script in this repository.
- For a change, inspect the affected HTML/CSS/JS directly and search for stale provider names or URLs with a text search.
- Validate static references and syntax in a browser or local static server when available. Do not assume a framework dev-server command exists.
- Keep changes focused; this repository is deployed directly, so accidental path or filename changes can break production assets.