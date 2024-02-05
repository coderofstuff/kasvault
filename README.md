# KasVault

KasVault is a simple frontend interface for your Ledger device.

## Official User Guide

See the official user guide at: https://wiki.kaspa.org/en/kasvault-basic-guide

## Compatible Browsers

The browser needs to support WebUSB/WebHID so it can interact with the Ledger device. These are the known compatible browsers:
- Edge
- Chrome

## Development and Running Locally

You will need [NodeJS](https://nodejs.org/en) to run this locally

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to start using or developing KasVault locally.

## FAQ

### Are my funds safe with KasVault?

Yes, but to be clear KasVault itself does not store your Kaspa. Your Kaspa is also not stored in the Ledger device as well. When you send kaspa to the address you generate with KasVault, it is stored on the blockdag as a UTXO.