#!/usr/bin/env python3
"""
Génère les diagrammes de la documentation technique Tusch.mn.

Substitution Mermaid -> Graphviz : mermaid-cli n'a pas pu être installé dans
l'environnement de génération (chromium indisponible). Graphviz produit des
PNG nets sans dépendance navigateur. Les sources .dot sont versionnées dans
ce dossier ; les PNG sont (re)générés via :  python3 generate.py

Palette Atelier : ink #1a1714, cream #f4ede1, paper #faf6ee, sand #e8ddc8,
terre #a8542a, olive #5e6b3a, muted #8a7f6f, line #d9cfba.
"""
import os
import subprocess

HERE = os.path.dirname(os.path.abspath(__file__))

INK = "#1a1714"
CREAM = "#f4ede1"
PAPER = "#faf6ee"
SAND = "#e8ddc8"
TERRE = "#a8542a"
OLIVE = "#5e6b3a"
MUTED = "#8a7f6f"
LINE = "#d9cfba"
FONT = "Helvetica"

# ──────────────────────────────────────────────────────────────────────────
# Fig. 2.1 — Architecture globale
# ──────────────────────────────────────────────────────────────────────────
ARCHITECTURE = f"""
digraph architecture {{
  rankdir=LR;
  bgcolor="transparent";
  node [fontname="{FONT}", fontsize=11, color="{LINE}", fontcolor="{INK}"];
  edge [fontname="{FONT}", fontsize=9, color="{MUTED}", fontcolor="{MUTED}"];

  subgraph cluster_client {{
    label="Client"; style="rounded,filled"; fillcolor="{PAPER}"; color="{LINE}"; fontname="{FONT}"; fontcolor="{INK}";
    nav [label="Navigateur\\n(mobile-first)", shape=box, style="rounded,filled", fillcolor="{CREAM}"];
  }}

  subgraph cluster_edge {{
    label="Cloudflare"; style="rounded,filled"; fillcolor="{PAPER}"; color="{LINE}"; fontname="{FONT}"; fontcolor="{INK}";
    cf [label="DNS + Proxy\\n(mode Proxied)\\nTLS edge / WAF", shape=box, style="rounded,filled", fillcolor="{CREAM}"];
  }}

  subgraph cluster_caddy {{
    label="CT 101  ·  10.10.0.20"; style="rounded,filled"; fillcolor="{PAPER}"; color="{LINE}"; fontname="{FONT}"; fontcolor="{INK}";
    caddy [label="Caddy\\nreverse proxy HTTPS\\nLet's Encrypt", shape=box, style="rounded,filled", fillcolor="{SAND}"];
  }}

  subgraph cluster_app {{
    label="CT 200  tusch-app-01  ·  10.10.0.30"; style="rounded,filled"; fillcolor="{PAPER}"; color="{LINE}"; fontname="{FONT}"; fontcolor="{INK}";
    web [label="Next.js 16\\n(SSR / App Router)\\n:3000", shape=box, style="rounded,filled", fillcolor="{CREAM}"];
    api [label="NestJS 11\\nAPI REST\\n:3310", shape=box, style="rounded,filled", fillcolor="{CREAM}"];
    pg  [label="PostgreSQL 15", shape=cylinder, style="filled", fillcolor="{SAND}"];
  }}

  subgraph cluster_ext {{
    label="Services externes"; style="rounded,filled"; fillcolor="{PAPER}"; color="{LINE}"; fontname="{FONT}"; fontcolor="{INK}";
    fb [label="Firebase Auth\\n(SMS / Phone)", shape=box, style="rounded,filled", fillcolor="{CREAM}"];
    rs [label="Resend\\n(email transactionnel)", shape=box, style="rounded,filled", fillcolor="{CREAM}"];
  }}

  nav   -> cf    [label="HTTPS"];
  cf    -> caddy [label="443 (origin)"];
  caddy -> web   [label="tusch.mn"];
  caddy -> api   [label="api.tusch.mn"];
  web   -> api   [label="REST / cookies httpOnly"];
  api   -> pg    [label="Prisma"];
  api   -> fb    [label="verifyIdToken", style=dashed];
  api   -> rs    [label="send()", style=dashed];
}}
"""

