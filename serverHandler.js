const fs = require('fs'),
os = require('os'),
ip = require('ip'),
bp = require('body-parser'),
isProd = !(process.env.NODE_ENV && process.env.NODE_ENV === 'development');
WsServer = isProd ? require('./ws/wsClient.min.js') : require('./ws/wsServer.js'),
WsClient = isProd ? require('./ws/wsServer.min.js') : require('./ws/wsClient.js');

const { responseBuilder, is } = require('./utils/toolbox');

let server = null,
connections = {},
browserConnections = {},
serverName;

const home = os.homedir();

function validFolder(path) {
  return fs.existsSync(path);
}

function serverHandler(app, s, c) {
  app.use(bp.json({ type: 'application/json' }));

  // creating the server
  // ::self
  app.post('/ws', function(req, res) {
    const { port, nickname } = req.body;
    let streams = {};
    const home = os.homedir();
    serverName = nickname;

    if (validFolder(`${home}/Documents`) && !validFolder(`${home}/Documents/hermez`)) {
      downloadFolder = `${home}/Documents/hermez`;
      fs.mkdir(`${home}/Documents/hermez`, { recursive: true }, (err) => {
        if (err) return;
      });
    }

    if (server == null) {
      server =  (new WsServer('0.0.0.0', port)).connect();
      
      server.on('connection', (ws) => {
        ws.on('message', (m) => {
          if (is('string', m) && m.split(" ")[0] === 'nickname') {
            const [, message] = m.split(" ");
            const [mode, nickname] = message.split("-");
            mode === 'browser' 
              ? browserConnections[nickname] = ws
              : connections[nickname] = ws;

          } else if (is('string', m) && m === 'START') {
            
          } else if (is('string', m) && m.split(" ")[0] === "DELETE") {
            const [, nickname] = m.split(" ");
            const client = connections[nickname];

            // close the connection and remove it from the list on the server.
            client.close();
            delete connections[nickname];
          } else if (is('string', m) && m.split(" ")[0] === "DONE") {
            const [, nickname, ...fname] = m.split(" ");
            const filename = fname.join(" ");

            if (serverName !== nickname) {
              streams[filename].close();
              delete streams[filename];
            }

            // notify every other client's server.
            for (let nick in browserConnections) {
              const sock = connections[nick];
              const browSock = browserConnections[nick];
              if (nick === nickname) {
                continue;
              } else {
                sock && sock.send(m);
                browSock && browSock.send(m); // notify their browsers too.
              }
            }
          } else if (Buffer.isBuffer(m)) {
            const { filename, chunk, nickname, progress } = JSON.parse(m.toString());
            
            if (serverName !== nickname) {
              if (!streams.hasOwnProperty(filename)) {
                streams[filename] = fs.createWriteStream(`${home}/Documents/hermez/${filename}`);
              }

              if (!is('undefined', chunk)) {
                streams[filename].write(Buffer.from(Object.values(chunk)));
              }
            }

            for (let nick in browserConnections) {
              const sock = connections[nick];
              const browSock = browserConnections[nick];
              if (nick === nickname) {
                // don't send to the same client.
                continue;
              } else {
                sock && sock.send(m);
                browSock && browSock.send(`PROGRESS ${progress}-${filename}`);
              }
            }
          }
        });
      });
      server.on('error', () => res.status(500).send(responseBuilder('An Error Occured while creating the server.')));
      
      res.status(201).send(responseBuilder("Server Created", { ip: ip.address() }));
      return;
    }
  
    res.status(200).send(
      responseBuilder(
        "Still here",
        {
          "connections-browser": Object.keys(browserConnections).length,
          "connections-server": Object.keys(connections).length,
        }
      )
    );
    return;
  })

  // creating and connecting client to server.
  // ::self
  app.put('/ws', function(req, res) {
    const { nickname, address } = req.body;
    const streams = {};
    
    if (validFolder(`${home}/Documents`) && !validFolder(`${home}/Documents/hermez`)) {
      downloadFolder = `${home}/Documents/hermez`;
      fs.mkdir(`${home}/Documents/hermez`, { recursive: true }, (err) => {
        if (err) return;
      });
    }

    // take note of the ip address.
    // const client = new WsClient('172.20.10.6:3001').connect();
    const client = new WsClient(address).connect();
    client
      .on('open', () => {
        client.send(`nickname server-${nickname}`);
        res.status(200).send(responseBuilder("Successfully opened a client!", { nickname }));
      })
      .on('close', () => {})
      .on('error', (err) => res.status(500).send(responseBuilder(err)))
      .on('message', (data) => {
        if (Buffer.isBuffer(data)) {
          const { filename, chunk } = JSON.parse(data.toString());
          if (!streams.hasOwnProperty(filename)) {
            streams[filename] = fs.createWriteStream(`${home}/Documents/hermez/${filename}`);
          }

          if (!is('undefined', chunk)) {
            streams[filename].write(Buffer.from(Object.values(chunk)));
          }
        } else if (data === 'START') {
        } else if (is('string', data) && data.split(" ")[0] === "DONE") {
          const [,, ...fname] = data.split(" ");
          streams[fname.join(" ")].close();
          delete streams[fname.join(" ")];
        }
      });
  })

  // deleting the server.
  // ::self
  app.delete('/ws', function(req, res) {
    if (server === null && !app.get('hermez-server')) {
      res.status(500).send(responseBuilder('No server exists at the moment.'))
      return;
    }

    server.close();
    server = null;
    connections = {};

    res.send({
      status: 200,
      message: 'Successfully deleted the server.',
    })
    return;
  })
}

module.exports = serverHandler;
