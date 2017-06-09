import React, {Component} from 'react'
import UploadsList from './UploadsList'
import Axios from 'axios'
import {
  countFilesToBeUploaded,
  countSizeUploaded,
  countSizeToBeUploaded,
  formatPhotosObject,
  fileSizeFromBytes,
  TEST_UPLOAD_URL
} from '../helpers'

class UploadPhotos extends Component {

  constructor(props) {
    super(props)
    this.state = {
      files: [],
      isUploading: false,
      uploadTimeStart: 0,
      uploadTime: 0,
      uploadSize: 0,
      uploadSizeUploaded: 0,
      uploadSizeTotal: 0,
      uploadSpeed: 0
    }
  }

  filesListObjToArray(FilesList) {
    let filesList = []
    for (let i = 0; i < FilesList.length; i++) {
      if (FilesList[i].type !== 'image/jpeg') continue
      let newFile = FilesList[i]
      newFile.preview = window.URL.createObjectURL(newFile) || ''
      newFile.status = ''
      filesList.push(newFile)
    }
    return filesList
  }

  onSelectionChange() {
    this.createQueue(this.filesListObjToArray(this.refs.galleryFiles.files))
  }

  uploadSingleFile = (fileToBeUploaded) => {
    const {activePostId} = window
    const uploadUrl = window.uploadUrl || TEST_UPLOAD_URL
    let data = new FormData()
    data.append('fileName', fileToBeUploaded.name)
    data.append('fileType', fileToBeUploaded.type)
    data.append('fileSize', fileToBeUploaded.size)
    data.append('referenceID', activePostId)
    data.append('file', fileToBeUploaded)
    data.append('displayName', fileToBeUploaded.displayName)
    data.append('description', fileToBeUploaded.description)
    data.append('alt', fileToBeUploaded.alt)

    this.updateFileStatus(fileToBeUploaded, 'uploading')

    let config = { // multipart/form-data
      headers: ['application/form-data-encoded'] // used to enable file uploads
    }

    let self = this

    return Axios.post(uploadUrl, data, config)
      .then(function (res) {
        console.log("Uploaded, response: ", res)
        self.props.onUpload(formatPhotosObject(res.data.allPhotos))
        self.updateFileStatus(fileToBeUploaded, 'uploaded')
        self.uploadNextFile()
      })
      .catch(function (err) {
        self.updateFileStatus(fileToBeUploaded, 'error')
        self.uploadNextFile()
        console.error(err)
      })
  }

  updateFileStatus = (fileToBeUploaded, toStatus = 'uploading') => {
    let {files, uploadTimeStart} = this.state
    const updatedFiles = files.map(file => {
      if (file.name === fileToBeUploaded.name) {
        file.isUploading = toStatus === 'uploading' ? true : false
        file.isUploaded = toStatus === 'uploaded' ? true : false
        file.error = toStatus === 'error' ? true : false
      }
      return file
    })
    const newTime = +new Date()
    const sizeUploaded = countSizeUploaded(files)

    this.setState({
      files: updatedFiles,
      uploadTime: newTime,
      uploadSizeUploaded: sizeUploaded,
      uploadSpeed: parseFloat(sizeUploaded / ((newTime - uploadTimeStart) / 1000)).toFixed(2)
    })
  }

  getNextUploadFile = () => {
    const {files} = this.state
    return files.find(file => {
      return (!file.isUploaded && !file.isUploading && !file.error) ? file : undefined
    })
  }

  uploadNextFile = () => {
    const file = this.getNextUploadFile()
    if (countFilesToBeUploaded(this.state.files) > 0 && file) {
      console.log('Uploading file: ', file.name)
      this.uploadSingleFile(file)
    } else {
      this.setState({isUploading: false, files: []})
    }
  }

  createQueue = (files) => {
    this.setState({
      files: this.addUploadStatusesAndAttributes(files)
    })
  }

  addUploadStatusesAndAttributes = (files) => {
    return files.map(file => {
      file.isUploading = false
      file.isUploaded = false
      file.error = false
      file.displayName = ''
      file.description = ''
      file.alt = ''
      return file
    })
  }

  startUploading = (event) => {
    event.preventDefault()
    this.setState({
      isUploading: true,
      uploadTimeStart: +new Date(),
      uploadSizeTotal: countSizeToBeUploaded(this.state.files),
      uploadSizeUploaded: 0
    })
    this.uploadNextFile()
  }

  resetUpload = (event) => {
    this.refs.uploadForm.reset()
    event.preventDefault()
    event.stopPropagation()
    this.setState({files: []})
  }

  updateFileInfo = (fileIndex, fieldName, fieldValue) => {
    const {files} = this.state
    const updatedFiles = files.map((file, index) => {
      if (fileIndex === index) {
        file[fieldName] = fieldValue
      }
      return file
    })
    this.setState({files: updatedFiles})
  }

  render() {
    const {files, isUploading, uploadSpeed} = this.state
    const gotFiles = files.length > 0 ? true : false
    const sizeToUpload = countSizeToBeUploaded(files)
    const sizeUploaded = countSizeUploaded(files)
    const progress = sizeToUpload > 0 ? parseFloat((sizeUploaded / sizeToUpload) * 100).toFixed(2) : 0
    return (
      <div>
        <form name="gallery-upload" ref="uploadForm">
          {isUploading && <div>
            <p>Uploaded: {fileSizeFromBytes(sizeUploaded)}Mb/{fileSizeFromBytes(sizeToUpload)}Mb</p>
            <div className="in-gallery__upload-progress">
              <div className="in-gallery__upload-progress-bar" style={{width: `${progress}%`}}></div>
            </div>
            <p>Speed: {fileSizeFromBytes(uploadSpeed)}Mb/s</p>
            <p>&nbsp;</p>
          </div>}

          {!gotFiles && !isUploading &&
          <div className="in-gallery__upload-browse-files">
            <label htmlFor="selectFilesBtn" className="in-gallery__upload-browse-button">
              Add Photos...
              <input type="file"
                     id="selectFilesBtn"
                     name="galleryFiles[]"
                     multiple accept="image/*,.jpg,.png,.jpeg" ref="galleryFiles"
                     onChange={this.onSelectionChange.bind(this)}/>
            </label>
          </div>}

          {gotFiles && !isUploading &&
          <div className="in-gallery__upload-controls">
            <button className="in-gallery__button cancel" onClick={this.resetUpload}>Reset</button>
            <button className="in-gallery__button proceed"
                    onClick={this.startUploading}
                    type="submit">Upload Photos
            </button>
          </div>}

          {!isUploading && <UploadsList files={files} onChange={this.updateFileInfo}/>}

          {gotFiles && !isUploading &&
          <div className="in-gallery__upload-controls">
            <button className="in-gallery__button cancel" onClick={this.resetUpload}>Reset</button>
            <button className="in-gallery__button proceed"
                    onClick={this.startUploading}
                    type="submit">Upload Photos
            </button>
          </div>}
          <p>&nbsp;</p>
        </form>
      </div>
    )
  }
}

export default UploadPhotos
