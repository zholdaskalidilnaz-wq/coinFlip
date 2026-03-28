let contract;
let signer;

const contractAddress = "0xc3789961d436778599b2E25D5ced99BdFB7eA926";

const abi = [
    "function playGame(uint8 choice) payable",
    "event GamePlayed(address player, bool isWinner, uint8 playerChoice, uint8 botChoice)"
];

async function Init() {
    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);

    signer = await provider.getSigner();
    contract = new ethers.Contract(contractAddress, abi, signer);
}

async function play(choice) {
    try {
        const amount = ethers.parseEther("0.000001");

        const tx = await contract.playGame(choice, {
            value: amount
        });

        document.getElementById("result").innerText = "⏳ Күте тұрыңыз...";

        await tx.wait();

        getResult();

    } catch (err) {
        console.log(err);
        document.getElementById("result").innerText = "❌ Қате шықты";
    }
}

function decodeChoice(num) {
    if (num == 0) return "🪨 Камень";
    if (num == 1) return "✂️ Ножницы";
    if (num == 2) return "📄 Бумага";
}

async function getResult() {
    const block = await signer.provider.getBlockNumber();

    const events = await contract.queryFilter(
        "GamePlayed",
        block - 5000,
        block
    );

    const last = events[events.length - 1];

    const win = last.args.isWinner;
    const playerChoice = last.args.playerChoice;
    const botChoice = last.args.botChoice;

    let text = win ? "🎉 ЖЕҢДІҢ!" : "😢 ЖЕҢІЛДІҢ!";

    document.getElementById("result").innerText =
        "Сен: " + decodeChoice(playerChoice) +
        " | Бот: " + decodeChoice(botChoice) +
        "\n" + text;
}

async function startApp() {
    await Init();
}

startApp();