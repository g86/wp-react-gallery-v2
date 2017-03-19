import React, {Component} from 'react'
import classnames from 'classnames'
import {fileSizeFromBytes} from '../helpers'
import './UploadsList.scss';

class UploadsList extends Component {
  renderFilesList(files) {
    return files.map((file, index) => {
      // console.log("file: ", file)
      const classNames = classnames({
        'in-gallery__file-to-upload': true,
        isUploading: file.isUploading,
        isUploaded: file.isUploaded,
        hasError: file.error
      })

      return (
        <div key={index} className={classNames}>
          <div className="row collapse">
            <div className="columns small-12 medium-8">
              {file.preview && <img src={file.preview} alt={file.name} style={{width: '100%', height: 'auto'}}/>}
            </div>
            <div className="columns small-12 medium-4">
              <div className="in-gallery__file-summary">
                <h2>{file.name}</h2>
                <p>
                  Modified: {file.lastModified}<br />
                  File type: <strong>{file.type}</strong><br />
                  Picture size: <strong>{fileSizeFromBytes(file.size)}Mb</strong>
                </p>
                <hr />
                <label>Photo display name:</label><br />
                <input type="text" defaultValue={file.name} /><br />
                <label>Photo description:</label><br />
                <textArea defaultValue={file.name}></textArea><br />
                <label>Photo alternative text:</label><br />
                <input type="text" defaultValue={file.name} /><br />
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
