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

Une fois installé, _cloner_ le présent dépôt git avec la commande suivante (si vous avez [configuré des clés SSH pour gitlab.fbo.network](https://gitlab.fbo.network/help#closed_lock_with_key-ssh-settings)):
```sh
$ git clone git@gitlab.fbo.network:FabioB/minidao.git
```
ou depuis le mirroir github (mais vous ne pourrez pas [contribuer](CONTRIBUTING.md) au projet le cas échéant):
```sh
$ git clone https://github.com/FabioBonfiglio/minidao.git
```

Une fois cloné, entrer dans le répertoire:
```sh
$ cd minidao
```
puis installer les dépendances:
```sh
$ npm install
```
Une fois fait, on peut alors soit lancer une blockchain locale de tests, **dans un second terminal**, avec la commande suivante:
```sh
$ npm run testchain
```
et lancer les tests de fonctionnement:
```sh
$ npm test
```
Ou déployer une instance de tests avec la commande
```sh
$ npm run testdeploy
```
Il est ensuite possible d'interagir avec le smart contract via une [abstraction de contrat Truffle](https://www.trufflesuite.com/docs/truffle/reference/contract-abstractions), en lançant la console ainsi:
```sh
$ npm run console
```
Puis de se connecter à l'instance déployée ainsi:
```js
> const minidao = await Minidao.deployed();
...
// Il est ensuite possible d'accéder aux méthodes du contrat, comme par exemple 
> await minidao.administrateur()
// Ce qui devrait retourner l'adresse de l'administrateur du contrat.
```

Ou alors, il est possible de déployer le contrat sur un réseau de test public _Rinkeby_, auquel cas il vous sera demandé d'entrer la clé privée à utiliser pour la transaction de déploiement (pour obtenir des ETH de test, passer par ce [faucet](https://faucet.rinkeby.io/)):
```sh
$ npm run deploy
```
> :warning: Prenez bien note de l'adresse de la nouvelle instance déployée du contrat. Elle sera affichée une fois le déploiement passé avec succès (2 confirmations attendues, soit ~30 secondes).  
> Cette adresse vous sera utile pour vous connecter à cette même instance du contrat depuis une autre webapp ou une console lancée depuis une autre session / machine, etc.

> :information_source: La procédure détaillée de connexion et interaction à un contrat existant dépasse le cadre de cette démonstration. N'hésitez pas à écrire à l'auteur pour toute question sur ce sujet.

On peut ensuite interagir avec le contrat via la librairie JavaScript [`web3js`](https://web3js.readthedocs.io/en/v1.3.0/), que ce soit en ligne de commande via la console `node`, ou via une interface utilisateur développée en HTML5 (non fournie ici).  
Pour une interaction depuis un script python, on peut utiliser la librairie [Web3.py](https://web3py.readthedocs.io/en/latest/).  
En tous les cas, le descripteur [ABI](https://solidity.readthedocs.io/en/v0.6.12/abi-spec.html#index-0), nécessaire à la connexion avec l'instance déployée du contrat, se trouve dans le fichier `build/contracts/Minidao.json` qui aura été généré avant le déploiement.

## Problèmes connus
- L'opération de division dans l'EVM s'effectuant sur des types entiers et arrondissant vers zéro, il est possible que, lorsque le nombre de Membres au Comité est impair, un nouveau votant soit approuvé avant que la majorité de 50% soit atteinte. Par exemple, avec 5 Membres au Comité, un nouveau votant sera approuvé dès que 2 Membres au Comité auront voté en sa faveur.  
Pour corriger ce problème il faudrait au préalable tester si le nombre de Membres au Comité est impair avec une opération modulo, puis effectuer le calcul de majorité à atteindre en conséquences. Ce paragraphe d'explication a probablement nécessité plus de temps pour être écrit que ce que n'aurait pris l'implémentation de la solution. Mais c'est pour la démonstration :) et un tout petit exemple des quelques spécificités de la programmation de smart contracts.
