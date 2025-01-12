// Configuration object for the network and contracts
const config = {
  chainId: 64165, // Sonic Testnet Chain ID
  rpcUrl: "https://rpc.testnet.soniclabs.com", // Sonic Testnet RPC URL
  contractAddress: "0x05FF60B96CB3dB409D3F376Ca6E0E85184F75f60", // theGridNFTv4.SOL in RemixIDE
  stakingContractAddress: "0xdE48d249D3665E1fEcA46d5427FB48E76e1f222D", // theGridStakingv4.SOL in RemixIDE
};

if (!window.gridState) {
  window.gridState = {}; // Global state for staked NFTs
}

if (!window.leaderboardState) {
  window.leaderboardState = []; // Global state for leaderboard
}

let provider, signer, contract, stakingContract, userNFTs; // Global variables for Web3 provider, signer, and contract
let gridState = {}; // This ensures you can reassign it later
let leaderboardState = []; // This allows modification and reassignment
let walletAddress = null; // Declare globally
let walletNFTs = []; // Declare globally at the top of the file
let stakedNFTs = []; // Declare stakedNFTs similarly

const contractABI = [
  {
    inputs: [
      {
        internalType: "address payable",
        name: "_rewardsWallet",
        type: "address",
      },
      {
        internalType: "address payable",
        name: "_pooledFundsWallet",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "ERC721IncorrectOwner",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "operator",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "ERC721InsufficientApproval",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "approver",
        type: "address",
      },
    ],
    name: "ERC721InvalidApprover",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "operator",
        type: "address",
      },
    ],
    name: "ERC721InvalidOperator",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "ERC721InvalidOwner",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "receiver",
        type: "address",
      },
    ],
    name: "ERC721InvalidReceiver",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    name: "ERC721InvalidSender",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "ERC721NonexistentToken",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "OwnableInvalidOwner",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "OwnableUnauthorizedAccount",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "approved",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "operator",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "approved",
        type: "bool",
      },
    ],
    name: "ApprovalForAll",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    inputs: [],
    name: "COMMON_LIMIT",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "MAX_SUPPLY",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "MINT_PRICE",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "RARE_LIMIT",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "commonCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "commonMetadataURI",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "getApproved",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "operator",
        type: "address",
      },
    ],
    name: "isApprovedForAll",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "isRare",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "mint",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "mintAll",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "ownerOf",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "pooledFundsWallet",
    outputs: [
      {
        internalType: "address payable",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "rareCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "rareMetadataURI",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "rewardsWallet",
    outputs: [
      {
        internalType: "address payable",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "safeTransferFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    name: "safeTransferFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "operator",
        type: "address",
      },
      {
        internalType: "bool",
        name: "approved",
        type: "bool",
      },
    ],
    name: "setApprovalForAll",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes4",
        name: "interfaceId",
        type: "bytes4",
      },
    ],
    name: "supportsInterface",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "tokenURI",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalMinted",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "transferFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "walletMintCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const stakingContractABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_nftContract",
        type: "address",
      },
      {
        internalType: "address",
        name: "initialOwner",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "OwnableInvalidOwner",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "OwnableUnauthorizedAccount",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "NFTStaked",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "NFTUnstaked",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "gameValues",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "nftContract",
    outputs: [
      {
        internalType: "contract IERC721",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "setGameValue",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "stake",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "stakedNFTs",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "stakers",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "stakingStartTime",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "unstake",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

document.addEventListener("DOMContentLoaded", () => {
  restoreAppState();
});

// Check for wallet connection on page load
document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Check for a saved wallet address in localStorage
    const storedWallet = localStorage.getItem("connectedWallet");
    if (storedWallet) {
      console.log(`Reconnecting to wallet: ${storedWallet}`);
      walletAddress = storedWallet;

      // Automatically reconnect the wallet
      await connectWallet();

      // Load the wallet-specific state (NFTs, staking data, etc.)
      const loadedState = await loadWalletState(walletAddress);
      walletNFTs = loadedState.walletNFTs || [];
      stakedNFTs = loadedState.stakedNFTs || [];

      console.log("Restored wallet-specific state:", {
        walletNFTs,
        stakedNFTs,
      });
      updateGridBoard(gridState); // Ensure the grid board reflects the restored state
      updateLeaderboard(gridState); //Update the Leaderboard based on the gridState
      // Update the NFT display and grid board
      const combinedNFTs = mergeNFTStates(walletNFTs, stakedNFTs);
      updateNFTDisplay(combinedNFTs);
      connectWallet();
    } else {
      console.log("No wallet address found in localStorage. Please connect.");
    }
  } catch (error) {
    console.error("Error restoring wallet state on page load:", error);
  }
});

