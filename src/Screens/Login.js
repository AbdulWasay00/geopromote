import React, { Component } from 'react';
import '../App.css';
import { auth, firestore } from "../Database/FirebaseConfig";
import styles from '../Styles/login.module.css';

//Referencing our "Users" collection in our firestore
const UsersCollection = firestore.collection('Users');

export default class login extends Component {

  state = {
    Email: '',
    Password: '',
    Error: ''
  }

  //checks if user is admin
  CheckIfUserIsAdmin = async (email) => {
    let data = [];
    let type = "";
    const query = UsersCollection.where('Email', '==', email);
    await query.get()
      .then((value) => {
        data = value.docs;
      })
      .then(() => {
        type = data.map(item => item.data().Type);
        type = JSON.stringify(type);
        type = type.replace(/["]+/g, '');
        type = type.replace(/[\[\]']+/g, '');
      });
    if (type === "Admin" || type === 'PowerUser') {
      return "Yes";
    }
    else {
      return "No";
    }
  }

  //Logs in the user
  loginUser = async (email, password) => {
    let reg = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    let response = await this.CheckIfUserIsAdmin(email);
    if (response === "Yes") {
      if (email.length === 0 && password.length === 0 || email.length === 0 || password.length === 0) {
        this.setState({ Error: "Email Or Password cannot be empty!" });
      }
      else if (reg.test(email) === false) {
        this.setState({ Error: "Email's Format is Incorrect!" });
      }
      else {
        auth.signInWithEmailAndPassword(email, password)
          .then(() => {
            this.setState({ Error: "Login Successful" })
          })
          .catch(error => this.setState({ Error: error.message }))
      }
    }
    else {
      this.setState({ Error: "You are not Authorized!" });
    }
  }

  //Handles adding from the input to the state
  onChangeHandler = (event) => {
    let name = event.currentTarget.name;
    let value = event.currentTarget.value;
    if (name === 'email') {
      this.setState({ Email: value });
    }
    else if (name === 'password') {
      this.setState({ Password: value });
    }
  };

  render() {
    return (
      <div className={styles.container}>
        <div className={styles.bgImg} />
        <div className={styles.contentContainer}>
          <div className={styles.formLogin}>
            <h2 className={styles.formTitle}>LOGIN</h2>
            {this.state.Error && <h1 className={styles.errorTitle}>{this.state.Error}</h1>}
            <div className={styles.inputDiv}>
              <label htmlFor="username">Email:</label>
              <input
                className={styles.inputColor}
                onChange={(event) => this.onChangeHandler(event)}
                type="text"
                name="email" />
            </div>
            <div className={styles.inputDiv}>
              <label htmlFor="password">Password:</label>
              <input
                className={styles.inputColor}
                onChange={(event) => this.onChangeHandler(event)}
                type="password"
                name="password" />
            </div>
            <button
              className={styles.signinBtn}
              onClick={() => this.loginUser(this.state.Email, this.state.Password)}
            >
              LOGIN
            </button>
          </div>
        </div>
      </div>
    )
  }
}