# ──────────────────────────────────────────────────────────────────────────
# Fig. 2.2 — Publication d'une annonce
# ──────────────────────────────────────────────────────────────────────────
PUBLICATION = f"""
digraph publication {{
  rankdir=TB;
  bgcolor="transparent";
  node [fontname="{FONT}", fontsize=11, shape=box, style="rounded,filled", fillcolor="{CREAM}", color="{LINE}", fontcolor="{INK}"];
  edge [fontname="{FONT}", fontsize=9, color="{MUTED}", fontcolor="{MUTED}"];

  u   [label="Utilisateur\\n(rôle PROVIDER / BOTH)", fillcolor="{PAPER}"];
  form[label="Formulaire /listings/create\\n(validation Zod côté client)"];
  g   [label="JwtAuthGuard + EmailVerifiedGuard\\nThrottle LISTINGS_CREATE (10/min)", fillcolor="{SAND}"];
  svc [label="ListingsService.create()\\nValidation DTO class-validator"];
  db  [label="Prisma → INSERT Listing\\n(status=ACTIVE)", shape=cylinder, fillcolor="{SAND}"];
  img [label="POST /listings/:id/images\\nMulter + sharp (thumbnail)\\nThrottle UPLOAD"];
  fs  [label="Stockage /uploads\\n+ ListingImage (position)", shape=cylinder, fillcolor="{SAND}"];
  ts  [label="Trigger SQL → searchVector\\n(tsvector full-text)", fillcolor="{SAND}"];

  u -> form -> g -> svc -> db;
  db -> ts [label="à l'écriture"];
  svc -> img [label="puis upload images", style=dashed];
  img -> fs;
}}
"""

# ──────────────────────────────────────────────────────────────────────────
# Fig. 2.3 — Cycle de vie d'une offre
# ──────────────────────────────────────────────────────────────────────────
OFFRE = f"""
digraph offre {{
  rankdir=LR;
  bgcolor="transparent";
  node [fontname="{FONT}", fontsize=11, shape=box, style="rounded,filled", color="{LINE}", fontcolor="{INK}"];
  edge [fontname="{FONT}", fontsize=9, color="{MUTED}", fontcolor="{MUTED}"];

  start [label="Prestataire crée\\nune offre", shape=circle, width=0.3, fixedsize=false, fillcolor="{INK}", fontcolor="{CREAM}"];
  pending  [label="PENDING\\n(expiresAt = +7 j)", fillcolor="{CREAM}"];
  accepted [label="ACCEPTED", fillcolor="{SAND}"];
  rejected [label="REJECTED", fillcolor="{PAPER}"];
  cancelled[label="CANCELLED", fillcolor="{PAPER}"];
  expired  [label="EXPIRED", fillcolor="{PAPER}"];
  completed[label="COMPLETED\\n(completedAt)", fillcolor="{OLIVE}", fontcolor="{CREAM}"];
  review   [label="Avis croisé\\n(Review)", shape=box, style="rounded,filled", fillcolor="{TERRE}", fontcolor="{CREAM}"];

  start -> pending;
  pending  -> accepted  [label="client accepte"];
  pending  -> rejected  [label="client refuse"];
  pending  -> cancelled [label="prestataire annule"];
  pending  -> expired   [label="7 jours écoulés"];
  accepted -> completed [label="client valide\\nla prestation"];
  completed -> review   [label="REVIEW_REQUESTED\\n(2 parties)"];
}}
"""

# ──────────────────────────────────────────────────────────────────────────
# Fig. 2.4 — Messagerie
# ──────────────────────────────────────────────────────────────────────────
MESSAGERIE = f"""
digraph messagerie {{
  rankdir=TB;
  bgcolor="transparent";
  node [fontname="{FONT}", fontsize=11, shape=box, style="rounded,filled", fillcolor="{CREAM}", color="{LINE}", fontcolor="{INK}"];
  edge [fontname="{FONT}", fontsize=9, color="{MUTED}", fontcolor="{MUTED}"];

  s   [label="Expéditeur", fillcolor="{PAPER}"];
  send[label="POST /messages\\nJwtAuthGuard + EmailVerifiedGuard\\nThrottleByUser MESSAGES_SEND (30/min)", fillcolor="{SAND}"];
  svc [label="MessagesService.send()\\nlié à un listingId"];
  db  [label="Prisma → INSERT Message\\n(readAt = null)", shape=cylinder, fillcolor="{SAND}"];
  notif[label="Notification NEW_MESSAGE\\n+ email (si préférence ON)"];
  r   [label="Destinataire", fillcolor="{PAPER}"];
  poll[label="Polling 30 s\\nGET /messages/threads\\nGET /messages/unread-count"];
  read[label="PATCH /messages/:id/read\\n(readAt = now)"];

  s -> send -> svc -> db;
  db -> notif -> r;
  r -> poll -> read;
}}
"""

# ──────────────────────────────────────────────────────────────────────────
# Fig. 3.1 — Schéma entité-relation (ERD)
# ──────────────────────────────────────────────────────────────────────────
def rec(name, fields, fill=CREAM):
    rows = "".join(f'<tr><td align="left">{f}</td></tr>' for f in fields)
    return (f'{name} [label=<<table border="0" cellborder="0" cellspacing="0">'
            f'<tr><td bgcolor="{TERRE}"><font color="{CREAM}"><b>{name}</b></font></td></tr>'
            f'{rows}</table>>, shape=box, style="filled", fillcolor="{fill}"];')

