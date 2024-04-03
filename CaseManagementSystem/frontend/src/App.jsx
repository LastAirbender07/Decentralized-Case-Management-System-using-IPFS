import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import abi from './contractJson/Upload.json';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ConnectButton from './miniComponents/ConnectButton';
import fox from './assets/images/fox.jpeg';
import fox2 from './assets/images/fox2.jpeg';
import NavBar from './miniComponents/NavBar';
import UploadCase from './components/UploadCase';
import DisplayCase from './components/DisplayCase';
import ShareAccess from './components/ShareAccess';

function App() {
  const [state, setState] = useState({
    provider: null,
    signer: null,
    contract: null,
    account: null,
  });

  const [account, setAccount] = useState(localStorage.getItem('account') || "Not Connected");
  const [modelOpen, setModelOpen] = useState(false);
  const [connected, setConnected] = useState(localStorage.getItem('connected') === 'true' || false);

  useEffect(() => {
    if (connected) {
      connectToMetaMask();
    }
  }, []);

  const connectToMetaMask = async () => {
    const contractAddr = "0x48865604dA943a71CDAC288440243365Ce2dbe37";
    const contractABI = abi.abi;

    console.log(contractABI, contractAddr);

    try {
      const { ethereum } = window;

      let signer = null;
      let provider;

      if (ethereum == null) {
        console.log("MetaMask not installed; using read-only defaults");
        provider = ethers.getDefaultProvider();
      } else {
        const accounts = await ethereum.request({
          method: 'eth_requestAccounts'
        });
        const chosenAccount = accounts[0];
        setAccount(chosenAccount);
        localStorage.setItem('account', chosenAccount);
        provider = new ethers.BrowserProvider(ethereum);
        signer = await provider.getSigner();
      }

      window.ethereum.on("chainChanged", () => {
        window.location.reload();
      });

      window.ethereum.on('accountsChanged', (accounts) => {
        const chosenAccount = accounts[0];
        setAccount(chosenAccount);
        localStorage.setItem('account', chosenAccount);
        window.location.reload();
      });

      const contract = new ethers.Contract(
        contractAddr,
        contractABI,
        signer
      );
      setState({ provider, signer, contract, account });
      setConnected(true);
      localStorage.setItem('connected', true);
    }
    catch (err) {
      console.log(err);
    }
  };

  const disconnectFromMetaMask = () => {
    setConnected(false);
    setAccount("Not Connected");
    localStorage.setItem('connected', false);
    localStorage.removeItem('account');
    // Reset the state
    setState({
      provider: null,
      signer: null,
      contract: null,
      account: null,
    });
  };

  return (
    <div className='w-full h-full justify-center items-center mx-auto bg-[#030014] overflow-hidden'>
      <Router>
        <NavBar />
        <Routes>
          <Route index />
          <Route path='/display' element={<DisplayCase state={state} />} />
          <Route path='/upload' element={<UploadCase state={state} />} />
          <Route path='/share' element={<ShareAccess state={state} />} />
        </Routes>
      </Router>

      <div className='w-full h-full p-[65px] justify-center items-center mx-auto bg-[#030014] max-w-7xl overflow-y-hidden overflow-x-hidden'>
        {!connected ? (
          <div className='flex flex-col items-center justify-center h-full'>
            <h1 className='text-3xl text-white mt-20'>Connect to the Blockchain</h1>
            <img src={fox} alt='per' border='0' className='mt-10 w-[30%] h-[30%]' />
            <ConnectButton onClick={connectToMetaMask} disabled={connected} text={connected ? 'Connected' : 'Connect with MetaMask'} />
          </div>
        ) : (
          <div className='flex flex-col items-center justify-center h-full'>
            <h1 className='text-3xl text-white mt-20'>Connected to: {account} </h1>
            <img src={fox2} alt='per' border='0' className='mt-10 w-[30%] h-[30%]' />
            <button className='mt-5 bg-red-500 text-white px-4 py-2 rounded-md' onClick={disconnectFromMetaMask}>Disconnect</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
