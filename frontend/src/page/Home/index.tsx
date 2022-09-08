import { BigNumber, ethers, utils } from 'ethers';
import { useEffect, useState } from 'react';
import factoryJson from '../../../../contracts/artifacts/contracts/FundraiserFactory.sol/FundraiserFactory.json';
import fundraiserJson from '../../../../contracts/artifacts/contracts/Fundraiser.sol/Fundraiser.json';
import { useNavigate } from 'react-router-dom';
import Web3 from '../../utils/web3';

export interface FundraiserContract {
	address: string;
	name: string;
	url: string;
	imageURL: string;
	description: string;
	beneficiary: string;
	totalDonations: BigNumber,
	donationsCount: BigNumber,
	custodian: string;
}

function Home() {
	const navigate = useNavigate();

	const [fundraisersCount, setFundraisersCount] = useState(BigInt(0));
	const [fundraisers, setFundraisers] = useState<FundraiserContract[]>([]);

	useEffect(() => {
		fetchFundraisers();
	}, []);

	const fetchFundraisers = async () => {
		const factoryABI = factoryJson.abi;
		const contractAddress = Web3.getFundraiserFactoryAddress();
		const provider = Web3.getProvider();
		const signer = provider.getSigner();
		const contract = new ethers.Contract(contractAddress, factoryABI, provider);

		const count: BigNumber = await contract.fundraisersCount();
		setFundraisersCount(count.toBigInt());

		const fundraiserAddresses: string[] = await contract.fundraisers(10, 0);

		const fundraiserABI = fundraiserJson.abi;
		const fundraiserContract = new ethers.ContractFactory(fundraiserABI, fundraiserJson.bytecode, signer);
		let fundraisers: FundraiserContract[] = [];
		for (const address of fundraiserAddresses) {
			const fundraiserInstance = fundraiserContract.attach(address);
			const fundraiser: FundraiserContract = {
				address,
				name: await fundraiserInstance.name(),
				url: await fundraiserInstance.url(),
				imageURL: await fundraiserInstance.imageURL(),
				description: await fundraiserInstance.description(),
				beneficiary: await fundraiserInstance.beneficiary(),
				totalDonations: await fundraiserInstance.totalDonations(),
				donationsCount: await fundraiserInstance.donationsCount(),
				custodian: await fundraiserInstance.custodian(),
			};
			fundraisers.push(fundraiser);
		}

		setFundraisers(fundraisers);
	}

	const onClickFundraiser = (fundraiser: FundraiserContract) => {
		navigate(`detail/${fundraiser.address}`);
	}

	return (
		<>
			<div className='text-slate-200 m-4'>
				Fundraisers List ({`${fundraisersCount}`})
			</div>

			<div className='flex text-slate-300'>
				{fundraisers.map((fundraiser, index) => (
					<div
						key={index}
						className='m-4 w-72 bg-sky-700 rounded shadow hover:cursor-pointer p-2'
						onClick={() => onClickFundraiser(fundraiser)}
					>
						<div className='text-lg'>{fundraiser.name}</div>
						<div className='text-blue-400 underline'>
							<a href={fundraiser.url}>{fundraiser.url}</a>
						</div>
						<div>{fundraiser.imageURL}</div>
						<div className='text-sm text-slate-400'>{fundraiser.description}</div>
						<div title={fundraiser.beneficiary}>
							Beneficiary:&nbsp;
							{fundraiser.beneficiary.substring(0, 15).concat('...')}
						</div>
						<div>
							{`${fundraiser.donationsCount}`} donations, total amount: {`${ethers.utils.formatEther(fundraiser.totalDonations.toString())}`} ETH
						</div>
					</div>
				))}
			</div>
		</>
	)
}

export default Home;