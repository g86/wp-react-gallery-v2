import React, {Component} from 'react'
import './assets/scss/app.scss'
import Photos from './components/Photos'
import Modal from './components/Modal'
import UploadPhotos from './components/UploadPhotos'
import Axios from 'axios'

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      photos: [],
      activePhoto: null,
      activeIndex: -1
    }
  }

  componentWillMount() {
    const { activePostId } = window
    console.log("Gallery ID: ", activePostId || "Not specified")
    //this.setState({photos: galleryStub.results})
  }

  componentDidMount() {
    this.preloadPhotos()
  }

  preloadPhotos = () => {
    const {photosUrl} = window
    console.log('Preloading photos? ', photosUrl)
    let self = this
    return Axios.get(photosUrl)
      .then(function (res) {
        console.log("Api response: ", res)
        self.setState({photos: res.data.allPhotos})
      })
      .catch(function (err) {
        throw err
      })
  }

  onNavigation(action, event) {
    event.preventDefault()
    event.stopPropagation()
    console.log("onNavigation(arguments): ", arguments)

    const { activeIndex, photos } = this.state

    switch (action) {
      case "prev":
        if (photos[activeIndex -1]) {
          this.setState({
            activePhoto: photos[activeIndex -1],
            activeIndex: activeIndex -1
          })
        }
        break
      case "next":
        if (photos[activeIndex +1]) {
          this.setState({
            activePhoto: photos[activeIndex +1],
            activeIndex: activeIndex +1
          })
        }
        break
      default:
        break
    }
  }
  closeModal(event) {
    event.preventDefault()
    event.stopPropagation()
    this.setState({activePhoto: null, activeIndex: -1})
  }
  openModal(id, index, event) {
    event.preventDefault()
    event.stopPropagation()

    this.setState({activePhoto: this.state.photos[index], activeIndex: index})
    console.log("openModal with arguments: ", arguments)
  }

  refreshPhotos = (newPhotos) => {
    this.setState({photos: newPhotos, activePhoto: null, activeIndex: -1})
  }

  render() {
    const { photos, activePhoto } = this.state
    return (
      <div className="in-gallery">
        <UploadPhotos onUpload={this.refreshPhotos} />
        <Photos photos={photos} onClick={this.openModal.bind(this)} />
        {activePhoto && <Modal photo={activePhoto} onClose={this.closeModal.bind(this)} onNavigation={this.onNavigation.bind(this)} />}
      </div>
    )
  }
}

export default App
