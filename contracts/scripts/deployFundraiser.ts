import { writeFile } from "fs/promises";
import { ethers } from "hardhat";
import path from "path";

async function main() {
	const FundraiserFactory = await ethers.getContractFactory('FundraiserFactory');
	const factory = await FundraiserFactory.deploy();

	await factory.deployed();

	await writeToEnv(factory.address);

	console.log('FundraiserFactory deployed');
}

async function writeToEnv(address: string) {
	const envFilePath = path.join(__dirname, '../../frontend/.env');

	try {
		await writeFile(envFilePath, `FUNDRAISER_FACTORY_ADDRESS=${address}`);
	} catch (err) {
		console.error('failed to write to .env file');
	}
}

main().catch(err => {
	console.error(err);
	process.exitCode = 1;
});