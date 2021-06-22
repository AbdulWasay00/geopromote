import React, { Component } from 'react';
import '../App.css';
import { auth, firestore, storage, geopointfirestore } from "../Database/FirebaseConfig";
import styles from '../Styles/login.module.css';
import { GeoFirestore } from 'geofirestore';
import FlatList from 'flatlist-react';

//Referencing our firestore in firebase and saving that reference in a variable named GeoFirestore
const geofirestore = new GeoFirestore(firestore);
//Referencing our "Ads" collection in our firestore (Which is referenced in GeoFirestore) and saving in GeoCollection
const Adsgeocollection = geofirestore.collection('Ads');
//Referencing our Ads collection
const AdsCollection = firestore.collection('Ads');
//Referencing our User collection
const UsersCollection = firestore.collection('Users');

export default class AddAdvertisements extends Component {

  state = {
    user: null,
    Title: '',
    ShopID: '',
    Price: 0,
    Discount: '',
    Details: '',
    ImageName: '',
    Tags: [],
    Latitude: 0,
    Longitude: 0,
    Image: null,
    Ads: [],
    AdID: '',
    AddError: '',
    UploadError: '',
    DeleteError: '',
    Type: ''
  }

  componentDidMount = async () => {
    //used in render to only render if user is logged in
    var tempUser = auth.currentUser;

    if(tempUser !== null) {
      this.setState({ user: tempUser });
      await this.CheckUserType();
    } 
    await this.GetAds();

    }

  //Check Current User Type
  CheckUserType = async () => {
    var User = auth.currentUser;
    let Type = '';
    let data = [];
    const query = UsersCollection.where(geopointfirestore.FieldPath.documentId(), '==', User.uid);
    await query.get()
      .then((value) => {
        data = value.docs;
      })
      .then(() => {
        Type = data.map(item => item.data().Type);
      });
    Type = JSON.stringify(Type);
    Type = Type.replace(/["]+/g, '');
    Type = Type.replace(/[\[\]']+/g, '');
    this.setState({ Type: Type });
  }

  AddAdvertisements = async (Title, ShopID, Price, Discount, Details, ImageName, Tags, Latitude, Longitude) => {
    if (Title === '' || ShopID === '' || Price === 0 || Discount === '' || Details === '' || Tags.length === 0 || Latitude === 0 || Longitude === 0) {
      this.setState({ AddError: "Please enter all the fields" });
    }
    else if (ImageName === '') {
      this.setState({ AddError: "Image Could not be found" });
    }
    else {
      let ArrayTags = [];
      Price = parseInt(Price);
      ArrayTags = Tags.split(", ");
      Latitude = parseFloat(Latitude);
      Longitude = parseFloat(Longitude);
      let ImgURL = await storage.ref(ImageName).getDownloadURL();

      const AddAds = {
        Title: Title,
        ShopID: ShopID,
        Price: Price,
        Discount: Discount,
        Details: Details,
        Image: ImgURL,
        Tags: ArrayTags,
        coordinates: new geopointfirestore.GeoPoint(Latitude, Longitude)
      };
      //Query to add advertisements
      Adsgeocollection.add(AddAds).then(() => { this.setState({ AddError: "Advertisement Added!" }) });
    }
  }

  //Getting image from the input
  HandleImageFile = (e) => {
    let Img = null;
    Img = e.target.files[0];
    if (Img !== null) {
      this.setState({ Image: Img, UploadError: "File Selected" });
    }
    else {
      this.setState({ UploadError: "Please select a file" });
    }
  }

  //Uploading image
  UploadImage = () => {
    console.log("Button was pressed");
    let ImageFile = null;
    ImageFile = this.state.Image;
    if (ImageFile !== null) {
      var ImageRef = storage.ref().child(ImageFile.name);
      ImageRef.put(ImageFile)
        .then((snapshot) => {
          this.setState({ UploadError: "Uploaded Image" })
        })
    }
    else {
      this.setState({ UploadError: "No Image Selected" });
    }
  }

  //Getting Advertisements
  GetAds = async () => {
    let tempAds = [];
    const query = AdsCollection;
    await query.get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          tempAds.push({
            ID: doc.id,
            Title: doc.data().Title,
            Details: doc.data().Details,
            Discount: doc.data().Discount,
            Price: doc.data().Price,
            Tags: doc.data().Tags,
            Image: doc.data().Image,
            ShopID: doc.data().ShopID,
            Location: doc.data().coordinates
          })
        })
      })
      .then(() => {
        this.setState({ Ads: tempAds })
      })
  }

