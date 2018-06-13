import React, {Component} from 'react'
import Photo from './Photo.jsx'

class Photos extends Component {

  renderPhotos(photos) {
    const { onClick, onDelete, onSave } = this.props
    return photos.map((photo, index)=> {
      return (
        <Photo photo={photo}
               key={`${index}_photo`}
               index={index}
               onClick={onClick}
               onDelete={onDelete}
               onSave={onSave} />
      )
    })
  }

  render() {
    const { photos } = this.props
    return (
      <section className="in-gallery_photos">
        {photos.length > 0 && this.renderPhotos(photos)}
      </section>
    )
  }
}

export default Photos
