import { HashRouter, Route, Switch, Redirect } from 'react-router-dom';
import ContractLookupPage from './contract_lookup';

const BasicRoute = () => (
    <HashRouter>
        <Switch>
            <Route exact path="/">
                <Redirect to="/lookup" />
            </Route>
            <Route exact path="/lookup" component={ContractLookupPage} />
        </Switch>
    </HashRouter>
);

export default BasicRoute;