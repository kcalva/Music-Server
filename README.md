### Node.js Server for YouTube Audio Downloads

This Node.js server script sets up an Express server to handle audio downloads from YouTube. It uses the `youtube-dl` command-line tool for this purpose. Here's a breakdown of what the code does:

1. Import necessary modules such as `express`, `exec` from the 'child_process' module, `cors`, and `fs` (file system).

2. Create an Express application and set up middleware for CORS and JSON parsing.

3. Define a variable `port` that specifies the server's port. It uses the provided environment variable `PORT` or defaults to port 5000 if no environment variable is set.

4. Set up an endpoint at `/download-audio` for handling POST requests.

5. In the `/download-audio` route handler, extract `youtubeLink` and `user` from the request body.

6. Construct the `downloadDirectory` path based on the `user` parameter. If `user` is provided, it uses `/Users/kev/Documents/{user}'s Music`, otherwise, it uses `/Users/kev/Documents/Music`. The `downloadDirectory` is created if it doesn't exist using `fs.mkdirSync`.

7. Construct a `youtubeDLCommand` string that represents the command to execute using `youtube-dl`. This command is used to download audio from the provided YouTube link. It specifies various options such as audio quality, output format, metadata extraction, etc.

8. Construct a `shellScript` that changes the current working directory to `downloadDirectory` and then runs the `youtubeDLCommand` using the `exec` function from the 'child_process' module.

9. The `exec` function is used to run the `shellScript`. If an error occurs during execution, it logs an error message and returns a 500 status code with an error message. Otherwise, it returns a 200 status code with a success message.

10. The server starts listening on the specified port, and a message is logged to the console when it starts.

**Note**: This code relies on the `youtube-dl` command-line tool being installed and available in your system's PATH. Additionally, there are security concerns with constructing the `shellScript` from user-provided data. You should consider sanitizing and validating user input to prevent potential security vulnerabilities, such as command injection.