# 3D Print Manager

3D Print Manger is a simple SvelteKit application written to facilitate the following tasks Skaperiet Makerspace
for children: 

- Allowing the children to upload 3D models as STL files in a simple Web User Interface to our Klipper-based printers
- Each of the printers that are available in the makerspace are listed in the application, and the children can select which printer they want to use for their print
- Once an STL file have been selected (either for upload, or for re-printing), the user interface will show a preview of the model
- 3D print manager takes care of slicing the uploaded STL file into GCODE, with one of the pre-selected slicer settings for the printer
- Once the GCODE is ready, it will upload the GCODE to the printer, and the print will start
- Each uploaded STL file is kept, and can be re-printed on any of the available printers

# Installation on Raspberry Pi

3D Print Manager can be run anywhere a SvelteKit application can be run. For Skaperiets use case, the application is
wrapped as a Docker Container using Node 20-slim as the base image. This makes the application completely self-contained,
easy to setup, manage and run. 

## IP addresses of the printers

In the .env file, each printers IP address is listed. There is a script called findPrinters.sh that can be used to find 
the IP addresses of the printers. Note that this script is written for Skaperiets setup where each printer have its
own unique hostname in the format: 

```
neptuneX
```

Where X is the printer number (from 1-4 in our case). 

If you printer IPs are stable on your network, you can manually edit the .env file and insert the printers with their
corresponding IP addresses.

## Installing Docker and Docker Compose

```angular2html
sudo apt-get update
sudo apt-get upgrade -y
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
docker --version
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

docker-compose --version

sudo systemctl enable docker

```

## Running the application via systemctl

Running the application via systemctl entails creating a service file for the application, and then starting the service.

### Create a service file for the application

Create a file called docker-compose-app.service in /etc/systemd/system/ with the following content:

```
[Unit]
Description=Docker Compose Application Service
Requires=docker.service
After=docker.service

[Service]
WorkingDirectory=/home/pi/server
ExecStart=/usr/local/bin/docker-compose up
ExecStop=/usr/local/bin/docker-compose down
Restart=always
User=pi
Group=docker

[Install]
WantedBy=multi-user.target
```

### Starting the service

```
sudo systemctl daemon-reload
sudo systemctl enable docker-compose-app
sudo systemctl start docker-compose-app
```

## Scheduling findPrinters.sh to run every hour

This script will find the IP addresses of the printers and update the .env file with the correct IP addresses. 
When finished, it will restart the docker container.

```
crontab -e
```

Add the following line to the crontab file:

```
0 * * * * /bin/bash /home/pi/server/findPrinters.sh >> /home/pi/server/findPrinters.log 2>&1
```

# create-svelte

Everything you need to build a Svelte project, powered by [`create-svelte`](https://github.com/sveltejs/kit/tree/main/packages/create-svelte).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```bash
# create a new project in the current directory
npm create svelte@latest

# create a new project in my-app
npm create svelte@latest my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.