// Detect and attach connect button functionality
document.addEventListener("DOMContentLoaded", () => {
  const connectButton = document.getElementById("connectWallet");
  connectButton.addEventListener("click", connectWallet);

  // Initialize read-only provider for non-connected users
  initContract();
  console.log("Contract initialized:", !!contract);
  console.log("Staking contract initialized:", !!stakingContract);
  console.log("Signer initialized:", !!signer);
});

// Initialize a read-only provider
// Initialize a read-only provider and both main and staking contracts
async function initContract() {
  try {
    if (!window.ethereum) {
      console.error("No Ethereum wallet detected.");
      return;
    }

    provider = new ethers.providers.Web3Provider(window.ethereum, {
      name: "sonic-testnet", // Explicit network name
      chainId: config.chainId, // Correct chainId for Sonic Testnet
    });

    signer = provider.getSigner();
    const network = await provider.getNetwork();

    if (network.chainId !== config.chainId) {
      console.error(`Connected to unsupported chain ID: ${network.chainId}`);
      return;
    }

    console.log(`Connected to chain ID: ${network.chainId}`);

    // Initialize the main contract
    contract = new ethers.Contract(config.contractAddress, contractABI, signer);
    console.log("Main contract initialized:", contract);

    // Initialize the staking contract
    stakingContract = new ethers.Contract(
      config.stakingContractAddress,
      stakingContractABI,
      signer
    );
    console.log("Staking contract initialized:", stakingContract);
  } catch (error) {
    console.error("Error initializing contract:", error);
  }
}

// Function to detect and connect to Web3 wallet
async function connectWallet() {
  try {
    if (typeof window.ethereum === "undefined") {
      alert("Please install MetaMask or a compatible wallet.");
      return;
    }

    // Initialize provider
    provider = new ethers.providers.Web3Provider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);
    walletAddress = accounts[0]; // Set global walletAddress
    signer = provider.getSigner();

    console.log(`Wallet connected: ${walletAddress}`);

    // Save wallet address to localStorage
    localStorage.setItem("connectedWallet", walletAddress);

    // Update UI button
    const connectButton = document.getElementById("connectWallet");
    if (connectButton) {
      connectButton.textContent = shortenAddress(walletAddress);
    }

    // Validate network
    const network = await provider.getNetwork();
    if (network.chainId !== config.chainId) {
      alert("Please switch to the Sonic Testnet.");
      return;
    }

    // Fetch wallet NFTs and staked NFTs
    const walletNFTs = await fetchUserNFTs(walletAddress);
    const stakedNFTs = await fetchStakedNFTs(walletAddress);
    updateGlobalNFTDisplay();

    console.log("Wallet NFTs fetched:", walletNFTs);
    console.log("Staked NFTs fetched:", stakedNFTs);

    // Merge both states to display
    const combinedNFTs = mergeNFTStates(walletNFTs, stakedNFTs);

    // Save wallet-specific state
    saveWalletState(walletAddress, walletNFTs, stakedNFTs);

    // Update the NFT display UI
    updateGridBoard(gridState);
    updateLeaderboard(gridState);
    updateNFTDisplay(combinedNFTs);
  } catch (error) {
    console.error("Error connecting wallet:", error);
  }
}

// Clear wallet connection on manual disconnect
function disconnectWallet() {
  localStorage.removeItem("connectedWallet");
  walletAddress = null;
  walletNFTs = [];
  stakedNFTs = [];
  updateNFTDisplay([]); // Clear the UI
  alert("Wallet disconnected.");
}

// Utility function to shorten wallet address
function shortenAddress(address) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

