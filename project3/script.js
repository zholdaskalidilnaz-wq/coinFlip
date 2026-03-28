import { ethers } from "https://cdnjs.cloudflare.com/ajax/libs/ethers/6.7.0/ethers.min.js";
const contractAddress="0xc3789961d436778599b2E25D5ced99BdFB7eA926";
const abi = [
  {
    "inputs": [],
    "stateMutability": "payable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "player",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "isWinner",
        "type": "bool"
      }
    ],
    "name": "GamePlayed",
    "type": "event"
  }
];
let signer = null;
let contract = null;
let provider = null;
provider = new ethers.BrowserProvider(window.ethereum);

async function init() {
    provider= new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const accounts = await provider.listAccounts();
    signer= await provider.getSigner();
    contract = new ethers.Contract(contractAddress, abi, signer);
    console.log("Signer address:", await signer.getAddress());
}
async function play(side) {
    let amountInWei=ethers.parseEther(("0.000001").toString());
    console.log(amountInWei);
    await contract.playGame(side, {value: amountInWei});
}
async function getGamePlayed() {

    const blockNumber = await provider.getBlockNumber();

    const events = await contract.queryFilter(
        "GamePlayed",
        blockNumber - 5000,
        blockNumber
    );

    if (events.length === 0) {
        document.getElementById("result").innerText = "Нет игр";
        return;
    }

    const lastEvent = events[events.length - 1];

    const player = lastEvent.args.player;
    const isWinner = lastEvent.args.isWinner;

    let resultText = `
Игрок: ${player}
Результат: ${isWinner ? "Вы выиграли 🎉" : "Вы проиграли ❌"}
    `;

    console.log(resultText);

    document.getElementById("result").innerText = resultText;
}


async function setNote() {
    const note = document.getElementById("InputNote").value;
    const tx = await contract.setNote(note);
    await tx.wait();
    console.log("Note stored");
}
async function getNote() {
    const note = await contract.getNote();
    document.getElementById("result").textContent = note; }

    async function startApp() {
        await init();
        document.getElementById("play0").addEventListener("click", () => play(0));
        document.getElementById("play1").addEventListener("click", () => play(1));
        document.getElementById("getGamePlayed").addEventListener("click", getGamePlayed);
    }
    startApp();