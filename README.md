# brotatdao - app

## 🚀 Bring your nfts to life by giving your NFT profile pic a profile page!

Select an NFT from your wallet, give it a name and a profile.  As configured it will register a subdomain of brotatdao.eth and upload a profile page to that address.  name.brotatdao.eth  .  All this completely gasless.

The wallet connection is only to select an owned NFT.  No transactions are made.  

The profile page is uploaded to IPFS using fleek.xyz and an ENS subdomain is set to route the subdomain to the IPFS address displaying the NFT profile page completely free and gasless.  The explorer page uses a firebase database where users can look at all the profiles that have been uploaded using the website.  

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                | Action                                           |
| :--------------------- | :----------------------------------------------- |
| `pnpm install`          | Installs dependencies                            |
| `pnpm run dev`          | Starts local dev server at `localhost:3000`      |
| `pnpm run build`        | Build your production site to `./dist/`          |
| `pnpm run preview`      | Preview your build locally, before deploying     |
| `pnpm run lint ...`    | Run Linter |

## ⚡ How to deploy to Fleek

### 1. Create a `fleek.json` config file:
You can configure this site deployment using [Fleek CLI]() and running:
```
 > fleek sites init
   WARN! Fleek CLI is in beta phase, use it under your own responsibility
   ? Choose one of the existing sites or create a new one. › 
   ❯ Create a new site
```
It will prompt you for a `name`, `dist` directory location & `build command`
- `name`: How you want to name the site
- `dist`: The output directory where the site is located, for this template it's `dist`
- `build command`: Command to build your site, this will be used to deploy the latest version either by CLI or Github Actions

### 2. Deploy the site
After configuiring your `fleek.json` file, you can deploy the site by running

```
fleek sites deploy
```
After running it you will get an output like this:
```
 WARN! Fleek CLI is in beta, use it at your own discretion
 > Success! Deployed!
 > Site IPFS CID: QmP1nDyoHqSrRabwUSrxRV3DJqiKH7b9t1tpLcr1NTkm1M

 > You can visit through the gateway:
 > https://ipfs.io/ipfs/QmP1nDyoHqSrRabwUSrxRV3DJqiKH7b9t1tpLcr1NTkm1M
 ```

### Extra features
- **Continuous Integration (CI):** `fleek sites ci` [Documentation.](https://docs.fleek.xyz/services/sites/#continuous-integration-ci)
- **Adding custom domains:** `fleek domains create` [Documentation.](https://docs.fleek.xyz/services/domains/)


### Keep in mind:

This template has been configured to produce a static output.

```js
// vite.config.ts

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "./",
})
```

This means that assets will be pre-fixed with `./`, you can learn more about it in [Vite Documentation](https://vitejs.dev/config/shared-options.html#base)
