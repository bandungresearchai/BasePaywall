'use client';

import { useAccount } from 'wagmi';
import { useX402IDRX } from '@/hooks/useX402IDRX';
import { BASEPAYWALL_ADDRESS } from '@/config/contract';
import { formatIDRX, DEFAULT_PRICE_IDRX, getIDRXAddress } from '@/config/idrx';

function LoadingSpinner() {
  return (
    <svg
      className="animate-spin h-5 w-5 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

function IDRXLogo() {
  return (
    <div className="relative w-8 h-8">
      <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center">
        <span className="text-white font-bold text-xs">IDR</span>
      </div>
      <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full w-4 h-4 flex items-center justify-center">
        <span className="text-white text-[8px] font-bold">X</span>
      </div>
    </div>
  );
}

export function X402IDRXDemo() {
  const { isConnected } = useAccount();
  const network = (process.env.NEXT_PUBLIC_NETWORK as 'base' | 'base-sepolia') || 'base-sepolia';
  
  // Hardcoded fallback IDRX address to prevent undefined errors
  const FALLBACK_IDRX_ADDRESS = '0x18Dd5B087bCA9920562aFf7A0199b96B9230438b' as `0x${string}`;
  
  const {
    status,
    paymentDetails,
    content,
    error,
    transactionHash,
    idrxBalance,
    formattedBalance,
    needsApproval,
    idrxAddress: hookIdrxAddress,
    fetchContent,
    approve,
    pay,
    reset,
  } = useX402IDRX('/api/x402-idrx/content', {
    payTo: BASEPAYWALL_ADDRESS || '0x0000000000000000000000000000000000000000',
    onSuccess: (content) => {
      console.log('IDRX Content unlocked:', content);
    },
    onError: (error) => {
      console.error('x402 IDRX error:', error);
    },
  });

  // Use hook address if available, otherwise use fallback - ensure never undefined
  const idrxAddress: `0x${string}` = hookIdrxAddress || getIDRXAddress(network) || FALLBACK_IDRX_ADDRESS;

  const priceDisplay = formatIDRX(DEFAULT_PRICE_IDRX);

  if (!isConnected) {
    return (
      <div className="bg-gradient-to-br from-red-900/30 to-orange-900/30 rounded-2xl p-8 border border-red-500/30">
        <div className="flex flex-col items-center text-center space-y-4">
          <IDRXLogo />
          <h3 className="text-xl font-bold text-white">x402 + IDRX</h3>
          <p className="text-gray-400">
            Hubungkan wallet untuk mencoba pembayaran dengan IDRX
          </p>
          <p className="text-xs text-gray-500">
            Stablecoin berbasis Rupiah Indonesia 🇮🇩
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-red-900/30 to-orange-900/30 rounded-2xl p-8 border border-red-500/30">
      <div className="flex flex-col space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <IDRXLogo />
            <div>
              <h3 className="text-xl font-bold text-white">x402 Protocol + IDRX</h3>
              <p className="text-sm text-gray-400">Bayar dengan Rupiah Digital</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Saldo IDRX</p>
            <p className="text-lg font-bold text-white">{formattedBalance}</p>
          </div>
        </div>

        {/* IDRX Info Banner */}
        <div className="bg-red-900/20 border border-red-500/20 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <span className="text-2xl">🇮🇩</span>
            <div className="flex-1">
              <p className="text-sm text-red-300 font-medium">IDRX Stablecoin</p>
              <p className="text-xs text-gray-400 mt-1">
                IDRX adalah stablecoin yang didukung oleh Rupiah Indonesia dengan rasio 1:1. 
                Transparan, stabil, dan siap untuk aplikasi onchain di Indonesia.
              </p>
              <a 
                href="https://docs.idrx.co/api/getting-started" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-blue-400 hover:underline mt-2 inline-block"
              >
                📖 Pelajari lebih lanjut →
              </a>
            </div>
          </div>
        </div>

        {/* Status Display */}
        <div className="bg-gray-900/50 rounded-xl p-4 font-mono text-sm">
          <div className="flex items-center space-x-2 text-gray-400">
            <span>Status:</span>
            <span className={`
              ${status === 'idle' ? 'text-gray-500' : ''}
              ${status === 'checking' ? 'text-yellow-400' : ''}
              ${status === 'payment-required' ? 'text-orange-400' : ''}
              ${status === 'approving' ? 'text-purple-400' : ''}
              ${status === 'paying' ? 'text-blue-400' : ''}
              ${status === 'confirming' ? 'text-blue-400' : ''}
              ${status === 'verifying' ? 'text-purple-400' : ''}
              ${status === 'success' ? 'text-green-400' : ''}
              ${status === 'error' ? 'text-red-400' : ''}
            `}>
              {status === 'idle' && '⚪ Siap'}
              {status === 'checking' && '🔄 Memeriksa endpoint...'}
              {status === 'payment-required' && '💰 402 Pembayaran Diperlukan'}
              {status === 'approving' && '🔓 Menyetujui IDRX...'}
              {status === 'paying' && '💳 Mengirim IDRX...'}
              {status === 'confirming' && '⏳ Mengkonfirmasi transaksi...'}
              {status === 'verifying' && '🔍 Memverifikasi pembayaran...'}
              {status === 'success' && '✅ Konten Terbuka!'}
              {status === 'error' && '❌ Error'}
            </span>
          </div>
        </div>

        {/* Payment Details (when 402 received) */}
        {status === 'payment-required' && paymentDetails && (
          <div className="bg-orange-900/20 border border-orange-500/30 rounded-xl p-4 space-y-3">
            <div className="flex items-center space-x-2">
              <span className="text-orange-400 font-bold">HTTP 402</span>
              <span className="text-gray-400">Pembayaran Diperlukan (IDRX)</span>
            </div>
            <div className="text-sm space-y-2 text-gray-300">
              <div className="flex justify-between">
                <span className="text-gray-500">Network:</span>
                <span>{paymentDetails.network}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Asset:</span>
                <span className="flex items-center space-x-1">
                  <span className="bg-red-600/20 text-red-400 px-2 py-0.5 rounded text-xs">IDRX</span>
                  <span className="text-xs text-gray-500">Rupiah Digital</span>
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Token:</span>
                <a 
                  href={`https://sepolia.basescan.org/token/${idrxAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-blue-400 hover:underline"
                >
                  {idrxAddress?.slice(0, 10)}...{idrxAddress?.slice(-8)}
                </a>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Pay To:</span>
                <span className="font-mono text-xs">{paymentDetails.payTo?.slice(0, 10)}...{paymentDetails.payTo?.slice(-8)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Harga:</span>
                <span className="text-white font-bold text-lg">{priceDisplay}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Resource:</span>
                <span className="font-mono text-xs">{paymentDetails.resource}</span>
              </div>
            </div>
            
            {/* Balance Check */}
            {idrxBalance !== null && idrxBalance < DEFAULT_PRICE_IDRX && (
              <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-3 mt-3">
                <p className="text-red-400 text-sm">
                  ⚠️ Saldo IDRX tidak cukup. Diperlukan: {priceDisplay}
                </p>
              </div>
            )}

            {/* Approval Info */}
            {needsApproval && (
              <div className="bg-purple-900/30 border border-purple-500/30 rounded-lg p-3 mt-3">
                <p className="text-purple-400 text-sm">
                  🔓 Perlu approval IDRX sebelum transfer. Klik &quot;Approve&quot; terlebih dahulu.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Content (when unlocked) */}
        {status === 'success' && content && (
          <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-4">
            <pre className="text-green-300 text-sm whitespace-pre-wrap font-mono">
              {content}
            </pre>
          </div>
        )}

        {/* Transaction Hash */}
        {transactionHash && (
          <div className="text-sm">
            <span className="text-gray-500">Transaksi: </span>
            <a
              href={`https://sepolia.basescan.org/tx/${transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline font-mono text-xs"
            >
              {transactionHash.slice(0, 10)}...{transactionHash.slice(-8)}
            </a>
          </div>
        )}

        {/* Error */}
        {status === 'error' && error && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-3">
          {status === 'idle' && (
            <button
              onClick={fetchContent}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-xl transition-all flex items-center justify-center space-x-2"
            >
              <span>🔗</span>
              <span>Request Konten (x402 IDRX)</span>
            </button>
          )}

          {status === 'payment-required' && needsApproval && (
            <button
              onClick={approve}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all flex items-center justify-center space-x-2"
            >
              <span>🔓</span>
              <span>Approve IDRX</span>
            </button>
          )}

          {status === 'payment-required' && !needsApproval && (
            <button
              onClick={pay}
              disabled={idrxBalance !== null && idrxBalance < DEFAULT_PRICE_IDRX}
              className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all flex items-center justify-center space-x-2"
            >
              <span>💳</span>
              <span>Bayar {priceDisplay}</span>
            </button>
          )}

          {(status === 'approving' || status === 'paying' || status === 'confirming' || status === 'verifying' || status === 'checking') && (
            <button
              disabled
              className="flex-1 bg-gray-700 text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center space-x-2"
            >
              <LoadingSpinner />
              <span>
                {status === 'checking' && 'Memeriksa...'}
                {status === 'approving' && 'Setujui di Wallet...'}
                {status === 'paying' && 'Konfirmasi di Wallet...'}
                {status === 'confirming' && 'Mengkonfirmasi...'}
                {status === 'verifying' && 'Memverifikasi...'}
              </span>
            </button>
          )}

          {(status === 'success' || status === 'error') && (
            <button
              onClick={reset}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-xl transition-all"
            >
              🔄 Coba Lagi
            </button>
          )}
        </div>

        {/* Protocol Info */}
        <div className="text-xs text-gray-500 text-center space-y-1">
          <p>x402 Protocol • IDRX Stablecoin • Base L2</p>
          <p className="text-gray-600">
            Pembayaran otomatis HTTP 402 dengan Rupiah digital di blockchain
          </p>
        </div>
      </div>
    </div>
  );
}
