// Configuration du module de calcul de couverture des tests.

module.exports = {
	providerOptions: {
		seed: "testMnemonic",
		default_balance_ether: 100,
		total_accounts: 30,
		network_id: "1337"
	},
	istanbulReporter: [
		"html",
		"text",
		"json"
	],
	mocha: {
		reporter: "nyan"
	}
};
