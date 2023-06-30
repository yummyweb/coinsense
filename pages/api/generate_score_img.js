import { createCanvas, registerFont } from "canvas"
import fs from "fs"

export default async function handler(req, res) {
    const score = req.body.score
    const imageCanvas = createCanvas(1200, 630)
    const context = imageCanvas.getContext('2d')

    registerFont('public/Baloo2-Bold.ttf', { family: 'Baloo 2' })

    context.fillStyle = '#7E21B4'
    context.fillRect(0, 0, 1200, 630)
    context.fillStyle = '#fff';
    context.font = 'bold 30pt Baloo 2'
    context.fillText("COINSENSE!", 480, 520)
    context.font = 'bold 60pt Baloo 2'
    context.fillText(`SCORE: ${score}/700`, 300, 275)

    return res.status(200).json({
        img: imageCanvas.toDataURL()
    })
}
