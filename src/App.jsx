import React, {Component} from 'react'
import './assets/scss/app.scss'
import Photos from './components/Photos'
import Modal from './components/Modal'
import UploadPhotos from './components/UploadPhotos'
import Axios from 'axios'
import {formatPhotosObject} from './helpers/index'
import galleryStub from '../sample-data/gallery.json'

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
    this.setState({photos: galleryStub.results})
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
        self.setState({photos: formatPhotosObject(res.data.allPhotos)})
      })
      .catch(function (err) {
        throw err
      })
  }

  onNavigation(action, event) {
    event.preventDefault()
    event.stopPropagation()
    console.log("onNavigation(arguments): ", arguments)

    const {activeIndex, photos} = this.state

    switch (action) {
      case "prev":
        if (photos[activeIndex - 1]) {
          this.setState({
            activePhoto: photos[activeIndex - 1],
            activeIndex: activeIndex - 1
          })
        }
        break
      case "next":
        if (photos[activeIndex + 1]) {
          this.setState({
            activePhoto: photos[activeIndex + 1],
            activeIndex: activeIndex + 1
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

  deletePhotoByIndex = (index) => {
    console.log("Delete by index: " + index)
    const {photos} = this.state
    photos.splice(index, 1)
    this.setState({photos: photos})
  }

  saveUpdatedInfo = (index, info) => {
    event.preventDefault()
    event.stopPropagation()
    console.log("Save by index: " + index, info)
    const {activePostId} = window
    const {photos} = this.state

    photos[index] = Object.assign(photos[index], info)

    this.setState({photos: photos})

    const saveUrl = window.updateUrl || 'http://www.impressions.lt/wp-content/plugins/include-gallery/api.php?action=update'
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
        console.log("Api response: ", res)
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
        <Modal photo={activePhoto} onClose={this.closeModal.bind(this)} onNavigation={this.onNavigation.bind(this)}/>}
      </div>
    )
  }
}

export default App
