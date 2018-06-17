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
import galleryMock from '../sample-data/gallery.json'

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
    console.log("Gallery ID: ", activePostId || "No Gallery ID available")

    if (!activePostId) {
      this.setState({photos: galleryMock.galleryPhotos})
    }
  }

  componentDidMount() {
    this.preloadPhotos()
  }

  preloadPhotos = () => {
    const {photosUrl} = window
    let self = this
    return Axios.get(photosUrl)
      .then(function (res) {
        console.log('preloadPhotos', {res})

        try {
          const photos = formatPhotosObject(res.data.galleryPhotos)
          self.setState({photos})
        } catch (error) {
          console.error('Getting photos failed: ', error)
        }

      })
      .catch(function (err) {
        throw err
      })
  }

  getNextPhoto(photos, index) {
    if (photos[index+1]) {
      return photos[index+1]
    }
    return null
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
            activeIndex: activeIndex + 1,
            nextPhoto: this.getNextPhoto(photos, activeIndex+1)
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

    this.setState({
      activePhoto: this.state.photos[index],
      activeIndex: index,
      nextPhoto: this.getNextPhoto(this.state.photos, index)
    })
  }

  refreshPhotos = (newPhotos) => {
    this.setState({photos: newPhotos, activePhoto: null, activeIndex: -1})
  }

  deleteViaModal = (event) => {
    const {activeIndex, photos} = this.state
    if (confirm(`Delete Photo #${activeIndex}?`)) {
      this.deletePhotoByIndex(activeIndex)
    }
  }

  deletePhotoByIndex = (index) => {
    const {photos, activePhoto} = this.state
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
      headers: ['application/form-data-encoded']
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

    photos[index] = {
      ...photos[index],
      ...info
    }

    this.setState({photos: photos})

    const saveUrl = window.updateUrl || TEST_UPDATE_URL
    let formData = new FormData()
    formData.append('photoID', photos[index].id)
    formData.append('title', photos[index].title || '')
    formData.append('description', photos[index].description || '')
    formData.append('alt', photos[index].alt || '')
    formData.append('geo', photos[index].geo || '')

    const config = { // multipart/form-data
      headers: ['application/form-data-encoded'] // used to enable file uploads
    }

    return Axios.post(saveUrl, formData, config)
      .then(function (res) {
        console.log("Saved")
      })
      .catch(function (err) {
        console.error(err)
      })
  }

  handleReload = (event) => {
    event.preventDefault()
    this.preloadPhotos()
  }

  render() {
    const {photos, activePhoto, nextPhoto} = this.state
    return (
      <div className="in-gallery">
        <small><a href='#' onClick={this.handleReload}>Reload gallery</a></small>
        <UploadPhotos onUpload={this.refreshPhotos}/>
        <Photos photos={photos} onClick={this.openModal.bind(this)}
                onDelete={this.deletePhotoByIndex.bind(this)}
                onSave={this.saveUpdatedInfo.bind(this)}/>
        {activePhoto &&
        <FlexModal photo={activePhoto}
                   nextPhotoPreload={nextPhoto}
                   onDelete={this.deleteViaModal.bind(this)}
                   onClose={this.closeModal.bind(this)}
                   onNavigation={this.onNavigation.bind(this)}/>}

      </div>
    )
  }
}

export default App
