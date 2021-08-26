import { HashRouter, Route, Switch, Redirect } from 'react-router-dom';
import ContractLookupPage from './contract_lookup';
import TokenToolsPage from './token_tools';

const BasicRoute = () => (
    <HashRouter>
        <Switch>
            <Route exact path="/">
                <Redirect to="/contract_lookup" />
            </Route>
            <Route exact path="/contract_lookup" component={ContractLookupPage} />
            <Route exact path="/token_tools" component={TokenToolsPage} />
        </Switch>
    </HashRouter>
);

export default BasicRoute;