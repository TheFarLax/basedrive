import { useState, useCallback } from 'react';

// Placeholder mimicking wagmi structure
export function useWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const connect = useCallback(() => {
    setIsConnecting(true);
    // Simulate wallet connection delay
    setTimeout(() => {
      setAddress('0x1234...abcd');
      setIsConnected(true);
      setIsConnecting(false);
    }, 1000);
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    setIsConnected(false);
  }, []);

  return {
    address,
    isConnected,
    isConnecting,
    connect,
    disconnect
  };
}
