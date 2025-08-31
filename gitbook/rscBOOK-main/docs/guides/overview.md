# Guías de RSC Chain

## Visión General

Esta sección proporciona guías paso a paso y tutoriales detallados para utilizar RSC Chain. Desde la configuración inicial hasta el desarrollo de aplicaciones avanzadas, estas guías te ayudarán a aprovechar al máximo la plataforma.

## Guías de Inicio Rápido

### Configuración Inicial

#### Instalación de RSC Chain

```bash
# 1. Verificar requisitos del sistema
rustc --version  # Debe ser 1.70+
cargo --version  # Debe estar incluido con Rust

# 2. Clonar el repositorio
git clone https://github.com/rsc-chain/rsc-chain.git
cd rsc-chain

# 3. Compilar el proyecto
cargo build --release

# 4. Verificar la instalación
./target/release/rsc-node --version
```

#### Configuración del Entorno

```bash
# 1. Crear archivo de configuración
cp config/default.yaml config/local.yaml

# 2. Editar configuración local
nano config/local.yaml

# Configuración básica:
network:
  name: "local"
  port: 8545
  rpc_port: 8546
  ws_port: 8547

database:
  path: "./data"
  max_size: "10GB"

consensus:
  algorithm: "hybrid"
  block_time: 15
  difficulty_adjustment: true

# 3. Crear directorio de datos
mkdir -p data
```

#### Ejecutar Nodo Local

```bash
# 1. Iniciar nodo en modo desarrollo
./target/release/rsc-node --config config/local.yaml --dev

# 2. Verificar que el nodo esté funcionando
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"rsc_blockNumber","params":[],"id":1}' \
  http://localhost:8546

# Respuesta esperada:
# {"jsonrpc":"2.0","result":"0x0","id":1}
```

### Crear tu Primera Wallet

#### Usando la CLI

```bash
# 1. Crear nueva wallet
./target/release/rsc-cli wallet create

# Salida:
# Wallet creada exitosamente
# Dirección: 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6
# Clave privada: 0x1234567890abcdef...
# Frase mnemónica: word1 word2 word3 ...

# 2. Verificar balance
./target/release/rsc-cli wallet balance 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6

# 3. Obtener tokens de prueba (solo en testnet)
./target/release/rsc-cli faucet request 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6
```

#### Usando el SDK de JavaScript

```javascript
// 1. Instalar SDK
npm install @rsc-chain/sdk

// 2. Crear wallet
import { RSCChain } from '@rsc-chain/sdk';

const rsc = new RSCChain({
    endpoint: 'http://localhost:8546',
    network: 'local'
});

// Crear wallet
const wallet = await rsc.wallet.create();
console.log('Wallet creada:', wallet.address);

// Obtener balance
const balance = await rsc.wallet.getBalance(wallet.address);
console.log('Balance:', balance.toString());

// Exportar wallet
const privateKey = wallet.exportPrivateKey();
const mnemonic = wallet.exportMnemonic();
console.log('Clave privada:', privateKey);
console.log('Frase mnemónica:', mnemonic);
```

### Enviar tu Primera Transacción

#### Transacción Básica

```javascript
// 1. Crear transacción
const transaction = await rsc.transactions.create({
    from: wallet.address,
    to: '0x1234567890123456789012345678901234567890',
    value: '1000000000000000000', // 1 RSC
    gas: '21000'
});

console.log('Transacción creada:', transaction.hash);

// 2. Esperar confirmación
const receipt = await rsc.transactions.waitForConfirmation(transaction.hash);
console.log('Transacción confirmada:', receipt);

// 3. Verificar en el explorador
console.log(`Ver transacción: http://localhost:3000/tx/${transaction.hash}`);
```

#### Transacción con Datos (Smart Contract)

```javascript
// 1. Crear transacción con datos
const contractAddress = '0x1234567890123456789012345678901234567890';
const functionSignature = 'transfer(address,uint256)';
const recipient = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6';
const amount = '1000000000000000000'; // 1 token

// Codificar datos de la función
const data = rsc.utils.encodeFunctionData(functionSignature, [recipient, amount]);

const transaction = await rsc.transactions.create({
    from: wallet.address,
    to: contractAddress,
    data: data,
    gas: '100000'
});

