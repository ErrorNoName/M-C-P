#!/usr/bin/env node
/**
 * MCPanel.js LunarWave
 * Dépendances (à installer avec npm) :
 *   npm install inquirer chalk figlet minecraft-server-util ora
 *
 * Assurez-vous que votre package.json contient "type": "module" pour utiliser ESM.
 */
import inquirer from 'inquirer';
import chalk from 'chalk';
import figlet from 'figlet';
import ora from 'ora';
import { status, queryFull } from 'minecraft-server-util';
import dns from 'dns/promises';
import fs from 'fs';

// Fonction pour résoudre les enregistrements SRV et obtenir le vrai nom d'hôte et port
async function resolveSRV(hostname) {
  try {
    const addresses = await dns.resolveSrv('_minecraft._tcp.' + hostname);
    if (addresses.length > 0) {
      return { host: addresses[0].name, port: addresses[0].port };
    }
  } catch (err) {
    // Aucun enregistrement SRV trouvé, on continue
  }
  return { host: hostname, port: 25565 };
}

// Fonction pour interroger le serveur Minecraft en utilisant la résolution SRV
async function getServerInfo(address, portParam) {
  let resolved;
  if (!portParam) {
    resolved = await resolveSRV(address);
  } else {
    resolved = { host: address, port: parseInt(portParam, 10) };
  }
  // On récupère les informations du serveur via status()
  const serverInfo = await status(resolved.host, resolved.port);
  // Injecter le vrai nom d'hôte résolu dans l'objet retourné (si absent)
  serverInfo.realHost = resolved.host;
  // S'assurer que le port est renseigné
  serverInfo.port = serverInfo.port || resolved.port;
  return serverInfo;
}

// Fonction d'affichage du header en ASCII art
function showHeader() {
  console.clear();
  console.log(chalk.green(figlet.textSync('MCPanel', { horizontalLayout: 'full' })));
  console.log(chalk.cyan('Interface console pour obtenir les infos d\'un serveur Minecraft\n'));
}

// Fonction d'affichage des informations du serveur
function displayServerInfo(info) {
  console.log(chalk.bold('\n=== Informations du serveur ==='));
  // Utilise info.realHost si défini, sinon info.host
  const realIP = info.realHost || info.host || 'Inconnue';
  console.log(chalk.yellow('IP réelle :'), realIP);
  console.log(chalk.yellow('Port réel :'), info.port);
  console.log(chalk.yellow('Joueurs :'), `${info.players ? info.players.online : 0} / ${info.players ? info.players.max : 0}`);
  if (info.motd) {
    const motd = info.motd.clean || info.motd;
    console.log(chalk.yellow('Motd :'), motd);
  }
  if (info.version) {
    if (typeof info.version === 'object' && info.version.name)
      console.log(chalk.yellow('Version :'), info.version.name);
    else
      console.log(chalk.yellow('Version :'), info.version);
  }
  if (info.plugins && info.plugins.length > 0) {
    console.log(chalk.yellow('Plugins :'), info.plugins.join(', '));
  }
  // Forcer le statut à "En ligne" si l'appel status() a réussi
  console.log(chalk.yellow('Statut :'), chalk.green('En ligne'));
  console.log('');
}

// Fonction pour afficher les logs à partir du fichier 'requests.log'
async function showLogs() {
  console.clear();
  console.log(chalk.bold('=== Logs ===\n'));
  try {
    const logs = fs.readFileSync('requests.log', 'utf8');
    console.log(logs);
  } catch (error) {
    console.log(chalk.red('Aucun log trouvé.'));
  }
  await inquirer.prompt([{ type: 'input', name: 'pause', message: 'Appuyez sur Entrée pour revenir au menu principal...' }]);
}

// Menu principal interactif
async function mainMenu() {
  showHeader();
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'choice',
      message: 'Que souhaitez-vous faire ?',
      choices: [
        { name: 'Interroger un serveur Minecraft', value: 'query' },
        { name: 'Voir les logs (si disponibles)', value: 'logs' },
        { name: 'Quitter', value: 'exit' }
      ]
    }
  ]);
  if (answers.choice === 'query') {
    await queryServerMenu();
    await mainMenu();
  } else if (answers.choice === 'logs') {
    await showLogs();
    await mainMenu();
  } else {
    console.log(chalk.blue('Au revoir !'));
    process.exit(0);
  }
}

// Menu pour interroger un serveur
async function queryServerMenu() {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'serverAddress',
      message: 'Entrez l\'adresse du serveur Minecraft (ex: TestBM-oXEQ.aternos.me) :',
      validate: input => input.trim() !== '' ? true : 'L\'adresse ne peut pas être vide.'
    },
    {
      type: 'input',
      name: 'port',
      message: 'Entrez le port (laisser vide pour résolution SRV et port par défaut 25565) :',
      default: ''
    },
    {
      type: 'list',
      name: 'method',
      message: 'Méthode de récupération :',
      choices: [
        { name: 'Status (Ping)', value: 'status' },
        { name: 'Query (si activé sur le serveur)', value: 'query' }
      ]
    }
  ]);

  const spinner = ora('Interrogation du serveur...').start();
  try {
    let info = await getServerInfo(answers.serverAddress, answers.port);
    let plugins = [];
    if (answers.method === 'query') {
      try {
        const queryInfo = await queryFull(answers.serverAddress, answers.port ? parseInt(answers.port, 10) : info.port);
        plugins = queryInfo.plugins || [];
      } catch (err) {
        spinner.warn('La méthode query a échoué, on continue avec status()');
      }
    }
    spinner.succeed('Interrogation réussie.');
    info.plugins = plugins;
    // On force "online" à true en cas de succès de l'appel
    info.online = true;
    displayServerInfo(info);
  } catch (error) {
    spinner.fail('Erreur lors de l\'interrogation du serveur.');
    console.log(chalk.red('Détail de l\'erreur : '), error.message);
  }
  await inquirer.prompt([{ type: 'input', name: 'pause', message: 'Appuyez sur Entrée pour revenir au menu principal...' }]);
}

// Démarrage de l'application
async function start() {
  showHeader();
  await mainMenu();
}

start();
