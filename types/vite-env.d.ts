   /// <reference types="vite/client" />
   
   declare global {
    interface ImportMeta {
      env: {
        VITE_FLEEK_CLIENT_ID: string;
        VITE_WALLETCONNECT_ID: string;
        VITE_OPENSEA_KEY: string;
        // Add more environment variables here...
        [key: string]: string | boolean | undefined;
      };
    }
  }