ERD = f"""
digraph erd {{
  rankdir=LR;
  bgcolor="transparent";
  splines=true;
  node [fontname="{FONT}", fontsize=9, color="{LINE}", fontcolor="{INK}"];
  edge [fontname="{FONT}", fontsize=8, color="{MUTED}", fontcolor="{MUTED}", arrowhead=crow, arrowtail=none, dir=both, arrowsize=0.8];

  {rec("User", ["id (cuid) PK","email? UNIQUE","phone? UNIQUE","firebaseUid? UNIQUE","role / adminRole","status","verificationStatus","emailNotifications JSON","deletedAt?"], PAPER)}
  {rec("Listing", ["id PK","description","price","category?","location?","status","searchVector tsvector","userId FK","deletedAt?"])}
  {rec("ListingImage", ["id PK","listingId FK","url / thumbnailUrl","position"])}
  {rec("Offer", ["id PK","listingId FK","providerId FK","price / message","status (6)","expiresAt","completedAt?"])}
  {rec("Review", ["id PK","offerId FK","reviewerId FK","targetUserId FK","rating / comment"])}
  {rec("Message", ["id PK","senderId FK","recipientId FK","listingId FK","content","readAt?"])}
  {rec("Notification", ["id PK","userId FK","type (enum 10)","title / body","readAt?"])}
  {rec("Report", ["id PK","reporterId FK","targetType / targetId","reason / status"])}
  {rec("ServiceZone", ["id PK","userId FK","city / district?"])}
  {rec("FavoriteListing", ["id PK","userId FK","listingId FK"])}
  {rec("FavoriteProvider", ["id PK","userId FK","providerId FK"])}
  {rec("AdminActionLog", ["id PK","adminId FK","action","targetType / targetId","meta JSON?"])}

  User -> Listing [label="1..n"];
  Listing -> ListingImage [label="1..n"];
  Listing -> Offer [label="1..n"];
  User -> Offer [label="provider 1..n"];
  Offer -> Review [label="1..n"];
  User -> Review [label="given / received"];
  User -> Message [label="sent / received"];
  Listing -> Message [label="1..n"];
  User -> Notification [label="1..n"];
  User -> Report [label="1..n"];
  User -> ServiceZone [label="1..n"];
  User -> FavoriteListing [label="1..n"];
  Listing -> FavoriteListing [label="1..n"];
  User -> FavoriteProvider [label="1..n"];
  User -> AdminActionLog [label="1..n"];
}}
"""

# ──────────────────────────────────────────────────────────────────────────
# Fig. 6.1 — Authentification téléphone (Firebase)
# ──────────────────────────────────────────────────────────────────────────
AUTH_PHONE = f"""
digraph authphone {{
  rankdir=TB;
  bgcolor="transparent";
  node [fontname="{FONT}", fontsize=11, shape=box, style="rounded,filled", fillcolor="{CREAM}", color="{LINE}", fontcolor="{INK}"];
  edge [fontname="{FONT}", fontsize=9, color="{MUTED}", fontcolor="{MUTED}"];

  u    [label="Utilisateur\\nsaisit +976XXXXXXXX", fillcolor="{PAPER}"];
  rc   [label="Firebase JS SDK\\nreCAPTCHA + envoi SMS"];
  otp  [label="Saisie du code OTP\\n→ Firebase ID token"];
  post [label="POST /auth/phone/login\\nThrottle 10/min", fillcolor="{SAND}"];
  verify[label="FirebaseService.verifyIdToken()\\n(Firebase Admin SDK)"];
  match[label="Normalise E.164 (+976)\\nMatch firebaseUid / phone\\nsinon création", shape=diamond, fillcolor="{SAND}"];
  jwt  [label="Signe JWT → cookie httpOnly\\naccessToken (7 j)", fillcolor="{OLIVE}", fontcolor="{CREAM}"];
  audit[label="AuditService.log(PHONE_LOGIN)"];

  u -> rc -> otp -> post -> verify -> match -> jwt -> audit;
  verify -> u [label="503 si Firebase non configuré", style=dashed, constraint=false];
}}
"""

