import React, {Component} from 'react'
import ReactDOM from 'react-dom'

class FlexModal extends Component {

  constructor(props) {
    super(props)
    this.state = {
      imageStyle: {}
    }
  }

  setImageHeight() {
    console.log("Recalculate image sizing model")

    const cW = ReactDOM.findDOMNode(this.refs.flexModal).clientWidth
    const cH = ReactDOM.findDOMNode(this.refs.flexModal).clientHeight

    const iW = ReactDOM.findDOMNode(this.refs.flexImage).clientWidth
    const iH = ReactDOM.findDOMNode(this.refs.flexImage).clientHeight

    const mRatio = cW / cH
    const iRatio = iW / iH

    console.log(`mRatio: ${parseFloat(mRatio).toFixed(2)} iRatio: ${parseFloat(iRatio).toFixed(2)}`)
    console.log(`iW: ${iW} iH: ${iH}`)
    console.log(`cW: ${cW} cH: ${cH}`)
    console.log("client aspect ratio: ", cW / cH > 1 ? 'landscape' : 'portrait')
    console.log("image aspect ratio: ", iW / iH > 1 ? 'landscape' : 'portrait')

    console.log(mRatio > iRatio ? 'limit height' : 'limit width')

    const imageStyles = {
      limitWidth: {
        maxWidth: cW,
        width: '100%',
        height: 'auto'
      },
      limitHeight: {
        maxHeight: cH,
        height: '100%',
        width: 'auto'
      }
    }

    this.setState({imageStyle: mRatio > iRatio ? imageStyles.limitHeight : imageStyles.limitWidth})
  }

  stopPropagation(event) {
    event.stopPropagation()
  }

  componentWillReceiveProps() {
    this.setImageHeight()
  }

  componentDidMount() {
    this.setImageHeight()
    document.addEventListener('keydown', this.keyDownListener)
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.keyDownListener);
  }

  keyDownListener = (event) => {
    this.handleKeyDown(event)
  }

  handleKeyDown(event) {
    const {onClose, onNavigation} = this.props
    event.preventDefault = () => {}
    event.stopPropagation = () => {}
    switch (event.code) {
      case "ArrowRight":
        onNavigation('next', event)
        break
      case "ArrowLeft":
        onNavigation('prev', event)
        break
      case "Escape":
        onClose(event)
        break
      // delete with del and edit feature with f2
      default:
        break
    }
  }

  render() {
    const {onClose, photo, onNavigation} = this.props
    const {imageStyle} = this.state
    return (
      <div className="in-flexModal" ref="flexModal">
        <div className="in-flexModalOverlay" onClick={onClose.bind(this)}>
          <div className="in-flexModalBox" onClick={this.stopPropagation.bind(this)}>
            <a className="in-flexModalNavClose" onClick={onClose.bind(this)}><i className="material-icons">close</i></a>
            <a className="in-flexModalNavArrow in-flexModalNavArrowLeft"
               onClick={onNavigation.bind(this, 'prev')}><i className="material-icons">keyboard_arrow_left</i>
            </a>
            <a className="in-flexModalNavArrow in-flexModalNavArrowRight"
               onClick={onNavigation.bind(this, 'next')}><i className="material-icons">keyboard_arrow_right</i>
            </a>
            <div className="in-flexModalImageTitle">{photo.title}</div>

            <img className="in-flexImage"
                 src={photo.photoThumbnail}
                 style={imageStyle}
                 alt={photo.alt}
                 ref="flexImage"/>
          </div>
        </div>
      </div>
    )
  }
}

export default FlexModal
