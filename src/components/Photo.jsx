import React, {Component} from 'react'

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
    // this.props.onEdit(photoIndex);
    console.log("I want to edit " + photoIndex)
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
    const { modifiedPhoto } = this.state
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
    const {isEditing, modifiedPhoto} = this.state
    const photoHasGeo = ( photo.geo !== '0,0' && photo.geo !== '' )
    const isDisabled = false

    return (
      <div className="in-gallery_photo" key={`${index}_${photo.id}`}>
        <div className="row collapse">
          <div className="column small-6 medium-5 large-4 in-gallery_photo-column">
            <a className="in-gallery_photo-link" onClick={onClick.bind(this, photo.id, index)}>
              <img className="in-gallery_photo-img" src={photo.photoThumbnail} alt={photo.alt}/>
            </a>
          </div>
          <div className="column small-6 medium-7 large-8">
            {isEditing ? <div className="in-gallery_info-column">
              <div className="in-gallery_photo-info">
                <div className="in-gallery_photo-title">Editing: {photo.title}</div>
                <div className="in-gallery__form">
                  <div className="in-gallery__form-input">
                    <label>Photo display name:</label>
                    <input type="text"
                           name="title"
                           value={modifiedPhoto.title}
                           onChange={this.onChange.bind(this)}/>
                  </div>
                  <div className="in-gallery__form-input">
                    <label>Photo description:</label>
                    <textArea value={modifiedPhoto.description}
                              name="description"
                              onChange={this.onChange.bind(this)}></textArea>
                  </div>
                  <div className="in-gallery__form-input">
                    <label>Photo alternative text:</label>
                    <input type="text"
                           name="alt"
                           value={modifiedPhoto.alt}
                           onChange={this.onChange.bind(this)}/>
                  </div>
                  <div className="in-gallery__form-input">
                    <label>GEO coordinates:</label>
                    <input type="text"
                           name="geo"
                           value={modifiedPhoto.geo}
                           onChange={this.onChange.bind(this)}/>
                  </div>
                </div>
                <div className="in-gallery_photo-controls">
                  <button className="in-gallery__button cancel" onClick={this.cancelEdit.bind(this, index)}>Cancel</button>
                  <button className="in-gallery__button proceed" onClick={this.onSave.bind(this, index, modifiedPhoto)}>Save</button>
                </div>
              </div>
            </div> : <div className="in-gallery_info-column">
              <div className="in-gallery_photo-info">
                <div className="in-gallery_photo-title">{photo.title || 'No title...'}</div>
                <div className="in-gallery_photo-description">
                  <span className="in-gallery_caption">Description:</span> {photo.description}</div>
                <div className="in-gallery_photo-alt">
                  <span className="in-gallery_caption">URL friendly name:</span> {photo.alt}</div>
                <div className="in-gallery_photo-gps">
                  <span className="in-gallery_caption">GEO:</span> {photoHasGeo && this.renderGoogleMaps(photo.geo)}
                </div>
              </div>
              <div className="in-gallery_photo-controls">
                <button className="in-gallery__button proceed" onClick={this.editPhoto.bind(this, index, photo)}>Edit</button>
                <button className="in-gallery__button delete" onClick={this.onDelete.bind(this, index)}>Delete</button>
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