async function fetchUserNFTs(walletAddress) {
  try {
    if (!contract || !provider || !signer) {
      console.error("Provider, signer, or contract not initialized.");
      return [];
    }

    console.log("Fetching NFTs for wallet:", walletAddress);

    const totalMinted = await contract.totalMinted();
    const nftDetails = [];

    for (let tokenId = 1; tokenId <= totalMinted; tokenId++) {
      try {
        // Check ownership
        const owner = await contract.ownerOf(tokenId);
        if (owner.toLowerCase() === walletAddress.toLowerCase()) {
          console.log(`User owns Token ID: ${tokenId}`);

          // Check approval status
          const isApproved = await contract.getApproved(tokenId);
          const approved =
            isApproved.toLowerCase() === stakingContract.address.toLowerCase();

          // Check staking status (from gridState or other source)
          const staked = Object.values(gridState).some(
            (entry) => entry.tokenId === tokenId.toString()
          );

          // Fetch token URI and metadata
          const tokenURI = await contract.tokenURI(tokenId);
          const gatewayURL = tokenURI.replace(
            "ipfs://",
            "https://ipfs.io/ipfs/"
          );
          let metadata = {};

          try {
            metadata = await fetch(gatewayURL).then((res) => res.json());
            if (metadata.image?.startsWith("ipfs://")) {
              metadata.image = metadata.image.replace(
                "ipfs://",
                "https://ipfs.io/ipfs/"
              );
            }
          } catch (metadataError) {
            console.warn(
              `Error fetching metadata for Token ID ${tokenId} at ${gatewayURL}:`,
              metadataError
            );
            metadata = { image: "placeholder.png", name: "Unknown NFT" };
          }

          // Add NFT details to the array
          nftDetails.push({
            tokenId: tokenId.toString(),
            ...metadata,
            approved,
            staked, // Add staking status
          });
        }
      } catch (error) {
        console.warn(
          `Could not verify ownership, approval, or metadata for Token ID ${tokenId}:`,
          error
        );
      }
    }

    console.log("Fetched NFTs with approvals and staking status:", nftDetails);
    userNFTs = nftDetails; // Update the global userNFTs variable
    return nftDetails;
  } catch (error) {
    console.error("Error fetching NFTs:", error);
    return [];
  }
}

async function fetchStakedNFTs(walletAddress) {
  try {
    const stakedNFTs = [];

    for (const gridId in gridState) {
      if (gridState[gridId]?.walletAddress === walletAddress) {
        stakedNFTs.push({
          tokenId: gridState[gridId].tokenId,
          image: gridState[gridId].image,
          staked: true,
        });
      }
    }
    console.log("Fetched staked NFTs:", stakedNFTs);
    return stakedNFTs;
  } catch (error) {
    console.error("Error fetching staked NFTs:", error);
    return [];
  }
}

// Utility: Merge NFTs - Only unstaked NFTs will show "Approve" button
function mergeNFTStates(walletNFTs, stakedNFTs) {
  const mergedState = [];
  const tokenIdSet = new Set();

  // Add all wallet NFTs and sync their states
  walletNFTs.forEach((nft) => {
    tokenIdSet.add(nft.tokenId);

    // Check if the tokenId is already staked
    const stakedData = stakedNFTs.find(
      (stakedNFT) => stakedNFT.tokenId === nft.tokenId
    );

    // Merge staked data if it exists
    mergedState.push({
      ...nft,
      approved: nft.approved || stakedData?.approved || false,
      staked: stakedData?.staked || false,
    });
  });

  // Add staked NFTs that might not be in the wallet
  stakedNFTs.forEach((stakedNFT) => {
    if (!tokenIdSet.has(stakedNFT.tokenId)) {
      mergedState.push({
        tokenId: stakedNFT.tokenId,
        image: stakedNFT.image,
        approved: true, // Staked NFTs are always approved
        staked: true,
      });
    }
  });

  return mergedState;
}

