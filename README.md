# hermez
file sharing utility... share files with computers on the same network. <br>

## requirements
- a computer system with nodejs installed on it. <br>

## installing and running
- install the package from the npm registry.
```
$ npm i -g hermez
$ hermez
``` 
follow the on-screen instructions and voila!
<br>

## how to use
on opening the app homepage you will be presented with two options.
- create a connection
- join a connection

### creating a connection
- fill in the details accordingly. the port number is a combination of any 4 numbers, and the nickname is any silly name you can think of ;) (btw, it has to be 5 or more letters). <br>
n.b: take note of the ip address displayed on the page you're redirected to after creating the connection. this will be the ip address that others will connect to. <br>

### joining a connection
- get the ip address of the server you want to connect to.
- enter the ip in the field where it says 'port'
- slot in any nickname you'd like to (p.s: it too shouldn't be shorter than 5). <br>

#### nb: your downloads are located in ....../{user_dir}/Documents/hermez.
#### "user_dir" is the USERS's root directory NOT the computer's root directory.

## development...

### how to run 
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
happy debugging!! <br>

### how to build (and run the build).
- run the production build task
```
$ npm run build:prod
```
- run the express server
```
$ npm run start:prod
```
<br>

## THIS IS A W.I.P and will contain bugs. to help improve on this software, please report any issues you have.

# todo
- add cli options (port number... ) ??
- port to electron.

### ❤, bami :)
