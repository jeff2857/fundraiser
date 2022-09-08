import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Signer } from "ethers";
import { ethers } from "hardhat";
import { FundraiserFactory } from "../typechain-types";

describe('Fundraiser Factory', () => {
	async function deployFixture() {
		const [custodian, beneficiary, signer3] = await ethers.getSigners();
		
		const FundraiserFactory = await ethers.getContractFactory('FundraiserFactory');
		const factory = await FundraiserFactory.deploy();

		return { factory, custodian, beneficiary, signer3 };
	}

	describe('CreateFundraiser', () => {
		// Fundraiser args
		const name = 'Beneficiary Name';
		const url = 'beneficiaryname.org';
		const imageURL = 'https://placekitten.com/600/350';
		const description = 'Beneficiary description';

		it('should increments the fundraisersCount', async () => {
			const { factory, beneficiary } = await loadFixture(deployFixture);

			const currentFundraisersCount = await factory.fundraisersCount();
			await factory.createFundraiser(name, url, imageURL, description, beneficiary.address);
			const newFundraisersCount = await factory.fundraisersCount();
			const diff = newFundraisersCount.sub(currentFundraisersCount);

			expect(diff).eq(1);
		});
		it('emits the FundraiserCreated event', async () => {
			const { factory, beneficiary } = await loadFixture(deployFixture);

			await expect(factory.createFundraiser(name, url, imageURL, description, beneficiary.address))
				.to.emit(factory, 'FundraiserCreated');
		});
	});

	describe('Fundraisers', () => {
		async function addFundraisers(factory: FundraiserFactory, count: number, beneficiary: SignerWithAddress) {
			const name = 'Beneficiary';
			const lowerCaseName = name.toLowerCase();

			for (let i = 0; i < count; i++) {
				await factory.createFundraiser(
					`${name} ${i}`,
					`${lowerCaseName}${i}.org`,
					`${lowerCaseName}${i}.png`,
					`description for ${name} ${i}`,
					beneficiary.address
				);
			}
		}

		it('returns an empty collection', async () => {
			const { factory, beneficiary } = await loadFixture(deployFixture);

			const fundraisers = await factory.fundraisers(10, 0);

			expect(fundraisers.length).eq(0);
		});
		it('returns 10 results when limit is 10', async () => {
			const { factory, beneficiary } = await loadFixture(deployFixture);
			await addFundraisers(factory, 30, beneficiary);

			const fundraisers = await factory.fundraisers(10, 0);

			expect(fundraisers.length).eq(10);
		});
		it('varying limits', async () => {
			const { factory, beneficiary } = await loadFixture(deployFixture);
			await addFundraisers(factory, 30, beneficiary);

			const fundraisers = await factory.fundraisers(20, 0);

			expect(fundraisers.length).eq(20);
		});
		it('returns 20 results when limit is 30', async () => {
			const { factory, beneficiary } = await loadFixture(deployFixture);
			await addFundraisers(factory, 30, beneficiary);

			const fundraisers = await factory.fundraisers(30, 0);

			expect(fundraisers.length).eq(20);
		});
		it('contains the fundraiser with the appropriate offset', async () => {
			const { factory, beneficiary } = await loadFixture(deployFixture);
			const FundraiserContract = await ethers.getContractFactory('Fundraiser');
			await addFundraisers(factory, 10, beneficiary);

			const fundraisers = await factory.fundraisers(1, 0);
			const fundraiser = FundraiserContract.attach(fundraisers[0]);

			expect(await fundraiser.name()).include('0');
		});
		it('contains the fundraiser with the appropriate offset', async () => {
			const { factory, beneficiary } = await loadFixture(deployFixture);
			const FundraiserContract = await ethers.getContractFactory('Fundraiser');
			await addFundraisers(factory, 10, beneficiary);

			const fundraisers = await factory.fundraisers(1, 7);
			const fundraiser = FundraiserContract.attach(fundraisers[0]);

			expect(await fundraiser.name()).include('7');
		});
		it('raises out of bounds error', async () => {
			const { factory, beneficiary } = await loadFixture(deployFixture);
			await addFundraisers(factory, 10, beneficiary);

			await expect(factory.fundraisers(1, 11))
				.to.be.rejectedWith('offset out of bounds');
		});
		it('adjusts return size to prevent out of bounds error', async () => {
			const { factory, beneficiary } = await loadFixture(deployFixture);
			await addFundraisers(factory, 10, beneficiary);

			const fundraisers = await factory.fundraisers(10, 5);
			expect(await fundraisers.length).eq(5);
		});
	});
});