function displayNFTs(nftDetails) {
  const nftListContainer = document.getElementById("nft-list");
  console.log("Contract initialized:", !!contract);
  console.log("Staking contract initialized:", !!stakingContract);
  console.log("Signer initialized:", !!signer);

  // Clear previous entries
  nftListContainer.innerHTML = "";

  nftDetails.forEach((nft) => {
    const nftRow = document.createElement("div");
    nftRow.className = "nft-row";

    // NFT Image
    const nftImageDiv = document.createElement("div");
    nftImageDiv.className = "nft-image";
    const nftImage = document.createElement("img");
    nftImage.src = nft.image || "placeholder.png"; // Use placeholder if no image
    nftImage.alt = "NFT Image";
    nftImageDiv.appendChild(nftImage);

    // Token ID
    const nftTokenIdDiv = document.createElement("div");
    nftTokenIdDiv.className = "nft-token-id";
    nftTokenIdDiv.textContent = `Token ID: ${nft.tokenId}`;

    // Approve Button
    const approveButtonDiv = document.createElement("div");
    approveButtonDiv.className = "nft-approve-button";
    const approveButton = document.createElement("button");
    approveButton.textContent = "Approve";
    approveButton.onclick = () => approveNFT(nft.tokenId, approveButton);
    approveButtonDiv.appendChild(approveButton);

    // Unstake Button
    const unstakeButtonDiv = document.createElement("div");
    unstakeButtonDiv.className = "nft-unstake-button";
    const unstakeButton = document.createElement("button");
    unstakeButton.textContent = "Unstake";
    unstakeButton.disabled = nft.staked !== true; // Enable if NFT is staked

    // Updated logic to handle `unstakeFromGrid` function
    unstakeButton.onclick = () => {
      if (typeof window.unstakeFromGrid === "function") {
        window.unstakeFromGrid(nft.tokenId);
      } else {
        console.error("unstakeFromGrid is not defined.");
      }
    };

    unstakeButtonDiv.appendChild(unstakeButton);

    // Append to Row
    nftRow.appendChild(nftImageDiv);
    nftRow.appendChild(nftTokenIdDiv);
    nftRow.appendChild(approveButtonDiv);
    nftRow.appendChild(unstakeButtonDiv);

    // Append Row to List
    nftListContainer.appendChild(nftRow);
  });
}

async function approveNFT(tokenId, buttonElement) {
  try {
    if (!contract || !signer) {
      console.error("NFT contract or signer not initialized.");
      alert("Please connect your wallet and try again.");
      return;
    }

    console.log(`Approving NFT with Token ID: ${tokenId}...`);

    // Call the `approve` function on the NFT contract
    const transaction = await contract.approve(
      config.stakingContractAddress,
      tokenId
    );
    await transaction.wait();

    console.log(`NFT with Token ID ${tokenId} approved successfully.`);

    // Refresh the NFT state to reflect the new approval
    refreshNFTDisplay();

    if (buttonElement && buttonElement instanceof HTMLElement) {
      buttonElement.innerText = "Stake to Grid"; // Update button text
      buttonElement.disabled = true; // Disable the button after approval
    } else {
      console.warn("Button element is not valid. Skipping UI update.");
      console.log("Received button element:", buttonElement);
      console.log("Button element passed to approveNFT:", buttonElement);
    }
  } catch (error) {
    if (error.code === 4001) {
      console.warn("User rejected the transaction.");
      alert(
        "Approval canceled. You need to approve the transaction to proceed."
      );
    } else {
      console.error("Error during approval:", error);
    }
  }
}

// Open the modal and populate with token IDs
export function openTokenIdModal(gridId) {
  const modal = document.getElementById("tokenIdModal");
  const tokenIdList = document.getElementById("tokenIdList");

  // Clear existing token IDs in the modal
  tokenIdList.innerHTML = "";

  // Ensure userNFTs is populated
  if (!userNFTs || userNFTs.length === 0) {
    console.error("No NFTs available for staking.");
    return;
  }

  // Populate the modal with user's token IDs
  userNFTs.forEach((nft) => {
    const tokenButton = document.createElement("button");
    tokenButton.textContent = `Token ID: ${nft.tokenId}`;
    tokenButton.className = "token-button";
    tokenButton.onclick = () => {
      stakeToGrid(nft.tokenId, gridId);
      closeModal();
    };

    tokenIdList.appendChild(tokenButton);
  });

  modal.style.display = "block";
}

