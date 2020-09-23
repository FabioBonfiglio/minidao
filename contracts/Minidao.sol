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

Demonstration contract 'Minidao'.

/!\ NO SECURITY AUDIT WAS CONDUCTED. /!\
/!\ DO NOT USE ON MAIN NET /!\

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

import "fbo-contracts-lib/contracts/lib/Administre.sol";

contract Minidao is Administre {
	
	uint8 constant internal AUTORISATION_COMITE = 0xB0;
	uint8 constant internal AUTORISATION_VOTANT = 0xA0;

	event NouveauMembreComite(indexed address id);
	event NouveauVotant(indexed address id);

	mapping (address => uint32) votes;

	function ajouteMembreComite(address id) {
		// TODO: continue !
	}

	// TODO: continue !
	
}
