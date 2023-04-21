# ChessOpeningMaster

<p align="center">
<a href="https://github.com/sky10p/ChessOpeningMaster/blob/master/src/doc/donate/donate.md" alt="Donate shield"><img src="./src/doc/donate/donate-bitcoin.svg" /></a>
</p>

## Description

ChessOpeningMaster is an application that allows you to manage your chess opening repertoire and train all the variations. The application is designed to be easy to use and offers various useful functionalities to enhance your gameplay.

## Features

* Manage repertoires (create, edit, and delete).
* Order repertoires.
* In repertoire editing:
    * Rename names at a specific position (automatic creation of variations).
    * Delete positions.
    * Add comments.
* In repertoire training:
    * View trained variations.
    * Choose which variations to train.
    * View comments.

## Installation Requirements

* Web server such as nginx.
* MongoDB 4.4 or higher

## Installation and Configuration

To install and run ChessOpeningMaster on your local environment, follow these steps:

1. Clone the repository to your local machine.
2. Make sure you have Node.js and yarn installed.
3. Run `yarn install` to install the project's dependencies.
4. Set up your web server and MongoDB following specific instructions for your environment.
5. Use the following yarn commands to run the project in development or production mode.

### Configure Nginx

To configure Nginx as a web server for ChessOpeningMaster, create a new Nginx configuration file with the following content:

```perl
server {
    listen 3002;
    server_name myapp.local;  # Replace this with your application's domain name, if you have one

    root <chessopeningmaster path>/build/frontend;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}

```

Make sure to replace `<chessopeningmaster path>` with the path to your ChessOpeningMaster directory on your server.

Reload the Nginx configuration for the changes to take effect:

```
sudo nginx -t && sudo nginx -s reload
```

## Create a Systemd Service for the backend

To create a Systemd service for the ChessOpeningMaster backend, create a new service file at `/etc/systemd/system/chessopeningmaster.service` with the following content:

```makefile
[Unit]
Description=ChessOpeningMaster Backend
After=network-online.target
Wants=network-online.target

[Service]
ExecStart=<bin node path> <chessopeningmaster path>/build/backend/server.js
Environment=MONGODB_URI=mongodb://localhost:27017/chess_opening_master
Environment=BACKEND_PORT=3001
Restart=on-failure
Type=simple
User=<user>
Group=nogroup
WorkingDirectory=<chessopeningmaster path>/build

[Install]
WantedBy=multi-user.target

```

Replace `<bin node path>` with the path to your Node.js binary, `<chessopeningmaster path>` with the path to your ChessOpeningMaster directory, and `<user>` with the appropriate user to run the service.

Enable and start the service:

```bash
sudo systemctl enable chessopeningmaster.service
sudo systemctl start chessopeningmaster.service
```

To check the status of the service, run:

```lua
sudo systemctl status chessopeningmaster.service
```

## Future improvements

* Allow the creation of arrows and circles on the board with the right mouse button.
* Undo menu when renaming nodes or deleting them (to avoid errors).
* Display analytics of studied variations by day, repetitions, etc.
* Add a spaced repetition system like SM-2 or Anki.
* Allow adding incorrect moves to the repertoire and allowing them during training to recognize your mistakes.
* Option to import/export repertoires (currently from MongoDB).
* Option to import/export in PNG.

## Known issues

The Chessboard library being used is no longer maintained, it will be replace as soon as possible.

## Collaboration

Although ChessOpeningMaster was initially created as a personal use tool, any type of collaboration is welcome. If you have ideas for improving the project, feel free to open issues or make pull requests.

## License

ChessOpeningMaster is licensed under a Non-Commercial Free Software License. You may use, modify, and distribute the software in accordance with the terms of this license. However, commercial use of the software requires prior consent from the author. For more information about commercial use, please contact the project author.
