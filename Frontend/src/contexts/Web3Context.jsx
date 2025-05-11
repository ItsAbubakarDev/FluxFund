import { createContext, useContext, useState, useEffect } from 'react';

const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const [address, setAddress] = useState('');

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ 
          method: "eth_requestAccounts" 
        });
        setAddress(accounts[0]);
        localStorage.setItem('connectedWallet', accounts[0]);
      } catch (error) {
        console.error("User rejected request", error);
      }
    }
  };

  useEffect(() => {
    const initWallet = async () => {
      if (window.ethereum && localStorage.getItem('connectedWallet')) {
        try {
          const accounts = await window.ethereum.request({ method: "eth_accounts" });
          if (accounts.length > 0) {
            setAddress(accounts[0]);
          }
        } catch (err) {
          console.error("Failed to fetch accounts", err);
        }
      }
    };
    initWallet();
  }, []);

  return (
    <Web3Context.Provider value={{ address, connectWallet }}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => useContext(Web3Context);