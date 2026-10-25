# Lumi Desktop · 0.2.0

Application personnelle Windows 10/11 x64, avec Next.js, React, TypeScript et Tauri 2. Cette version fonctionne **sans Supabase et sans compte Lumi**. Les données sont conservées dans SQLite sur votre PC. Gemini, Gmail et Microsoft se connectent directement depuis l'application native.

## Installer et démarrer

1. Décompressez entièrement l'archive.
2. Lancez `Lumi_0.2.0_x64-setup.exe`. L'installateur peut télécharger Microsoft WebView2 si nécessaire. `Lumi.exe` permet aussi de lancer l'application directement quand WebView2 est présent. Il utilise le même dossier de données utilisateur : ce n'est pas un stockage portable à côté de l'exécutable.
3. Cliquez sur **Utiliser mon espace**, puis ouvrez **Réglages**.
4. Dans **Gemini, directement dans Lumi**, collez votre clé, cliquez sur **Enregistrer Gemini**, puis **Tester la connexion**.

L'exécutable est une version de développement non signée. Il n'exige ni serveur local Node.js, ni base distante, ni confirmation par email. Pour mettre à jour la version précédente, fermez Lumi puis installez la nouvelle version. Ne supprimez pas ses données d'application.

## Gemini

Créez votre clé personnelle dans [Google AI Studio](https://aistudio.google.com/api-keys). Le modèle est modifiable dans Réglages ; utilisez un modèle de génération de contenu disponible pour votre projet. La valeur livrée est `gemini-3.8-flash`. En cas de modèle indisponible, changez ce champ ; en cas de quota épuisé, vérifiez votre projet Google.

La clé et les autorisations OAuth sont conservées dans le **Gestionnaire d'identifiants Windows**, pas dans le stockage web, la base SQLite ou les sauvegardes JSON. Le formulaire masque la clé et se vide après enregistrement. Les requêtes réseau passent par Rust. La clé n'est jamais incluse dans cette distribution.

Gemini peut répondre dans le chat, produire le brief, préparer une relance, analyser les données de santé, rédiger une lettre/adaptations du CV et générer une fiche avec quiz à partir d'un PDF. Les messages, extraits de mails et documents utilisés pour une analyse sont transmis à Google. Sans connexion Internet, les modules locaux restent utilisables mais la génération IA et les synchronisations ne fonctionnent pas. Quotas et tarifs dépendent de votre compte Google.

## Gmail et Google Calendar

Cette version personnelle utilise **votre propre client OAuth de bureau**, distinct de votre clé Gemini. La configuration se fait une seule fois :

1. Ouvrez [Google Cloud Console](https://console.cloud.google.com/).
2. Créez/sélectionnez un projet. Activez **Gmail API** et **Google Calendar API**.
3. Configurez l'écran de consentement Google Auth Platform : nom de l'application, email de contact, audience. Pour une application externe en test, ajoutez votre adresse Gmail aux utilisateurs de test.
4. Dans les clients/identifiants, créez un **client OAuth 2.0 de type Application de bureau**. N'utilisez pas un client Application Web. Téléchargez le JSON contenant l'objet `installed`.
5. Dans Lumi → Réglages → Mails & calendriers → Configurer Google, cliquez sur **Importer le JSON Google**. Le client ID et son secret (s'il est fourni par Google) sont remplis. Cliquez sur **Connecter Google**.
6. Choisissez votre compte dans le navigateur et acceptez la lecture des mails et du calendrier. Gardez Lumi ouvert. Revenez dans Lumi, puis cliquez sur **Synchroniser mes comptes**.

Lumi ouvre temporairement un port local aléatoire sur `127.0.0.1`, avec PKCE et vérification de l'état OAuth. Il n'y a pas de lien Supabase à ouvrir ou à copier, ni d'adresse fixe `localhost:3000` à configurer. Le retour expire après cinq minutes ; le bouton Annuler permet de recommencer. Si Google indique `access_denied`, vérifiez le compte utilisateur de test. Pour `invalid_client`, réimportez le JSON du client **de bureau** correspondant au projet.

## Outlook / EDHEC et calendrier Microsoft

1. Ouvrez [Microsoft Entra](https://entra.microsoft.com/) → Inscriptions d'applications → Nouvelle inscription.
2. Choisissez les types de comptes adaptés. Pour `common`, utilisez une inscription acceptant les comptes professionnels/scolaires et personnels. Pour une inscription limitée à EDHEC, renseignez son tenant spécifique dans Lumi.
3. Dans Authentification, ajoutez la plateforme **Applications mobiles et de bureau** avec l'URI de redirection **`http://localhost`**. Le client est une application publique, avec PKCE ; **ne créez pas de secret client Microsoft**.
4. Dans Autorisations API, configurez les autorisations **déléguées Microsoft Graph** `User.Read`, `Mail.Read`, `Calendars.Read`. L'application demande également les scopes de connexion `openid`, `email`, `offline_access`.
5. Copiez l'**ID d'application (client)** dans les réglages Lumi. Utilisez `common` ou le tenant approprié, puis **Connecter Microsoft**.
6. Acceptez les permissions dans votre navigateur, revenez dans Lumi et synchronisez.

Les règles EDHEC peuvent exiger un consentement administrateur ou empêcher l'inscription d'une application. Lumi ne peut pas contourner ces règles. L'erreur Microsoft `AADSTS50011` signifie que la redirection ne correspond pas : vérifiez la plateforme de bureau et `http://localhost`.

Les deux connexions sont en **lecture seule** : Lumi n'envoie ni mail ni candidature. Déconnecter un compte retire son autorisation enregistrée sur le PC mais conserve les données déjà importées. Vous pouvez aussi révoquer le consentement dans les paramètres de votre compte Google ou Microsoft.

## Modules et limites précises

- **Brief** : agenda unifié, mails récents, trois priorités, focus 25 minutes, alertes réseau. Génération quotidienne à l'ouverture de l'application ; aucun service ne tourne quand Lumi est fermé.
- **Carrière** : offre collée, PDF/capture ou lien LinkedIn/Welcome to the Jungle. La lecture d'un lien fonctionne uniquement si une page publique fournit une description structurée accessible. Si elle est bloquée, collez le texte ou importez le PDF. L'IA prépare une lettre et des suggestions textuelles d'adaptation du CV ; elle ne réécrit pas la mise en page de votre CV PDF. Vous joignez vous-même la version finale.
- **Validation humaine** : une modification du contenu annule la validation. Une candidature envoyée est figée ; vous pouvez toujours changer son statut. L'envoi est réalisé par vous, dans le service d'origine.
- **Suivi mail** : liez une candidature à un fil et à son fournisseur. Les nouveaux extraits de ce fil peuvent déclencher un statut entretien/refus selon des expressions explicites ; ce suivi est heuristique et le statut reste modifiable manuellement.
- **Santé** : sommeil, macros, entraînement, charge cognitive et conseils IA. Le score d'énergie est un repère calculé, pas une mesure médicale ; les données manquantes ne sont pas inventées.
- **Réseau** : contacts, tags, relances, CSV dédupliqué par email, brouillons IA à copier manuellement.
- **Académique** : PDF, fiches et quiz interactifs issus de la lecture multimodale Gemini. Vérifiez les formules/pages importantes. Stockage de fichiers limité à 50 Mo, analyse à 10 Mo par document.
- **Agenda académique** : import `.ics`, récurrences et exceptions. Réimportez pour actualiser. Les événements absents d'un nouvel import ne sont pas supprimés automatiquement.
- **Synchronisation** : au lancement et toutes les cinq minutes quand une fenêtre est visible. Gmail : 30 derniers messages de l'inbox des 14 derniers jours ; Outlook : 30 derniers messages de l'inbox. Calendrier principal, de J−7 à J+30, au plus 1 250 événements par compte. Il ne s'agit pas d'un archivage complet de votre messagerie.
- **Bureau** : modules détachables, widget toujours au premier plan, OLED, onglets déplaçables (ou Alt + flèches), Ctrl + K. Dictée selon disponibilité du moteur WebView ; sinon Win + H dans le champ. La commande `/tache titre` fonctionne sans Gemini.

## Données, mise à jour et sauvegarde

SQLite et les documents sont dans `%APPDATA%\app.lumi.desktop\lumi.sqlite3`. Les documents sont stockés dans la base. Lors du premier accès à l'espace personnel, les anciennes données **locales** de Lumi 0.1.1 sont reprises automatiquement depuis le stockage web de la même installation. La migration est atomique et conserve les anciens originaux.

Les anciennes données **hébergées dans Supabase** ne sont pas téléchargées ni supprimées. Cette version ne se connecte plus à votre ancien projet. Si vous y avez stocké des données uniquement distantes, elles nécessitent un export séparé. Les sauvegardes JSON partielles de 0.1 ne sont pas reconnues par le nouveau format complet : la migration automatique de l'espace local reste la voie de mise à jour.

Réglages → **Sauvegarder mon espace** exporte les données personnelles **et pièces jointes**. Les clés, tokens et configurations de connexion sont exclus. Conservez une copie sur un autre disque ; le fichier contient vos données en clair. Pour restaurer, choisissez une sauvegarde Lumi 0.2 puis cliquez sur **Restaurer cette sauvegarde**. Les identifiants présents sont remplacés, les autres conservés. Import limité à 250 Mo. Sur un autre PC, reconnectez Gemini/Google/Microsoft.

Les exemples de découverte sont séparés des données personnelles. Le stockage n'est pas synchronisé entre plusieurs PC. Le coffre Windows protège les identifiants ; la base de données locale n'est pas elle-même chiffrée par Lumi.

## Développer

Source complet dans `source/`. Node.js 22+, Rust stable, outils MSVC C++ et WebView2 sous Windows.

```powershell
npm ci
npm run typecheck
npm test
npm run test:native
npm run desktop
# Créer l'installateur Windows sur Windows :
npm run desktop:build
```

`npm run dev`/`npm run preview` offrent un aperçu navigateur avec IndexedDB ; la connexion Gemini et OAuth nécessite le runtime Tauri Windows. Aucune variable `.env` n'est nécessaire. Ne placez aucune clé dans le code ou les fichiers distribués.

```powershell
npx playwright install chromium
npm run build
npm run test:ui
node tests/native-bridge.mjs
```

Le second test simule le pont Tauri pour vérifier l'interface et la migration ; il ne remplace pas un test avec vos comptes réels. Le rapport `VALIDATION.md` précise les contrôles réalisés.

## Références de configuration

- [OAuth Google pour applications natives](https://developers.google.com/identity/protocols/oauth2/native-app)
- [Flux Microsoft Authorization Code et PKCE](https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-auth-code-flow)
- [Modèles Gemini](https://ai.google.dev/gemini-api/docs/models)
