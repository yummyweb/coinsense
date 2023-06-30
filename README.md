# Coinsense

## What is it

Coinsense is a whimsical wallet analyzer that takes a fun and creative approach at your crypto portfolio and past transactions. With a simple and clear UI/UX, our aim is for you to know gain more insights into your own transaction history on a "degen" scale. You can test it out, [here](https://coinsense-sandy.vercel.app/).

## Technologies Used

- **Next.js:** We used Next.js (and React.js) for the frontend user interface due to the ease-of-use in development and performance of React.js. With Next.js, we were able to render pages on server-side and implement basic API routes.

- **Shyft:** We used APIs from Shyft in order to read address' transaction history and query the NFTs held by the wallet. Specifically we used the following API endpoints: `/nft/compressed/read_all/`, `/wallet/get_portfolio/` and `/wallet/transaction_history/`. Furthermore, as our source-of-truth we used Shyft's explorer called "Solana Translator".

- **Jup.ag Price APIs:** We used price api from Jupiter to check for SPL token prices and fetch the value of the entire user portfolio. Overall, our experience with the API was amazing, and it was quite dev-friendly to work with.

## Degen Score

Degen Score is the highlight of Coinsense. Degen Score provides a clear, summarized view of your entire transaction history and portfolio. By evaluating your wallet on a number of rigorous degen-style parameters, we calculate your Degen Score.

Degen Score depends on multiple paramters:
- No. of tokens you have
- No. of NFTs you have
- Total value of your portfolio
- Ratio of memecoins to sol
- Transaction history

Max. degen score possible is 700 points

*Built by Antariksh Verma (https://twitter.com/AntarikshaVerm2)*