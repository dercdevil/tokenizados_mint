"use client";

import { useState } from "react";
import { useAccount, useConnect, useDisconnect, useWriteContract } from "wagmi";
import { injected } from "wagmi/connectors";

// 📌 Dirección y ABI del contrato NFT
const CONTRACT_ADDRESS = "0xe248f72bf84233d58b3b54a274950a3fac269d0c"; // <-- reemplazar por la dirección real
const CONTRACT_ABI = [
  {
    inputs: [{ internalType: "address", name: "to", type: "address" }],
    name: "safeMint",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "rewardToken",
    outputs: [
      { internalType: "contract IERC20Metadata", name: "", type: "address" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "to", type: "address" },
      {
        indexed: false,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "rewardAmount",
        type: "uint256",
      },
    ],
    name: "RewardPaid",
    type: "event",
  },
];

function MintComponent() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, error, isLoading: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const { writeContractAsync } = useWriteContract();

  const [txHash, setTxHash] = useState("");
  const [mintedNFT, setMintedNFT] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Función para conectar wallet
  const handleConnect = async (connectorToUse = null) => {
    try {
      let connector = connectorToUse;
      if (!connector) {
        // Buscar primero MetaMask, luego injected, luego cualquier otro
        connector =
          connectors.find((c) => c.name === "MetaMask") ||
          connectors.find((c) => c.type === "injected") ||
          connectors[0];
      }

      if (connector) {
        await connect({ connector });
      } else {
        alert(
          "No se encontró ninguna wallet compatible. Por favor instala MetaMask u otra wallet."
        );
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
      setMintedNFT({ txHash: tx, timestamp: Date.now() });
    } catch (err) {
      alert("Error en la transacción: " + err.message);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md mx-auto bg-[#0d1b2a] p-6 rounded-2xl shadow-lg text-white">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mb-2 text-[#61dafb]">
          🎨 Mint Bonus NFT
        </h1>
        <p className="text-sm text-gray-300">
          Mintea un NFT y recibe recompensas en tokens si el ID es múltiplo de
          10 (≤50)
        </p>
      </div>

      {!isConnected ? (
        <div className="space-y-3">
          {/* Botón principal de conexión */}
          <button
            onClick={() => handleConnect()}
            disabled={isConnecting}
            className="w-full bg-[#61dafb] text-black py-3 px-4 rounded-lg hover:bg-[#4cb8d1] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isConnecting ? "🔄 Conectando..." : "🔗 Conectar Wallet"}
          </button>

          {/* Opciones específicas de wallets */}
          {connectors.length > 1 && (
            <div className="space-y-2">
              <p className="text-xs text-gray-400 text-center">
                O elige tu wallet:
              </p>
              <div className="grid gap-2">
                {connectors.map((connector) => (
                  <button
                    key={connector.id}
                    onClick={() => handleConnect(connector)}
                    disabled={isConnecting}
                    className="w-full bg-[#1b263b] text-white py-2 px-3 rounded-lg hover:bg-[#2a3441] font-medium transition-colors text-sm disabled:opacity-50"
                  >
                    {connector.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-900/20 border border-red-500/30 p-3 rounded-lg">
              <p className="text-red-400 text-sm">❌ Error: {error.message}</p>
            </div>
          )}

          <div className="bg-[#1b263b] p-3 rounded-lg">
            <p className="text-xs text-gray-400 mb-2">💡 Asegúrate de tener:</p>
            <ul className="text-xs text-gray-300 space-y-1">
              <li>• MetaMask o wallet compatible instalada</li>
              <li>• Red Sepolia configurada</li>
              <li>• ETH para gas fees</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="bg-[#1b263b] p-3 rounded-lg">
            <p className="text-xs text-gray-400 mb-1">Wallet conectada:</p>
            <p className="text-sm break-words text-white font-mono">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </p>
          </div>

          <div className="bg-[#1b263b] p-3 rounded-lg">
            <h3 className="text-sm font-semibold text-[#61dafb] mb-2">
              💰 Sistema de Recompensas:
            </h3>
            <ul className="text-xs text-gray-300 space-y-1">
              <li>• NFT ID #10 → 2 tokens de recompensa</li>
              <li>• NFT ID #20 → 4 tokens de recompensa</li>
              <li>• NFT ID #30 → 6 tokens de recompensa</li>
              <li>• NFT ID #40 → 8 tokens de recompensa</li>
              <li>• NFT ID #50 → 10 tokens de recompensa</li>
            </ul>
          </div>

          <button
            onClick={handleMint}
            disabled={isLoading}
            className="w-full bg-[#61dafb] text-black py-3 px-4 rounded-lg hover:bg-[#4cb8d1] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "⏳ Minteando..." : "🎨 Mint NFT"}
          </button>

          <button
            onClick={() => disconnect()}
            className="w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 font-semibold transition-colors"
          >
            🔌 Desconectar
          </button>

          {mintedNFT && (
            <div className="bg-green-900/20 border border-green-500/30 p-4 rounded-lg">
              <h3 className="text-green-400 font-semibold mb-2">
                ✅ NFT Minteado!
              </h3>
              <p className="text-xs text-gray-300 mb-2">
                Tu NFT ha sido minteado exitosamente. Si el ID es múltiplo de 10
                (≤50), recibirás tokens de recompensa automáticamente.
              </p>
              <a
                href={`https://sepolia.etherscan.io/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#61dafb] underline text-sm hover:text-[#4cb8d1]"
              >
                📊 Ver transacción: {txHash?.slice(0, 10)}...
              </a>
            </div>
          )}

          {txHash && !mintedNFT && (
            <div className="bg-blue-900/20 border border-blue-500/30 p-3 rounded-lg">
              <p className="text-sm text-blue-300">
                ⏳ Transacción enviada:
                <a
                  href={`https://sepolia.etherscan.io/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#61dafb] underline ml-1 hover:text-[#4cb8d1]"
                >
                  {txHash.slice(0, 10)}...
                </a>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0a1128] font-sans">
      <MintComponent />
    </main>
  );
}