console.log('Transacción de contrato creada:', transaction.hash);
```

## Guías de Desarrollo

### Configurar Entorno de Desarrollo

#### Configuración del IDE

```json
// .vscode/settings.json
{
    "rust-analyzer.checkOnSave.command": "clippy",
    "rust-analyzer.cargo.buildScripts.enable": true,
    "rust-analyzer.procMacro.enable": true,
    "rust-analyzer.lens.enable": true,
    "rust-analyzer.lens.implementations.enable": true,
    "rust-analyzer.lens.references.adt.enable": true,
    "rust-analyzer.lens.references.trait.enable": true,
    "rust-analyzer.lens.references.enumVariant.enable": true,
    "rust-analyzer.lens.references.method.enable": true,
    "rust-analyzer.assist.emitMustUse": true,
    "rust-analyzer.assist.emitMustUseOrPanic": true,
    "rust-analyzer.assist.emitMustUseOrDrop": true,
    "files.associations": {
        "*.rs": "rust"
    },
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
        "source.fixAll": true,
        "source.organizeImports": true
    }
}
```

#### Configuración de Git Hooks

```bash
# 1. Instalar pre-commit
pip install pre-commit

# 2. Crear .pre-commit-config.yaml
cat > .pre-commit-config.yaml << EOF
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.4.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-added-large-files

  - repo: https://github.com/psf/black
    rev: 23.3.0
    hooks:
      - id: black

  - repo: local
    hooks:
      - id: rust-fmt
        name: rust-fmt
        entry: cargo fmt --check
        language: system
        types: [rust]
        pass_filenames: false

      - id: rust-clippy
        name: rust-clippy
        entry: cargo clippy --all-targets --all-features -- -D warnings
        language: system
        types: [rust]
        pass_filenames: false
EOF

# 3. Instalar hooks
pre-commit install
```

### Crear tu Primera dApp

#### Estructura del Proyecto

```bash
# 1. Crear estructura del proyecto
mkdir my-dapp
cd my-dapp

# 2. Inicializar proyecto
npm init -y

# 3. Instalar dependencias
npm install @rsc-chain/sdk ethers hardhat @openzeppelin/contracts

# 4. Configurar Hardhat
npx hardhat init
```

#### Configuración de Hardhat

```javascript
// hardhat.config.js
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.19",
  networks: {
    rsc_local: {
      url: "http://localhost:8546",
      accounts: ["0x1234567890abcdef..."], // Tu clave privada
      chainId: 1337
    },
    rsc_testnet: {
      url: "https://testnet.rsc-chain.com",
      accounts: ["0x1234567890abcdef..."],
      chainId: 1337
    }
  }
};
```

#### Smart Contract Básico

```solidity
// contracts/SimpleToken.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SimpleToken is ERC20, Ownable {
    constructor(string memory name, string memory symbol) 
        ERC20(name, symbol) 
        Ownable(msg.sender) 
    {
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }
}
```

#### Desplegar Contrato

```javascript
// scripts/deploy.js
const hre = require("hardhat");

