import React from 'react';
import { useExplorer } from '@/hooks/useNetwork';

export default function TransactionReceipt({ hash, priceEth }: { hash: string; priceEth: string | number }) {
  const { getTransactionUrl } = useExplorer();

  return (
    <div className="bg-green-900/30 border border-green-500/30 rounded-xl p-4 w-full">
      <div className="flex items-center space-x-2 mb-3">
        <span className="text-green-400 text-lg">✅</span>
        <span className="text-green-400 font-semibold">Payment Confirmed!</span>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-gray-400">
          <span>Amount Paid:</span>
          <span className="text-white">{priceEth} ETH</span>
        </div>
        <div className="flex justify-between text-gray-400">
          <span>Transaction:</span>
          <a
            href={getTransactionUrl(hash)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-base-blue hover:underline font-mono text-xs"
          >
            {hash.slice(0, 10)}...{hash.slice(-8)}
          </a>
        </div>
      </div>
      <a
        href={getTransactionUrl(hash)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 block w-full text-center bg-green-600/20 hover:bg-green-600/30 text-green-400 py-2 rounded-lg transition-colors text-sm"
      >
        View on BaseScan →
      </a>
    </div>
  );
}
