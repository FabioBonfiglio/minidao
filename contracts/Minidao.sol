/** ****************************************************************************
 *
 *      88888888888  88888888ba     ,ad8888ba,
 *      88           88      "8b   d8"'    `"8b
 *      88           88      ,8P  d8'        `8b
 *      88aaaaa      88aaaaaa8P'  88          88
 *      88"""""      88""""""8b,  88          88
 *      88           88      `8b  Y8,        ,8P
 *      88           88      a8P   Y8a.    .a8P
 *      88           88888888P"     `"Y8888Y"'
 *     ____                  _                             _
 *    |    \  ___  _ _  ___ | | ___  ___  _____  ___  ___ | |_  ___
 *    |  |  || -_|| | || -_|| || . || . ||     || -_||   ||  _||_ -|
 *    |____/ |___| \_/ |___||_||___||  _||_|_|_||___||_|_||_|  |___|
 *                                  |_|
 *******************************************************************************

Demonstration contract 'Minidao'. French documented as it was written as part of
a course about smart contracts and DAOs.

/!\ NO SECURITY AUDIT WAS CONDUCTED. /!\
/!\ DEMONSTRATION PURPOSE ONLY /!\
/!\ USE ON MAIN NET AT YOUR OWN RISK /!\
/!\ This contract should probably use a withdrawal pattern for its beneficiaries
to be payed, instead of the implemented distribution method.

Author: Fabio Bonfiglio <fabio.bonfiglio@protonmail.ch>

Copyright © 2020  FBO Developments <info@fbo.network>

SPDX-License-Identifier: ISC
 Permission to use, copy, modify, and/or distribute this software for any
 purpose with or without fee is hereby granted, provided that the above
 copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED “AS IS” AND ISC DISCLAIMS ALL WARRANTIES WITH REGARD TO
THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS.
IN NO EVENT SHALL ISC BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR
CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA
OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS
ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS
SOFTWARE.
***************************************************************************** */
pragma solidity ^0.6.3;

import "./lib/Administre.sol";