// Bind openTokenIdModal to all stake buttons dynamically
document.addEventListener("DOMContentLoaded", () => {
  const stakeButtons = document.querySelectorAll(".item-button");

  stakeButtons.forEach((button) => {
    const gridId = button.getAttribute("data-grid-id");

    button.onclick = () => {
      openTokenIdModal(gridId);
    };
  });

  // Initialize other UI elements and contracts
  initContract();
  console.log("Contract initialized:", !!contract);
  console.log("Staking contract initialized:", !!stakingContract);
  console.log("Signer initialized:", !!signer);
});

// Close the modal
function closeModal() {
  const modal = document.getElementById("tokenIdModal");
  modal.style.display = "none";
}

// Handle closing the modal when clicking the close button or outside the modal
document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("tokenIdModal");
  const closeButton = document.getElementById("closeModal");

  // Close when the "x" button is clicked
  if (closeButton) {
    closeButton.onclick = () => {
      closeModal();
    };
  }

  // Close when clicking outside the modal
  window.onclick = (event) => {
    if (event.target === modal) {
      closeModal();
    }
  };
});

async function stakeToGrid(tokenId, gridId) {
  try {
    if (!stakingContract || !signer) {
      await initContract(); // Ensure contracts and signer are initialized
      console.error("Staking contract or signer not initialized.");
      alert("Please connect your wallet and try again.");
      return;
    }

    console.log(`Staking Token ID: ${tokenId} to Grid ID: ${gridId}...`);

    const gasLimit = await stakingContract.estimateGas.stake(tokenId);
    const transaction = await stakingContract.stake(tokenId, { gasLimit });
    await transaction.wait();

    console.log(`Token ID ${tokenId} staked successfully to ${gridId}.`);

    // Update gridState with a clearer placeholder
    gridState[gridId] = {
      tokenId,
      walletAddress,
      image: userNFTs.find((nft) => nft.tokenId === tokenId)?.image || "",
      gridValue: "Pending", // More descriptive than "?"
      wins: 0,
      winnings: 0,
    };

    // Save updated gridState
    saveAppState();

    // Update UI
    updateGridBoard(gridState); // Update the grid
    updateLeaderboard(gridState);
    refreshNFTDisplay(); // Update available NFTs

    alert(`Successfully staked Token ID: ${tokenId} to Grid ID: ${gridId}`);
    console.log("Updated gridState after staking:", gridState[gridId]);
  } catch (error) {
    if (error.code === 4001) {
      console.warn("User rejected the staking transaction.");
      alert("Staking canceled. Please confirm the transaction to proceed.");
    } else {
      console.error("Error during staking:", error);
      alert("An error occurred during staking. Please try again.");
    }
  }
}

async function unstakeFromGrid(tokenId) {
  try {
    if (!stakingContract || !signer) {
      console.error("Staking contract or signer not initialized.");
      alert("Please connect your wallet and try again.");
      return;
    }

    console.log(`Unstaking Token ID: ${tokenId}...`);

    const gasLimit = await stakingContract.estimateGas.unstake(tokenId);
    const transaction = await stakingContract.unstake(tokenId, { gasLimit });
    await transaction.wait();

    console.log(`Token ID ${tokenId} unstaked successfully.`);

    // Find and remove the grid entry
    const gridId = Object.keys(gridState).find(
      (key) => gridState[key]?.tokenId === tokenId
    );

    if (gridId) {
      delete gridState[gridId];
    }

    // Save updated gridState
    saveAppState();

    // Update UI
    updateGridBoard(gridState); // Update the grid
    updateLeaderboard(gridState); // Update leaderboard
    refreshNFTDisplay();

    alert(`Successfully unstaked Token ID: ${tokenId}.`);
  } catch (error) {
    if (error.code === 4001) {
      console.warn("User rejected the unstaking transaction.");
      alert("Unstaking canceled. Please confirm the transaction to proceed.");
    } else {
      console.error("Error during unstaking:", error);
      alert("An error occurred during unstaking. Please try again.");
    }
  }
}

// UPDATE THE Grid Board //

