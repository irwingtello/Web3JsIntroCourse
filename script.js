window.addEventListener('load', function() {
    if (typeof window.ethereum !== 'undefined') {
        console.log('MetaMask is installed!');
    } else {
        alert('MetaMask is not installed. Please install it to use this app.');
    }
});

document.getElementById('connectButton').addEventListener('click', async () => {
    const button = document.getElementById('connectButton');

    if (window.ethereum) {
        if (button.innerText === 'Connect to MetaMask') {
            try {
                const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
                const account = accounts[0];
                document.getElementById('account').innerText = account;
                document.getElementById('accountInfo').style.display = 'block';

                // Set up web3
                const web3 = new Web3(window.ethereum);

                // Replace with the Filecoin Calibration testnet RPC URL
                const filecoinRPC = 'https://filecoin-calibration.chainup.net/rpc/v1';

                // Add Filecoin Calibration Testnet chain to MetaMask
                await ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId: web3.utils.toHex(314159),
                        chainName: 'Filecoin - Calibration testnet',
                        nativeCurrency: {
                            name: 'tFIL',
                            symbol: 'tFIL',
                            decimals: 18,
                        },
                        rpcUrls: [filecoinRPC],
                        blockExplorerUrls: ['https://calibration.filscan.io']
                    }]
                });

                // Get the balance of the connected account
                const balance = await web3.eth.getBalance(account);
                document.getElementById('balance').innerText = web3.utils.fromWei(balance, 'ether') + ' tFIL';

                // Get the chain ID
                const chainId = await web3.eth.getChainId();
                console.log('Chain ID:', chainId);
                document.getElementById('chainId').innerText = chainId;

                // Display the RPC URL directly
                const rpcUrl = filecoinRPC;
                console.log('RPC URL:', rpcUrl);
                document.getElementById('rpcUrl').innerText = rpcUrl;

                // Change button text to Disconnect
                button.innerText = 'Disconnect';

                // Show the transfer form
                document.getElementById('transferForm').style.display = 'block';

                // Show the token balances
                document.getElementById('tokenBalances').style.display = 'block';

                // Store web3 instance for later use in disconnect and transfer
                window.web3Instance = web3;
                window.account = account;

                // Fetch and display token balances
                await displayTokenBalances(web3, account);
            } catch (error) {
                console.error(error);
            }
        } else {
            // Simulate disconnect logic
            document.getElementById('account').innerText = '';
            document.getElementById('balance').innerText = '';
            document.getElementById('chainId').innerText = '';
            document.getElementById('rpcUrl').innerText = '';
            document.getElementById('accountInfo').style.display = 'none';

            // Hide the transfer form
            document.getElementById('transferForm').style.display = 'none';

            // Hide the token balances
            document.getElementById('tokenBalances').style.display = 'none';

            // Change button text to Connect to MetaMask
            button.innerText = 'Connect to MetaMask';

            // Remove web3 instance
            window.web3Instance = null;
            window.account = null;
        }
    } else {
        alert('MetaMask is not installed. Please install it to use this app.');
    }
});

document.getElementById('transferTokenForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const recipient = document.getElementById('recipient').value;
    const amount = document.getElementById('amount').value;

    if (!window.web3Instance || !window.account) {
        alert('Please connect to MetaMask first.');
        return;
    }

    const web3 = window.web3Instance;
    const account = window.account;

    // Replace with your ERC-20 token contract address and ABI
    const tokenAddress = '0x18bceD2BFbf5Bf9dAa2dc73A0Eaf0b902df00a85';
    const tokenABI = [
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "spender",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "allowance",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "needed",
                    "type": "uint256"
                }
            ],
            "name": "ERC20InsufficientAllowance",
            "type": "error"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "sender",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "balance",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "needed",
                    "type": "uint256"
                }
            ],
            "name": "ERC20InsufficientBalance",
            "type": "error"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "approver",
                    "type": "address"
                }
            ],
            "name": "ERC20InvalidApprover",
            "type": "error"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "receiver",
                    "type": "address"
                }
            ],
            "name": "ERC20InvalidReceiver",
            "type": "error"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "sender",
                    "type": "address"
                }
            ],
            "name": "ERC20InvalidSender",
            "type": "error"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "spender",
                    "type": "address"
                }
            ],
            "name": "ERC20InvalidSpender",
            "type": "error"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "owner",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "spender",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "value",
                    "type": "uint256"
                }
            ],
            "name": "Approval",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "from",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "value",
                    "type": "uint256"
                }
            ],
            "name": "Transfer",
            "type": "event"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "owner",
                    "type": "address"
                },
                {
                    "internalType": "address",
                    "name": "spender",
                    "type": "address"
                }
            ],
            "name": "allowance",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "spender",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "value",
                    "type": "uint256"
                }
            ],
            "name": "approve",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "account",
                    "type": "address"
                }
            ],
            "name": "balanceOf",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "decimals",
            "outputs": [
                {
                    "internalType": "uint8",
                    "name": "",
                    "type": "uint8"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "name",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "symbol",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "totalSupply",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "value",
                    "type": "uint256"
                }
            ],
            "name": "transfer",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "from",
                    "type": "address"
                },
                {
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "value",
                    "type": "uint256"
                }
            ],
            "name": "transferFrom",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            "stateMutability": "nonpayable",
            "type": "function"
        }
    ];

    const tokenContract = new web3.eth.Contract(tokenABI, tokenAddress);

    try {
        const transferAmount = web3.utils.toWei(amount, 'ether'); // Adjust the unit according to your token's decimals
        await tokenContract.methods.transfer(recipient, transferAmount).send({ from: account });
        document.getElementById('transferStatus').innerText = 'Transfer successful!';
    } catch (error) {
        console.error(error);
        document.getElementById('transferStatus').innerText = 'Transfer failed!';
    }
});

async function displayTokenBalances(web3, account) {
    const tokenAddresses = [
        // Add your token contract addresses here
        '0x18bceD2BFbf5Bf9dAa2dc73A0Eaf0b902df00a85'
        // ...
    ];

    const tokenABI = [
        // Minimal ABI to get token balance and name
        {
            "constant": true,
            "inputs": [],
            "name": "name",
            "outputs": [
                {
                    "name": "",
                    "type": "string"
                }
            ],
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "_owner",
                    "type": "address"
                }
            ],
            "name": "balanceOf",
            "outputs": [
                {
                    "name": "balance",
                    "type": "uint256"
                }
            ],
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "decimals",
            "outputs": [
                {
                    "name": "",
                    "type": "uint8"
                }
            ],
            "type": "function"
        }
    ];

    const tokenList = document.getElementById('tokenList');
    tokenList.innerHTML = '';

    for (const address of tokenAddresses) {
        const tokenContract = new web3.eth.Contract(tokenABI, address);

        try {
            const name = await tokenContract.methods.name().call();
            const balance = await tokenContract.methods.balanceOf(account).call();
            const decimals = await tokenContract.methods.decimals().call();
            const adjustedBalance = balance / Math.pow(10, decimals);

            const listItem = document.createElement('li');
            listItem.innerText = `${name}: ${adjustedBalance}`;
            tokenList.appendChild(listItem);
        } catch (error) {
            console.error(`Failed to fetch balance for token at ${address}`, error);
        }
    }
}
