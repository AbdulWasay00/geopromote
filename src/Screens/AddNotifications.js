import React, { Component } from 'react';
import '../App.css';
import { auth, firestore, geopointfirestore } from "../Database/FirebaseConfig";
import styles from '../Styles/login.module.css';
import * as emailjs from 'emailjs-com'
emailjs.init("user_uYHL33B3Se8RKLPjdgH0T");

//Referencing our User collection
const UsersCollection = firestore.collection('Users');

export default class AddNotifications extends Component {

  state = {
    user: null,
    Email: '',
    Tags: [],
    SubMessage: '',
    BodMessage: '',
    UserIDs: [],
    Error: '',
    Type: ''
  }

  componentDidMount = async () => {
    //used in render to only render if user is logged in
    var tempUser = auth.currentUser;
    if(tempUser !== null) {
      this.setState({ user: tempUser });
      await this.CheckUserType();
    } 
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
    this.setState({Type: Type});
  }

  //Getting IDs of users Interested in these tags
  GetSelectUsersIDs = async () => {
    let data = [];
    let IDs = [];
    let ArrayTags = [];
    ArrayTags = this.state.Tags.split(", ");
    const query = UsersCollection.where('Interests', 'array-contains-any', ArrayTags);
    await query.get()
      .then((value) => {
        data = value.docs;
      })
      .then(() => {
        IDs = data.map(item => "" + item.id + "");
      })
      .then(() => {
        this.setState({ UserIDs: IDs });
      })
  }

  SendingEmailNotif = async () => {
    if (this.state.SubMessage === '' || this.state.BodMessage === '' || this.state.Tags.length === 0) {
      this.setState({ Error: "Enter all the required data" });
    }
    else {
      await this.GetSelectUsersIDs();
      let IDsArray = this.state.UserIDs;
      for (let i = 0; i < IDsArray.length; i++) {
        //Getting Users Email
        let Email = "";
        let data = [];
        const query = UsersCollection.doc(IDsArray[i]);
        await query.get()
          .then(value => {
            data = value.data();
          })
        Email = data.Email;

        //Sending Email
        emailjs.send("service_v00yp6a", "template_kle8ra3", {
          Subject_Message: this.state.SubMessage,
          Message: this.state.BodMessage,
          Email_To: Email
        })
          .then(() => {
            this.setState({ Error: "Email Sent Successfully" });
          })
          .catch((error) => {
            this.setState({ Error: error.message })
          })
      }
    }
  }

  //Handles adding from the input to the state
  onChangeHandler = (event) => {
    let name = event.currentTarget.name;
    let value = event.currentTarget.value;
    if (name === 'SubMessage') {
      this.setState({ SubMessage: value });
    }
    else if (name === 'BodMessage') {
      this.setState({ BodMessage: value });
    }
    else if (name === 'Tags') {
      this.setState({ Tags: value });
    }
  };

  render() {
    if (this.state.user !== null) {
      if (this.state.Type === "Admin") {
        return (
          <body>
          <div className={styles.form}>
            <h2 className={styles.formTitle}>Enter Shop Details</h2>
            {/* Error label */}
            {this.state.Error && <h1 className={styles.errorTitle}>{this.state.Error}</h1>}
            {/* Add Notifications starts here */}
            <div className="Cont">
            <div class="brand-title">Notifications</div>
            <div class="inp">

              <label htmlFor="submessage">Email Subject Message:</label>
              <input
                className={'inputs'}
                onChange={(event) => this.onChangeHandler(event)}
                type="text"
                name="SubMessage" />
                <br/>
              <label htmlFor="bodmessage">Email Body Message:</label>
              <input
                className={'inputs'}
                onChange={(event) => this.onChangeHandler(event)}
                type="text"
                name="BodMessage" />
                <br/>
              <label htmlFor="tags">Tags:</label>
              <input
                className={'inputs'}
                onChange={(event) => this.onChangeHandler(event)}
                type="text"
                name="Tags" />
            <button
              className={'btnNew'}
              onClick={() => this.SendingEmailNotif()}
              >
              Send Notifications
            </button>
              </div>
              </div>
            {/* Add Notifications Ends here */}
          </div>
          </body>
        );
      }
      else if (this.state.Type === "PowerUser") {
        return (
          <h1 className='notifications'>You do not have access to this. Please Login</h1>
        );
      }
      else {
        return (
          <h1 className='notifications'>You do not have access to this. Please Login</h1>
        );
      }
    }
    else {
      return (
        <h1 className='notifications'>You do not have access to this. Please Login</h1>
      );
    }
  }
}