async function main() {
  // 1. Obtener el contrato
  const SimpleToken = await hre.ethers.getContractFactory("SimpleToken");
  
  // 2. Desplegar contrato
  const token = await SimpleToken.deploy("Mi Token", "MTK");
  await token.waitForDeployment();
  
  const address = await token.getAddress();
  console.log("Token desplegado en:", address);
  
  // 3. Verificar en explorador
  console.log(`Ver contrato: http://localhost:3000/contract/${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

```bash
# Desplegar contrato
npx hardhat run scripts/deploy.js --network rsc_local
```

#### Frontend Básico

```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mi dApp</title>
    <script src="https://cdn.ethers.io/lib/ethers-5.7.2.umd.min.js"></script>
</head>
<body>
    <h1>Mi dApp en RSC Chain</h1>
    
    <div>
        <h2>Conectar Wallet</h2>
        <button onclick="connectWallet()">Conectar</button>
        <p id="wallet-address"></p>
    </div>
    
    <div>
        <h2>Balance de Token</h2>
        <input type="text" id="token-address" placeholder="Dirección del token">
        <button onclick="getBalance()">Obtener Balance</button>
        <p id="token-balance"></p>
    </div>
    
    <div>
        <h2>Transferir Tokens</h2>
        <input type="text" id="recipient" placeholder="Dirección del destinatario">
        <input type="number" id="amount" placeholder="Cantidad">
        <button onclick="transfer()">Transferir</button>
    </div>

    <script src="app.js"></script>
</body>
</html>
```

```javascript
// app.js
let provider, signer, tokenContract;

async function connectWallet() {
    try {
        // Conectar a MetaMask
        if (typeof window.ethereum !== 'undefined') {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            provider = new ethers.providers.Web3Provider(window.ethereum);
            signer = provider.getSigner();
            
            const address = await signer.getAddress();
            document.getElementById('wallet-address').textContent = `Conectado: ${address}`;
        } else {
            alert('Por favor instala MetaMask');
        }
    } catch (error) {
        console.error('Error conectando wallet:', error);
    }
}

async function getBalance() {
    try {
        const tokenAddress = document.getElementById('token-address').value;
        if (!tokenAddress) {
            alert('Por favor ingresa la dirección del token');
            return;
        }
        
        // ABI básico para ERC20
        const abi = [
            "function balanceOf(address owner) view returns (uint256)",
            "function decimals() view returns (uint8)",
            "function symbol() view returns (string)"
        ];
        
        tokenContract = new ethers.Contract(tokenAddress, abi, signer);
        
        const address = await signer.getAddress();
        const balance = await tokenContract.balanceOf(address);
        const decimals = await tokenContract.decimals();
        const symbol = await tokenContract.symbol();
        
        const formattedBalance = ethers.utils.formatUnits(balance, decimals);
        document.getElementById('token-balance').textContent = 
            `Balance: ${formattedBalance} ${symbol}`;
    } catch (error) {
        console.error('Error obteniendo balance:', error);
    }
}

async function transfer() {
    try {
        const recipient = document.getElementById('recipient').value;
        const amount = document.getElementById('amount').value;
        
        if (!recipient || !amount) {
            alert('Por favor completa todos los campos');
            return;
        }
        
        const decimals = await tokenContract.decimals();
        const amountWei = ethers.utils.parseUnits(amount, decimals);
        
        const tx = await tokenContract.transfer(recipient, amountWei);
        await tx.wait();
        
        alert('Transferencia exitosa!');
        getBalance(); // Actualizar balance
    } catch (error) {
        console.error('Error en transferencia:', error);
        alert('Error en transferencia: ' + error.message);
    }
}
```

### Integración con APIs

#### Configurar API Client

```javascript
// api-client.js
import { RSCChain } from '@rsc-chain/sdk';

class RSCAPIClient {
    constructor(config) {
        this.rsc = new RSCChain({
            endpoint: config.endpoint,
            apiKey: config.apiKey,
            network: config.network
        });
    }
    
    // Blockchain info
    async getBlockchainInfo() {
        return await this.rsc.blockchain.getInfo();
    }
    
    async getLatestBlock() {
        return await this.rsc.blockchain.getLatestBlock();
    }
    
    // Transactions
    async getTransaction(hash) {
        return await this.rsc.transactions.get(hash);
    }
    
    async sendTransaction(txData) {
        return await this.rsc.transactions.send(txData);
    }
    
    // Smart contracts
    async callContract(address, abi, method, params) {
        return await this.rsc.contracts.call(address, abi, method, params);
    }
    
    async deployContract(bytecode, abi, params) {
        return await this.rsc.contracts.deploy(bytecode, abi, params);
    }
    
    // Events
    async subscribeToEvents(eventType, callback) {
        return await this.rsc.events.subscribe(eventType, callback);
    }
}

export default RSCAPIClient;
```

#### Ejemplo de Uso de API

```javascript
// example-usage.js
import RSCAPIClient from './api-client.js';

const client = new RSCAPIClient({
    endpoint: 'https://api.rsc-chain.com',
    apiKey: 'your-api-key',
    network: 'mainnet'
});

// Obtener información de la blockchain
async function getBlockchainStatus() {
    try {
        const info = await client.getBlockchainInfo();
        console.log('Estado de la blockchain:', info);
        
        const latestBlock = await client.getLatestBlock();
        console.log('Último bloque:', latestBlock);
    } catch (error) {
        console.error('Error obteniendo información:', error);
    }
}

// Enviar transacción
async function sendTransaction() {
    try {
        const tx = await client.sendTransaction({
            from: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
            to: '0x1234567890123456789012345678901234567890',
            value: '1000000000000000000', // 1 RSC
            gas: '21000'
        });
        
        console.log('Transacción enviada:', tx.hash);
        
        // Esperar confirmación
        const receipt = await client.waitForConfirmation(tx.hash);
        console.log('Transacción confirmada:', receipt);
    } catch (error) {
        console.error('Error enviando transacción:', error);
    }
}

// Suscribirse a eventos
async function subscribeToEvents() {
    try {
        const subscription = await client.subscribeToEvents('new_block', (block) => {
            console.log('Nuevo bloque:', block);
        });
        
        console.log('Suscripción creada:', subscription.id);
    } catch (error) {
        console.error('Error suscribiéndose a eventos:', error);
    }
}

// Ejecutar ejemplos
getBlockchainStatus();
sendTransaction();
subscribeToEvents();
```

## Guías Avanzadas

### Optimización de Smart Contracts

#### Gas Optimization

```solidity
// contracts/OptimizedToken.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract OptimizedToken is ERC20 {
    // Usar uint256 en lugar de uint para optimizar gas
    uint256 private _totalSupply;
    
    // Empaquetar variables en structs para optimizar storage
    struct UserInfo {
        uint128 balance;
        uint128 lastUpdate;
    }
    
    mapping(address => UserInfo) private _userInfo;
    
    constructor(string memory name, string memory symbol) 
        ERC20(name, symbol) 
    {
        _totalSupply = 1000000 * 10 ** decimals();
        _userInfo[msg.sender] = UserInfo({
            balance: uint128(_totalSupply),
            lastUpdate: uint128(block.timestamp)
        });
    }
    
    // Función optimizada para transferencia
    function transfer(address to, uint256 amount) 
        public 
        override 
        returns (bool) 
    {
        require(to != address(0), "Invalid recipient");
        require(amount > 0, "Invalid amount");
        
        UserInfo storage fromInfo = _userInfo[msg.sender];
        UserInfo storage toInfo = _userInfo[to];
        
        require(fromInfo.balance >= amount, "Insufficient balance");
        
        // Actualizar balances
        fromInfo.balance = uint128(fromInfo.balance - amount);
        toInfo.balance = uint128(toInfo.balance + amount);
        
        // Emitir evento
        emit Transfer(msg.sender, to, amount);
        
        return true;
    }
    
    // Función view optimizada
    function balanceOf(address account) 
        public 
        view 
        override 
        returns (uint256) 
    {
        return _userInfo[account].balance;
    }
}
```

#### Security Best Practices

```solidity
// contracts/SecureToken.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract SecureToken is ReentrancyGuard, Pausable, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;
    
    uint256 private _totalSupply;
    string private _name;
    string private _symbol;
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    
    constructor(string memory name_, string memory symbol_) {
        _name = name_;
        _symbol = symbol_;
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
    }
    
    modifier onlyMinter() {
        require(hasRole(MINTER_ROLE, msg.sender), "Must have minter role");
        _;
    }
    
    modifier onlyPauser() {
        require(hasRole(PAUSER_ROLE, msg.sender), "Must have pauser role");
        _;
    }
    
    function mint(address to, uint256 amount) 
        public 
        onlyMinter 
        whenNotPaused 
    {
        require(to != address(0), "Invalid recipient");
        require(amount > 0, "Invalid amount");
        
        _totalSupply += amount;
        _balances[to] += amount;
        
        emit Transfer(address(0), to, amount);
    }
    
    function transfer(address to, uint256 amount) 
        public 
        override 
        whenNotPaused 
        nonReentrant 
        returns (bool) 
    {
        require(to != address(0), "Invalid recipient");
        require(amount > 0, "Invalid amount");
        require(_balances[msg.sender] >= amount, "Insufficient balance");
        
        _balances[msg.sender] -= amount;
        _balances[to] += amount;
        
        emit Transfer(msg.sender, to, amount);
        
        return true;
    }
    
    function pause() public onlyPauser {
        _pause();
    }
    
    function unpause() public onlyPauser {
        _unpause();
    }
    
    // Función de emergencia
    function emergencyWithdraw(address token, address to) 
        public 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        require(to != address(0), "Invalid recipient");
        
        uint256 balance = IERC20(token).balanceOf(address(this));
        require(balance > 0, "No tokens to withdraw");
        
        IERC20(token).transfer(to, balance);
    }
}
```

### Testing Avanzado

#### Testing de Smart Contracts

```javascript
// test/SecureToken.test.js
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SecureToken", function () {
    let SecureToken, token, owner, user1, user2;
    
    beforeEach(async function () {
        [owner, user1, user2] = await ethers.getSigners();
        
        SecureToken = await ethers.getContractFactory("SecureToken");
        token = await SecureToken.deploy("Secure Token", "SEC");
        await token.deployed();
    });
    
    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            expect(await token.hasRole(await token.DEFAULT_ADMIN_ROLE(), owner.address)).to.equal(true);
        });
        
        it("Should assign minter role to owner", async function () {
            expect(await token.hasRole(await token.MINTER_ROLE(), owner.address)).to.equal(true);
        });
    });
    
    describe("Minting", function () {
        it("Should allow minter to mint tokens", async function () {
            const mintAmount = ethers.utils.parseEther("100");
            await token.mint(user1.address, mintAmount);
            
            expect(await token.balanceOf(user1.address)).to.equal(mintAmount);
        });
        
        it("Should not allow non-minter to mint tokens", async function () {
            const mintAmount = ethers.utils.parseEther("100");
            
            await expect(
                token.connect(user1).mint(user2.address, mintAmount)
            ).to.be.revertedWith("Must have minter role");
        });
    });
    
    describe("Transfer", function () {
        beforeEach(async function () {
            await token.mint(user1.address, ethers.utils.parseEther("100"));
        });
        
        it("Should transfer tokens between accounts", async function () {
            const transferAmount = ethers.utils.parseEther("50");
            
            await token.connect(user1).transfer(user2.address, transferAmount);
            
            expect(await token.balanceOf(user1.address)).to.equal(ethers.utils.parseEther("50"));
            expect(await token.balanceOf(user2.address)).to.equal(transferAmount);
        });
        
        it("Should fail if sender doesn't have enough tokens", async function () {
            const transferAmount = ethers.utils.parseEther("150");
            
            await expect(
                token.connect(user1).transfer(user2.address, transferAmount)
            ).to.be.revertedWith("Insufficient balance");
        });
        
        it("Should fail when paused", async function () {
            await token.pause();
            
            await expect(
                token.connect(user1).transfer(user2.address, ethers.utils.parseEther("10"))
            ).to.be.revertedWith("Pausable: paused");
        });
    });
    
    describe("Pausing", function () {
        it("Should allow pauser to pause", async function () {
            await token.pause();
            expect(await token.paused()).to.equal(true);
        });
        
        it("Should not allow non-pauser to pause", async function () {
            await expect(
                token.connect(user1).pause()
            ).to.be.revertedWith("Must have pauser role");
        });
    });
});
```

#### Testing de Integración

```javascript
// test/integration.test.js
const { expect } = require("chai");
const { ethers } = require("hardhat");
const { RSCChain } = require("@rsc-chain/sdk");

