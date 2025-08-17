"use client";

import { useState } from "react";
import { useAccount, useConnect, useDisconnect, useWriteContract } from "wagmi";

// 📌 Dirección y ABI del contrato NFT
const CONTRACT_ADDRESS = "0x5CA48aaA07FB4244A7C94966210343F2883a2236";
const CONTRACT_ABI = [
  {
    inputs: [{ internalType: "address", name: "to", type: "address" }],
    name: "safeMint",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
];

// Componente Header simple (solo logo)
function Header() {
  return (
    <header className="absolute top-0 left-0 right-0 z-10 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-teal-400 rounded-lg flex items-center justify-center mr-3">
              <span className="text-gray-900 font-bold text-lg">T</span>
            </div>
            <span className="text-xl font-bold">Tokenizados</span>
          </div>
        </div>
      </div>
    </header>
  );
}

function MintComponent() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, error, isLoading: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const { writeContractAsync } = useWriteContract();

  const [txHash, setTxHash] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async (connectorToUse = null) => {
    try {
      let connector = connectorToUse;
      if (!connector) {
        connector =
          connectors.find((c) => c.name === "MetaMask") ||
          connectors.find((c) => c.type === "injected") ||
          connectors[0];
      }

      if (connector) {
        await connect({ connector });
      } else {
        alert("No se encontró ninguna wallet compatible.");
      }
    } catch (err) {
      console.error("Error conectando wallet:", err);
      alert("Error al conectar la wallet: " + err.message);
    }
  };

  async function handleMint() {
    if (!address) return;

    setIsLoading(true);
    try {
      const tx = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "safeMint",
        args: [address],
      });
      setTxHash(tx);
    } catch (err) {
      alert("Error en la transacción: " + err.message);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-gray-800 text-white p-6 text-center">
        <h2 className="text-2xl font-bold">Mint Bonus NFT</h2>
        <p className="text-gray-300 mt-2">Conecta tu wallet y mintea tu NFT</p>
      </div>

      <div className="p-6">
        {!isConnected ? (
          <div className="space-y-4">
            <button
              onClick={() => handleConnect()}
              disabled={isConnecting}
              className="w-full bg-teal-500 hover:bg-teal-600 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {isConnecting ? "Conectando..." : "Conectar Wallet"}
            </button>

            {error && (
              <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                <p className="text-red-700 text-sm">Error: {error.message}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">Wallet conectada:</p>
              <p className="font-mono text-sm">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <h3 className="font-bold text-yellow-800 mb-2">
                💰 Sistema de Recompensas
              </h3>
              <p className="text-sm text-yellow-700">
                Si el NFT ID es múltiplo de 10 (≤50), recibirás tokens
                automáticamente:
              </p>
              <ul className="text-xs text-yellow-600 mt-2 space-y-1">
                <li>• ID #10 → 2 tokens</li>
                <li>• ID #20 → 4 tokens</li>
                <li>• ID #30 → 6 tokens</li>
                <li>• ID #40 → 8 tokens</li>
                <li>• ID #50 → 10 tokens</li>
              </ul>
            </div>

            <button
              onClick={handleMint}
              disabled={isLoading}
              className="w-full bg-teal-500 hover:bg-teal-600 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {isLoading ? "Minteando..." : "🎨 Mint NFT"}
            </button>

            <button
              onClick={() => disconnect()}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg text-sm transition-colors"
            >
              Desconectar
            </button>

            {txHash && (
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <h3 className="text-green-800 font-bold mb-2">
                  ✅ NFT Minteado!
                </h3>
                <p className="text-green-700 text-sm mb-2">
                  Transacción exitosa. Revisa si recibiste recompensas.
                </p>
                <a
                  href={`https://bscscan.com/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-600 hover:text-teal-800 text-sm font-medium"
                >
                  Ver en BSCScan →
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <div
      className="min-h-screen bg-gray-900 bg-cover bg-center bg-no-repeat relative"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('/img/grabacion.webp')`,
      }}
    >
      <Header />

      {/* Hero Section Simple */}
      <div className="pt-32 pb-20 text-center text-white">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Bienvenido a Tokenizados
          </h1>
          <p className="text-xl text-gray-300 mb-12">
            Tu portal de información sobre tokenización y blockchain
          </p>

          {/* Mint Component centrado */}
          <div className="flex justify-center">
            <MintComponent />
          </div>
        </div>
      </div>

      {/* Footer Simple */}
      <footer className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white py-6">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex flex-col md:flex-row justify-center items-center space-y-2 md:space-y-0 md:space-x-6">
            <p className="text-sm text-gray-300">
              © 2025 Tokenizados. Todos los derechos reservados.
            </p>
            <div className="flex space-x-4 text-sm">
              <a
                href="https://tokenizados.net/es"
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-400 hover:text-teal-300 transition-colors"
              >
                📖 Blog Oficial
              </a>
              <a
                href="https://tokenizados.net/es"
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-400 hover:text-teal-300 transition-colors"
              >
                🏠 Inicio
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
