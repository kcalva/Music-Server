require('dotenv').config();
const express = require('express');
const { exec } = require('child_process');
const cors = require('cors');
const fs = require('fs');
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5000;

// Configure AWS SDK with your credentials
const s3 = new S3Client({
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    region: process.env.AWS_REGION,
});

app.post('/download-audio', (req, res) => {
    const { youtubeLink, user } = req.body;
    const downloadDirectory = user ? `/Users/kev/Documents/${user}'s Music` : `/Users/kev/Documents/Music`

    if (!fs.existsSync(downloadDirectory)) {
        fs.mkdirSync(downloadDirectory, { recursive: true });
    }

    const youtubeDLCommand = `youtube-dl --audio-quality 0 -i --extract-audio --audio-format mp3 -o './%(title)s.%(ext)s' --add-metadata --embed-thumbnail --metadata-from-title "%(artist)s - %(title)s" ${youtubeLink}`;

    const shellScript = `cd "${downloadDirectory}" && ${youtubeDLCommand}`

    exec(shellScript, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing shell script: ${error}`);
            return res.status(500).json({ error: 'Failed to download audio' });
        }

        console.log('stdout ', stdout);
        console.log('stderr ', stderr);
        // Extract the file name from the output
        const match = /\[ffmpeg\] Destination: (.*\.mp3)/.exec(stdout);
        console.log('match ', match);
        let audioFileName = match ? match[1] : 'unknown.mp3';
        if (audioFileName === 'unknown.mp3') {
            // If the filename is 'unknown.mp3', use the download directory instead
            audioFileName = `${downloadDirectory}/unknown.mp3`;
        }

        // Upload the audio file to Amazon S3
        const params = {
            Bucket: process.env.AWS_S3_BUCKET,
            Key: audioFileName,
            Body: fs.createReadStream(`${downloadDirectory}/${audioFileName}`),
        };

        const putObjectCommand = new PutObjectCommand(params);

        s3.send(putObjectCommand)
            .then(() => {
                // File uploaded successfully
                return res.status(200).json({ success: 'Audio downloaded and uploaded to S3 successfully' });
            })
            .catch((s3Error) => {
                console.error(`Error uploading to S3: ${s3Error}`);
                return res.status(500).json({ error: 'Failed to upload audio' });
            });
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
