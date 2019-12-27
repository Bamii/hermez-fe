import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { Redirect } from "react-router-dom";
import axios from "axios";
import SectionTitle from "../containers/SectionTitle.jsx";
import WidgetCard from "../containers/WidgetCard.jsx";
import Button from "../containers/Button.jsx";

const Client = props => {
  const [validEntry, setVE] = useState(1);
  const [nickname, setNickname] = useState("");
  const [fileList, setFilelist] = useState([]);
  const [progressTracker, setProgressTracker] = useState({});
  const [ip, setIp] = useState("");

  useEffect(() => {
    // redirect them if theu didn't enter through the dashboard.
    // i.e if they don't have a state or if they don't have a
    // mode property in the state.
    const location = props.location;

    if (
      !location.hasOwnProperty("state") ||
      !location.state ||
      !location.state.nickname ||
      !props.store.client
    ) {
      setVE(0);
    } else {
      setNickname(location.state.nickname);
      setIp(location.state.ip);
      // notification for done tasks.
      props.store.client.addEventListener("message", e => {
        const [operation, ...message] = e.data.split(" ");
        switch (operation) {
          case "PROGRESS":
            const [progress, ...fn] = message.join(" ").split("-");

            if (!document.getElementById(`file-${fn.join(" ")}`)) {
              const received_list = document.getElementById("list");
              const single_file = document.createElement("div");
              single_file.id = `file-${fn.join(" ")}`;

              const filename = document.createElement("div");
              filename.innerText = fn.join(" ");
              filename.classList.add(...['font-light', 'py-5']);

              const container = document.createElement('div');
              container.classList.add('flex');
              
              const prog = document.createElement("progress");
              const prog_text = document.createElement('div');
              prog.setAttribute("value", progress);
              prog.setAttribute("max", 100);
              prog.classList.add('w-1/2');
              prog_text.innerText = `${progress}%`;
              prog_text.classList.add(...['font-light', 'px-3']);


              container.append(prog);
              container.append(prog_text)

              single_file.append(filename);
              single_file.append(container);

              received_list.prepend(single_file);
            } else {
              const zz = document.getElementById(`file-${fn.join(" ")}`);
              zz.childNodes[1].childNodes[0].setAttribute("value", progress);
              zz.childNodes[1].childNodes[1].innerText = `${progress}%`;
            }
            return;

          case "DONE":
            console.log(message.join(" "));
            return;

          default:
            return;
        }
      });
      props.store.client.onclose = () => setVE(0);
    }
  }, [true]);

  const disconnect = () => {
    if (props.location.state.mode === "server") {
      axios.delete("/ws").then(() => {
        setVE(0);
      });
    } else {
      props.store.client.send(`DELETE ${nickname}`);
      props.store.client.close();
      setVE(0);
    }
  };

  const sendFiles = evt => {
    Array.from(fileList).forEach(file => {
      const reader = file.stream().getReader();
      let size = 0;

      props.store.client.send(file.name);
      reader.read().then(function rec({ done, value }) {
        if (done) {
          props.store.client.send(`DONE ${nickname} ${file.name}`);
          return;
        }
        size += value.length;
        const progress = Math.floor((size / file.size) * 100);

        document.getElementById(`file-${file.name}`).setAttribute('value', progress);
        document.getElementById(`progress-${file.name}`).innerText = `${progress}%`;

        const json_to_encode = {
          nickname,
          chunk: value,
          filename: file.name,
          progress
        };
        const encoded_buffer = Buffer.from(JSON.stringify(json_to_encode));
        
        props.store.client.send(encoded_buffer);
        return reader.read().then(rec);
      });
    });
  };

  return validEntry === 1 ? (
    <div className="mx-auto text-primaryDark">
      <div style={{ height: "calc(100vh - 8.5rem)" }} className="flex">
        {/* left */}
        <div className="overflow-scroll relative p-10 pl-20 w-full">
          <SectionTitle title={`hi ${nickname}, here's your history...`} />
          <div id="list" className="py-8"></div>
        </div>

        {/* right */}
        <div
          style={{ height: "calc(100vh - 8.5rem)" }}
          className="flex flex-col relative
            border-l border-secondary"
        >
          <div className="p-10">
            <div
              style={{ width: "250px" }}
              className="m-auto text-center flex flex-col justify-center items-center"
            >

              <input
                type="file"
                multiple
                id="file-select"
                name="file-select"
                onChange={evt => {
                  const files = evt.target.files;
                  let temp = {};
                  Array.from(files).forEach(file => {
                    temp[file.name] = 0;
                  });
                  setProgressTracker(temp);
                  setFilelist(Array.from(files));
                }}
              />
              <label
                htmlFor="file-select"
                className="cursor-pointer w-full py-4 text-center rounded-lg border bg-secondary">
                click to select files to send
              </label>

              <div className="py-5 ">
                {fileList.length > 0 ? (
                  fileList.map(file => {
                    return (
                      <div key={file.name} className="text-left py-3">
                        <div className="text-md">{file.name}</div>
                        <div className="flex items-center">
                          <progress
                            id={`file-${file.name}`}
                            max={100}
                            value={progressTracker[file.name]}
                            className="h-4 w-full"
                          ></progress>
                          <div id={`progress-${file.name}`} className="px-5 text-light">
                            {progressTracker[file.name]}%
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center w-full py-24">
                    No files have been selected
                  </div>
                )}
              </div>

              <div onClick={sendFiles} className="cursor-pointer py-3 px-5 border rounded-lg border-secondary">
                send files
              </div>
            </div>

            <div className="flex flex-col py-10">
              <hr className="w-1/3 mx-auto" />
              <div className="text-lg text-center py-8">
                address: http://{ip}
              </div>
              <hr className="w-1/3 mx-auto" />
            </div>

            <WidgetCard title="connected to" />
            <Button extras="cursor-pointer mb-5 py-5 px-8 text-lg" btnClick={disconnect}>
              disconnect!
            </Button>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <Redirect to="/" />
  );
};

const mapStateToProps = ({ client }) => {
  return { store: { client } };
};

const mapDispatchToProps = dispatch => {
  return {
    plsClient: client => {
      dispatch(setClient(client));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Client));
