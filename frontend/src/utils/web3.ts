import { Web3Provider } from "@ethersproject/providers";
import { ethers, Signer } from "ethers";

export default class Web3 {
	private static provider: Web3Provider | null;

	public static getProvider(): Web3Provider {
		if (this.provider === null) {
			this.provider = new ethers.providers.Web3Provider(window.ethereum);
		}
		return this.provider;
	}

	public static getFundraiserFactoryAddress(): string {
		return process.env.FUNDRAISER_FACTORY_ADDRESS as string;
	}
}