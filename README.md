# Régie d’accueil — Gala Tournesols · Namur · 2026

Application **indépendante** du Blind Test V2. Aucun changement n'est nécessaire dans le dépôt du jeu.

## Ce que fait cette V1

- **Mac (écran principal)** : tableau de bord privé avec commandes de lecture, réglage du bandeau et bascule vers le jeu.
- **TV (deuxième écran en HDMI, mode bureau étendu)** : diaporama MP4 en boucle et bandeau défilant en haut.
- Le bandeau peut être modifié et activé/désactivé à tout moment, sans interrompre la vidéo.
- Le MP4 peut être chargé depuis la régie Mac et envoyé localement à la fenêtre TV du même navigateur ; la **lecture en boucle** est activable/désactivable depuis la régie.
- **Passage au Blind Test V2** : les deux liens fournis sont préconfigurés. Le bouton « Passer au Blind Test » affiche la page publique du jeu sur la TV et ouvre l'interface animateur sur le Mac. **Attention : la page publique/joueur n'est pas la fenêtre vidéo TV du Blind Test** ; cette dernière doit être ouverte depuis l'interface animateur pour disposer de la session et du jeton TV.

## Installation sur Render (en ligne)

1. Dans [Render](https://dashboard.render.com/), choisir **New → Web Service** puis connecter ce dépôt GitHub.
2. Configurer : **Build Command** `npm install` ; **Start Command** `npm start` ; **Node 20+**.
3. Créer la variable d'environnement **`ADMIN_PIN`**, avec un code secret long et unique d'au moins 10 caractères. **Ne jamais mettre ce code dans GitHub**.
4. Déployer puis relever l'URL publique de Render, par exemple `https://votre-regie.onrender.com`.
5. Ouvrir `https://votre-regie.onrender.com/regie.html` sur le Mac et `https://votre-regie.onrender.com/tv.html` dans une autre fenêtre placée sur la télévision.

La première connexion du service Render gratuit peut prendre un moment après une période d'inactivité. Pour un événement en direct, un service qui ne se met pas en veille est préférable.

## Préparation du Mac et de la TV

1. Réglages système macOS → Moniteurs → **Étendre l'affichage** (ne pas recopier le même écran).
2. Placer le navigateur de la TV sur le deuxième écran.
3. Sur la **régie Mac**, sélectionner le **MP4 local**. Il est transféré directement à la page TV via `BroadcastChannel`, sans upload sur Render/GitHub. Les deux fenêtres doivent être ouvertes dans le **même navigateur et le même profil sur le même Mac**. Cliquer sur **Lecture** depuis la régie ; si Safari bloque la lecture automatique, cliquer une première fois sur **Démarrer le diaporama** sur la TV, puis **Plein écran**.
4. Garder la page de régie sur l'écran du Mac. Le bandeau et les commandes sont synchronisés en temps réel.
5. Au lancement du Blind Test, cliquer sur le bouton de bascule : les deux liens fournis sont déjà renseignés. Pour afficher le lecteur vidéo TV du jeu, utiliser ensuite la commande **Ouvrir la fenêtre vidéo** dans l'interface animateur et déplacer cette fenêtre sur la TV.

⚠️ **Limites importantes :**

- Après actualisation de l'onglet TV, la régie ouverte retransmet le MP4 sélectionné. Après fermeture ou actualisation de la régie, il faut sélectionner le MP4 à nouveau (sécurité du navigateur).
- Le premier démarrage vidéo peut nécessiter un clic sur la TV : les navigateurs limitent les lectures automatiques commandées à distance. Le transfert local de très gros MP4 peut aussi échouer selon la mémoire disponible.
- Le plein écran s'active avec un clic sur la TV ; le navigateur peut le quitter lors de la navigation vers le Blind Test.
- Une fois passée au Blind Test, la page TV n'est plus reliée à la régie. Pour revenir à l'accueil, rouvrir `/tv.html` et recharger le MP4.
- L'application n'intègre pas encore un système d'authentification propre à l'écran TV : le lien TV doit être partagé uniquement avec l'équipe régie. Le code animateur protège les commandes, pas l'accès à l'image TV.
- Les réglages du bandeau ne sont conservés qu'en mémoire : un redémarrage du service restaure les valeurs par défaut.
- Les deux URL fournies (page publique et interface animateur) sont publiées dans le code. Elles ne contiennent pas de jeton de session. Les URL TV avec jeton doivent rester privées et ne sont pas intégrées à la régie.

## Exécution locale

```bash
npm install
ADMIN_PIN="choisissez-un-code-secret-long" npm start
```

Puis : `http://localhost:3000/regie.html` et `http://localhost:3000/tv.html`.

## Sécurité

Le dépôt peut être public mais **les codes d'accès et liens privés ne doivent pas être committés**. Si vous souhaitez garder l'architecture confidentielle, rendez le dépôt privé dans **GitHub → Settings → General → Danger Zone → Change repository visibility**.