/// @title Minidao
/// @dev Hérite des méthodes de la dépendance `Administre` (contrat dans le sous-répertoire `lib`), qui gère les droits d'accès et niveaux d'autorisations.
/// @notice Ce contrat agit comme une "mini-DAO", capable de gérer une "cagnotte", qui sera distribuée (maximum une fois par semaine) aux bénéficiaires désignés, selon une répartition proportionnelle aux votes des participants.
contract Minidao is Administre {

	string constant private ERREUR_VOTANT_NON_AUTORISE = "VOTANT NON AUTORISÉ";
	string constant private ERREUR_MEMBRE_COMITE_INACTIF = "MEMBRE COMITÉ INACTIF";
	string constant private ERREUR_DOUBLE_APPROBATION = "DEJA APPROUVÉ";
	string constant private ERREUR_BENEFICIAIRE_INVALIDE = "BÉNÉFICIAIRE INVALIDE";
	string constant private ERREUR_INTERVALLE_DISTRIBUTION = "UNE SEMAINE NON ÉCOULÉE";

	// Définition du niveau d'autorisation Membre Comité
	uint8 constant internal AUTORISATION_COMITE = 0xB0;

	// "Events" de journalisation de certains changements.
	event NouveauMembreComite(address indexed id);
	event NouveauVotant(address indexed id);
	event NouveauBeneficiaire(address indexed id);
	event NouveauScrutin(uint indexed num, uint distribue); // renvoie le nouveau numéro de scrutin, ainsi que le montant total distribué à l'issue du scrutin précédent.
	event VoteFinActivite(address indexed id, uint8 restant); // renvoie l'adresse-id du Membre au Comité qui a voté la fin d'activité, ainsi que le nombre de votes restants nécessaires pour déclencher la cessation d'activité.

	mapping (address => mapping (address => bool)) approbVotant; // Approbation des Membres du Comité pour les votants
	mapping (address => mapping (address => bool)) approbBenef; // Approbation des Membres au Comité pour les bénéficiaires
	mapping (address => uint8) votant; // Autorisation des votants
	mapping (address => uint8) benef; // Autorisation des bénéficiaires
	mapping (address => bool) voteFin; // Marques de vote de fin d'activité des Membres au Comité
	mapping (address => mapping (uint => uint32)) votes; // Décomptes de votes pour les bénéficiaires
	address[] public beneficiaires; // Liste de bénéficiaires approuvés.

	uint8 public membresComite = 0; // Nombre de Membres au Comité
	uint public cagnotte = 0; // Montant de la cagnotte
	uint public scrutin = 1; // Numéro du scrutin en cours
	uint public distribPrecedente; // Timestamp de la dernière distribution ayant été exécutée.
	bool public actif = true;

	/// @dev Au déploiement du contrat, le "déployeur" est automatiquement ajouté comme premier Membre au Comité.
	constructor() public {
		ajouteMembreComite(msg.sender);
	}

	/// @dev Toute valeur (ETH uniquement) envoyée au contrat est ajoutée à la cagnotte.
	receive() external payable {
		cagnotte += msg.value;
	}

	modifier seulActif() {
		require(actif, "CONTRAT INACTIF");
		_;
	}

	modifier membreActif() {
		require(!voteFin[msg.sender], ERREUR_MEMBRE_COMITE_INACTIF);
		_;
	}

	modifier seulVotant() {
		require(estVotant(msg.sender), ERREUR_VOTANT_NON_AUTORISE);
		_;
	}

	/// @dev Méthode de test d'autorisation d'un votant.
	/// @param id L'adresse-identité du votant à tester.
	/// @return `true` si le votant est approuvé.
	function estVotant(address id) internal view returns (bool) {
		return votant[id] >= membresComite / 2;
	}

	/// @dev Méthode d'ajout d'un membre au Comité qui peut accepter de nouveaux votants. Seul l'administrateur du contrat peut le faire.
	/// @param id L'adresse-identité du nouveau Membre au Comité.
	function ajouteMembreComite(address id) public seulAdmin seulActif {
		require(membresComite <= 10, "NB_MEMBRES_COMITE_MAX");
		autorise(id, AUTORISATION_COMITE);
		++membresComite;
		emit NouveauMembreComite(id);
	}

	/// @notice Approbation d'un votant. Seul un Membre au Comité peut le faire. Le votant ne sera approuvé qu'une fois une majorité de 50% atteinte.
	/// @param id L'adresse-identité du votant à approuver.
	function approuveVotant(address id) public seulAutorise(AUTORISATION_COMITE) seulActif membreActif {
		if (approbVotant[msg.sender][id] || votant[id] >= membresComite / 2) {
			revert(ERREUR_DOUBLE_APPROBATION);
		}
		approbVotant[msg.sender][id] = true;
		if (++votant[id] >= membresComite / 2) {
			emit NouveauVotant(id);
		}
	}

	/// @notice Approbation d'un bénéficiaire. Seul un Membre au Comité peut le faire. Le bénéficiaire ne sera approuvé qu'une fois l'unanimité atteinte.
	/// @param id L'adresse-identité du bénéficiaire à approuver.
	function approuveBeneficiaire(address id) public seulAutorise(AUTORISATION_COMITE) seulActif membreActif {
		if (approbBenef[msg.sender][id] || benef[id] >= membresComite) {
			revert(ERREUR_DOUBLE_APPROBATION);
		}
		approbBenef[msg.sender][id] = true;
		if (++benef[id] >= membresComite) {
			beneficiaires.push(id);
			emit NouveauBeneficiaire(id);
		}
	}

	/// @notice Méthode de vote
	/// @param beneficiaire L'adresse-identité du bénéficiaire auquel donner son vote.
	function vote(address beneficiaire) public seulVotant seulActif {
		require(benef[beneficiaire] >= membresComite, ERREUR_BENEFICIAIRE_INVALIDE);
		++votes[beneficiaire][scrutin];
	}

	/// @notice Méthode de déclenchement de la distribution hebdomadaire des fonds. Seul un Membre au Comité peut le faire.
	/// @param frais Montant (en Wei) demandé en remboursement de frais et émolument. Maximum 0.1 ETH ou 10% du montant de la cagnotte.
	function distribution(uint frais) public seulAutorise(AUTORISATION_COMITE) seulActif membreActif {
		require(block.timestamp >= distribPrecedente + 7 days, ERREUR_INTERVALLE_DISTRIBUTION);
		uint rembourseMax = cagnotte / 100;
		rembourseMax = rembourseMax > 100 finney ? 100 finney : rembourseMax;
		uint rembourse = frais > rembourseMax ? rembourseMax : frais;
		uint aDistribuer = cagnotte - rembourse;
		uint totalDistribue = 0;
		uint nbVotesTotal = 0;
		uint montant;
		uint32 i = 0;
		while (i < beneficiaires.length) {
			nbVotesTotal += votes[beneficiaires[i++]][scrutin];
		}
		i = 0;
		while (i < beneficiaires.length) {
			montant = (votes[beneficiaires[i]][scrutin] * aDistribuer) / nbVotesTotal;
			cagnotte -= montant;
			payable(beneficiaires[i++]).transfer(montant);
			totalDistribue += montant;
		}
		emit NouveauScrutin(++scrutin, totalDistribue);
		montant = cagnotte > rembourse ? rembourse : cagnotte;
		cagnotte -= montant;
		msg.sender.transfer(montant);
	}

	/// @notice Méthode de vote des Membres au Comité pour cesser les activités. Nécessite l'unanimité.
	function termine() public seulAutorise(AUTORISATION_COMITE) seulActif membreActif {
		voteFin[msg.sender] = true;
		if (--membresComite == 0) {
			cagnotte = 0;
			actif = false;
			payable(administrateur()).transfer(address(this).balance);
		}
		emit VoteFinActivite(msg.sender, membresComite);
	}
}
