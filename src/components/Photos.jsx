import React, {Component} from 'react'
import Photo from './Photo.jsx'

class Photos extends Component {

  renderPhotos(photos) {
    const { onClick } = this.props
    return photos.map((photo, index)=> {
      return (
        <Photo photo={photo} key={index} index={index} onClick={onClick} />
      )
    })
  }

  render() {
    const { photos } = this.props
    return (
      <section className="in-gallery_photos">
        {this.renderPhotos(photos)}
      </section>
    )
  }
}

export default Photos
