import React from 'react'
import { Label, FileInput } from 'flowbite-react'
import '../styles/Modules.css'


function Modules() {
  return (
    <>
      <div className='UploadButton'>
        <div className="space-y-5">
          <div>
            <FileInput id="default-file-upload" />
          </div>
        </div>
      </div>
      <div className='card-container'>
        <div className='grid grid-cols-3'>
          <p>Uploaded file</p>
          <p>Uploaded file</p>
          <p>Uploaded file</p>
          <p>Uploaded file</p>
          <p>Uploaded file</p>
          <p>Uploaded file</p>
          <p>Uploaded file</p>
        </div>
      </div>
    </>
  )
}

export default Modules
