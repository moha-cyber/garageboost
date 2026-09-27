# GarageBoost

GarageBoost identifie les clients d’un garage à risque de départ et facilite leur relance. L’application est construite avec Next.js, TypeScript, Supabase et Tailwind CSS (CSS natif pour le thème).

## Démarrage

1. Créez un projet Supabase, puis ouvrez le **SQL Editor**.
2. Copiez-collez et exécutez [`supabase/schema.sql`](./supabase/schema.sql). Il crée les six tables, les relations, le trigger de création de garage et les politiques RLS.
3. Copiez `.env.example` vers `.env.local` et renseignez `NEXT_PUBLIC_SUPABASE_URL` ainsi que `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` depuis **Connect**.
4. Installez les dépendances avec `pnpm install`, puis lancez `pnpm dev`.

Avec une confirmation d’e-mail activée dans Supabase, confirmez d’abord l’adresse : le trigger SQL crée le garage avec le nom fourni lors de l’inscription.

## Import CSV

Depuis **Importer un CSV**, sélectionnez votre fichier. GarageBoost détecte les en-têtes puis permet de les associer aux champs. Seuls *Prénom* et *Nom* sont requis. Les colonnes suivantes sont prises en charge : prénom, nom, e-mail, téléphone, dernière visite, dépenses totales, marque/modèle/immatriculation/kilométrage, date/montant/prestation de visite.

Un client est mis à jour lorsqu’un e-mail déjà présent dans le même garage est importé. Le score est recalculé dans `lib/scoring.ts` et enregistré à chaque import.

## Risk Score

- pas de dernière visite : 80 points ;
- plus de 12, 9 ou 6 mois : 50, 35 ou 20 points ;
- dépenses ≥ 1 000 € ou ≥ 500 € : 20 ou 10 points ;
- plafond à 100 ; critique ≥70, élevé ≥40, modéré ≥20.

## Vérifications

`pnpm typecheck` vérifie TypeScript strict. `pnpm build` génère le build de production.
