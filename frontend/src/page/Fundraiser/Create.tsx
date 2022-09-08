import { useState } from "react";
import factoryJson from '../../../../contracts/artifacts/contracts/FundraiserFactory.sol/FundraiserFactory.json';
import { BigNumber, ethers } from 'ethers';
import Web3 from "../../utils/web3";

function Create() {
	const [name, setName] = useState('Beneficiary1');
	const [url, setUrl] = useState('beneficiary1.org');
	const [imageURL, setImageURL] = useState('beneficiary1.png');
	const [description, setDescription] = useState('beneficiary1 description');
	const [beneficiary, setBeneficiary] = useState('0x70997970C51812dc3A010C7d01b50e0d17dc79C8');

	const submit = async () => {
		// TODO: validate form
		const factoryABI = factoryJson.abi;
		const contractAddress = Web3.getFundraiserFactoryAddress();
		const provider = Web3.getProvider();
		const signer = provider.getSigner();
		const contract = new ethers.Contract(contractAddress, factoryABI, signer);

		contract.on('FundraiserCreated', () => {
			console.log('FundraiserCreated');
		});
		await contract.createFundraiser(name, url, imageURL, description, beneficiary);
	}

	return (
		<>
			<form onSubmit={e => e.preventDefault()}>
				<input
					value={name}
					onChange={(e) => setName(e.target.value)}
					placeholder='Fundraiser Name'
				/>
				<input
					value={url}
					onChange={(e) => setUrl(e.target.value)}
					placeholder='Fundraiser URL'
				/>
				<input
					value={imageURL}
					onChange={(e) => setImageURL(e.target.value)}
					placeholder='Fundraiser Image URL'
				/>
				<input
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					placeholder='Fundraiser Description'
				/>
				<input
					value={beneficiary}
					onChange={(e) => setBeneficiary(e.target.value)}
					placeholder='Fundraiser Beneficiary'
				/>
				<button onClick={submit}>Create</button>
			</form>
		</>
	)
}

export default Create;