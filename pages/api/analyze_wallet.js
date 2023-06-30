import axios from "axios"
import moment from "moment"

const get_token_price = async address => {
  const res = await axios.get(`https://price.jup.ag/v4/price?ids=${address}`)
  if (res.data.data[address] !== undefined) {
    return res.data.data[address].price
  }
  return 0
}

moment.fn.fromNow = function (a) {
  var duration = moment().diff(this, 'minutes');
  return duration;
}

export default async function handler(req, res) {
  const address = req.body.wallet_address

  // Query cNFTs (compressed nfts)
  const cnftData = await axios.get(`https://api.shyft.to/sol/v1/nft/compressed/read_all?network=mainnet-beta&wallet_address=${address}`, {
    headers: {
      "x-api-key": process.env.SHYFT_API_KEY
    }
  })

  // Query portfolio
  const portfolioData = await axios.get(`https://api.shyft.to/sol/v1/wallet/get_portfolio?network=mainnet-beta&wallet=${address}`, {
    headers: {
      "x-api-key": process.env.SHYFT_API_KEY
    }
  })

  // Query transaction history
  const txHistory = await axios.get(`https://api.shyft.to/sol/v1/wallet/transaction_history?network=mainnet-beta&wallet=${address}`, {
    headers: {
      "x-api-key": process.env.SHYFT_API_KEY
    }
  })

  const portfolio = portfolioData.data.result
  const cnfts = cnftData.data.result
  const num_cnfts = cnfts.nfts.length
  const total_num_nfts = num_cnfts + portfolio.num_nfts

  // Calculate degen_score
  let degen_score = 0

  // No. of tokens
  // Logic: If it is between 5 and 10, you get 10 points. If it is between 10 and 20, you get 20 points.
  // If it is between 20 and 30, you get 30 points, and if it is greater than 30, then you get 50 points.
  if (portfolio.num_tokens >= 5 && portfolio.num_tokens <= 10) {
    degen_score += 10
  }
  else if (portfolio.num_tokens >= 11 && portfolio.num_tokens <= 20) {
    degen_score += 20
  }
  else if (portfolio.num_tokens >= 21 && portfolio.num_tokens <= 30) {
    degen_score += 30
  }
  else if (portfolio.num_tokens >= 31) {
    degen_score += 50
  }

  // No. of NFTs
  // Logic: If you have less than 5 nfts, you get 10 points. If it is between 5 and 20, you get 30 points. If it is between 20 and 30, you get 40 points.
  // If it is between 30 and 40, you get 50 points, and if it is greater than 60, then you get 150 points.
  if (total_num_nfts >= 5 && total_num_nfts <= 20) {
    degen_score += 30
  }
  else if (total_num_nfts >= 21 && total_num_nfts <= 30) {
    degen_score += 40
  }
  else if (total_num_nfts >= 31 && total_num_nfts <= 40) {
    degen_score += 50
  }
  else if (total_num_nfts >= 41 && total_num_nfts <= 60) {
    degen_score += 80
  }
  else if (total_num_nfts >= 61) {
    degen_score += 150
  }
  else {
    degen_score += 10
  }

  // Total value of portfolio (except for sol)
  // Logic: If total value of portfolio is between $5 and $50, you get 20 points. If total value of portfolio
  // is between $50 and $100, you get 50 points. If total value of portfolio is between $100 and 
  // $300, you get 100 points. If total value of portfolio is greater than $300, you get 150 points.
  let total_value = 0

  for (let i = 0; i < portfolio.tokens.length; i++) {
    const token = portfolio.tokens[i];
    const token_price = await get_token_price(token.address)
    const token_value = token_price * token.balance
    total_value += token_value
  }

  if (total_value >= 5 && total_value <= 50) {
    degen_score += 20
  }
  else if (total_value >= 50 && total_value <= 100) {
    degen_score += 50
  }
  else if (total_value >= 100 && total_value <= 300) {
    degen_score += 100
  }
  else if (total_value >= 300) {
    degen_score += 150
  }
  else {
    degen_score += 10
  }

  // Ratio of memecoins to sol
  // Logic: If ratio of memecoins to sol (memecoin_value / sol_value) is greater than 1, so you
  // get 10+ points, otherwise less than 50 points.
  const sol_price = await get_token_price("SOL")
  const sol_value_in_usd = portfolio.sol_balance * sol_price

  const ratio = total_value / sol_value_in_usd
  if (ratio > 1) {
    if (ratio >= 2 && ratio <= 3) {
      degen_score += 40
    }
    else if (ratio > 3 && ratio <= 10) {
      degen_score += 80
    }
    // we must check if you have large amount of sol, which would also mean that you would
    // have even larger amount of memecoin due to the ratio
    else if (ratio > 10 && ratio <= 50) {
      if (sol_value_in_usd > 20) {
        degen_score += 150
      }
      else {
        degen_score += 40
      }
    }
    else if (ratio > 50) {
      if (sol_value_in_usd > 40) {
        degen_score += 200
      }
      else {
        degen_score += 50
      }
    }
    else {
      degen_score += 20
    }
  }
  else {
    degen_score += 10
  }

  // Transaction history
  const txs = txHistory.data.result
  let resultant_epoch = 0
  for (let i = 0; i < txs.length; i++) {
    const tx = txs[i]
    resultant_epoch += tx.blockTime
  }

  const avg_tx_time_epoch = Math.trunc(resultant_epoch / txs.length)
  const mins_passed = moment.unix(avg_tx_time_epoch).fromNow()

  if (mins_passed / 1440 < 1) {
    if (mins_passed / 1440 < 0.5) {
      degen_score += 150
    }
    else {
      degen_score += 100
    }
  }
  else if (mins_passed / 1440 > 1 && mins_passed / 1440 < 2) {
    if (mins_passed / 1440 < 1.5) {
      degen_score += 80
    }
    else {
      degen_score += 50
    }
  }
  else {
    degen_score += 10
  }

  // Assign name tags based on degen score
  let name_tags = []

  if (degen_score >= 560) {
    name_tags.push("Degen Extraordinaire")
    name_tags.push("Wizard of Sol Street")
  }
  else if (degen_score >= 350 && degen_score <= 550) {
    name_tags.push("Swift Swapper")
    name_tags.push("Memelord Moneymaker")
  }
  else {
    name_tags.push("Crypto Zen Master")
    name_tags.push("Fickle Phantom")
  }

  return res.status(200).json({
    degen_score,
    name_tags,
  })
}
