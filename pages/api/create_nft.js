import axios from "axios"
import { createCanvas, registerFont } from "canvas"
import fs from "fs"

export default async function handler(req, res) {
    const score = req.body.score
    const address = req.body.address

    const imgData = await axios.post(process.env.NEXT_URL + "/api/generate_score_img", {
        score
    })

    const nftData = await axios.post("https://api.shyft.to/sol/v1/nft/create_detach", {
        network: "devnet",
        wallet: address,
        name: "DEGEN SCORE NFT",
        symbol: "DEGENFT",
        file: imgData.data.img
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
