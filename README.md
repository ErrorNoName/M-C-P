# MCPanel

MCPanel est une interface console interactive pour interroger et afficher les informations d'un serveur Minecraft. Grâce à ce projet, vous pouvez récupérer, en temps réel, la véritable adresse IP (via résolution SRV), le port exact, le nombre de joueurs en ligne, le MOTD, la version du serveur, la liste des plugins (si activée en mode query) et bien d'autres détails.  
L'interface s'inspire d'outils comme prompt_toolkit et offre un menu convivial et coloré directement dans le terminal.

![MCPanel Banner](https://via.placeholder.com/600x150?text=MCPanel)

## Caractéristiques

- **Résolution SRV automatique :**  
  Récupère l'IP réelle et le port d'un serveur Minecraft à partir de son nom de domaine.

- **Interrogation du serveur :**  
  Utilise le protocole "status" (ping) pour obtenir le nombre de joueurs, le MOTD et la version.  
  Option "query" (si activée sur le serveur) pour récupérer la liste des plugins installés.

- **Interface Console Interactive :**  
  Menu intuitif avec une présentation en ASCII art, prompts interactifs et affichage coloré grâce à Inquirer, Chalk et Figlet.

- **Journalisation des requêtes :**  
  Chaque requête est loguée dans un fichier `requests.log`, accessible depuis l'interface.

## Prérequis

- **Node.js** (version 14 ou supérieure recommandée)
- **npm**

Les modules suivants sont utilisés :
- [inquirer](https://www.npmjs.com/package/inquirer)
- [chalk](https://www.npmjs.com/package/chalk)
- [figlet](https://www.npmjs.com/package/figlet)
- [minecraft-server-util](https://www.npmjs.com/package/minecraft-server-util)
- [ora](https://www.npmjs.com/package/ora)

## Installation

1. **Cloner le dépôt ou copier les fichiers dans un répertoire**  
   Assurez-vous d'avoir créé votre projet avec la structure souhaitée.

2. **Créer le fichier `package.json`**  
   Pour utiliser la syntaxe des modules ES, assurez-vous que le fichier `package.json` contient la ligne :
   ```json
   {
     "type": "module",
     ...
   }
   ```
   
3. **Installer les dépendances**  
   Dans le répertoire du projet, exécutez :
   ```bash
   npm install inquirer chalk figlet minecraft-server-util ora
   ```

4. **Rendre le script exécutable (optionnel)**  
   ```bash
   chmod +x MCPanel.js
   ```

## Utilisation

Pour lancer l'application, exécutez dans le terminal :
```bash
node MCPanel.js
```
ou, si vous avez rendu le script exécutable :
```bash
./MCPanel.js
```

### Fonctionnement

1. **Affichage du header :**  
   Le programme efface la console et affiche un logo en ASCII ("MCPanel") avec des couleurs.

2. **Menu interactif :**  
   Le menu principal propose trois options :
   - **Interroger un serveur Minecraft** : Saisissez l'adresse du serveur (par exemple, `TestBM-oXEQ.aternos.me`). Si aucun port n'est fourni, une résolution SRV est effectuée et le port par défaut 25565 est utilisé.
   - **Voir les logs** : Affiche le contenu du fichier `requests.log` qui enregistre chaque requête.
   - **Quitter** : Ferme l'application.

3. **Interrogation du serveur :**  
   Après saisie de l'adresse (et éventuellement du port et de la méthode de récupération), l'application démarre un spinner indiquant que le serveur est interrogé.  
   Une fois l'interrogation réussie, les informations suivantes s'affichent :
   - IP réelle (résolue via SRV)
   - Port réel
   - Nombre de joueurs en ligne / maximum
   - MOTD (message du jour)
   - Version du serveur
   - Liste des plugins (si récupérée via la méthode query)
   - Statut (forcé à "En ligne" si l'appel à status réussit)

4. **Journalisation :**  
   Toutes les requêtes et leurs résultats (ou erreurs) sont enregistrées dans le fichier `requests.log`, que vous pouvez consulter via l'option "Voir les logs" du menu.

## Exemple d'utilisation

Au lancement, le menu s'affiche :

```
? Que souhaitez-vous faire ? (Use arrow keys)
❯ Interroger un serveur Minecraft
  Voir les logs (si disponibles)
  Quitter
```

Sélectionnez "Interroger un serveur Minecraft". Ensuite, on vous demandera :

- **Adresse du serveur :**  
  Entrez par exemple `TestBM-oXEQ.aternos.me`.

- **Port :**  
  Laissez vide pour utiliser la résolution SRV (port par défaut 25565) ou saisissez un port spécifique.

- **Méthode de récupération :**  
  Choisissez "Status (Ping)" pour la plupart des cas, ou "Query" si le serveur a `enable-query=true`.

Une fois la requête terminée, vous verrez s'afficher :

```
=== Informations du serveur ===
IP réelle : [l'adresse résolue]
Port réel : [le port obtenu]
Joueurs : 1 / 20
Motd : Welcome to the server of freakidann!
Version : 1.16.5
Statut : En ligne
```

## Remarques

- **Résolution SRV :**  
  Le script tente d'obtenir l'enregistrement SRV pour récupérer la véritable adresse et le port du serveur. En cas d'échec, il utilise le port par défaut (25565).

- **Mode Query :**  
  La méthode "query" permet de récupérer des informations supplémentaires (liste des plugins), mais elle nécessite que l'option `enable-query` soit activée sur le serveur Minecraft.

- **Logs :**  
  Les logs détaillés sont enregistrés dans `requests.log`. Vous pouvez les consulter depuis le menu de l'application.

## Licence

Ce projet est sous licence MIT.

---

N'hésitez pas à contribuer, signaler des bugs ou proposer des améliorations via GitHub !

---
