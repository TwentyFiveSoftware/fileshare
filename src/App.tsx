import React from 'react';
import {
    Switch,
    BrowserRouter as Router,
    Route,
    Redirect,
} from 'react-router-dom';

import HomePage from './pages/HomePage';
import SharePage from './pages/SharePage';

import Header from './components/Header';

const App = () => {
    return (
        <Router>
            <Header />

            <Switch>
                <Route path={'/share/:id'}>
                    <SharePage />
                </Route>

                <Route exact path={'/'}>
                    <HomePage />
                </Route>

                <Redirect to={'/'} />
            </Switch>
        </Router>
    );
};

export default App;
