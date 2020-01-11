const fs = require('fs'),
os = require('os'),
ip = require('ip'),
bp = require('body-parser'),
WsServer = require('./ws/wsServer.js'),
WsClient = require('./ws/wsClient.js');
const { responseBuilder, is } = require('./utils/toolbox');

const validFolder = (path) => fs.existsSync(path);

function serverHandler(app, s, c) {
  let server = null,
  connections = {},
  browserConnections = {},
  downloadFolder,
  serverName;
  const home = os.homedir();

  app.use(bp.json({ type: 'application/json' }));

  // creating the server
  // ::self
  app.post('/ws', function(req, res) {
    const { port, nickname } = req.body;
    let streams = {};
    serverName = nickname;

    // TODO:: do something about the duplicate
    if (validFolder(`${home}/Documents`) && !validFolder(`${home}/Documents/hermez`)) {
      downloadFolder = `${home}/Documents/hermez`;
      fs.mkdir(`${home}/Documents/hermez`, { recursive: true }, (err) => {
        if (err) return;
        // handle the error!!!
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
                // only send the necessary parts of the chunk to the receiving ('server') sockets
                // and send the progress to the browser sockets.
                sock && sock.send(Buffer.from(JSON.stringify({ filename, chunk })));
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
        "a server has already been created",
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
    
    // TODO:: duplicate
    if (validFolder(`${home}/Documents`) && !validFolder(`${home}/Documents/hermez`)) {
      downloadFolder = `${home}/Documents/hermez`;
      fs.mkdir(`${home}/Documents/hermez`, { recursive: true }, (err) => {
        if (err) return;
      });
    }

    const client = new WsClient(address).connect();

    client
      .on('open', () => {
        client.send(`nickname server-${nickname}`);
        res.status(200).send(responseBuilder("Successfully opened a client!", { nickname }));
      })
      .on('close', () => {})
      .on('error', (err) => { res.status(500).send(responseBuilder(err)); return; })
      .on('message', (data) => {
        // the buffers of the file being sent
        if (Buffer.isBuffer(data)) {
          // decode the chunk being received. 
          const { filename, chunk } = JSON.parse(data.toString());
          if (!streams.hasOwnProperty(filename)) {
            streams[filename] = fs.createWriteStream(`${home}/Documents/hermez/${filename}`);
          }

          if (!is('undefined', chunk)) {
            streams[filename].write(Buffer.from(Object.values(chunk)));
          }
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
