# Minidao
Une implémentation de démonstration d'un _smart contract_ / _mini-DAO_ gérant la distribution de fonds à des bénéficiaires à intervalles réguliers.

Cette démonstration fait partie du cours suivant: https://www.he-arc.ch/gestion/blockchain.

> #### :warning: Avertissement
> Ce contrat a été écrit à des fins éducatives uniquement. Il n'a pas été audité, et il est déconseillé de l'utiliser en l'état sur le réseau _Main Net_.

> #### :information_source: "Utilisateur"
> Ce contrat devant servir avant tout de démonstration d'implémentation d'une gouvernance arbitraire dans un _smart contract_, aucune interface utilisateur n'a été développée pour interagir avec lui. La procédure d'installation ci-dessous est donc relativement complexe pour un néophyte, mais reste toutefois possible.

## Gouvernance
Cette "_mini-DAO_" modélise la gouvernance suivante (l'implémentation du contrat a été réalisée d'après le cahier des charges suivant):
- Un Comité (limité à 10 membres) approuve les votants qui pourront participer. Au moins 50% des Membres au Comité doivent approuver un votant pour que ce dernier puisse voter.
- Toute personne est libre de faire une "donation" à la DAO. Les fonds sont détenus par le contrat.
- Chaque semaine, les votants peuvent nominer un bénéficiaire de leur choix, parmi une liste définie par les Membres au Comité (à l'unanimité).
- Les fonds sont ensuite distribués, maximum une fois par semaine, aux bénéficiaires proportionnellement aux nombre de votes qu'ils auront récoltés. Le Membre au Comité qui aura déclenché la transaction sera automatiquement dédommagé par le contrat pour ses frais (annoncés), à hauteur de maximum 10% du montant de la cagnotte.
- Après chaque distribution, les votes sont remis à zéro.
- Le Comité peut décider, à l'unanimité uniquement, de terminer la DAO. Le solde des fonds détenus par le contrat sera versé à l'administrateur actuel. Le contrat sera rendu inactif une fois cette opération terminée.

## Code source
Si vous voulez uniquement consulter le code source du contrat, il s'agit du fichier [`contracts/Minidao.sol`](contracts/Minidao.sol).

## Installation
Pour pouvoir tester et déployer ce contrat sur un réseau de test _Rinkeby_, il vous faut au préalable disposer d'un environnement de travail [NodeJS](https://nodejs.org/en/download/).

Les instructions ci-après sont pour une utilisation via un terminal de commandes _shell_. Les utilisateurs de MacOS ou Linux peuvent simplement ouvrir un terminal en appuyant sur `CTRL` + `T`. Les utilisateurs de Windows peuvent suivre [ce tutoriel](https://www.howtogeek.com/249966/how-to-install-and-use-the-linux-bash-shell-on-windows-10/) pour installer un terminal compatible sur leur machine.

Une fois installé, _cloner_ le présent dépôt git avec la commande suivante:
```sh
$ git clone https://github.com...
```
et entrer dans le répertoire:
```sh
$ cd minidao
```
puis installer les dépendances:
```sh
$ npm install
```
Une fois fait, on peut alors soit lancer une blockchain locale de tests, avec la commande suivante:
```sh
$ npm run testchain
```
et lancer les tests de fonctionnement, ce qui va au préalable déployer une nouvelle instance du contrat sur cette chaîne:
```sh
$ npm test
```
Il est ensuite possible d'interagir avec le smart contract via une [abstraction de contrat Truffle](https://www.trufflesuite.com/docs/truffle/reference/contract-abstractions), en lançant la console ainsi:
```sh
$ npm run console
```

Ou alors, il est possible de déployer le contrat sur un réseau de test public _Rinkeby_, auquel cas il vous sera demandé d'entrer la clé privée à utiliser pour la transaction de déploiement (pour obtenir des ETH de test, passer par ce [faucet](https://faucet.rinkeby.io/)):
```sh
$ npm run deploy
```
On peut ensuite interagir avec le contrat via la librairie JavaScript [`web3js`](https://web3js.readthedocs.io/en/v1.3.0/), que ce soit en ligne de commande via la console `node`, ou via une interface utilisateur développée en HTML5 (non fournie ici).  
Pour une interaction depuis un script python, on peut utiliser la librairie [Web3.py](https://web3py.readthedocs.io/en/latest/).  
En tous les cas, le descripteur [ABI](https://solidity.readthedocs.io/en/v0.6.12/abi-spec.html#index-0), nécessaire à la connexion avec l'instance déployée du contrat, se trouve dans le fichier `build/contracts/Minidao.json` qui aura été généré avant le déploiement.
