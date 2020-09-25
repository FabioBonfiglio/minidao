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

@description Test suite for `Minidao.sol`

@author Fabio Bonfiglio <fabio.bonfiglio@protonmail.ch>

@copyright © 2020  FBO Developments <info@fbo.network>

@license ISC
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

/* globals web3 */

const Minidao = artifacts.require("Minidao");

contract("Minidao", (accounts) => {
	let minidao;
	describe("Tests de déploiement de administration", () => {
		before(async () => {
			minidao = await Minidao.deployed();
		});

		it("Deploiement correct, l'admin du contrat correspond au compte [0]", async () => {
			const admin = await minidao.administrateur();
			const isAdmin = await minidao.estAdmin({ from: accounts[0] });
			expect(admin.toString()).to.equal(accounts[0]);
			expect(isAdmin).to.be.true;
		});
	});

	describe("Tests valeurs initiales", () => {
		it("Membres comité à 1 (l'administrateur)", async () => {
			let res = await minidao.membresComite();
			expect(res.toNumber()).to.equal(1);
		});

		it("Cagnotte à 0", async () => {
			let res = await minidao.cagnotte();
			expect(res.toNumber()).to.equal(0);
		});

		it("Numéro de scrutin à 1", async () => {
			let res = await minidao.scrutin();
			expect(res.toNumber()).to.equal(1);
		});

		it("Timestamp précédente distribution à 0", async () => {
			let res = await minidao.distribPrecedente();
			expect(res.toNumber()).to.equal(0);
		});

		it("Contrat actif", async () => {
			let res = await minidao.actif();
			expect(res).to.be.true;
		});
	});

	describe("Tests ajout Membres Comité et approbation votants", () => {
		it("Ajout de 5 Membres au Comité ([1] à [5]) par l'administrateur ([0])", async () => {
			let res;
			for (let i = 1; i <= 5; ++i) {
				res = await minidao.ajouteMembreComite(accounts[i]);
				expect(res.logs[0].event).to.equal("NouvelleAutorisation");
				expect(res.logs[0].args.nouvelAutorise).to.equal(accounts[i]);
				expect(res.logs[0].args.niveau.toNumber()).to.equal(0xB0);
			}
		});

		it("Approbation de 8 bénéficiaires ([6] à [14], et [13] n'est pas approuvé par tous les Membres au Comité)", async () => {
			let res;
			for (let i = 6; i <= 14; ++i) {
				let approved = false;
				for (let j = 0; j <= 5; ++j) {
					if (!approved) {
						if (!(j >= 2 && i === 13)) {
							res = await minidao.approuveBeneficiaire(accounts[i], { from: accounts[j] });
							if (res.logs[0]) {
								expect(res.logs[0].event).to.equal("NouveauBeneficiaire");
								expect(res.logs[0].args.id).to.equal(accounts[i]);
								approved = true;
							}
						}
					} else {
						res = true;
						try {
							await minidao.approuveBeneficiaire(accounts[i], { from: accounts[j] });
						} catch (e) {
							res = false;
							expect(e.reason).to.equal("DEJA APPROUVÉ");
						}
						expect(res).to.be.false;
					}
				}
			}
		});

		it("Impossible pour un Membre au Comité d'approuver 2 fois le même bénéficiaire", async () => {
			let res = true;
			try {
				await minidao.approuveBeneficiaire(accounts[13], { from: accounts[1] });
			} catch (e) {
				res = false;
				expect(e.reason).to.equal("DEJA APPROUVÉ");
			}
			expect(res).to.be.false;
		});

		it("Approbation de 12 votants ([15] à [28], et [17] et [21] ne sont pas approuvés par tous les Membres au Comité)", async () => {
			let res;
			for (let i = 15; i <= 28; ++i) {
				let approved = false;
				for (let j = 0; j <= 5; ++j) {
					if (!approved) {
						if (!(j >= 2 && (i === 17 || i === 21))) {
							res = await minidao.approuveVotant(accounts[i], { from: accounts[j] });
							if (res.logs[0]) {
								expect(res.logs[0].event).to.equal("NouveauVotant");
								expect(res.logs[0].args.id).to.equal(accounts[i]);
								approved = true;
							}
						}
					} else {
						res = true;
						try {
							await minidao.approuveVotant(accounts[i], { from: accounts[j] });
						} catch (e) {
							res = false;
							expect(e.reason).to.equal("DEJA APPROUVÉ");
						}
						expect(res).to.be.false;
					}
				}
			}
		});

		it("Impossible pour un Membre au Comité d'approuver 2 fois le même votant", async () => {
			let res = true;
			try {
				await minidao.approuveVotant(accounts[17], { from: accounts[1] });
			} catch (e) {
				res = false;
				expect(e.reason).to.equal("DEJA APPROUVÉ");
			}
			expect(res).to.be.false;
		});
	});

	describe("Tests donations", async () => {
		it("Envoi de 1 ETH depuis le compte [29]", async () => {
			let res = await minidao.send(web3.utils.toWei("1", "ether"), { from: accounts[29] });
			expect(res.receipt.status).to.be.true;
		});

		it("Envoi de 3 ETH depuis le compte [4]", async () => {
			let res = await minidao.send(web3.utils.toWei("3", "ether"), { from: accounts[4] });
			expect(res.receipt.status).to.be.true;
		});

		it("Montant de la cagnotte doit être à 4 ETH", async () => {
			let res = await minidao.cagnotte();
			expect(res.toString()).to.equal(web3.utils.toWei("4", "ether"));
		});
	});

	describe("Tests votes", async () => {
		it("6 votes pour le bénéficiaire [8]", async () => {
			let res;
			for (let i = 15; i <= 22; ++i) {
				if (i !== 17 && i !== 21) {
					res = await minidao.vote(accounts[8], { from: accounts[i] });
					expect(res.receipt.status).to.be.true;
				}
			}
		});

		it("4 votes pour le bénéficiaire [10]", async () => {
			let res;
			for (let i = 23; i <= 26; ++i) {
				res = await minidao.vote(accounts[10], { from: accounts[i] });
				expect(res.receipt.status).to.be.true;
			}
		});

		it("Impossible de voter 2 fois durant le même scrutin", async () => {
			let res = true;
			try {
				await minidao.vote(accounts[7], { from: accounts[15] });
			} catch (e) {
				res = false;
				expect(e.reason).to.equal("DEJA VOTÉ");
			}
			expect(res).to.be.false;
		});

		it("Impossible de voter si non-votant", async () => {
			let res = true;
			try {
				await minidao.vote(accounts[7], { from: accounts[7] });
			} catch (e) {
				res = false;
				expect(e.reason).to.equal("VOTANT NON AUTORISÉ");
			}
			expect(res).to.be.false;
		});
	});

	describe("Tests d'accès interdits et sécurité des fonds", () => {
		it.skip("À faire !");
	});

	describe("Distribution des fonds et cessation d'activité", () => {
		it("Déclenchement de distribution impossible par un non Membre au Comité", async () => {
			let res = true;
			try {
				await minidao.distribution(web3.utils.toWei("4", "ether"), { from: accounts[7] });
			} catch (e) {
				res = false;
				expect(e.reason).to.equal("ADMIN:NON_AUTORISE");
			}
			expect(res).to.be.false;
		});

		it("Déclenchement de la distribution", async () => {
			let beforeBalBenef8 = web3.utils.toBN(await web3.eth.getBalance(accounts[8]));
			let beforeBalBenef10 = web3.utils.toBN(await web3.eth.getBalance(accounts[10]));
			let beforeBalMembre = web3.utils.toBN(await web3.eth.getBalance(accounts[4]));
			let res = await minidao.distribution(web3.utils.toWei("120", "finney"), { from: accounts[4] });
			expect(res.logs[0].event).to.equal("NouveauScrutin");
			expect(res.logs[0].args.num.toNumber()).to.equal(2);
			expect(res.logs[0].args.distribue.toString()).to.equal(
				web3.utils.toWei("3960", "finney")
			);
			let afterBalBenef8 = web3.utils.toBN(await web3.eth.getBalance(accounts[8]));
			let afterBalBenef10 = web3.utils.toBN(await web3.eth.getBalance(accounts[10]));
			let afterBalMembre = web3.utils.toBN(await web3.eth.getBalance(accounts[4]));
			expect(afterBalBenef8.sub(beforeBalBenef8).toString()).to.equal(
				web3.utils.toBN(web3.utils.toWei("2376", "finney")).toString()
			);
			expect(afterBalBenef10.sub(beforeBalBenef10).toString()).to.equal(
				web3.utils.toBN(web3.utils.toWei("1584", "finney")).toString()
			);
			expect(afterBalMembre.gt(beforeBalMembre)).to.be.true;
		});

		it("Impossible de déclencher une distribution avant le délai de 7 jours", async () => {
			let res = true;
			try {
				await minidao.distribution(web3.utils.toWei("120", "finney"), { from: accounts[4] });
			} catch (e) {
				res = false;
				// expect(e.reason).to.equal("UNE SEMAINE NON ÉCOULÉE"); // COMBAK: Ne devrait pas renvoyer `invalid opcode`
			}
			expect(res).to.be.false;
		});
	});
});
