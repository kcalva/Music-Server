// server.js
const express = require('express')
const { exec } = require('child_process')
const cors = require('cors')
const fs = require('fs')

const app = express()
app.use(cors())
app.use(express.json())

const port = process.env.PORT || 5000

app.post('/download-audio', (req, res) => {
    const { youtubeLink, user } = req.body
    let downloadDirectory

    if (user) {
        downloadDirectory = `/Users/kev/Documents/${user}'s Music`
    } else {
        downloadDirectory = `/Users/kev/Documents/Music`
    }

    // Create the download directory if it doesn't exist
    if (!fs.existsSync(downloadDirectory)) {
        fs.mkdirSync(downloadDirectory, { recursive: true })
    }

    const youtubeDLCommand = `youtube-dl --audio-quality 0 -i --extract-audio --audio-format mp3 -o './%(title)s.%(ext)s' --add-metadata --embed-thumbnail --metadata-from-title "%(artist)s - %(title)s" ${youtubeLink}`

    const shellScript = `cd "${downloadDirectory}" && ${youtubeDLCommand}`

    exec(shellScript, (error) => {
        if (error) {
            console.error(`Error executing shell script: ${error}`)
            return res.status(500).json({ error: 'Failed to download audio' })
        }
        return res.status(200).json({ success: 'Audio downloaded successfully' })
    })
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})
