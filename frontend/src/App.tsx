import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { ethers } from 'ethers';
import Home from './page/Home';
import { default as CreateFundraiser } from './page/Fundraiser/Create';
import Detail, { default as FundraiserDetail } from './page/Fundraiser/Detail';
import './App.css'

function App() {
	useEffect(() => {
		connectWallet();
	}, []);

	const connectWallet = async () => {
		if (!window.ethereum) {
			console.error('MetaMask not installed');
		}
		const provider = new ethers.providers.Web3Provider(window.ethereum);
		await provider.send('eth_requestAccounts', []);
		const signer = provider.getSigner();
		console.log('MetaMask Connected, account:', await signer.getAddress());
	}

	return (
		<div className="bg-sky-800 min-h-screen min-w-full">
			<nav className='w-full block h-12 bg-sky-900'>
				<ul className='flex justify-start items-center w-full h-full text-slate-100'>
					<li className='ml-2'>
						<Link to='/'>Home</Link>
					</li>
					<li className='mx-2'>
						<Link to='/new'>New</Link>
					</li>
				</ul>
			</nav>

			<Routes>
				<Route index element={<Home />} />
				<Route path='new' element={<CreateFundraiser />} />
				<Route path='detail/:address' element={<Detail />} />
			</Routes>
		</div>
	)
}

export default App
