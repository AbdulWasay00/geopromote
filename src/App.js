import React from 'react';
import './App.css';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Navbar from '../src/Components/Navbar';
import Home from '../src/Screens/Home';
import AddNotifications from '../src/Screens/AddNotifications';
import AddAdvertisements from '../src/Screens/AddAdvertisements';
import Login from '../src/Screens/Login';
import AddShops from '../src/Screens/AddShops';
import Toss from '../src/Screens/TosPage';
import "../node_modules/bootstrap/dist/css/bootstrap.min.css"

function App() {
  return (
    <>
      <Router>
        <Navbar />
        <Switch>
          <Route path='/' exact component={Home} />
          <Route path='/notifications' component={AddNotifications} />
          <Route path='/advertisements' component={AddAdvertisements} />
          <Route path='/login' component={Login} />
          <Route path='/shops' component={AddShops} />
          <Route path='/Tos' component={Toss} />
        </Switch>
      </Router>
    </>
  );
}

export default App;
