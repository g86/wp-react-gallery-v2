import React, {Component} from 'react'
import {fileSizeFromBytes} from '../helpers'

class UploadsList extends Component {
  onChange(fileIndex, event) {
    event.preventDefault()
    event.stopPropagation()
    this.props.onChange(fileIndex, event.target.name, event.target.value)
  }

  renderFilesList(files) {
    return files.map((file, index) => {
      return (
        <div key={index} className="in-gallery__file-to-upload">
          <div className="row collapse">
            <div className="columns small-12 medium-7">
              {file.preview && <img src={file.preview} alt={file.name} style={{width: '100%', height: 'auto'}}/>}
            </div>
            <div className="columns small-12 medium-5">
              <div className="in-gallery__file-summary">
                <div className="in-gallery__form">
                  <div className="in-gallery__form-input">
                    <label>Photo display name:</label>
                    <input type="text"
                           name="displayName"
                           placeholder={file.name}
                           value={file.displayName}
                           onChange={this.onChange.bind(this, index)}/>
                  </div>
                  <div className="in-gallery__form-input">
                    <label>Photo description:</label>
                    <textArea value={file.description}
                              name="description"
                              onChange={this.onChange.bind(this, index)}></textArea>
                  </div>
                  <div className="in-gallery__form-input">
                    <label>Photo alternative text:</label>
                    <input type="text"
                           name="alt"
                           value={file.alt}
                           onChange={this.onChange.bind(this, index)}/>
                  </div>
                </div>
                <div>Picture size: <strong>{fileSizeFromBytes(file.size)}Mb</strong></div>
              </div>
            </div>
          </div>
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
