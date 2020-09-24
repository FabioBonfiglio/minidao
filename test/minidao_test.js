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
});