  //Rendering Flatlist
  renderAdvertisements = (Advertisement, ids) => {
    return (
<li key={ids} className={'listitem_1 clearfix'}>
        <div className={'listitem_id'}>{Advertisement.ID}</div>
        <div className={'listitem_name'}>{Advertisement.Title}</div>
        <div className={'listitem_number'}>{Advertisement.ShopID}</div>
      </li>
    );
  }

  //Deleting Advertisement
  DeleteAdvertisement = () => {
    let ID = this.state.AdID;
    if (ID !== '') {
      AdsCollection.doc(ID).delete()
        .then(() => {
          this.setState({ DeleteError: "Advertisement Deleted" });
        })
        .catch((error) => {
          this.setState({ DeleteError: error.message });
        })
    }
    else {
      this.setState({ DeleteError: "No ID Entered" });
    }
  }

  //Handles adding from the input to the state
  onChangeHandler = (event) => {
    let name = event.currentTarget.name;
    let value = event.currentTarget.value;
    if (name === 'Title') {
      this.setState({ Title: value });
    }
    else if (name === 'ShopID') {
      this.setState({ ShopID: value });
    }
    else if (name === 'Price') {
      this.setState({ Price: value });
    }
    else if (name === 'Discount') {
      this.setState({ Discount: value });
    }
    else if (name === 'Details') {
      this.setState({ Details: value });
    }
    else if (name === 'ImageName') {
      this.setState({ ImageName: value });
    }
    else if (name === 'Tags') {
      this.setState({ Tags: value });
    }
    else if (name === 'Latitude') {
      this.setState({ Latitude: value });
    }
    else if (name === 'Longitude') {
      this.setState({ Longitude: value });
    }
    else if (name === 'AdID') {
      this.setState({ AdID: value });
    }
  };

