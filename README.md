# ProofIt! A decentralized solution to proof digital ownership of physical products
* Web 3 app using Hardhat, Ethereum smart contract written in Solidity and a Frontend with VueJS & TailwindCSS

## How to run the app?
* First of all copy the ``.env.example`` file to ``.env``; all key-value pairs will be injected into the application as environment variables
* The app requires API Credentials from Filebase (https://filebase.com/) - make sure to create an account + API Keys (don't forget to restrict them properly (CREATE + READ is allowed)) and then create a new Bucket (selecting IPFS + Public) and update the corresponding ENV Variables (File: ``.env``; Keys: ``VITE_FILEBASE_BUCKET_NAME`` -> Bucket Name; ``VITE_FILEBASE_API_KEY`` -> API Key provided by Filebase; ``VITE_FILEBASE_API_SECRET`` -> API Secret provided by Filebase)
* Ensure that you have MetaMask installed (https://metamask.io/download/)
* Make sure that you have NodeJS v16.14.0 installed (it's easiest to manage via NVM -> just run `nvm use`)
* Run `yarn` to install all the required dependencies (if yarn is not yet installed run `npm i -g yarn` before that)
* Run `yarn server` to host a local ethereum network
* After starting the server 20 accounts (pre funded with 10.000 ETH) are created and their respective public & private keys are displayed -> Add one of the account to MetaMask: Login to MetaMask with passphrase -> click on the upper right icon -> Import account -> paste private key -> Import (NEVER use these Accounts in production / fund them with ETH as their private keys are publicly known!)
* After that setup metamask -> add a new network (Network dropdown -> Add network): Networkname: Localhost; New RPC-URL: http://127.0.0.1:8545; ChainID: 31337
* Run `yarn deploy:local` to compile and deploy the compiled smart contract to the local ethereum network
* Ensure that the correct smart contract address (i.e. 0x5FC8d32690cc91D4c39d9d3abcBD16989F875707) is setup in the environment variables (File: ``.env``; ``VITE_CONTRACT_ADDRESS`` -> Address of the deployed smart contract)
* Run `yarn dev` to start the frontend (running on port 3000)
* Goto http://localhost:3000/ to see the frontend and create your first asset!
* In case you are restarting the network then you have to reset your MetaMask (open metamask -> click on icon in the top right corner -> settings -> advanced -> scroll down -> reset account and confirm)
* Whenever you create a new account make sure to connect it to the site (upper left corner under the logo) -> press connect

## Testing
* Tests are available in the `test` folder and right now cover the whole smart contract. In order to run them: `yarn test`

## Folder Structure
The following table describes the general folder structure of the application

| Folder   | Explanation                                                               |
|----------------|--------------------------------------------------------------------------------------|
| contracts      | Location for smart contracts                                                         |
| public         | Location for any assets (such as favicon, etc.)                                      |
| scripts        | Location for prepared scripts, such as for smart contract compilation and deployment |
| src            | Location for application's VueJS Code                                                |
| src/assets     | Location for the application's assets (lottie files, fonts, etc.)                    |
| src/components | Location for the base VueJS components (Navbar, Lottie, etc.)                        |
| src/helpers    | Location for any helper JavaScript functions required for the application            |
| src/i18n       | Location for managing the strings for different languages                            |
| src/pages      | Location for all the pages used throughout the application                           |
| src/plugins    | Location for the all plugins used (router, config, etc.)                             |
| src/store      | Location for global state mangement files                                            |
| test           | Location for test scripts and test cases                                             |