describe("Integration Tests", function () {
    let rsc, token, owner, user1, user2;
    
    before(async function () {
        // Conectar a RSC Chain
        rsc = new RSCChain({
            endpoint: "http://localhost:8546",
            network: "local"
        });
        
        [owner, user1, user2] = await ethers.getSigners();
    });
    
    beforeEach(async function () {
        // Desplegar contrato antes de cada test
        const SecureToken = await ethers.getContractFactory("SecureToken");
        token = await SecureToken.deploy("Test Token", "TEST");
        await token.deployed();
    });
    
    it("Should handle complete token lifecycle", async function () {
        // 1. Mint tokens
        const mintAmount = ethers.utils.parseEther("1000");
        await token.mint(user1.address, mintAmount);
        
        // 2. Verificar balance en blockchain
        const balance = await rsc.contracts.call(
            token.address,
            ["function balanceOf(address) view returns (uint256)"],
            "balanceOf",
            [user1.address]
        );
        
        expect(balance.toString()).to.equal(mintAmount.toString());
        
        // 3. Transfer tokens
        const transferAmount = ethers.utils.parseEther("100");
        await token.connect(user1).transfer(user2.address, transferAmount);
        
        // 4. Verificar transferencia
        const user1Balance = await token.balanceOf(user1.address);
        const user2Balance = await token.balanceOf(user2.address);
        
        expect(user1Balance).to.equal(ethers.utils.parseEther("900"));
        expect(user2Balance).to.equal(transferAmount);
        
        // 5. Verificar evento en blockchain
        const events = await rsc.events.getContractEvents(
            token.address,
            "Transfer",
            { fromBlock: "latest" }
        );
        
        expect(events.length).to.be.greaterThan(0);
        expect(events[0].args.from).to.equal(user1.address);
        expect(events[0].args.to).to.equal(user2.address);
        expect(events[0].args.value.toString()).to.equal(transferAmount.toString());
    });
    
    it("Should handle multiple concurrent transactions", async function () {
        // Mint tokens a múltiples usuarios
        const mintAmount = ethers.utils.parseEther("100");
        await token.mint(user1.address, mintAmount);
        await token.mint(user2.address, mintAmount);
        
        // Ejecutar transferencias concurrentes
        const promises = [];
        for (let i = 0; i < 5; i++) {
            promises.push(
                token.connect(user1).transfer(user2.address, ethers.utils.parseEther("10"))
            );
        }
        
        await Promise.all(promises);
        
        // Verificar balances finales
        const user1Balance = await token.balanceOf(user1.address);
        const user2Balance = await token.balanceOf(user2.address);
        
        expect(user1Balance).to.equal(ethers.utils.parseEther("50")); // 100 - 5*10
        expect(user2Balance).to.equal(ethers.utils.parseEther("150")); // 100 + 5*10
    });
});
```

### Despliegue en Producción

#### Configuración de Producción

```javascript
// hardhat.config.prod.js
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
      viaIR: true
    }
  },
  networks: {
    rsc_mainnet: {
      url: process.env.RSC_MAINNET_URL,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 1,
      gasPrice: "auto",
      gas: "auto"
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  }
};
```

#### Script de Despliegue

```javascript
// scripts/deploy-prod.js
const hre = require("hardhat");

