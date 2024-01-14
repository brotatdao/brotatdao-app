import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

export default function ConnectButton() {
 const { address, isConnecting, isDisconnected } = useAccount();
 const [buttonLabel, setButtonLabel] = useState('Connect Wallet');

 useEffect(() => {
  if (isConnecting) {
    setButtonLabel('Connecting...');
  } else if (isDisconnected) {
    setButtonLabel('Connect Wallet');
  } else if (address) {
    setButtonLabel(`Disconnect (${address.substring(0, 6)}...${address.substring(address.length - 4)})`);
  }
 }, [isConnecting, isDisconnected, address]);

 return (
  <w3m-connect-button
    size="md"
    label={buttonLabel}
    loadingLabel="Connecting..."
  ></w3m-connect-button>
 );
}
