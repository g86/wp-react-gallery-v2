import React, {Component} from 'react'
import deleteIcon from '../assets/icons/ic_delete_black_24px.svg'
import undoIcon from '../assets/icons/ic_undo_black_24px.svg'
import {RESOURCE_HOST} from '../config'
import {getSizePath} from '../helpers'
import {Parser} from 'expr-eval'

const MathParser = new Parser()

const executeMath = (expression) => {
  try {
    return MathParser.evaluate(expression)
  } catch (error) {
    console.log('Aperture value not available')
    return null
  }
}

class Photo extends Component {
  state = {
    isEditing: false,
    modifiedPhotoIndex: -1,
    modifiedPhoto: {}
  }

  renderGoogleMaps(coordinates) {
    const url = `https://www.google.co.uk/maps/place/${coordinates}`
    return (
      <a href={url} target="_blank">See on map &raquo;</a>
    )
  }

  editPhoto = (photoIndex, photo, event) => {
    event.preventDefault()
    event.stopPropagation()
    this.setState({isEditing: true, modifiedPhoto: photo, modifiedPhotoIndex: photoIndex})
  }

  cancelEdit = (index, event) => {
    event.preventDefault()
    event.stopPropagation()
    this.setState({
      isEditing: false,
      modifiedPhoto: {},
      modifiedPhotoIndex: -1
    })
  }

  onChange = (event) => {
    event.preventDefault()
    event.stopPropagation()
    const {modifiedPhoto} = this.state
    modifiedPhoto[event.target.name] = event.target.value
    this.setState(modifiedPhoto)
  }

  onSave = (index, modifiedPhoto, event) => {
    event.preventDefault()
    event.stopPropagation()
    this.props.onSave(index, modifiedPhoto)
    this.resetState()
  }

  onDelete = (index, event) => {
    event.preventDefault()
    event.stopPropagation()
    if (confirm('Are you sure?')) {
      this.props.onDelete(index)
    }
  }

  resetState = () => {
    this.setState({
      isEditing: false,
      modifiedPhotoIndex: -1,
      modifiedPhoto: {}
    })
  }

  render() {
    const {photo, index, onClick, onDelete} = this.props
    const {isEditing, modifiedPhoto, draggablePhotoStyle} = this.state
    const photoHasGeo = ( photo.geo !== '0,0' && photo.geo !== '' )
    const setDeleteIcon = () => { return {__html: deleteIcon}}
    const setUndoIcon = () => { return {__html: undoIcon}}
    const imgSrc = getSizePath(`${RESOURCE_HOST}${photo.photoPath}`,'small')

    return (
      <div className="in-gallery_photo" key={`${index}_${photo.id}`}>
        <div className="row collapse">
          <div className="column small-12 medium-5 in-gallery_photo-column">
            <a className="in-gallery_photo-link" onClick={onClick.bind(this, photo.id, index)}>
              <img className="in-gallery_photo-img" src={imgSrc} alt={photo.alt}/>
            </a>
          </div>
          <div className="column small-12 medium-7">
            {isEditing ? <div className="in-gallery_info-column">
              <div className="in-gallery_photo-info">
                {/*<div className="in-gallery_photo-title">Editing: {photo.title}</div>*/}
                <div className="in-gallery__form">
                  <div className="in-gallery__form-input">
                    <input type="text"
                           name="title"
                           placeholder="Photo title"
                           value={modifiedPhoto.title}
                           onChange={this.onChange.bind(this)}/>
                  </div>
                  <div className="in-gallery__form-input">
                    <textArea value={modifiedPhoto.description}
                              name="description"
                              placeholder="Description"
                              onChange={this.onChange.bind(this)}></textArea>
                  </div>
                  <div className="in-gallery__form-input">
                    <input type="text"
                           name="alt"
                           placeholder="ALT text"
                           value={modifiedPhoto.alt}
                           onChange={this.onChange.bind(this)}/>
                  </div>
                  <div className="in-gallery__form-input">
                    <input type="text"
                           name="geo"
                           placeholder="GEO coordinates"
                           value={modifiedPhoto.geo}
                           onChange={this.onChange.bind(this)}/>
                  </div>
                </div>
                <div className="in-gallery_photo-controls">
                  <a className="in-gallery__button-link cancel" onClick={this.cancelEdit.bind(this, index)}>
                    <i dangerouslySetInnerHTML={setUndoIcon()}></i>
                    Cancel</a>
                  <button className="in-gallery__button proceed" onClick={this.onSave.bind(this, index, modifiedPhoto)}>Save</button>
                </div>
              </div>
            </div> : <div className="in-gallery_info-column">
              <div className="in-gallery_photo-info">
                <div className="in-gallery_photo-title">{photo.title || 'No title...'}</div>
                <div className="in-gallery_photo-description">
                  <span className="in-gallery_caption">Description:</span> {photo.description}
                </div>
                <div className="in-gallery_photo-description">
                  <span className="in-gallery_caption">Details:</span><br />
                  Size: {photo.width}x{photo.height}<br />
                  Camera: {String(photo.exifCameraMake).toUpperCase()} {photo.exifCameraModel}<br />
                  ISO: {photo.exifIso} |
                  Aperture: f{executeMath(photo.exifAperture)} |
                  Shutter: {photo.exifShutter} |
                  Focal length: {photo.exifFocalLength}mm<br />
                </div>
                <div className="in-gallery_photo-alt">
                  <span className="in-gallery_caption">URL friendly name (alt):</span> {photo.alt}</div>
                <div className="in-gallery_photo-gps">
                  <span className="in-gallery_caption">GEO:</span> {photoHasGeo && this.renderGoogleMaps(photo.geo)}
                </div>
                <div className="in-gallery_photo-controls">
                  <a className="in-gallery__button-link delete" onClick={this.onDelete.bind(this, index)}>
                    <i dangerouslySetInnerHTML={setDeleteIcon()}></i>
                    Delete</a>
                  <button className="in-gallery__button proceed" onClick={this.editPhoto.bind(this, index, photo)}>Edit</button>
                </div>
              </div>

            </div>
            }
          </div>
        </div>
      </div>
    )
  }
}

export default Photo