  render() {
    {/*setTimeout(() => {
      return (
        <h1 className='advertisements'>Loading</h1>
      );
    }, 2000);*/}
    if (this.state.user !== null) {
      if (this.state.Type === "Admin") {
        return (
          <body>
            <h1>Shop Details
            </h1>
            <div className="Cont">
            <div class="inp">
            {/* Shops Flatlist starts here */}
            <ul className={'sortable_list'}>
              <li className={'listitem clearfix header'}>
                <div className={'listitem_id'}>Id</div>
                <div className={'listitem_name'}>Title</div>
                <div className={'listitem_number'}>ShopID</div>
              </li>
             {/* Advertisement Flatlist starts here */}
              <FlatList
                list={this.state.Ads}
                renderItem={this.renderAdvertisements}
                renderWhenEmpty={() => <div>List is empty!</div>}
              />
            </ul>
            {/* Advertisement Flatlist Ends here */}
          
          <div className={styles.form}>
            <div className={'bgColor'}>
              <h2 className={styles.formTitle}>Enter Advertisement Details</h2>
              {/* Error label */}
              {this.state.AddError && <h1 className={styles.errorTitle}>{this.state.AddError}</h1>}
              {/* Add Advertisements starts here */}
                <label htmlFor="title">Title:</label>
                <input
                className={'inputs'}
                onChange={(event) => this.onChangeHandler(event)}
                  type="text"
                  name="Title" />
                <label htmlFor="shopid">Shop ID:</label>
                <input
                className={'inputs'}
                onChange={(event) => this.onChangeHandler(event)}
                  type="text"
                  name="ShopID" />
                <label htmlFor="price">Price:</label>
                <input
                className={'inputs'}
                onChange={(event) => this.onChangeHandler(event)}
                  type="text"
                  name="Price" />
                <label htmlFor="discount">Discount:</label>
                <input
                className={'inputs'}
                onChange={(event) => this.onChangeHandler(event)}
                  type="text"
                  name="Discount" />
                <label htmlFor="details">Details:</label>
                <input
                className={'inputs'}
                onChange={(event) => this.onChangeHandler(event)}
                  type="text"
                  name="Details" />
                <label htmlFor="imgname">Image Name:</label>
                <input
                className={'inputs'}
                onChange={(event) => this.onChangeHandler(event)}
                  type="text"
                  name="ImageName" />
                <label htmlFor="tags">Tags:</label>
                <input
                className={'inputs'}
                onChange={(event) => this.onChangeHandler(event)}
                  type="text"
                  name="Tags" />
                <label htmlFor="latitude">Latitude:</label>
                <input
                className={'inputs'}
                onChange={(event) => this.onChangeHandler(event)}
                  type="text"
                  name="Latitude" />
                <label htmlFor="longitude">Longitude:</label>
                <input
                className={'inputs'}
                onChange={(event) => this.onChangeHandler(event)}
                  type="text"
                  name="Longitude" />
            </div>
            <button
              className={'btnNew'}
              onClick={() => this.AddAdvertisements(this.state.Title, this.state.ShopID, this.state.Price,
                this.state.Discount, this.state.Details, this.state.ImageName,
                this.state.Tags, this.state.Latitude, this.state.Longitude)}
            >
              ADD
            </button>
            {/* Add Advertisements Ends here */}
            <br />
            <hr/>


            {/* Error label */}
            {this.state.UploadError && <h1 className={styles.errorTitle}>{this.state.UploadError}</h1>}
            {/* Upload Image starts here */}
            <div className={styles.inputDiv}>
              <label htmlFor="image">Image:</label>
              <input
                className={styles.addinputColor}
                onChange={this.HandleImageFile}
                type="file"
                name="Image" />
            </div>
            <button
              className={'btnNew'}
              onClick={() => this.UploadImage()}
            >
              UPLOAD IMAGE
            </button>
            {/* Upload Image Ends here */}
            <br />
            <hr/>

            {/* Error label */}
            {this.state.DeleteError && <h1 className={styles.errorTitle}>{this.state.DeleteError}</h1>}
            {/* Delete Advertisements starts here */}
              <label htmlFor="adid">Advertisement ID:</label>
              <input
                className={'inputs'}
                onChange={(event) => this.onChangeHandler(event)}
                type="text"
                name="AdID" />
            <button
              className={'btnNew'}
              onClick={() => this.DeleteAdvertisement()}
            >
              DELETE
            </button>
            {/* Update Advertisements Ends here */}
            <br />
            <hr/>

          </div>
          </div>
          </div>
          </body>
        );
      }
      else if (this.state.Type === "PowerUser") {
        return (
          <div className={styles.form}>
            <div className={'bgColor'}>
              <h2 className={styles.formTitle}>Enter Advertisement Details</h2>
              {/* Error label */}
              {this.state.AddError && <h1 className={styles.errorTitle}>{this.state.AddError}</h1>}
              {/* Add Advertisements starts here */}
                <label htmlFor="title">Title:</label>
                <input
                  className={'inputs'}
                  onChange={(event) => this.onChangeHandler(event)}
                  type="text"
                  name="Title" />
                <label htmlFor="shopid">Shop ID:</label>
                <input
                className={'inputs'}
                onChange={(event) => this.onChangeHandler(event)}
                  type="text"
                  name="ShopID" />
                <label htmlFor="price">Price:</label>
                <input
                className={'inputs'}
                onChange={(event) => this.onChangeHandler(event)}
                  type="text"
                  name="Price" />
                <label htmlFor="discount">Discount:</label>
                <input
                className={'inputs'}
                onChange={(event) => this.onChangeHandler(event)}
                  type="text"
                  name="Discount" />
                <label htmlFor="details">Details:</label>
                <input
                className={'inputs'}
                onChange={(event) => this.onChangeHandler(event)}
                  type="text"
                  name="Details" />
                <label htmlFor="imgname">Image Name:</label>
                <input
                className={'inputs'}
                onChange={(event) => this.onChangeHandler(event)}
                  type="text"
                  name="ImageName" />
                <label htmlFor="tags">Tags:</label>
                <input
                className={'inputs'}
                onChange={(event) => this.onChangeHandler(event)}
                  type="text"
                  name="Tags" />
                <label htmlFor="latitude">Latitude:</label>
                <input
                className={'inputs'}
                onChange={(event) => this.onChangeHandler(event)}
                  type="text"
                  name="Latitude" />
                <label htmlFor="longitude">Longitude:</label>
                <input
                className={'inputs'}
                onChange={(event) => this.onChangeHandler(event)}
                  type="text"
                  name="Longitude" />
            </div>
            <button
              className={'btnNew'}
              onClick={() => this.AddAdvertisements(this.state.Title, this.state.ShopID, this.state.Price,
                this.state.Discount, this.state.Details, this.state.ImageName,
                this.state.Tags, this.state.Latitude, this.state.Longitude)}
            >
              ADD
            </button>
          </div>
        );
      }
      else {
        return (
          <h1 className='advertisements'>You do not have access to this. Please Login</h1>
        );
      }
    }
    else {
      return (
        <h1 className='advertisements'>You do not have access to this. Please Login</h1>
      );
    }
  }
}
