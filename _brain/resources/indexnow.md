# IndexNow — protocolul, din documentația oficială

> Surse: https://www.indexnow.org/documentation și https://www.indexnow.org/faq
> Citite: 2026-11-21 (descărcate cu `curl`, text integral; mai jos doar ce folosim).
> Folosit de: `lib/indexnow.ts`, `scripts/indexnow-submit-sitemap.mjs`, `tests/e2e/indexnow.spec.ts`.

## Ce face

Anunță motoarele de căutare participante că un URL a fost **adăugat, modificat sau șters**, fără să aștepte
următoarea crawlare. Un URL trimis la un endpoint e împărțit automat cu toate motoarele participante
(endpointurile listate în FAQ: cel global, Amazon, Bing, Naver, Seznam.cz).

## Cheia

- „Your-key should have a minimum of 8 and a maximum of 128 hexadecimal characters. The key can contain only
  the following characters: lowercase characters (a-z), uppercase characters (A-Z), numbers (0-9), and dashes (-).”
- **Opțiunea 1 (recomandată):** „You must host a UTF-8 encoded text key file `{your-key}.txt` listing the key
  in the file at the root directory of your website.” Cu fișierul în rădăcină nu e nevoie de `keyLocation`.
- Opțiunea 2: fișierul în alt loc + `keyLocation` la fiecare trimitere; cheia acoperă atunci doar URL-urile
  de sub acel folder. „It is strongly recommended that you use Option 1.”
- Motoarele descarcă fișierul ca să verifice că deținem domeniul și folosesc cheia până o schimbăm.

La noi: `public/<cheie>.txt`, servit la `https://oakfantasy.ro/<cheie>.txt`; cheia e constanta `INDEXNOW_KEY`.

## Trimiterea

- Un URL: `GET https://<motor>/indexnow?url=<url>&key=<cheie>`.
- Mai multe (până la **10.000** pe cerere):

  ```
  POST /indexnow HTTP/1.1
  Content-Type: application/json; charset=utf-8
  Host: <motor>

  { "host": "www.example.com", "key": "…", "urlList": ["https://www.example.com/url1", "…"] }
  ```

- Endpoint global: `https://api.indexnow.org/indexnow` (din FAQ; alternative: Bing, Amazon, Naver, Seznam).
  Se trimite la **unul singur**.

## Răspunsuri

| Cod | Înseamnă |
|---|---|
| 200 OK | URL-urile au fost primite. „Only indicates that the search engine has received your set of URLs.” |
| 202 Accepted | Primite; validarea cheii e în curs |
| 400 Bad request | Format invalid |
| 403 Forbidden | Cheie invalidă (fișierul lipsește sau nu conține cheia) |
| 422 Unprocessable Entity | URL-uri care nu aparțin hostului sau cheie care nu respectă formatul |
| 429 Too Many Requests | Prea multe cereri (posibil spam) |

## Reguli de folosire (FAQ)

- Se trimit doar URL-urile care **s-au schimbat**; nu se retrimit cele neschimbate.
- URL-urile șterse sau redirecționate (404, 410, 301) **se trimit**: așa dispar din index.
- „It is not designed for submitting every URL on your site at once. If your entire site has been recently
  updated, such as after a migration or redesign, it is acceptable to submit all URLs.” Pentru descoperirea
  de fond rămâne sitemap-ul, cu `lastmod` corect.
- La 429: se așteaptă, nu se reîncearcă în buclă.

## Ce am hotărât la noi (2026-11-21)

Vezi [[../notes/decisions]] („IndexNow”). Pe scurt: trimitere doar de pe server, doar din producție, la
publicarea, modificarea sau scoaterea din vânzare a unui produs; o eroare se notează în log și nu oprește
salvarea; doar URL-uri publice (listă de permisiuni); scriptul manual se rulează o dată după un deploy
care schimbă tot site-ul.
