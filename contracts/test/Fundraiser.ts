import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { assert, expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";

describe('Fundraiser', () => {
	async function deployFixture() {
		const name = 'Beneficiary Name';
		const url = 'beneficiaryname.org';
		const imageURL = 'https://placekitten.com/600/350';
		const description = 'Beneficiary description';

		const [custodian, beneficiary, signer3] = await ethers.getSigners();
		const Fundraiser = await ethers.getContractFactory('Fundraiser');
		const fundraiser = await Fundraiser.deploy(name, url, imageURL, description, beneficiary.address, custodian.address);

		return { name, url, imageURL, description, beneficiary, custodian, fundraiser, signer3 };
	}

	describe('Deployment', () => {
		it('Should init correctly', async () => {
			const { name, url, imageURL, description, beneficiary, custodian, fundraiser } = await loadFixture(deployFixture);

			expect(await fundraiser.name()).eq(name);
			expect(await fundraiser.url()).eq(url);
			expect(await fundraiser.imageURL()).eq(imageURL);
			expect(await fundraiser.description()).eq(description);
			expect(await fundraiser.beneficiary()).eq(beneficiary.address);
			expect(await fundraiser.owner()).eq(custodian.address);
		});
	});

	describe('Set beneficiary', () => {
		it('updated beneficiary when called by owner', async () => {
			const { beneficiary, custodian, fundraiser, signer3 } = await loadFixture(deployFixture);

			await fundraiser.setBeneficiary(signer3.address);
			expect(await fundraiser.beneficiary()).eq(signer3.address);
		});
		it('throws error when called from non-owner', async () => {
			const { beneficiary, custodian, fundraiser, signer3 } = await loadFixture(deployFixture);

			await expect(fundraiser.connect(beneficiary).setBeneficiary(signer3.address)).to.be.reverted;
		});
	});

	describe('Donation', () => {
		const value = ethers.utils.parseEther('0.0289');

		it('increases myDonations', async () => {
			const { beneficiary, custodian, fundraiser, signer3 } = await loadFixture(deployFixture);

			const currentDonationCount = await fundraiser.connect(signer3).myDonationsCount();
			await fundraiser.connect(signer3).donate({value});
			const newDonationCount = await fundraiser.connect(signer3).myDonationsCount();

			expect(newDonationCount.sub(currentDonationCount)).eq(BigNumber.from(1));
		});
		it('includes donation in myDonation', async () => {
			const { beneficiary, custodian, fundraiser, signer3 } = await loadFixture(deployFixture);

			await fundraiser.connect(signer3).donate({value});
			const [values, dates] = await fundraiser.connect(signer3).myDonations();

			expect(values[0]).eq(value);
			expect(dates[0]).exist;
		});
		it('increases the totalDonations amount', async () => {
			const { beneficiary, custodian, fundraiser, signer3 } = await loadFixture(deployFixture);

			const currentTotalDonations = await fundraiser.totalDonations();
			await fundraiser.connect(signer3).donate({value});
			const newTotalDonations = await fundraiser.totalDonations();

			const diff = newTotalDonations.sub(currentTotalDonations);

			expect(diff).eq(value);
		});
		it('increases donationsCount', async () => {
			const { beneficiary, custodian, fundraiser, signer3 } = await loadFixture(deployFixture);

			const currentDonationsCount = await fundraiser.donationsCount();
			await fundraiser.connect(signer3).donate({value});
			const newDonationsCount = await fundraiser.donationsCount();

			const diff = newDonationsCount.sub(currentDonationsCount);

			expect(diff).eq(1);
		});
		it('emits the DonationReceived event', async () => {
			const { beneficiary, custodian, fundraiser, signer3 } = await loadFixture(deployFixture);

			await expect(fundraiser.connect(signer3).donate({value}))
				.to.emit(fundraiser, 'DonationReceived')
				.withArgs(signer3.address, value);
		});
	});

	describe('Withdrawal', () => {
		const value = ethers.utils.parseEther('0.0289');

		it('throws error when called from non-owner', async () => {
			const { beneficiary, custodian, fundraiser, signer3 } = await loadFixture(deployFixture);

			await expect(fundraiser.connect(signer3).withdraw()).to.be.rejected;
		});
		it('permits the owner to call', async () => {
			const { beneficiary, custodian, fundraiser, signer3 } = await loadFixture(deployFixture);

			await fundraiser.connect(signer3).donate({value});
			await fundraiser.withdraw();

			assert(true);
		});
		it('transfers balance to beneficiary', async () => {
			const { beneficiary, custodian, fundraiser, signer3 } = await loadFixture(deployFixture);

			await fundraiser.connect(signer3).donate({value});

			const currentContractBalance = await ethers.provider.getBalance(fundraiser.address);
			const currentBeneficiaryBalance = await ethers.provider.getBalance(beneficiary.address);

			await fundraiser.withdraw();

			const newContractBalance = await ethers.provider.getBalance(fundraiser.address);
			const newBeneficiaryBalance = await ethers.provider.getBalance(beneficiary.address);
			const beneficiaryDiff = newBeneficiaryBalance.sub(currentBeneficiaryBalance);

			expect(newContractBalance).eq(0);
			expect(beneficiaryDiff).eq(currentContractBalance);
		});
		it('emits Withdraw event', async () => {
			const { beneficiary, custodian, fundraiser, signer3 } = await loadFixture(deployFixture);

			await fundraiser.connect(signer3).donate({value});
	
			await expect(await fundraiser.withdraw())
				.to.emit(fundraiser, 'Withdraw')
				.withArgs(value);
		});
	});

	describe('Fallback function', () => {
		const value = ethers.utils.parseEther('0.0289');

		it('increases the totalDonations amount', async () => {
			const { beneficiary, custodian, fundraiser, signer3 } = await loadFixture(deployFixture);

			const currentTotalDonations = await fundraiser.totalDonations();
			await signer3.sendTransaction({
				to: fundraiser.address,
				value,
			});

			const newTotalDonations = await fundraiser.totalDonations();
			const diff = newTotalDonations.sub(currentTotalDonations);

			expect(diff).eq(value);
		});
		it('increases the donationsCount', async () => {
			const { beneficiary, custodian, fundraiser, signer3 } = await loadFixture(deployFixture);

			const currentDonationCount = await fundraiser.donationsCount();
			await signer3.sendTransaction({
				to: fundraiser.address,
				value,
			});

			const newDonationCount = await fundraiser.donationsCount();
			const diff = newDonationCount.sub(currentDonationCount);

			expect(diff).eq(1);
		});
	});
});