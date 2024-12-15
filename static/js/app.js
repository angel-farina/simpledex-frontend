import { ethers } from "https://cdnjs.cloudflare.com/ajax/libs/ethers/6.7.0/ethers.min.js";

// Dirección del contrato SimpleDEX en Sepolia
const contractAddress = "0x1C8AA2A0104162d69e5E4ed91c3AA2f4B3253c87";

// ABI del contrato SimpleDEX
const abi = [
    {
        "inputs": [
            { "internalType": "address", "name": "_tokenA", "type": "address" },
            { "internalType": "address", "name": "_tokenB", "type": "address" }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    { "inputs": [{ "internalType": "uint256", "name": "amountA", "type": "uint256" }, { "internalType": "uint256", "name": "amountB", "type": "uint256" }], "name": "addLiquidity", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [{ "internalType": "uint256", "name": "amountA", "type": "uint256" }, { "internalType": "uint256", "name": "amountB", "type": "uint256" }], "name": "removeLiquidity", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [{ "internalType": "uint256", "name": "amountAIn", "type": "uint256" }], "name": "swapAforB", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [{ "internalType": "uint256", "name": "amountBIn", "type": "uint256" }], "name": "swapBforA", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [{ "internalType": "address", "name": "_token", "type": "address" }], "name": "getPrice", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "reserveA", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "reserveB", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "tokenA", "outputs": [{ "internalType": "contract IERC20", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "tokenB", "outputs": [{ "internalType": "contract IERC20", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }
];

let provider, signer, contract;

async function connectWallet() {
    if (window.ethereum) {
        provider = new ethers.BrowserProvider(window.ethereum);
        signer = await provider.getSigner();
        const address = await signer.getAddress();
        
        contract = new ethers.Contract(contractAddress, abi, signer);
        
        document.getElementById('status').innerText = `Conectado a ${address}`;
        document.getElementById('btnConnect').style.display = 'none';
        document.getElementById('btnDisconnect').style.display = 'inline';

        document.getElementById('liquidityForm').style.display = 'block';
        document.getElementById('swapForm').style.display = 'block';
        document.getElementById('removeLiquidityForm').style.display = 'block';
        document.getElementById('reservesSection').style.display = 'block';
        document.getElementById('tokenPriceSection').style.display = 'block';
        document.getElementById('balancesSection').style.display = 'block';
        document.getElementById('decimalInfo').style.display = 'block';
        document.getElementById('refreshButton').style.display = 'inline';
        document.getElementById('aestheticEffect').style.display = 'none';

        await getTokenAddresses();
        await getReserves();
        await getTokenPrices();
        await getEthBalance();
        await getTokenBalances();
    } else {
        alert('Metamask no detectado');
    }
}

async function disconnectWallet() {
    provider = null;
    signer = null;
    contract = null;

    document.getElementById('status').innerText = 'Desconectado';
    document.getElementById('btnConnect').style.display = 'inline';
    document.getElementById('btnDisconnect').style.display = 'none';

    document.getElementById('liquidityForm').style.display = 'none';
    document.getElementById('swapForm').style.display = 'none';
    document.getElementById('removeLiquidityForm').style.display = 'none';
    document.getElementById('balancesSection').style.display = 'none';
    document.getElementById('tokenPriceSection').style.display = 'none';
    document.getElementById('reservesSection').style.display = 'none';
    document.getElementById('decimalInfo').style.display = 'none';
    document.getElementById('refreshButton').style.display = 'none';
    document.getElementById('aestheticEffect').style.display = 'block';

}

// async function addLiquidity() {
//     const amountA = document.getElementById('amountA').value;
//     const amountB = document.getElementById('amountB').value;

//     try {
//         // Convertir las cantidades a  18 decimales
//         const amountAInWei = ethers.parseUnits(amountA, 18);
//         const amountBInWei = ethers.parseUnits(amountB, 18);

//         // Llamada al contrato para agregar liquidez
//         const tx = await contract.addLiquidity(amountAInWei, amountBInWei);
//         await tx.wait();
//         alert(`Liquidez agregada con éxito: ${tx.hash}`);
//         await getReserves();
//         await getTokenPrices();
//         await getTokenBalances();
//     } catch (error) {
//         console.error(error);
//         alert('Error al agregar liquidez');
//     }
// }

async function addLiquidity() {
    const amountA = document.getElementById('amountA').value;
    const amountB = document.getElementById('amountB').value;

    // Referencias a los elementos del botón
    const spinner = document.getElementById('spinner');
    const successIcon = document.getElementById('successIcon');
    const buttonText = document.getElementById('buttonAddLiquidityText');
    const button = document.getElementById('btnAddLiquidity');

    try {
        // Mostrar el spinner y deshabilitar el botón
        spinner.classList.remove('hidden');
        button.disabled = true;
        buttonText.textContent = "⏳ Procesando...";
        
        // Convertir las cantidades a  18 decimales
        const amountAInWei = ethers.parseUnits(amountA, 18);
        const amountBInWei = ethers.parseUnits(amountB, 18);

        // Llamada al contrato para agregar liquidez
        const tx = await contract.addLiquidity(amountAInWei, amountBInWei);
        await tx.wait();

        // Cambiar el botón a estado de éxito
        button.classList.remove('bg-blue-600', 'hover:bg-blue-700');
        button.classList.add('bg-green-600', 'hover:bg-green-700');
        button.classList.add('shake');
        buttonText.textContent = "¡Completado!";
        spinner.classList.add('hidden');
        successIcon.classList.remove('hidden');

        alert(`Liquidez agregada con éxito: ${tx.hash}`);

        await getReserves();
        await getTokenPrices();
        await getTokenBalances();
    } catch (error) {
        console.error(error);
        // alert('Error al agregar liquidez');

        // Cambiar el botón a estado de error
        button.classList.remove('bg-blue-600', 'hover:bg-blue-700');
        button.classList.add('bg-red-500', 'hover:bg-red-600');
        button.classList.add('shake');
        buttonText.textContent = "Algo salió mal ⚠️";
        spinner.classList.add('hidden');
    } finally {
        // Restaurar el estado del botón después de 3 segundos
        setTimeout(() => {
            button.classList.remove('bg-green-600', 'hover:bg-green-700');
            button.classList.add('bg-blue-600', 'hover:bg-blue-700');
            buttonText.textContent = "Agregar Liquidez";
            successIcon.classList.add('hidden');
            button.disabled = false;
        }, 3000);
    }
}

// async function swapTokens(isAtoB) {
//     const amount = document.getElementById('amountSwap').value;

//     try {
//         // Convertir las cantidades a  18 decimales
//         const amountInWei = ethers.parseUnits(amount, 18);

//         const tx = isAtoB
//             ? await contract.swapAforB(amountInWei)
//             : await contract.swapBforA(amountInWei);
//         await tx.wait();

//         alert(`Intercambio realizado con éxito: ${tx.hash}`);

//         await getReserves();
//         await getTokenPrices();
//         await getTokenBalances();
//     } catch (error) {
//         console.error(error);
//         alert('Error al intercambiar tokens');
//     }
// }

async function swapTokens(isAtoB) {
    const amount = document.getElementById('amountSwap').value;
    
    // Referencias a los elementos del botón
    const buttonAtoB = document.getElementById('btnSwapAtoB');
    const buttonBtoA = document.getElementById('btnSwapBtoA');
    
    // Determinar qué botón está activo
    const activeButton = isAtoB ? buttonAtoB : buttonBtoA;
    const inactiveButton = isAtoB ? buttonBtoA : buttonAtoB;

    try {
        // Crear un elemento de spinner para el botón
        const spinner = document.createElement('svg');
        spinner.innerHTML = `
            <svg class="animate-spin h-5 w-5 ml-2 inline-block" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.372 0 0 5.372 0 12h4zm2 5.291A7.966 7.966 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                </path>
            </svg>
        `;

        // Deshabilitar botones y mostrar estado de procesamiento
        activeButton.disabled = true;
        inactiveButton.disabled = true;
        activeButton.innerHTML = `${isAtoB ? 'Procesando TKA ➡️ TKB' : 'Procesando TKB ➡️ TKA'} <span class="ml-2"></span>`;
        activeButton.querySelector('span').appendChild(spinner);
        
        // Quitar estilos de hover
        activeButton.classList.remove('hover:bg-blue-700');
        activeButton.classList.add('cursor-not-allowed');

        // Convertir las cantidades a 18 decimales
        const amountInWei = ethers.parseUnits(amount, 18);

        const tx = isAtoB
            ? await contract.swapAforB(amountInWei)
            : await contract.swapBforA(amountInWei);
        await tx.wait();

        // Cambiar a estado de éxito
        activeButton.classList.remove('bg-blue-600');
        activeButton.classList.add('bg-green-600', 'shake');
        activeButton.innerHTML = `¡Completado! ✅`;

        alert(`Intercambio realizado con éxito: ${tx.hash}`);

        await getReserves();
        await getTokenPrices();
        await getTokenBalances();

    } catch (error) {
        console.error(error);
        //alert('Error al intercambiar tokens');

        // Cambiar a estado de error
        activeButton.classList.remove('bg-blue-600');
        activeButton.classList.add('bg-red-500', 'shake');
        activeButton.innerHTML = `Algo salió mal ⚠️`;


    } finally {
        // Restaurar estado original después de 3 segundos
        setTimeout(() => {
            activeButton.disabled = false;
            activeButton.classList.remove('bg-green-600', 'bg-red-500', 'shake', 'cursor-not-allowed');
            activeButton.classList.add('bg-blue-600', 'hover:bg-blue-700');
            activeButton.innerHTML = isAtoB ? 'Intercambiar TKA ➡️ TKB' : 'Intercambiar TKB ➡️ TKA';
            
            inactiveButton.disabled = false;
        }, 3000);
    }
}

// async function removeLiquidity() {
//     const amountA = document.getElementById('amountRemoveA').value;
//     const amountB = document.getElementById('amountRemoveB').value;

//     try {
//         // Convertir las cantidades a  18 decimales
//         const amountAInWei = ethers.parseUnits(amountA, 18);
//         const amountBInWei = ethers.parseUnits(amountB, 18);

//         const tx = await contract.removeLiquidity(amountAInWei, amountBInWei);
//         await tx.wait();
//         alert(`Liquidez retirada con éxito: ${tx.hash}`);
//         await getReserves();
//         await getTokenPrices();
//         await getTokenBalances();
//     } catch (error) {
//         console.error(error);
//         alert('Error al retirar liquidez');
//     }
// }

async function removeLiquidity() {
    const amountA = document.getElementById('amountRemoveA').value;
    const amountB = document.getElementById('amountRemoveB').value;

    // Referencia al botón
    const button = document.getElementById('btnRemoveLiquidity');

    try {
        // Crear un elemento de spinner para el botón
        const spinner = document.createElement('svg');
        spinner.innerHTML = `
            <svg class="animate-spin h-5 w-5 ml-2 inline-block" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.372 0 0 5.372 0 12h4zm2 5.291A7.966 7.966 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                </path>
            </svg>
        `;

        // Deshabilitar el botón y mostrar estado de procesamiento
        button.disabled = true;
        button.innerHTML = `⏳ Procesando... <span class="ml-2"></span>`;
        button.querySelector('span').appendChild(spinner);
        
        // Quitar estilos de hover
        button.classList.remove('hover:bg-blue-700');
        button.classList.add('cursor-not-allowed');

        // Convertir las cantidades a 18 decimales
        const amountAInWei = ethers.parseUnits(amountA, 18);
        const amountBInWei = ethers.parseUnits(amountB, 18);

        const tx = await contract.removeLiquidity(amountAInWei, amountBInWei);
        await tx.wait();

        // Cambiar a estado de éxito
        button.classList.remove('bg-blue-600');
        button.classList.add('bg-green-600', 'shake');
        button.innerHTML = `¡Completado! ✅`;

        alert(`Liquidez retirada con éxito: ${tx.hash}`);

        await getReserves();
        await getTokenPrices();
        await getTokenBalances();

    } catch (error) {
        console.error(error);
        //alert('Error al retirar liquidez');

        // Cambiar a estado de error
        button.classList.remove('bg-blue-600');
        button.classList.add('bg-red-500', 'shake');
        button.innerHTML = `Algo salió mal ⚠️`;

    } finally {
        // Restaurar estado original después de 3 segundos
        setTimeout(() => {
            button.disabled = false;
            button.classList.remove('bg-green-600', 'bg-red-500', 'shake', 'cursor-not-allowed');
            button.classList.add('bg-blue-600', 'hover:bg-blue-700');
            button.innerHTML = 'Retirar Liquidez';
        }, 3000);
    }
}

async function getReserves() {
    try {
        const reserveA = await contract.reserveA();
        const reserveB = await contract.reserveB();

        // Formatear las reservas a 2 decimales
        const formattedReserveA = parseFloat(ethers.formatUnits(reserveA, 18)).toFixed(2);
        const formattedReserveB = parseFloat(ethers.formatUnits(reserveB, 18)).toFixed(2);

        // document.getElementById('reserves').innerText = `TKA: 
        // ${reserveA}, 
        // TKB: 
        // ${reserveB}`;
        document.getElementById('reserves').innerText = `TKA: ${formattedReserveA} 
        TKB: ${formattedReserveB}`;
    } catch (error) {
        console.error(error);
        alert('Error al obtener reservas');
    }
}

async function getTokenAddresses() {
    try {
        const tokenA = await contract.tokenA();
        const tokenB = await contract.tokenB();
        console.log(`TKA: ${tokenA}, TKB: ${tokenB}`);
    } catch (error) {
        console.error(error);
        alert('Error al obtener direcciones de los tokens');
    }
}

async function getTokenPrices() {
    try {
        const tokenA = await contract.tokenA();
        const tokenB = await contract.tokenB();

        const priceA = await contract.getPrice(tokenA);
        const priceB = await contract.getPrice(tokenB);

        // Formatear los precios de los tokens a 2 decimales
        const formattedPriceA = parseFloat(ethers.formatUnits(priceA, 18)).toFixed(2);
        const formattedPriceB = parseFloat(ethers.formatUnits(priceB, 18)).toFixed(2);

        // document.getElementById('tokenPrices').innerText = 
        //     `TKA: 
        //         ${ethers.formatUnits(priceA, 18)}
        //      TKB: 
        //         ${ethers.formatUnits(priceB, 18)}`;
        document.getElementById('tokenPrices').innerText = `TKA: ${formattedPriceA}
        TKB: ${formattedPriceB}`;
    } catch (error) {
        console.error(error);
        alert('Error al obtener precios de los tokens');
    }
}

async function getEthBalance() {
    try {
        const address = await signer.getAddress();
        const balance = await provider.getBalance(address);

        // Mostrar balance ETH con 2 decimales para legibilidad
        const formattedBalance = parseFloat(ethers.formatEther(balance)).toFixed(2);

        // document.getElementById('ethBalance').innerText = `ETH: 
        // ${ethers.formatEther(balance)} eth`;
        document.getElementById('ethBalance').innerText = `ETH: ${formattedBalance}`;
    } catch (error) {
        console.error(error);
        alert('Error al obtener el balance de ETH');
    }
}

async function getTokenBalances() {
    try {
        const address = await signer.getAddress();

        const tokenA = await contract.tokenA();
        const tokenB = await contract.tokenB();

        const tokenAContract = new ethers.Contract(tokenA, [
            { "constant": true, "inputs": [{ "name": "_owner", "type": "address" }], "name": "balanceOf", "outputs": [{ "name": "balance", "type": "uint256" }], "type": "function" }
        ], provider);

        const tokenBContract = new ethers.Contract(tokenB, [
            { "constant": true, "inputs": [{ "name": "_owner", "type": "address" }], "name": "balanceOf", "outputs": [{ "name": "balance", "type": "uint256" }], "type": "function" }
        ], provider);

        const balanceA = await tokenAContract.balanceOf(address);
        const balanceB = await tokenBContract.balanceOf(address);

        // Mostrar balances con 2 decimales para legibilidad
        const formattedBalanceA = parseFloat(ethers.formatUnits(balanceA, 18)).toFixed(2);
        const formattedBalanceB = parseFloat(ethers.formatUnits(balanceB, 18)).toFixed(2);

        // document.getElementById('tokenABalance').innerText = `TKA: 
        // ${ethers.formatUnits(balanceA, 18)}`;
        // document.getElementById('tokenBBalance').innerText = `TKB: 
        // ${ethers.formatUnits(balanceB, 18)}`;
        document.getElementById('tokenABalance').innerText = `TKA: ${formattedBalanceA}`;
        document.getElementById('tokenBBalance').innerText = `TKB: ${formattedBalanceB}`;
    } catch (error) {
        console.error(error);
        alert('Error al obtener los balances de tokens');
    }
}

function generateAestheticEffect() {
    const container = document.getElementById('aestheticEffect');

    // sol
    const sun = document.createElement('div');
    sun.classList.add('aesthetic-sun');
    container.appendChild(sun);
}

document.getElementById('btnConnect').addEventListener('click', connectWallet);
document.getElementById('btnDisconnect').addEventListener('click', disconnectWallet);
document.getElementById('btnAddLiquidity').addEventListener('click', addLiquidity);
document.getElementById('btnSwapAtoB').addEventListener('click', () => swapTokens(true));
document.getElementById('btnSwapBtoA').addEventListener('click', () => swapTokens(false));
document.getElementById('btnRemoveLiquidity').addEventListener('click', removeLiquidity);
document.getElementById('btnRefreshAll').addEventListener('click', async () => {
    const button = document.getElementById('btnRefreshAll');
    const icon = button.querySelector('svg');

    // Cambiar el ícono para mostrar que esta cargando (animar)
    icon.classList.add('animate-spin');
    button.disabled = true;

    try {
        // Actualizar balances
        await getEthBalance();
        await getTokenBalances();

        // Actualizar precios
        await getTokenPrices();

        // Actualizar reservas
        await getReserves();

        // alert('Balances, Precios y Reservas actualizados correctamente.');
    } catch (error) {
        console.error(error);
        alert('Error al actualizar los datos');
    } finally {
        // Volver el icono a su estado original (quitar la animación)
        icon.classList.remove('animate-spin');
        button.disabled = false;
    }
});
// conversor en tiempo real Swap
document.getElementById('amountSwap').addEventListener('input', function () {
    const amount = document.getElementById('amountSwap').value;

    if (amount) {
        // Convertir la cantidad ingresada a 18 decimales
        const amountInWei = ethers.parseUnits(amount, 18);

        // Mostrar el valor convertido debajo del input
        document.getElementById('convertedAmount').innerText = `Equivalente en 18 decimales: ${amountInWei.toString()}`;
    } else {
        // Limpiar el mensaje si no hay valor
        document.getElementById('convertedAmount').innerText = '';
    }
});
// conversor en tiempo real Retirar Liquidez
document.getElementById('amountRemoveA').addEventListener('input', function () {
    const amount = document.getElementById('amountRemoveA').value;

    if (amount) {
        // Convertir la cantidad a 18 decimales
        const amountInWei = ethers.parseUnits(amount, 18);

        // Mostrar el valor convertido debajo del input
        document.getElementById('convertedRemoveA').innerText = `Equivalente en 18 decimales: ${amountInWei.toString()}`;
    } else {
        // Limpiar el mensaje si no hay valor
        document.getElementById('convertedRemoveA').innerText = '';
    }
});
document.getElementById('amountRemoveB').addEventListener('input', function () {
    const amount = document.getElementById('amountRemoveB').value;

    if (amount) {
        // Convertir la cantidad a 18 decimales
        const amountInWei = ethers.parseUnits(amount, 18);

        // Mostrar el valor convertido debajo del input
        document.getElementById('convertedRemoveB').innerText = `Equivalente en 18 decimales: ${amountInWei.toString()}`;
    } else {
        // Limpiar el mensaje si no hay valor
        document.getElementById('convertedRemoveB').innerText = '';
    }
});
// conversor en tiempo real Agregar Liquidez
document.getElementById('amountA').addEventListener('input', function () {
    const amount = document.getElementById('amountA').value;

    if (amount) {
        // Convertir la cantidad a 18 decimales
        const amountInWei = ethers.parseUnits(amount, 18);

        // Mostrar el valor convertido debajo del input
        document.getElementById('convertedAmountA').innerText = `Equivalente en 18 decimales: ${amountInWei.toString()}`;
    } else {
        // Limpiar el mensaje si no hay valor
        document.getElementById('convertedAmountA').innerText = '';
    }
});
document.getElementById('amountB').addEventListener('input', function () {
    const amount = document.getElementById('amountB').value;

    if (amount) {
        // Convertir la cantidad a 18 decimales
        const amountInWei = ethers.parseUnits(amount, 18);

        // Mostrar el valor convertido debajo del input
        document.getElementById('convertedAmountB').innerText = `Equivalente en 18 decimales: ${amountInWei.toString()}`;
    } else {
        // Limpiar el mensaje si no hay valor
        document.getElementById('convertedAmountB').innerText = '';
    }
});
// effecto al cargar la pagina
document.addEventListener('DOMContentLoaded', generateAestheticEffect);