function updateGridBoard(gridState) {
  if (!gridState) {
    console.error("No gridState provided to updateGridBoard.");
    return;
  }

  console.log("Updating grid board with final gridState:", gridState);

  // Update each grid cell based on gridState
  Object.entries(gridState).forEach(([gridId, cellData]) => {
    const gridElement = document.getElementById(gridId);

    if (!gridElement) return; // Skip if the grid element is not found

    if (cellData && cellData.image) {
      // If an NFT is staked, display only the NFT image
      gridElement.innerHTML = `
        <img src="${cellData.image}" alt="NFT Image" class="nft-image">
      `;
      gridElement.classList.add("occupied");
    } else {
      // If no NFT is staked, display the "STAKE" button
      gridElement.innerHTML = `<button class="stake-button" onclick="openTokenIdModal('${gridId}')">STAKE</button>`;
      gridElement.classList.remove("occupied");
    }
  });

  // Update column and row headers
  const columnHeaders = JSON.parse(
    localStorage.getItem("headerValues")
  )?.columns;
  const rowHeaders = JSON.parse(localStorage.getItem("headerValues"))?.rows;

  if (columnHeaders && rowHeaders) {
    const columnElements = Array.from(
      document.querySelectorAll(".rand_column")
    );
    const rowElements = Array.from(document.querySelectorAll(".rand_row"));

    columnElements.forEach((colElement, index) => {
      colElement.textContent = columnHeaders[index] || ""; // Default to empty
    });

    rowElements.forEach((rowElement, index) => {
      rowElement.textContent = rowHeaders[index] || ""; // Default to empty
    });
  } else {
    console.error("Column and row headers not found in localStorage.");
  }
}

//Update the NFT Display
async function updateGlobalNFTDisplay() {
  try {
    // Merge wallet NFTs and staked NFTs into one list
    userNFTs = mergeNFTStates(walletNFTs, stakedNFTs);

    // Pass the merged state to updateNFTDisplay
    updateNFTDisplay(userNFTs);

    console.log("NFT display updated with merged state:", userNFTs);
  } catch (error) {
    console.error("Error updating global NFT display:", error);
  }
}

function updateNFTDisplay(nfts) {
  const nftDisplaySection = document.getElementById("nft-list");
  nftDisplaySection.innerHTML = ""; // Clear existing display

  const displayedTokenIds = new Set(); // Track displayed token IDs to avoid duplicates

  nfts.forEach((nft) => {
    if (displayedTokenIds.has(nft.tokenId)) return; // Skip duplicates
    displayedTokenIds.add(nft.tokenId);

    const nftElement = document.createElement("div");
    nftElement.className = "nft-item";

    // Add NFT image
    const img = document.createElement("img");
    img.src = nft.image || "placeholder.png"; // Fallback to placeholder
    img.alt = `NFT ${nft.tokenId}`;
    img.className = "nft-image";
    nftElement.appendChild(img);

    // Add Token ID
    const tokenIdText = document.createElement("p");
    tokenIdText.textContent = `Token ID: ${nft.tokenId}`;
    nftElement.appendChild(tokenIdText);

    // Add Status
    const statusText = document.createElement("p");
    statusText.textContent = `Status: ${
      nft.staked ? "Staked" : nft.approved ? "Approved" : "Not Approved"
    }`;
    nftElement.appendChild(statusText);

    // Add Action Button
    const actionButton = document.createElement("button");

    if (nft.staked) {
      actionButton.textContent = "Unstake";
      actionButton.onclick = () => unstakeFromGrid(nft.tokenId);
    } else if (nft.approved) {
      actionButton.textContent = "Stake to Grid";
      actionButton.disabled = true; // Disabled until grid selection
    } else {
      actionButton.textContent = "Approve";
      actionButton.onclick = async () => {
        await approveNFT(nft.tokenId, actionButton);
        updateGlobalNFTDisplay(); // Refresh after approval
      };
    }

    nftElement.appendChild(actionButton);
    nftDisplaySection.appendChild(nftElement);
  });
}

