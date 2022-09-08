import { BigNumber, ethers } from "ethers";
import { useState } from "react";
import { FundraiserContract } from "../Home";
import fundraiserJson from '../../../../contracts/artifacts/contracts/Fundraiser.sol/Fundraiser.json';
import Web3 from "../../utils/web3";

interface Props {
	fundraiser: FundraiserContract;
	close: () => void;
}

function Donate(props: Props) {
	const { fundraiser } = props;

	const [donateAmount, setDonateAmount] = useState('');

	const submit = async () => {
		const { abi } = fundraiserJson;
		const provider = Web3.getProvider();
		const signer = provider.getSigner();
		const contract = new ethers.Contract(fundraiser.address, abi, signer);

		contract.on('DonationReceived', () => {
			console.log('DonationReceived');
		});
		const amountInWei = ethers.utils.parseEther(donateAmount);
		await contract.donate({ value: amountInWei });
	}

	return (
		<div className="w-1/3 fixed z-10 top-32 left-1/2 shadow bg-slate-100 p-2 rounded -translate-x-1/2">
			<div className="text-lg">Donate to {fundraiser.name}</div>
			<div className="my-2">
				<input
					value={donateAmount}
					onChange={e => setDonateAmount(e.target.value)}
				/>
				<span className="pl-1">ETH</span>
				<button
					className="ml-2 bg-sky-800 text-slate-100 hover:bg-sky-600 px-2 py-1 rounded"
					onClick={submit}>Donate</button>
			</div>
			<div className="flex justify-end">
				<button onClick={props.close}>Cancel</button>
			</div>
		</div>
	)
}

export default Donate;