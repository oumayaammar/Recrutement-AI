# JobGate

Plateforme de recrutement intelligente : extraction automatique de CV, matching sémantique candidat/offre par IA, et gestion complète du pipeline de recrutement.

Projet réalisé dans le cadre d'un stage de fin d'études (Ingénierie, ISSAT Sousse).

---

## Fonctionnalités

**Côté candidat**
- Inscription / gestion de profil
- Dépôt de CV (PDF / DOCX)
- Extraction automatique des compétences, expériences et formations via IA
- Consultation des offres publiées et candidature en un clic
- Suivi de ses candidatures et de leur statut

**Côté recruteur**
- Gestion des offres (création, modification, publication, clôture)
- Pipeline de candidatures par étape (Suggérée → Reçue → Présélectionnée → Entretien → Acceptée / Refusée)
- Score de matching CV ↔ Offre calculé automatiquement (similarité vectorielle)
- Classement des candidats par pertinence pour une offre donnée
- Recherche sémantique en langage naturel dans la CVthèque ("développeur Python avec expérience FastAPI...")

**Administration**
- Gestion des comptes recruteurs et candidats

---

## Stack technique

| Couche | Technologies |
|---|---|
| Backend | FastAPI, SQLAlchemy 2.0, Pydantic v2, PostgreSQL |
| IA — extraction de CV | Groq API (Qwen 3 32B) |
| IA — matching / recherche | sentence-transformers (`paraphrase-multilingual-MiniLM-L12-v2`), similarité cosinus |
| Authentification | bcrypt (hash des mots de passe) |
| Frontend | Next.js (App Router), React, TypeScript |
| Conteneurisation | Docker, Docker Compose |

---

## Architecture du projet

```
jobgate/
├── docker-compose.yml
├── .env                        # secrets (non versionne)
│
├── recrutment_IA/              # backend FastAPI
│   ├── main.py                 # point d'entree, assemble les routers
│   ├── db.py                   # connexion PostgreSQL (SQLAlchemy)
│   ├── init_db.py              # creation des tables
│   ├── security.py             # hashage des mots de passe (bcrypt)
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── docker-entrypoint.sh
│   │
│   ├── models/                 # modeles SQLAlchemy (heritage Utilisateur)
│   ├── schemas/                 # schemas Pydantic (validation)
│   ├── controllers/             # logique metier / acces DB
│   ├── routers/                 # endpoints FastAPI
│   └── services/
│       ├── extraction_service.py   # extraction texte + entites (Groq)
│       └── embedding_service.py    # embeddings + score de matching
│
└── jobgate/ (ou frontend/)      # frontend Next.js
    ├── app/
    │   ├── candidate/
    │   ├── recruiter/
    │   └── admin/
    ├── lib/api/                 # appels API vers le backend
    ├── Dockerfile
    └── next.config.mjs
```

### Modèle de données

Héritage table-per-subtype : `Utilisateur` (classe mère) → `Administrateur`, `Recruteur`, `Candidat`.

Entités principales : `CV`, `Competence`, `Experience`, `Formation`, `Offre`, `Candidature`, `Embedding`, `Notification`.

---

## Démarrage avec Docker (recommandé)

**Prérequis** : Docker Desktop installé et lancé.

```bash
# 1. Copier le fichier d'exemple et renseigner les vraies valeurs
cp .env.example .env

# 2. Construire et lancer les 3 services (base de donnees, API, frontend)
docker compose up --build
```

- Backend : http://localhost:8000/docs (documentation Swagger interactive)
- Frontend : http://localhost:3000

Le premier build est plus long (téléchargement du modèle d'embeddings et des dépendances IA), les suivants sont mis en cache par Docker.

---

## Démarrage en local (sans Docker)

### Backend

```bash
cd recrutment_IA
python -m venv env
env\Scripts\Activate.ps1        # Windows (PowerShell)
pip install -r requirements.txt

python init_db.py               # cree les tables dans PostgreSQL
uvicorn main:app --reload
```

### Frontend

```bash
cd jobgate   # ou le nom de ton dossier frontend
npm install
npm run dev
```

---

## Variables d'environnement

| Variable | Description |
|---|---|
| `POSTGRES_PASSWORD` | Mot de passe de la base PostgreSQL |
| `GROQ_API_KEY` | Clé API Groq (extraction de CV) — gratuite sur console.groq.com |
| `DATABASE_URL` | URL de connexion PostgreSQL (injectée automatiquement par Docker Compose) |
| `NEXT_PUBLIC_API_URL` | URL du backend, utilisée côté navigateur par le frontend |

---

## Aperçu des endpoints principaux

```
POST   /candidats/                          Creer un compte candidat
POST   /recruteurs/                         Creer un compte recruteur
POST   /offres/                             Creer une offre
GET    /offres/{id}/pipeline                Vue kanban des candidatures d'une offre
GET    /offres/{id}/classement              Candidats classes par score de matching
POST   /cvs/{id}/extraire                   Extraction IA (competences/experiences/formations)
POST   /cvs/{id}/embedding                  Generer l'embedding d'un CV
POST   /offres/{id}/embedding               Generer l'embedding d'une offre
POST   /candidatures/{id}/calculer-score    Calculer le score de matching
GET    /recruteurs/recherche/candidats      Recherche semantique de candidats
```

Documentation complète et interactive disponible sur `/docs` une fois le serveur lancé.

---

## Roadmap

- [ ] Authentification JWT (remplace l'identification manuelle par ID recruteur)
- [ ] Endpoint d'upload de fichier CV (PDF/DOCX → extraction automatique du texte)
- [ ] Génération automatique des embeddings à la création d'un CV/d'une offre
- [ ] Filtrage `recruteur_id` côté backend pour "Mes offres" (actuellement filtré côté frontend)

---

## Auteur

Ammar — Étudiant ingénieur, ISSAT Sousse (Tunisie)
Stage Fullstack Developer — JobGate
