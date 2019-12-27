import React from 'react';

const DragToSend = ({ files, progressTracker }) => {
  return (
    <div
      style={{ width: '250px' }}
      className="m-auto text-center flex flex-col justify-center items-center"
    >
      <div className="w-full py-4 text-center rounded-lg border bg-secondary">
        click to select files to send
      </div>

      <div className="py-5 ">
        {files.length > 0 
          ?
            files.map(file => {
              return (
                <div className="text-left py-3">
                  <div className="text-md">{file.name}</div>
                  <div className="flex items-center">
                    <progress
                      max={100}
                      value={progressTracker[file.name]}
                      className="h-4 rounded-lg w-full"
                    ></progress>
                    <div className="px-5 text-light">{progressTracker[file.name]}%</div>
                  </div>
                </div>
              );
            })
          : <div className="text-center w-full py-24">No files have been selected</div>}
      </div>

      <div className="py-3 px-5 border rounded-lg border-secondary">
        send files
      </div>
    </div>
  )
}

export default DragToSend;
