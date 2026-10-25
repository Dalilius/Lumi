# Validation · Lumi Desktop 0.2.0

Version préparée le 23 octobre 2026. Refonte sans Supabase : SQLite local, Gemini natif et OAuth Google/Microsoft avec coffre Windows.

## Contrôles réalisés

- TypeScript : `npm run typecheck`, sans erreur.
- Production : export statique Next.js réussi pour l'application et le widget.
- 9 tests unitaires TypeScript : dates/fuseaux, score d'énergie incomplet, CSV, récurrences/exceptions ICS, liens externes, invariants de validation des candidatures et validation des sauvegardes.
- 7 tests natifs Rust exécutés sous Linux : transaction SQLite atomique et annulation sur conflit, préfixes littéraux, vecteur PKCE, rejet de callbacks ambigus, liste de domaines autorisés, serveur de retour OAuth rejetant un état incorrect avant un refus valide, annulation d'une connexion en cours.
- 10 groupes de parcours Chromium : séparation démo/local ; tâches et annulation ; CRM/CSV ; sommeil/macros ; import PDF ; révision, validation et gel d'une candidature ; OLED/navigation ; commande globale/deuxième fenêtre ; widget ; absence d'erreur JavaScript et de débordement à 960 px.
- 5 groupes Chromium avec pont Tauri simulé : migration des données/fichiers IndexedDB vers les commandes SQLite ; migration unique ; configuration/test Gemini et effacement de la clé ; restauration explicite et conservation des autres données ; sauvegarde avec pièces jointes sans identifiants.
- Inspection visuelle des réglages locaux dans Chromium.
- Compilation native Windows x64 avec Rust/MSVC via compilation croisée ; runtime C statique et SQLite embarqué. Les avertissements de symboles de débogage MSVC manquants n'empêchent pas la production de l'exécutable.

L’installateur NSIS français Windows x64 a été généré avec succès. Le fichier principal est identifié comme exécutable PE32+ GUI x86-64.

## Portée et essais restant sur Windows

Les tests du pont frontend utilisent des réponses simulées et les tests SQLite/OAuth exécutent le vrai noyau Rust sous Linux. Ils ne prouvent pas à eux seuls le fonctionnement du coffre ou de WebView2 sur un poste Windows. Le lancement de l'exécutable, le multi-fenêtrage natif, la dictée et l'installation NSIS doivent être vérifiés sur le PC cible.

Aucune clé API ou session Google/Microsoft de l'utilisateur n'a été fournie pour cette version. Les appels réels Gemini, le consentement/rafraîchissement des jetons et la synchronisation des comptes doivent être testés après configuration. Les restrictions EDHEC et les quotas Google restent propres aux comptes.

Aucune donnée Supabase n'a été téléchargée ou effacée. La migration automatique ne concerne que les données locales de l'installation précédente. Les mails ne sont jamais envoyés automatiquement et aucune candidature n'est déposée par Lumi.

## Reproduire

```sh
npm ci
npm run typecheck
npm test
npm run test:native
npm run build
npx playwright install chromium
npm run test:ui
npm run test:bridge
# Sous Windows avec les outils MSVC :
npm run desktop:build
```

Dans l'environnement de compilation Linux utilisé, Chromium est lancé avec les variables `LUMI_CHROMIUM_PATH` et `LUMI_SINGLE_PROCESS=1`. Ce mode n'est pas nécessaire sur un poste standard.
