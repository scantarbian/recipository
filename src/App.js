import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

export default function App () {
  const [currentAccount, setCurrentAccount] = useState("");

  const checkWalletConnection = () => {
    const { ethereum } = window;

    if (!ethereum) {
      alert("Please connect to MetaMask");
      return;
    } else {
      console.log("We have the ethereum object: ", ethereum);
    }
  }

  useEffect(() => {
    checkWalletConnection();
  }, []);

  return (
    <div className="h-screen bg-gradient-to-br from-pink-400 to-purple-400 px-10">
      <header className="flex flex-col w-full items-center py-20">
        <h1 className="text-white font-bold text-5xl ">👋 Welcome to Recipository! 🍽</h1>
        <span className="pt-4 text-xl text-gray-200 font-light">Here you can share your homemade recipe and store them in the blockchain!</span>
      </header>
      <main className="flex flex-col items-center w-full">
        <button>
          Submit Recipe
        </button>
      </main>
    </div>
  );
}