# ──────────────────────────────────────────────────────────────────────────
# Fig. 6.2 — Les 3 méthodes d'authentification
# ──────────────────────────────────────────────────────────────────────────
AUTH_3 = f"""
digraph auth3 {{
  rankdir=LR;
  bgcolor="transparent";
  node [fontname="{FONT}", fontsize=11, shape=box, style="rounded,filled", fillcolor="{CREAM}", color="{LINE}", fontcolor="{INK}"];
  edge [fontname="{FONT}", fontsize=9, color="{MUTED}", fontcolor="{MUTED}"];

  email [label="Email + mot de passe\\nPOST /auth/login\\nbcrypt", fillcolor="{PAPER}"];
  phone [label="Téléphone (Firebase)\\nPOST /auth/phone/login\\nID token vérifié", fillcolor="{PAPER}"];
  oauth [label="OAuth Google\\nNextAuth → POST /auth/oauth-login\\nupsert sur email", fillcolor="{PAPER}"];

  jwt   [label="JWT signé\\n(sub, email, adminRole)", fillcolor="{SAND}"];
  cookie[label="Cookie httpOnly\\naccessToken · sameSite lax · 7 j", fillcolor="{OLIVE}", fontcolor="{CREAM}"];
  api   [label="Toutes les routes protégées\\n(JwtAuthGuard)"];

  email -> jwt;
  phone -> jwt;
  oauth -> jwt;
  jwt -> cookie -> api;
}}
"""

# ──────────────────────────────────────────────────────────────────────────
# Fig. 8.1 — Infrastructure Hetzner / Proxmox
# ──────────────────────────────────────────────────────────────────────────
INFRA = f"""
digraph infra {{
  rankdir=TB;
  bgcolor="transparent";
  node [fontname="{FONT}", fontsize=11, shape=box, style="rounded,filled", fillcolor="{CREAM}", color="{LINE}", fontcolor="{INK}"];
  edge [fontname="{FONT}", fontsize=9, color="{MUTED}", fontcolor="{MUTED}"];

  net  [label="Internet", shape=ellipse, fillcolor="{PAPER}"];
  rfw  [label="Hetzner Robot Firewall\\n(filtrage en amont)", fillcolor="{SAND}"];
  ts   [label="Tailscale\\nadmin 100.68.52.59", fillcolor="{SAND}"];

  subgraph cluster_host {{
    label="Serveur dédié Hetzner AX41-NVMe  ·  Proxmox VE 8  ·  Falkenstein"; style="rounded,filled"; fillcolor="{PAPER}"; color="{LINE}"; fontname="{FONT}"; fontcolor="{INK}";

    vmbr0[label="vmbr0 (WAN)\\nIP publique", shape=box, fillcolor="{CREAM}"];
    vmbr1[label="vmbr1 (LAN privé 10.10.0.0/24)\\nNAT MASQUERADE + DNAT 80/443", shape=box, fillcolor="{CREAM}"];

    subgraph cluster_ct101 {{
      label="CT 101 · LXC"; style="rounded,filled"; fillcolor="{SAND}"; color="{LINE}"; fontcolor="{INK}";
      caddy[label="tusch-caddy-01\\n10.10.0.20\\nCaddy + Let's Encrypt", fillcolor="{CREAM}"];
    }}
    subgraph cluster_ct200 {{
      label="CT 200 · LXC"; style="rounded,filled"; fillcolor="{SAND}"; color="{LINE}"; fontcolor="{INK}";
      app[label="tusch-app-01 · 10.10.0.30\\nNode 22 · Next.js + NestJS\\nPostgreSQL 15", fillcolor="{CREAM}"];
    }}
    lvm[label="Stockage LVM-thin\\n(snapshots LXC)", shape=cylinder, fillcolor="{CREAM}"];
  }}

  net -> rfw -> vmbr0;
  vmbr0 -> vmbr1 [label="DNAT 80/443 → 10.10.0.20"];
  vmbr1 -> caddy;
  caddy -> app [label="reverse proxy interne"];
  app -> lvm [style=dashed, label="snapshots"];
  ts -> vmbr0 [label="accès admin chiffré", style=dashed, constraint=false];
}}
"""

DIAGRAMS = {
    "fig-2-1-architecture-globale": ARCHITECTURE,
    "fig-2-2-publication-annonce": PUBLICATION,
    "fig-2-3-cycle-offre": OFFRE,
    "fig-2-4-messagerie": MESSAGERIE,
    "fig-3-1-erd-prisma": ERD,
    "fig-6-1-auth-phone": AUTH_PHONE,
    "fig-6-2-auth-3-methodes": AUTH_3,
    "fig-8-1-infra-proxmox": INFRA,
}

def main():
    for name, dot in DIAGRAMS.items():
        dot_path = os.path.join(HERE, name + ".dot")
        png_path = os.path.join(HERE, name + ".png")
        with open(dot_path, "w", encoding="utf-8") as f:
            f.write(dot.strip() + "\n")
        subprocess.run(
            ["dot", "-Tpng", "-Gdpi=150", dot_path, "-o", png_path],
            check=True,
        )
        print("rendered", png_path)

if __name__ == "__main__":
    main()
