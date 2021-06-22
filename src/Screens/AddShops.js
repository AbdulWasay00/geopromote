import React, { Component } from 'react';
import '../App.css';
import { auth, firestore, storage, geopointfirestore } from "../Database/FirebaseConfig";
import styles from '../Styles/login.module.css';
import { GeoFirestore } from 'geofirestore';
import FlatList from 'flatlist-react';

//Referencing our firestore in firebase and saving that reference in a variable named GeoFirestore
const geofirestore = new GeoFirestore(firestore);
//Referencing our "Ads" collection in our firestore (Which is referenced in GeoFirestore) and saving in GeoCollection
const Shopsgeocollection = geofirestore.collection('Shops');
//Referencing our Ads collection
const ShopsCollection = firestore.collection('Shops');
//Referencing our User collection
const UsersCollection = firestore.collection('Users');

export default class AddShops extends Component {

  state = {
    user: null,
    Name: '',
    PhoneNumber: '',
    QRCodeString: '',
    Tags: [],
    Latitude: 0,
    Longitude: 0,
    Image: null,
    Shops: [],
    ShopID: '',
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
    this.GetShops();
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

  AddShops = async (Name, PhoneNumber, QRCodeString, Tags, Latitude, Longitude) => {
    if (Name === '' || PhoneNumber === '' || QRCodeString === '' || Tags.length === 0 || Latitude === 0 || Longitude === 0) {
      this.setState({ AddError: "Please enter all the fields" });
    }
    else {
      let ArrayTags = [];
      ArrayTags = Tags.split(", ");
      Latitude = parseFloat(Latitude);
      Longitude = parseFloat(Longitude);

      const AddShops = {
        Name: Name,
        PhoneNumber: PhoneNumber,
        QRCodeString: QRCodeString,
        Tags: ArrayTags,
        coordinates: new geopointfirestore.GeoPoint(Latitude, Longitude)
      };
      //Query to add Shops
      Shopsgeocollection.add(AddShops).then(() => { this.setState({ AddError: "Shop Added!" }) });
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

  //Getting Shops
  GetShops = async () => {
    let tempShops = [];
    const query = ShopsCollection;
    await query.get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          tempShops.push({
            ID: doc.id,
            Name: doc.data().Name,
            PhoneNumber: doc.data().PhoneNumber,
            QRCodeString: doc.data().QRCodeString,
            Tags: doc.data().Tags,
            Location: doc.data().coordinates
          })
        })
      })
      .then(() => {
        this.setState({ Shops: tempShops })
      })
  }

  //Rendering Flatlist
  renderShops = (Shop, ids) => {
    return (
      <li key={ids} className={'listitem_1 clearfix'}>
        <div className={'listitem_id'}>Shop ID: {Shop.ID}</div>
        <div className={'listitem_name'}>Shop Name: {Shop.Name}</div>
        <div className={'listitem_number'}>PhoneNumber: {Shop.PhoneNumber}</div>
      </li>
    );
  }

  //Deleting Shops
  DeleteShop = () => {
    let ID = this.state.ShopID;
    if (ID !== '') {
      ShopsCollection.doc(ID).delete()
        .then(() => {
          this.setState({ DeleteError: "Shop Deleted" });
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
    if (name === 'Name') {
      this.setState({ Name: value });
    }
    else if (name === 'PhoneNumber') {
      this.setState({ PhoneNumber: value });
    }
    else if (name === 'QRCodeString') {
      this.setState({ QRCodeString: value });
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
    else if (name === 'ShopID') {
      this.setState({ ShopID: value });
    }
  };

  render() {
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
                <div className={'listitem_name'}>Name</div>
                <div className={'listitem_number'}>Number</div>
              </li>
              <FlatList
                list={this.state.Shops}
                renderItem={this.renderShops}
                renderWhenEmpty={() => <div>List is empty!</div>}
              />
            </ul>
            {/* Shops Flatlist Ends here */}
          <div className={styles.form}>
            <h2 className={styles.formTitle}>Enter Shop Details</h2>
            {/* Error label */}
            {this.state.AddError && <h1 className={styles.errorTitle}>{this.state.AddError}</h1>}
            {/* Add Shops starts here */}
              <label htmlFor="name">Name:</label>
              <input
                className={'inputs'}
                onChange={(event) => this.onChangeHandler(event)}
                type="text"
                name="Name" />
              <label htmlFor="phonenumber">Phone Number:</label>
              <input
                className={'inputs'}
                onChange={(event) => this.onChangeHandler(event)}
                type="text"
                name="PhoneNumber" />
              <label htmlFor="qrcodestring">QRCode String:</label>
              <input
                className={'inputs'}
                onChange={(event) => this.onChangeHandler(event)}
                type="text"
                name="QRCodeString" />
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
            <button
              className={'btnNew'}
              onClick={() => this.AddShops(this.state.Name, this.state.PhoneNumber, this.state.QRCodeString,
                this.state.Tags, this.state.Latitude, this.state.Longitude)}
            >
              ADD
            </button>
            {/* Add Shops Ends here */}
            <br />
            <hr/>


            {/* Error label */}
            {this.state.UploadError && <h1 className={styles.errorTitle}>{this.state.UploadError}</h1>}
            {/* Upload Image starts here */}
              <label htmlFor="image">Image:</label>
              <input
                onChange={this.HandleImageFile}
                type="file"
                name="Image" />
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
            {/* Delete Shops starts here */}
              <label htmlFor="shopid">Shop ID:</label>
              <input
                className={'inputs'}
                onChange={(event) => this.onChangeHandler(event)}
                type="text"
                name="ShopID" />
            <button
              className={'btnNew'}
              onClick={() => this.DeleteShop()}
            >
              DELETE
            </button>
            {/* Delete Shops Ends here */}
            <br />
            <hr/>

            
</div></div>
          </div>
          </body>
        );
      }
      else if (this.state.Type === "PowerUser") {
        return (
          <h1 className='shops'>You do not have access to this. Please Login</h1>
        );
      }
      else {
        return (
          <h1 className='shops'>You do not have access to this. Please Login</h1>
        );
      }
    }
    else {
      return (
        <h1 className='shops'>You do not have access to this. Please Login</h1>
      );
    }
  }
}