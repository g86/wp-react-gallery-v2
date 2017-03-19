import React, {Component} from 'react'

class Photo extends Component {

  render() {
    const { photo, index, onClick } = this.props
    return (
      <div className="in-gallery_photo" key={`${index}_${photo.id}`}>
        <div className="in-gallery_photo-title">{photo.title}</div>
        <a className="in-gallery_photo-link" onClick={onClick.bind(this, photo.id, index)}>
          <img className="in-gallery_photo-img" src={photo.photoThumbnail || photo.photo_path} alt={photo.alt}/>
        </a>
      </div>
    )
  }
}

export default Photo
