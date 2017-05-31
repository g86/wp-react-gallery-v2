import React, {Component} from 'react'
import classnames from 'classnames'
import {fileSizeFromBytes} from '../helpers'

class UploadsList extends Component {
  onChange(fileIndex, event) {
    event.preventDefault()
    event.stopPropagation()
    this.props.onChange(fileIndex, event.target.name, event.target.value)
  }

  renderFilesList(files) {
    return files.map((file, index) => {
      // console.log("file: ", file)
      const classNames = classnames({
        'in-gallery__file-to-upload': true,
        isUploading: file.isUploading,
        isUploaded: file.isUploaded,
        hasError: file.error
      })

      const isDisabled = file.isUploading ? 'disabled' : '';

      return (
        <div key={index} className={classNames}>
          {file.isUploading && <div className="in-gallery__notification info">File is uploading...</div>}
          {file.isUploaded &&
          <div className="in-gallery__notification success">File has been successfully uploaded.</div>}
          {file.error && <div className="in-gallery__notification error">File has been successfully uploaded.</div>}
          {!file.isUploaded && <div className="row collapse">
            <div className="columns small-12 medium-7">
              {file.preview && <img src={file.preview} alt={file.name} style={{width: '100%', height: 'auto'}}/>}
            </div>
            <div className="columns small-12 medium-5">
              <div className="in-gallery__file-summary">
                <blockquote style={{display: 'none'}}>
                  Filename: {file.name}<br />
                  Modified: {file.lastModified}<br />
                  File type: <strong>{file.type}</strong><br />
                  Picture size: <strong>{fileSizeFromBytes(file.size)}Mb</strong>
                </blockquote>
                <div className="in-gallery__form">
                  <div className="in-gallery__form-input">
                    <label>Photo display name:</label>
                    <input type="text"
                           name="displayName"
                           placeholder={file.name}
                           value={file.displayName}
                           disabled={isDisabled}
                           onChange={this.onChange.bind(this, index)}/>
                  </div>
                  <div className="in-gallery__form-input">
                    <label>Photo description:</label>
                    <textArea value={file.description}
                              name="description"
                              onChange={this.onChange.bind(this, index)}
                              disabled={isDisabled}></textArea>
                  </div>
                  <div className="in-gallery__form-input">
                    <label>Photo alternative text:</label>
                    <input type="text"
                           name="alt"
                           value={file.alt}
                           onChange={this.onChange.bind(this, index)}
                           disabled={isDisabled}/>
                  </div>
                </div>
              </div>
            </div>
          </div>}
        </div>
      )
    })
  }

  render() {
    const {files} = this.props
    return (
      <div className="in-gallery__files-to-upload">
        {this.renderFilesList(files)}
      </div>
    )
  }
}

export default UploadsList
