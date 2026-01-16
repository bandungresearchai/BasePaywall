// Minimal client-side stub for `wagmi` hooks to support headless tests.
const React = require('react');

function useAccount() {
  return { isConnected: true, address: '0x00000000000000000000000000000000DEADBEEF', connector: { id: 'injected' } };
}

function useConnect() {
  return {
    connectors: [{ id: 'injected', name: 'Browser Wallet', ready: true }],
    connect: async () => {},
    isPending: false,
  };
}

function useDisconnect() {
  return () => {};
}

function useSwitchChain() {
  return { switchChain: async () => {}, isPending: false };
}

function useReadContract() {
  return { data: null, isLoading: false };
}

function useWriteContract() {
  return { write: async () => {}, isLoading: false };
}

function useWaitForTransactionReceipt() {
  return { data: null, isLoading: false };
}

function WagmiProvider({ children }) {
  return React.createElement(React.Fragment, null, children);
}

function createConfig() {
  return {};
}

function http() {
  return () => {};
}

function createStorage() {
  return {};
}

const cookieStorage = {};

module.exports = {
  useAccount,
  useConnect,
  useDisconnect,
  useSwitchChain,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  WagmiProvider,
  createConfig,
  http,
  createStorage,
  cookieStorage,
};
