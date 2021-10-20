const dotenv = require('dotenv');
const result = dotenv.config()

if (result.error) {
	throw result.error
}

const express = require('express');
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const path = require('path');
const OAuth2 = google.auth.OAuth2;
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const users = [];

io.on('connection',socket => {
	socket.on('new-user',name => {
		users[socket.id] = name
		socket.broadcast.emit('user-connected',name)
	})
	socket.on('send-chat-message',message => {
		socket.broadcast.emit('chat-message',{ message: message,name: users[socket.id] })
	})
	socket.on('disconnect',() => {
		socket.broadcast.emit('user-disconnected',users[socket.id])
		delete users[socket.id]
	})
})

app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }));

app.use(function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:8000");
	res.setHeader("Access-Control-Allow-Credentials", "true");
	res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,DELETE");
	res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
    next();
});

const publicCssDirectoryPath = path.join(__dirname, '/public/css');
app.use('/static/css', express.static(publicCssDirectoryPath))

const publicJsDirectoryPath = path.join(__dirname, '/public/js');
app.use('/static/js', express.static(publicJsDirectoryPath))

const publicAssetDirectoryPath = path.join(__dirname, '/public/assets');
app.use('/static/assets', express.static(publicAssetDirectoryPath))

app.get('/',(req,res) => {
	res.sendFile(path.join(__dirname,'/index.html'));
})

app.post('/send',(req,res) => {

	const { username,email,message } = req.body;

	const oauth2Client = new OAuth2(
     process.env.OAUTH_CLIENTID, // ClientID
     process.env.OAUTH_CLIENT_SECRET, // Client Secret
     "https://developers.google.com/oauthplayground" // Redirect URL
     );
	oauth2Client.setCredentials({
		refresh_token: process.env.OAUTH_REFRESH_TOKEN
	});
	const accessToken = oauth2Client.getAccessToken()

	const smtpTransport = nodemailer.createTransport({
			service: 'gmail',
  			type: "SMTP",
  			host: "smtp.gmail.com",
  			secure: true,
		auth: {
			type: "OAuth2",
			user: "saswatsingh629@gmail.com", 
			clientId: process.env.OAUTH_CLIENTID,
			clientSecret: process.env.OAUTH_CLIENT_SECRET,
			refreshToken: process.env.OAUTH_REFRESH_TOKEN,
			accessToken: accessToken
		},
		tls: {
			rejectUnauthorized: false
		}
	});
	const mailOptions = {
		from: email,
		to: "saswatsingh629@gmail.com",
		subject: "New message from your portfolio!",
		generateTextFromHTML: true,
		html: `<h2>Hey Saswat Someone messaged you.</h2><p>From: ${email}<p><p>Username: ${username}</p><p>Message: ${message}</p><hr><h3>Hope you have a good day and don't forget to reply that person</h3>`
	};
	smtpTransport.sendMail(mailOptions, (error, response) => {
		if (error) {
			res.status(404).json({
				success: false,
				message: 'There was a problem sending email',
				response: response,
				error: error
			})
		}
		res.status(200).json({
			success: true,
			message: 'Email sent successfully',
			response: response,
			error: null
		})
		smtpTransport.close();
	});
})

const PORT = process.env.PORT || 8000;

server.listen(PORT,() => {
	console.log(`Server listening on port ${PORT}`)
})

// medium article https://medium.com/@nickroach_50526/sending-emails-with-node-js-using-smtp-gmail-and-oauth2-316fe9c790a1