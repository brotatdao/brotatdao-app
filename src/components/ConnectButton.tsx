import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import useAuth from './Auth';

export default function ConnectButton() {
  const { address, isConnected } = useAccount();
  const { initiateConnection } = useAuth();
  const [buttonLabel, setButtonLabel] = useState('Connect Wallet');
  const [authInitiated, setAuthInitiated] = useState(false);

  useEffect(() => {
    if (isConnected && address && !authInitiated) {
      setButtonLabel(`Disconnect (${address.substring(0, 6)}...${address.substring(address.length - 4)})`);
      initiateConnection();
      setAuthInitiated(true); // Prevents re-initiating auth
    } else if (!isConnected) {
      setButtonLabel('Connect Wallet');
      setAuthInitiated(false); // Resets when wallet is disconnected
    }
  }, [isConnected, address, initiateConnection, authInitiated]);

  return (
    <w3m-connect-button
      size="md"
      label={buttonLabel}
      loadingLabel="Connecting..."
    ></w3m-connect-button>
  );
}
