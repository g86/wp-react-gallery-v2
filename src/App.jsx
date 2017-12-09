import React, {Component} from 'react'
import './assets/scss/app.scss'
import Photos from './components/Photos'
import FlexModal from './components/FlexModal'
import UploadPhotos from './components/UploadPhotos'
import Axios from 'axios'
import {
  formatPhotosObject,
  TEST_DELETE_URL,
  TEST_UPDATE_URL
} from './helpers/index'
// import galleryStub from '../sample-data/gallery.json'

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
    const {activePostId} = window
    console.log("Gallery ID: ", activePostId || "Not specified")
    // this.setState({photos: galleryStub.results})
  }

  componentDidMount() {
    this.preloadPhotos()
  }

  preloadPhotos = () => {
    const {photosUrl} = window
    let self = this
    return Axios.get(photosUrl)
      .then(function (res) {
        self.setState({photos: formatPhotosObject(res.data.allPhotos)})
      })
      .catch(function (err) {
        throw err
      })
  }

  onNavigation(action, event) {
    event.preventDefault()
    event.stopPropagation()

    const {activeIndex, photos} = this.state

    switch (action) {
      case "prev":
        if (photos[activeIndex - 1]) {
          this.setState({
            activePhoto: photos[activeIndex - 1],
            activeIndex: activeIndex - 1
          })
        } else {
          this.setState({
            activePhoto: photos[photos.length -1],
            activeIndex: photos.length -1
          })
        }
        break
      case "next":
        if (photos[activeIndex + 1]) {
          this.setState({
            activePhoto: photos[activeIndex + 1],
            activeIndex: activeIndex + 1
          })
        } else {
          this.setState({
            activePhoto: photos[0],
            activeIndex: 0
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
  }

  refreshPhotos = (newPhotos) => {
    this.setState({photos: newPhotos, activePhoto: null, activeIndex: -1})
  }

  deleteViaModal = (event) => {
    const {activeIndex, photos} = this.state
    this.deletePhotoByIndex(activeIndex)

  }

  deletePhotoByIndex = (index) => {
    const {photos, activeIndex, activePhoto} = this.state
    const deleteId = photos[index].id
    photos.splice(index, 1)

      if (activePhoto) {
        if (photos.length >= 1 && photos[index]) {
            this.setState({
                activePhoto: photos[index],
                photos
            })
        } else if (photos.length >= 1 && !photos[index]) {
            this.setState({
                activePhoto: photos[index - 1],
                activeIndex: index - 1,
                photos
            })
        } else {
            this.setState({activePhoto: null, activeIndex: -1, photos})
        }
      } else {
          this.setState({photos: photos})
      }

    let data = new FormData()
    data.append('photoID', deleteId)

    let config = { // multipart/form-data
      headers: ['application/form-data-encoded'] // used to enable file uploads
    }

    const deleteUrl = window.deleteUrl || TEST_DELETE_URL

    return Axios.post(deleteUrl, data, config)
      .then(function (res) {
        console.log("Deleted")

      })
      .catch(function (err) {
        console.error(err)
      })

  }

  saveUpdatedInfo = (index, info) => {
    event.preventDefault()
    event.stopPropagation()
    const {activePostId} = window
    const {photos} = this.state

    photos[index] = Object.assign(photos[index], info)

    this.setState({photos: photos})

    const saveUrl = window.updateUrl || TEST_UPDATE_URL
    let data = new FormData()
    data.append('photoID', photos[index].id)
    data.append('title', photos[index].title)
    data.append('description', photos[index].description)
    data.append('alt', photos[index].alt)
    data.append('geo', photos[index].geo)

    let config = { // multipart/form-data
      headers: ['application/form-data-encoded'] // used to enable file uploads
    }

    return Axios.post(saveUrl, data, config)
      .then(function (res) {
        console.log("Saved")
      })
      .catch(function (err) {
        console.error(err)
      })
    
  }

  render() {
    const {photos, activePhoto} = this.state
    return (
      <div className="in-gallery">
        <UploadPhotos onUpload={this.refreshPhotos}/>
        <Photos photos={photos} onClick={this.openModal.bind(this)}
                onDelete={this.deletePhotoByIndex.bind(this)}
                onSave={this.saveUpdatedInfo.bind(this)}/>
        {activePhoto &&
        <FlexModal photo={activePhoto}
                   onDelete={this.deleteViaModal.bind(this)}
                   onClose={this.closeModal.bind(this)}
                   onNavigation={this.onNavigation.bind(this)}/>}

      </div>
    )
  }
}

export default App
