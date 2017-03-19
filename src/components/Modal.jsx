import React, {Component} from 'react'
import ReactDOM from 'react-dom'

class Modal extends Component {

  constructor(props) {
    super(props)
    this.state = {
      imageStyle: {
        display: 'block',
        height: 'auto',
        width: 'auto'
      }
    }
  }

  stopPropagation(event) {
    event.stopPropagation()
  }

  setImageHeight() {
    console.log("set new height")
    const imageStyle = {
      display: 'block',
      height: ReactDOM.findDOMNode(this.refs.modalContainer).clientHeight - 200 || 'auto', // some kind of weird hack..
      width: 'auto'
    }
    this.setState({imageStyle: imageStyle})
  }

  componentWillReceiveProps() {
    this.setImageHeight()
  }

  componentDidMount() {
    this.setImageHeight()
  }

  render() {
    const { photo, onClose, onNavigation } = this.props
    const { imageStyle } = this.state
    return (
      <div className="in-gallery_modal" ref="modalContainer" onClick={onClose.bind(this)}>
        <div className="in-gallery_modal-placeholder" onClick={this.stopPropagation.bind(this)}>
          <div className="in-gallery_modal-content">
            <a className="in-gallery_modal-close" onClick={onClose.bind(this)}><i className="material-icons">close</i></a>
            <a className="in-gallery_modal-nav in-gallery_modal-nav-previous"
               onClick={onNavigation.bind(this, 'prev')}><i className="material-icons">keyboard_arrow_left</i>
            </a>
            <a className="in-gallery_modal-nav in-gallery_modal-nav-next"
               onClick={onNavigation.bind(this, 'next')}><i className="material-icons">keyboard_arrow_right</i>
            </a>
            <h2 style={{position: 'absolute', opacity: 0.5, left: 30}}>{photo.title}</h2>
            <img className="in-gallery_modal-photo-img" src={photo.photoThumbnail} alt={photo.alt} style={imageStyle}/>
          </div>
        </div>
      </div>
    )
  }
}

export default Modal
