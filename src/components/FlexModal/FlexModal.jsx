import React, {Component} from 'react'
import {RESOURCE_HOST} from '../../config'
import Loader from '../../components/Loader'
import {getSizePath} from '../../lib/helpers'

class FlexModal extends Component {

  state = {
    imageStyle: {},
    imageLoaded: false
  }

  saveScrollY = 0
  flexModal = null
  flexImage = null

  setImageHeight(event) {

    /*const mW = this.flexModal.clientWidth
    const mH = this.flexModal.clientHeight*/

    const iW = this.flexImage.clientWidth
    const iH = this.flexImage.clientHeight
    const scrW = window.innerWidth
    const scrH = window.innerHeight
    const iRatio = iW / iH
    const scrRatio = scrW / scrH
    const imageStyles = {
      limitWidth: {
        maxWidth: scrW - 30,
        // width: '100%',
        height: 'auto'
      },
      limitHeight: {
        maxHeight: scrH - 30,
        // height: '100%',
        width: 'auto'
      }
    }

    this.setState({
      imageStyle: scrRatio > iRatio ? imageStyles.limitHeight : imageStyles.limitWidth,
      imageLoaded: true
    })
  }

  stopPropagation(event) {
    event.stopPropagation()
  }

  initModalControls() {
    this.saveScrollY = window.scrollY
    document.addEventListener('keydown', this.keyDownListener)
    document.body.style = 'overflow: hidden;'
    document.documentElement.style = 'overflow: hidden;'
    // what about on window resize
  }

  destructModalControls() {
    document.removeEventListener("keydown", this.keyDownListener)
    document.body.style = {}
    document.documentElement.style = {}
    window.scroll(0, this.saveScrollY)
  }

  componentDidMount() {
    const {photo} = this.props

    if (photo) {
      this.initModalControls()
    }
  }

  componentWillReceiveProps(nextProps) {
    const {photo} = nextProps
    const prevPhoto = this.props.photo

    if (!prevPhoto && photo) {
      this.initModalControls()
    }
    if (prevPhoto && !photo) {
      this.destructModalControls()
    }
  }

  componentWillUnmount() {
    const {photo} = this.props

    if (photo) {
      this.destructModalControls()
    }
  }

  keyDownListener = (event) => {
    this.handleKeyDown(event)
  }

  handleNavButtonClick = (action, event) => {
    event.persist()

    if (!this.state.imageLoaded) {
      event.preventDefault()
      event.stopPropagation()
      return
    }
    this.setState({imageLoaded: false})
    this.props.onNavigation(action, event)
  }

  handleKeyDown(event) {
    const {onClose, onNavigation, onDelete} = this.props
    event.preventDefault = () => {}
    event.stopPropagation = () => {}

    if (!this.state.imageLoaded) {
      return
    }

    switch (event.code) {
      case "ArrowRight":
        this.setState({imageLoaded: false})
        onNavigation('next', event)
        break
      case "ArrowLeft":
        this.setState({imageLoaded: false})
        onNavigation('prev', event)
        break
      case "Escape":
      case "Enter":
        onClose(event)
        break
      case "Delete":
      case "Backspace":
        onDelete(event)
        break
      default:
        break
    }
  }

  render() {
    const {onClose, photo, onNavigation, nextPhotoPreload} = this.props
    const {imageStyle, imageLoaded} = this.state

    if (!photo) {
      return null
    }

    const preloadImgSrc = nextPhotoPreload && getSizePath(`${RESOURCE_HOST}${nextPhotoPreload.photoPath}`,'large') || null
    const imgSrc = getSizePath(`${RESOURCE_HOST}${photo.photoPath}`,'large')

    return (
      <div className="in-flexModal" ref={(ref) => {this.flexModal = ref}}>
        <div className="in-flexModalOverlay" onClick={onClose.bind(this)}>

          {!imageLoaded && <div className="in-flexModalImageLoader">
            <Loader overlayMode={true} />
          </div>}

          <div className="in-flexModalBox" onClick={this.stopPropagation.bind(this)}>
            <a className="in-flexModalNavClose" onClick={onClose.bind(this)}><i className="material-icons">close</i></a>
            <a className="in-flexModalNavArrow in-flexModalNavArrowLeft"
               onClick={this.handleNavButtonClick.bind(this, 'prev')}>
              <span className="in-flexModalArrowCircle">
                <i className="material-icons">keyboard_arrow_left</i>
              </span>
            </a>
            <a className="in-flexModalNavArrow in-flexModalNavArrowRight"
               onClick={this.handleNavButtonClick.bind(this, 'next')}>
              <span className="in-flexModalArrowCircle">
                <i className="material-icons">keyboard_arrow_right</i>
              </span>
            </a>
            {photo.title && <div className="in-flexModalImageTitle">{photo.title}</div>}
            <img className={'in-flexImage' + (!imageLoaded && ' in-flexImage-loading')}
                 src={imgSrc}
                 style={imageStyle}
                 alt={photo.alt}
                 onLoad={this.setImageHeight.bind(this)}
                 ref={(ref) => {this.flexImage = ref}} />
            {preloadImgSrc &&
            <img style={{width: 1, height: 1, opacity: 0, position: 'absolute', bottom: 0, left: 0}}
                 src={preloadImgSrc}
            />
            }
          </div>
        </div>
      </div>
    )
  }
}

export default FlexModal
