const Minidao = artifacts.require("Minidao");

module.exports = (deployer, network) => {
	deployer.deploy(Minidao)
		.then(minidao => {
			if (network === "rinkeby") {
				console.warn(`⚠ Votre contrat est déployé sur une chaîne de test publique (rinkeby). Veuillez bien prendre note de son adresse: ${minidao.address}\n`);
			}
		});
};
