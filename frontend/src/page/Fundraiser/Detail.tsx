import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import fundraiserJson from '../../../../contracts/artifacts/contracts/Fundraiser.sol/Fundraiser.json';
import Web3 from "../../utils/web3";
import { FundraiserContract } from "../Home";
import Donate from "./Donate";

function Detail() {
	const { address } = useParams();

	const [fundraiser, setFundraiser] = useState<FundraiserContract | null>(null);

	const [donateVisible, setDonateVisible] = useState(false);

	const [signerAddress, setSignerAddress] = useState('');

	useEffect(() => {
		fetchFundraiser();
	}, []);

	const fetchFundraiser = async () => {
		if (!address) return;
		const abi = fundraiserJson.abi;
		const provider = Web3.getProvider();
		const signer = provider.getSigner();
		const contract = new ethers.Contract(address, abi, signer);

		const detail: FundraiserContract = {
			address,
			name: await contract.name(),
			url: await contract.url(),
			imageURL: await contract.imageURL(),
			description: await contract.description(),
			beneficiary: await contract.beneficiary(),
			totalDonations: await contract.totalDonations(),
			donationsCount: await contract.donationsCount(),
			custodian: await contract.custodian(),
		};
		setFundraiser(detail);
		setSignerAddress(await signer.getAddress());
	}

	const showDonate = () => {
		setDonateVisible(true);
	}

	const closeDonate = () => {
		setDonateVisible(false);
	}

	const withdraw = async () => {
		if (!address) return;
		const abi = fundraiserJson.abi;
		const provider = new ethers.providers.Web3Provider(window.ethereum);
		const signer = provider.getSigner();
		const contract = new ethers.Contract(address, abi, signer);
	
		contract.on('Withdraw', () => {
			console.log('Withdraw');
		});
		await contract.withdraw();
	}

	return (
		<>
			<div>
				<div>{fundraiser && fundraiser.name}</div>
				<div>{fundraiser && fundraiser.url}</div>
				<div>{fundraiser && fundraiser.imageURL}</div>
				<div>{fundraiser && fundraiser.description}</div>
				<div>{fundraiser && fundraiser.beneficiary}</div>
			
				<div>
					<button
					 	className="bg-sky-600 text-slate-100 rounded py-1 px-2"
						onClick={showDonate}
					>
						Donate to this fundraiser
					</button>
					<button
					 	className="bg-sky-600 text-slate-100 rounded py-1 px-2 ml-1"
						onClick={withdraw}
					>
						Withdraw to beneficiary
					</button>

				</div>
			</div>

			{donateVisible &&
				<Donate
					fundraiser={fundraiser as FundraiserContract}
					close={closeDonate}
				/>
			}
		</>
	)
}

export default Detail;