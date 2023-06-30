import axios from "axios"
import { createCanvas, registerFont } from "canvas"
import fs from "fs"

export default async function handler(req, res) {
    const nft_address = req.body.nftAddress
    const address = req.body.address

    const nftData = await axios.post("https://api.shyft.to/sol/v1/nft/mint_detach", {
        network: "devnet",
        wallet: address,
        receiver: address,
        master_nft_address: nft_address,
    }, {
        headers: {
            "x-api-key": process.env.SHYFT_API_KEY
        }
    })

    return res.status(200).json({
        tx: nftData.data.result.encoded_transaction,
        mint: nftData.data.result.mint
    })
}
