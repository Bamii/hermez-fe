import React, { Component, useState } from "react";
import { Switch, Route, BrowserRouter } from "react-router-dom";
import { CSSTransition } from "react-transition-group";
import Home from "./Home.jsx";
import Host from "./Host.jsx";
import Settings from './Settings.jsx';
import Client from "./Client.jsx";
import Help from "./Help.jsx";
import Header from "../containers/Header.jsx";

const App = () => {
  const [path, setPath] = useState("");

  const routes = [
    { path: '/', name: 'Home', Component: Home },
    { path: '/client', name: 'Client', Component: Client },
    { path: '/about', name: 'About', Component: Help },
  ]

  return (
    <BrowserRouter>
      {path !== "/" && <Header />}
      <div className="relative">
        {routes.map(({ path, Component }) => (
          <Route
            key={path}
            exact
            path={path}
            render={({ match }) => {
              setPath(path);
              return (
                <CSSTransition
                  in={match != null}
                  timeout={300}
                  classNames="page"
                  unmountOnExit
                >
                  <Component />
                </CSSTransition>
              )
            }}>
          </Route>
        ))}
      </div>
    </BrowserRouter>
  );
};

export default App;
