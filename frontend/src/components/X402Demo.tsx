'use client';

import { useAccount } from 'wagmi';
import { useX402 } from '@/hooks/useX402';
import { BASEPAYWALL_ADDRESS, PRICE_ETH } from '@/config/contract';

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

export function X402ContentDemo() {
  const { isConnected } = useAccount();
  
  const {
    status,
    paymentDetails,
    content,
    error,
    transactionHash,
    fetchContent,
    pay,
    reset,
  } = useX402('/api/x402/content', {
    payTo: BASEPAYWALL_ADDRESS || '0x0000000000000000000000000000000000000000',
    onSuccess: (content) => {
      console.log('Content unlocked:', content);
    },
    onError: (error) => {
      console.error('x402 error:', error);
    },
  });

  if (!isConnected) {
    return (
      <div className="bg-gray-900/50 rounded-2xl p-8 border border-gray-800">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="text-4xl">🔌</div>
          <h3 className="text-xl font-bold text-white">Connect Wallet</h3>
          <p className="text-gray-400">
            Connect your wallet to try the x402 protocol demo
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-2xl p-8 border border-purple-500/30">
      <div className="flex flex-col space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-3">
          <div className="bg-purple-500/20 p-3 rounded-xl">
            <span className="text-2xl">⚡</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">x402 Protocol Demo</h3>
            <p className="text-sm text-gray-400">HTTP 402 Payment Required</p>
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
              ${status === 'paying' ? 'text-blue-400' : ''}
              ${status === 'confirming' ? 'text-blue-400' : ''}
              ${status === 'verifying' ? 'text-purple-400' : ''}
              ${status === 'success' ? 'text-green-400' : ''}
              ${status === 'error' ? 'text-red-400' : ''}
            `}>
              {status === 'idle' && '⚪ Ready'}
              {status === 'checking' && '🔄 Checking endpoint...'}
              {status === 'payment-required' && '💰 402 Payment Required'}
              {status === 'paying' && '💳 Sending payment...'}
              {status === 'confirming' && '⏳ Confirming transaction...'}
              {status === 'verifying' && '🔍 Verifying payment...'}
              {status === 'success' && '✅ Content Unlocked!'}
              {status === 'error' && '❌ Error'}
            </span>
          </div>
        </div>

        {/* Payment Details (when 402 received) */}
        {status === 'payment-required' && paymentDetails && (
          <div className="bg-orange-900/20 border border-orange-500/30 rounded-xl p-4 space-y-3">
            <div className="flex items-center space-x-2">
              <span className="text-orange-400 font-bold">HTTP 402</span>
              <span className="text-gray-400">Payment Required</span>
            </div>
            <div className="text-sm space-y-2 text-gray-300">
              <div className="flex justify-between">
                <span className="text-gray-500">Network:</span>
                <span>{paymentDetails.network}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Pay To:</span>
                <span className="font-mono text-xs">{paymentDetails.payTo.slice(0, 10)}...{paymentDetails.payTo.slice(-8)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Amount:</span>
                <span className="text-white font-bold">{PRICE_ETH} ETH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Resource:</span>
                <span className="font-mono text-xs">{paymentDetails.resource}</span>
              </div>
            </div>
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
            <span className="text-gray-500">Transaction: </span>
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
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all"
            >
              🔗 Request Content (x402)
            </button>
          )}

          {status === 'payment-required' && (
            <button
              onClick={pay}
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-6 rounded-xl transition-all flex items-center justify-center space-x-2"
            >
              <span>💳</span>
              <span>Pay {PRICE_ETH} ETH</span>
            </button>
          )}

          {(status === 'paying' || status === 'confirming' || status === 'verifying' || status === 'checking') && (
            <button
              disabled
              className="flex-1 bg-gray-700 text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center space-x-2"
            >
              <LoadingSpinner />
              <span>
                {status === 'checking' && 'Checking...'}
                {status === 'paying' && 'Confirm in Wallet...'}
                {status === 'confirming' && 'Confirming...'}
                {status === 'verifying' && 'Verifying...'}
              </span>
            </button>
          )}

          {(status === 'success' || status === 'error') && (
            <button
              onClick={reset}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-xl transition-all"
            >
              🔄 Try Again
            </button>
          )}
        </div>

        {/* Protocol Info */}
        <div className="text-xs text-gray-500 text-center">
          x402 Protocol • Automatic HTTP 402 handling with on-chain payments
        </div>
      </div>
    </div>
  );
}