// Update the leaderboard
function updateLeaderboard() {
  const leaderboardTable = document
    .getElementById("leaderboard")
    .getElementsByTagName("tbody")[0];

  if (!leaderboardTable) {
    console.error("Leaderboard table or tbody not found.");
    return;
  }

  // Clear the existing leaderboard
  leaderboardTable.innerHTML = "";

  // Log gridState for debugging
  console.log("GridState before sorting for leaderboard:", gridState);

  // Convert gridState to an array and sort by wins
  const sortedLeaderboard = Object.entries(gridState)
    .filter(([gridId, gridData]) => gridData && gridData.wins >= 0) // Include entries with wins or 0 wins
    .sort(([, a], [, b]) => b.wins - a.wins); // Sort descending by wins

  // Log sorted leaderboard data
  console.log("Sorted Leaderboard Data:", sortedLeaderboard);

  // Populate leaderboard
  sortedLeaderboard.forEach(([gridId, gridData]) => {
    if (!gridData || typeof gridData.walletAddress !== "string") {
      console.warn(`Skipping invalid entry for gridId ${gridId}:`, gridData);
      return;
    }

    // Create a new row in the leaderboard
    const newRow = leaderboardTable.insertRow();
    const walletCell = newRow.insertCell(0);
    const gridValueCell = newRow.insertCell(1);
    const winsCell = newRow.insertCell(2);
    const winningsCell = newRow.insertCell(3);

    walletCell.textContent = shortenAddress(gridData.walletAddress);
    gridValueCell.textContent = gridData.gridValue || "N/A";
    winsCell.textContent = gridData.wins || "0";
    winningsCell.textContent = `$${gridData.winnings || 0}`;
  });

  console.log("Leaderboard updated and sorted by wins.");
}

// Expose the function globally
window.updateLeaderboard = updateLeaderboard;

// Utility function to save state to localStorage
function saveAppState() {
  try {
    if (typeof gridState === "object" && gridState !== null) {
      localStorage.setItem("gridState", JSON.stringify(gridState));
    } else {
      console.warn("Invalid gridState. Resetting to empty.");
      gridState = {};
    }

    console.log("App state saved.");
  } catch (error) {
    console.error("Error saving app state:", error);
  }
}

// RESTORE APP STATE
function restoreAppState() {
  try {
    console.log("Restoring app state...");

    const savedGridState = JSON.parse(localStorage.getItem("gridState")) || {};
    const walletNFTsState = localStorage.getItem(
      `walletState_${walletAddress}`
    );

    if (typeof savedGridState === "object" && savedGridState !== null) {
      gridState = savedGridState;

      // Update the grid display
      Object.entries(gridState).forEach(([gridId, tokenData]) => {
        const gridElement = document.getElementById(gridId);
        if (gridElement) {
          gridElement.innerHTML = `<img src="${tokenData.image}" alt="NFT" />`;
          gridElement.classList.add("occupied");
        }
      });

      console.log("Restored gridState:", gridState);
    } else {
      console.warn("Invalid or missing gridState. Resetting to empty.");
      gridState = {};
    }

    // Reload NFT data for the connected wallet
    if (walletNFTsState) {
      const parsedState = JSON.parse(walletNFTsState);
      userNFTs = mergeNFTStates(
        parsedState.walletNFTs,
        Object.values(gridState)
      );
      updateGridBoard(gridState);
      updateLeaderboard(gridState);
      updateNFTDisplay(userNFTs);
    }

    console.log("App state restored.");
  } catch (error) {
    console.error("Error restoring app state:", error);
  }
}

const unstakeButton = document.querySelector("#nft-unstake-button"); // Replace with actual button ID
if (unstakeButton) {
  unstakeButton.addEventListener("click", () => {
    const tokenId = unstakeButton.dataset.tokenId; // Ensure tokenId is set as a dataset attribute
    unstakeFromGrid(tokenId);
  });
}

async function saveGlobalState() {
  localStorage.setItem("gridState", JSON.stringify(gridState));
  localStorage.setItem("leaderboardState", JSON.stringify(leaderboardState));
  console.log("Global state saved.");
}

async function loadGlobalState() {
  gridState = JSON.parse(localStorage.getItem("gridState")) || {};
  leaderboardState = JSON.parse(localStorage.getItem("leaderboardState")) || [];
  console.log("Global state loaded.");
}

