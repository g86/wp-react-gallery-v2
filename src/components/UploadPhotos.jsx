import React, {Component} from 'react'
import UploadsList from './UploadsList'
import Axios from 'axios'
import {formatPhotosObject} from '../helpers/index'

class UploadPhotos extends Component {

  constructor(props) {
    super(props)
    this.state = {
      files: [],
      isUploading: false
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
    const uploadUrl = window.uploadUrl || 'http://www.impressions.lt/wp-content/plugins/include-gallery/api.php?action=upload'
    let data = new FormData()
    data.append('fileName', fileToBeUploaded.name)
    data.append('fileType', fileToBeUploaded.type)
    data.append('fileSize', fileToBeUploaded.size)
    data.append('referenceID', activePostId)
    data.append('file', fileToBeUploaded)

    this.updateFileStatus(fileToBeUploaded, 'uploading')

    let config = {
      headers: ['application/form-data-encoded'] // used to enable file uploads
    }

    let self = this

    return Axios.post(uploadUrl, data, config)
      .then(function (res) {
        console.log("Api response: ", res)
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
    let {files} = this.state
    const updatedFiles = files.map(file => {
      if (file.name === fileToBeUploaded.name) {
        file.isUploading = toStatus === 'uploading' ? true : false
        file.isUploaded = toStatus === 'uploaded' ? true : false
        file.error = toStatus === 'error' ? true : false
      }
      return file
    })
    this.setState({files: updatedFiles})
  }

  countFilesToBeUploaded = () => {
    const {files} = this.state
    return files.reduce((uploadsPending, file) => {
      if (file.isUploaded === false && file.error === false) {
        return ++uploadsPending
      } else {
        return uploadsPending
      }
    }, 0)
  }

  getNextUploadFile = () => {
    const {files} = this.state
    return files.find(file => {
      return (!file.isUploaded && !file.isUploading && !file.error) ? file : undefined
    })
  }

  uploadNextFile = () => {
    const file = this.getNextUploadFile()
    console.log('Files to upload: ', this.countFilesToBeUploaded())
    if (this.countFilesToBeUploaded() > 0 && file) {
      console.log('Uploading next file: ', file.name)
      this.uploadSingleFile(file)
    } else {
      this.setState({isUploading: false, files: []})
    }
  }

  createQueue = (files) => {
    this.setState({
      files: this.addUploadStatuses(files)
    })
  }

  addUploadStatuses = (files) => {
    return files.map(file => {
      file.isUploading = false
      file.isUploaded = false
      file.error = false
      return file
    })
  }

  startUploading = (event) => {
    event.preventDefault()
    this.setState({isUploading: true})
    this.uploadNextFile()
  }

  resetUpload = (event) => {
    this.refs.uploadForm.reset()
    event.preventDefault()
    event.stopPropagation()
    this.setState({files: []})
  }

  render() {
    const {files} = this.state
    return (
      <div>
        <form name="gallery-upload" ref="uploadForm">
          <input type="file" name="galleryFiles[]" multiple="multiple" ref="galleryFiles"
                 onChange={this.onSelectionChange.bind(this)}/>
          <button onClick={this.resetUpload}>Reset</button>
          <button type="submit" onClick={this.startUploading}>Process files</button>
        </form>
        <UploadsList files={files}/>
      </div>
    )
  }
}

export default UploadPhotos
