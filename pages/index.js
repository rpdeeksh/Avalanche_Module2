import {useState, useEffect} from "react";
import {ethers} from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;
  const [addressInput, setAddressInput] = useState("");
  const [queriedBalance, setQueriedBalance] = useState(undefined);

  const getWallet = async() => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const account = await ethWallet.request({method: "eth_accounts"});
      handleAccount(account);
    }
  }

  const handleAccount = (account) => {
    if (account) {
      console.log ("Account connected: ", account);
      setAccount(account);
    }
    else {
      console.log("No account found");
    }
  }

  const connectAccount = async() => {
    if (!ethWallet) {
      alert('MetaMask wallet is required to connect');
      return;
    }
  
    const accounts = await ethWallet.request({ method: 'eth_requestAccounts' });
    handleAccount(accounts);
    
    // once wallet is set we can get a reference to our deployed contract
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);
 
    setATM(atmContract);
  }

  const getBalance = async() => {
    if (atm) {
      setBalance((await atm.getBalance()).toNumber());
    }
  }

  const deposit = async() => {
    if (atm) {
      let tx = await atm.deposit(1);
      await tx.wait()
      getBalance();
    }
  }

  const withdraw = async() => {
    if (atm) {
      let tx = await atm.withdraw(1);
      await tx.wait()
      getBalance();
    }
  }
  const handleAddressChange = (event) => {
    setAddressInput(event.target.value);
  };

  const queryBalance = async () => {
    if (atm && ethers.utils.isAddress(addressInput)) {
      try {
        const balanceOfAddress = await atm.provider.getBalance(addressInput);
        setQueriedBalance(ethers.utils.formatEther(balanceOfAddress));
      } catch (error) {
        console.error('Error fetching balance:', error);
        setQueriedBalance(undefined);
      }
    } else {
      alert('Please enter a valid Ethereum address.');
    }
  };

  const initUser = () => {
    // Check to see if user has Metamask
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>
    }

    // Check to see if user is connected. If not, connect to their account
    if (!account) {
      return <button onClick={connectAccount}>Please connect your Metamask wallet</button>
    }

    if (balance == undefined) {
      getBalance();
    }

    return (
      <>
      <div>
        <p>Your Account: {account}</p>
        <p>Your Balance: {balance}</p>
        <button onClick={deposit}>Deposit 1 ETH</button>
        <button onClick={withdraw}>Withdraw 1 ETH</button>
        <h3 id="h3_id">Check your friend's ETH balance!</h3>
        <div className="querybalance">
          <input type="text" value={addressInput} onChange={(e) => setAddressInput(e.target.value)} placeholder="Enter an Ethereum address" />
          <button onClick={queryBalance}>Query Balance</button>
        
        {queriedBalance !== undefined && (
          <p>Queried Balance: {queriedBalance} ETH</p>
        )}
      </div>
        
      </div>
      </>
    )
  }

  useEffect(() => {getWallet();}, []);

  return (
    <main className="container">
      <header><h1>Welcome to the Metacrafters ATM!!</h1></header>
      <header><h2>One stop destination for your ATH tracking !</h2></header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center;
          background-color : aquamarine
        }
      `}
      </style>
    </main>
  )
}
