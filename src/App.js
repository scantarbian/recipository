import reciportal from './utils/Reciportal.json';
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useForm } from "react-hook-form";

export default function App () {
  const [currentAccount, setCurrentAccount] = useState("");
  const [allRecipes, setAllRecipes] = useState([]);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const contractAddress = "0x1BCcF95c826807a33dA070047a47Ad9A712a44f5";

  const getAllRecipes = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const reciportalContract = new ethers.Contract(contractAddress, reciportal.abi, signer);

        const recipes = await reciportalContract.getAllRecipes();

        let purifiedRecipes = [];

        recipes.forEach((recipe) => {
          purifiedRecipes.push({
            address: recipe.sender,
            timestamp: new Date(recipe.timestamp.toNumber() * 1000).toLocaleString(),
            title: recipe.title,
            ingredients: recipe.ingredients,
            instructions: recipe.instructions,
          });
        });
        
        setAllRecipes(purifiedRecipes);

        reciportalContract.on("NewRecipe", (from, timestamp, title, ingredients, instructions) => {
          console.log("NewRecipe", from, timestamp, title, ingredients, instructions);

          setAllRecipes(prevState => [
            ...prevState, {
              address: from,
              timestamp: new Date(timestamp.toNumber() * 1000).toLocaleString(),
              title: title,
              ingredients: ingredients,
              instructions: instructions,
            }
          ]);
        });
      } else {
        console.log("No ethereum object found!");
      }
    } catch (error) {
      console.error(error);
    }
  }

  const checkWalletConnection = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Please connect to MetaMask");
        return;
      } else {
        console.log("We have the ethereum object: ", ethereum);
      }
  
      const accounts  = await ethereum.request({ method: "eth_accounts"});
  
      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account: ", account);
        setCurrentAccount(account);
        getAllRecipes();
      } else {
        console.log("No authorized account found!");
      }
    } catch (error) {
      console.error(error);
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts"});
      
      console.log("Connected: ", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.error(error);
    }
  }

  const recipost = async (title, ingredients, instructions) => {
    try {
      const { ethereum } = window;
      
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const reciportalContract = new ethers.Contract(contractAddress, reciportal.abi, signer);

        // let count = await reciportalContract.getTotalRecipes();
        // console.log("Total Waves: ", count.toNumber());

        const waveTxn = await reciportalContract.recipost(title, ingredients, instructions, { gasLimit: 300000 });
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined!", waveTxn.hash);

      } else {
        console.log("No ethereum object found!");
      }
    } catch (error) {
      console.error(error);
    }
  }

  const onSubmit = async (data) => {
    try {
      recipost(data.title, data.ingredients, data.instructions);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    checkWalletConnection();
  }, []);

  return (
    <div className="">
      <header className="flex flex-col w-full items-center my-20">
        <h1 className="text-white font-bold text-5xl ">👋 Welcome to Recipository! 🍽</h1>
        <span className="pt-4 text-xl text-gray-200 font-light">Here you can share your homemade recipe and store them in the blockchain!</span>
      </header>
      <main className="flex flex-col items-center w-full ">
        <form 
          onSubmit={handleSubmit(onSubmit)}
          className="p-8 flex flex-col items-center bg-white rounded-2xl backdrop-filter backdrop-blur-xl bg-opacity-30 w-1/2 space-y-4 filter drop-shadow-lg">
          <input 
            type="text"
            placeholder="Title"
            className="rounded-2xl w-full"
            {...register("title", {required: true})}
          />
          <textarea 
            placeholder="Ingredients"
            className="rounded-2xl w-full resize-none h-32"
            {...register("ingredients", {required: true})}
          />
          <textarea 
            placeholder="instructions"
            className="rounded-2xl w-full resize-none h-32"
            {...register("instructions", {required: true})}
          />
          <div className={`flex items-center space-x-10 ${!currentAccount && "space-x-10"}`}>
            {!currentAccount && (
              <button
                type="button"
                onClick={connectWallet}
                className="p-4 rounded-2xl bg-white font-light
                transform-gpu transition duration-500
                hover:bg-gray-100 hover:scale-110
                focus:scale-100 focus:bg-gray-100"
              >
                Connect Wallet
              </button>
            )}
            <button 
              type="submit"
              className="p-4 rounded-2xl bg-white font-light
              transform-gpu transition duration-500
              hover:bg-gray-100 hover:scale-110
              focus:scale-100 focus:bg-gray-100"
            >
              Submit Recipe
            </button>
          </div>
        </form>
          {allRecipes.length > 0 && (
            <div className="flex flex-col items-center space-y-4 mt-20 w-1/2">
              <h2 className="text-white font-bold text-3xl">😋 Submitted Recipes 🍝</h2>
              {allRecipes.map((recipe, index) => {
                return (
                  <div key={index} className="w-full bg-white rounded-2xl backdrop-filter backdrop-blur-xl bg-opacity-30 filter drop-shadow-lg p-8">
                    <h3 className="font-medium text-xl">{recipe.title}</h3>
                    <div className="flex justify-between text-sm">
                      <p>By {recipe.address}</p>
                      <p>{recipe.timestamp.toString()}</p>
                    </div>
                    <h4 className="font-medium text-lg">Ingredients</h4>
                    <p>{recipe.ingredients}</p>
                    <h4 className="font-medium text-lg">Instructions</h4>
                    <p>{recipe.instructions}</p>
                  </div>
                )
              })}
            </div>
          )}
      </main>
      <footer className="mt-20 w-full p-4 text-white text-center">
        <span>Made with ❤ by <a target="_blank" href="https://github.com/scantarbian/">scantarbian</a></span>
      </footer>
    </div>
  );
}