function saveWalletState(walletAddress, walletNFTs = [], stakedNFTs = []) {
  try {
    if (!walletAddress) throw new Error("Wallet address is missing.");

    const walletState = {
      walletNFTs: walletNFTs,
      stakedNFTs: stakedNFTs,
    };

    localStorage.setItem(
      `walletState_${walletAddress}`,
      JSON.stringify(walletState)
    );
    console.log(
      `Wallet-specific state saved for ${walletAddress}:`,
      walletState
    );
  } catch (error) {
    console.error(`Failed to save wallet state for ${walletAddress}:`, error);
  }
}

async function loadWalletState(walletAddress) {
  try {
    const walletState = localStorage.getItem(`walletState_${walletAddress}`);
    if (!walletState) {
      console.log(`No saved state for wallet: ${walletAddress}`);
      return { walletNFTs: [], stakedNFTs: [] };
    }

    const parsedState = JSON.parse(walletState);
    console.log(`Loaded state for wallet: ${walletAddress}`, parsedState);
    return parsedState;
  } catch (error) {
    console.error(`Failed to load state for wallet: ${walletAddress}`, error);
    return { walletNFTs: [], stakedNFTs: [] }; // Return default values
  }
}

// New function to refresh the NFT display
async function refreshNFTDisplay() {
  try {
    console.log("Refreshing NFT Display...");

    // Fetch the latest wallet and staked NFT states
    const walletNFTs = await fetchUserNFTs(walletAddress);
    const stakedNFTs = await fetchStakedNFTs(walletAddress);

    // Merge the two states
    const combinedNFTs = mergeNFTStates(walletNFTs, stakedNFTs);

    console.log("Merged NFT state:", combinedNFTs);

    // Update the NFT display with the merged data
    updateNFTDisplay(combinedNFTs);

    // Persist the updated state in localStorage
    saveWalletState(walletAddress, walletNFTs, stakedNFTs);
  } catch (error) {
    console.error("Error refreshing NFT display:", error);
  }
}

document.addEventListener("gridFilledAndSaved", (event) => {
  const finalizedGridState = event.detail.gridState;

  // Debug log to confirm the event payload
  console.log("Received finalized gridState in event:", finalizedGridState);

  // Ensure the gridState is valid before updating the leaderboard
  if (!finalizedGridState || typeof finalizedGridState !== "object") {
    console.error("Invalid gridState received in gridFilledAndSaved event.");
    return;
  }

  // Update the grid and leaderboard
  updateGridBoard(finalizedGridState);
  updateLeaderboard(); // Uses the finalized gridState
});

window.unstakeFromGrid = unstakeFromGrid;
window.approveNFT = approveNFT;
window.connectWallet = connectWallet;
export { gridState, leaderboardState };

if (window.ethereum) {
  window.ethereum.on("accountsChanged", async (accounts) => {
    try {
      if (accounts.length > 0) {
        const previousWalletAddress = walletAddress; // Save the previous wallet
        walletAddress = accounts[0]; // Update the global walletAddress
        console.log(`Wallet switched to: ${walletAddress}`);

        // Save the state of the previous wallet
        if (previousWalletAddress) {
          saveWalletState(previousWalletAddress, walletNFTs, stakedNFTs);
        }

        // Reset wallet-specific states
        walletNFTs = [];
        stakedNFTs = [];

        // Fetch and load state for the new wallet
        const loadedState = await loadWalletState(walletAddress);
        walletNFTs = loadedState.walletNFTs || []; // Assign walletNFTs after loading state
        stakedNFTs = loadedState.stakedNFTs || []; // Assign stakedNFTs after loading state

        console.log("Loaded wallet-specific state:", {
          walletNFTs,
          stakedNFTs,
        });

        // Fetch wallet-specific NFTs
        const newWalletNFTs = await fetchUserNFTs(walletAddress);
        const newStakedNFTs = await fetchStakedNFTs(walletAddress);

        walletNFTs = [...newWalletNFTs]; // Update global walletNFTs
        stakedNFTs = [...newStakedNFTs]; // Update global stakedNFTs

        console.log("NFTs after wallet switch:", {
          walletNFTs,
          stakedNFTs,
        });

        // Update the UI with the new wallet's data
        updateNFTDisplay([...walletNFTs, ...stakedNFTs]);
      } else {
        alert("Wallet disconnected. Please reconnect.");
      }
    } catch (error) {
      console.error("Error handling wallet switch:", error);
    }
  });
}
