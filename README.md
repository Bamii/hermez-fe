# hermez
file sharing utility... share files with computers on the same network.

## requirements
- a computer system with nodejs installed on it.

## how to run 
- clone this repo
```
$ git clone https://github.com/bamii/hermez-fe
```
- setup the repo
```
$ cd hermez-fe
$ npm install
```
- run the app
```
$ npm run start:dev
```

### how to build (and run the build).
- run the production build task
```
$ npm run build:prod
```
- run the express server
```
$ npm run start:prod
```
after this, an express server is run and the address will be displayed on the command line. enter this address in your browser, happy debugging!


## how to use
on opening the app homepage you will be presented with two options.
- create a connection
- join a connection

### creating a connection
- fill in the details accordingly. the port number is a combination of any 4 numbers, and the nickname is any silly name you can think of ;) (btw, it has to be 5 or more letters). <br>
n.b: take note of the ip address displayed on the page you're redirected to after creating the connection. this will be the ip address that others will connect to.

### joining a connection
- get the ip address of the server you want to connect to.
- enter the ip in the field where it says 'port'
- slot in any nickname you'd like to (p.s: it too shouldn't be shorter than 5).


# THIS IS A W.I.P and will contain bugs. to help improve on this software, please report any issues you have.

### bami :)