async function main() {
    console.log("Iniciando despliegue en producción...");
    
    // 1. Verificar configuración
    const network = await hre.ethers.provider.getNetwork();
    console.log("Red:", network.name);
    console.log("Chain ID:", network.chainId);
    
    // 2. Obtener balance
    const [deployer] = await hre.ethers.getSigners();
    const balance = await deployer.getBalance();
    console.log("Balance del deployer:", hre.ethers.utils.formatEther(balance), "RSC");
    
    if (balance.lt(hre.ethers.utils.parseEther("0.1"))) {
        throw new Error("Balance insuficiente para despliegue");
    }
    
    // 3. Desplegar contrato
    console.log("Desplegando contrato...");
    const SecureToken = await hre.ethers.getContractFactory("SecureToken");
    const token = await SecureToken.deploy("Production Token", "PROD");
    
    console.log("Esperando confirmación...");
    await token.deployed();
    
    console.log("Contrato desplegado en:", token.address);
    
    // 4. Verificar contrato
    console.log("Verificando contrato...");
    try {
        await hre.run("verify:verify", {
            address: token.address,
            constructorArguments: ["Production Token", "PROD"],
        });
        console.log("Contrato verificado exitosamente");
    } catch (error) {
        console.log("Error en verificación:", error.message);
    }
    
    // 5. Configurar roles
    console.log("Configurando roles...");
    const minterRole = await token.MINTER_ROLE();
    const pauserRole = await token.PAUSER_ROLE();
    
    // Asignar roles a múltiples direcciones para redundancia
    const backupAddresses = process.env.BACKUP_ADDRESSES?.split(",") || [];
    
    for (const address of backupAddresses) {
        await token.grantRole(minterRole, address);
        await token.grantRole(pauserRole, address);
        console.log("Roles asignados a:", address);
    }
    
    // 6. Mint tokens iniciales
    const initialSupply = hre.ethers.utils.parseEther("1000000"); // 1M tokens
    await token.mint(deployer.address, initialSupply);
    console.log("Tokens iniciales minteados");
    
    console.log("Despliegue completado exitosamente!");
    console.log("Contrato:", token.address);
    console.log("Explorador:", `https://explorer.rsc-chain.com/contract/${token.address}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
```

#### Monitoreo de Producción

```javascript
// scripts/monitor.js
const { ethers } = require("hardhat");
const { RSCChain } = require("@rsc-chain/sdk");

class ProductionMonitor {
    constructor(config) {
        this.rsc = new RSCChain(config);
        this.contracts = new Map();
        this.alerts = [];
    }
    
    async addContract(address, name, abi) {
        this.contracts.set(address, { name, abi, address });
    }
    
    async startMonitoring() {
        console.log("Iniciando monitoreo de producción...");
        
        // Monitorear eventos de contratos
        for (const [address, contract] of this.contracts) {
            await this.monitorContractEvents(address, contract);
        }
        
        // Monitorear transacciones sospechosas
        await this.monitorSuspiciousTransactions();
        
        // Monitorear métricas de red
        await this.monitorNetworkMetrics();
    }
    
    async monitorContractEvents(address, contract) {
        console.log(`Monitoreando eventos de ${contract.name}...`);
        
        this.rsc.events.subscribe('contract_event', (event) => {
            if (event.address.toLowerCase() === address.toLowerCase()) {
                this.handleContractEvent(contract, event);
            }
        });
    }
    
    async handleContractEvent(contract, event) {
        console.log(`Evento en ${contract.name}:`, event);
        
        // Verificar eventos críticos
        if (event.event === 'Transfer' && event.args.value > ethers.utils.parseEther("10000")) {
            this.alert('Large Transfer', {
                contract: contract.name,
                from: event.args.from,
                to: event.args.to,
                value: ethers.utils.formatEther(event.args.value)
            });
        }
        
        if (event.event === 'Paused') {
            this.alert('Contract Paused', {
                contract: contract.name,
                timestamp: new Date().toISOString()
            });
        }
    }
    
    async monitorSuspiciousTransactions() {
        this.rsc.events.subscribe('transaction', (tx) => {
            // Verificar transacciones con gas muy alto
            if (tx.gasUsed > 1000000) {
                this.alert('High Gas Transaction', {
                    hash: tx.hash,
                    gasUsed: tx.gasUsed,
                    from: tx.from
                });
            }
            
            // Verificar transacciones fallidas
            if (tx.status === 0) {
                this.alert('Failed Transaction', {
                    hash: tx.hash,
                    from: tx.from,
                    error: tx.error
                });
            }
        });
    }
    
    async monitorNetworkMetrics() {
        setInterval(async () => {
            try {
                const info = await this.rsc.blockchain.getInfo();
                
                // Verificar latencia de red
                if (info.blockTime > 20) {
                    this.alert('High Network Latency', {
                        blockTime: info.blockTime,
                        timestamp: new Date().toISOString()
                    });
                }
                
                // Verificar número de peers
                if (info.peers < 10) {
                    this.alert('Low Peer Count', {
                        peers: info.peers,
                        timestamp: new Date().toISOString()
                    });
                }
            } catch (error) {
                this.alert('Network Monitoring Error', {
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
            }
        }, 60000); // Cada minuto
    }
    
    alert(type, data) {
        const alert = {
            type,
            data,
            timestamp: new Date().toISOString()
        };
        
        this.alerts.push(alert);
        console.log('ALERTA:', alert);
        
        // Enviar notificación (email, Slack, etc.)
        this.sendNotification(alert);
    }
    
    async sendNotification(alert) {
        // Implementar envío de notificaciones
        // Email, Slack, Discord, etc.
        console.log('Enviando notificación:', alert);
    }
}

// Uso del monitor
async function main() {
    const monitor = new ProductionMonitor({
        endpoint: process.env.RSC_MAINNET_URL,
        network: 'mainnet'
    });
    
    // Agregar contratos a monitorear
    await monitor.addContract(
        process.env.TOKEN_CONTRACT_ADDRESS,
        "Production Token",
        ["event Transfer(address indexed from, address indexed to, uint256 value)"]
    );
    
    // Iniciar monitoreo
    await monitor.startMonitoring();
}

if (require.main === module) {
    main().catch(console.error);
}
```

---

*Estas guías te proporcionan una base sólida para comenzar con RSC Chain. Recuerda consultar la documentación oficial para obtener información más detallada y actualizada.*
