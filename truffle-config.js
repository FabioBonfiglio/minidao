const HDWalletProvider = require("@truffle/hdwallet-provider");

const rlSync = require("readline-sync");
let privateKeys = [];

const getPrivK = () => {
	if (privateKeys.length === 0) {
		privateKeys.push(rlSync.question("Enter (paste) deployer's account private key: ", {
			hideEchoBack: true,
			limit: /[0x]*[a-f,A-F,\d]{64}/,
			limitMessage: "Not a valid private key."
		}));
	}
	return privateKeys;
};

module.exports = {
	networks: {
		development: {
			host: "127.0.0.1",
			port: 9545,
			network_id: "1337",
			websockets: true,
			skipDryRun: true
		},
		rinkeby: {
			provider: () => {
				return new HDWalletProvider({
					privateKeys: getPrivK(),
					providerOrUrl: "wss://rinkeby.infura.io/ws/v3/ba26e72900034669a71a4262af6cdd9c"
				});
			},
			network_id: 4,
			gas: 8000000,
			confirmations: 2,
			timeoutBlocks: 20,
			websockets: true,
			skipDryRun: false
		}
	},

	plugins: [
		"solidity-coverage"
	],

	mocha: {
		slow: 10000,
		timeout: 20000
	},

	compilers: {
		solc: {
			version: "^0.6.3",
			settings: {
				optimizer: {
					enabled: true,
					runs: 400,
					details: {
						constantOptimizer: true
					}
				},
				evmVersion: "istanbul"
			}
		}
	}
};
