import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Route, Switch } from 'react-router-dom';
import HomePage from '../views/HomePage';
import SignInForm from '../views/auth/SignInForm';
import Roles from './Roles';

export const PrivateRoutes = [

];

export const PublicRoutes = [
    {
        component: HomePage,
        path: '/',
        title: 'Home',
        exact: true,
        permission: [
            Roles.ADMIN,
            Roles.USER
        ]
    },
    {
        component: SignInForm,
        path: '/signin',
        title: 'Sign In',
        permission: [
            Roles.ADMIN,
            Roles.USER
        ]
    },
];

const AllRoutes = [...PrivateRoutes, ...PublicRoutes];

export const filterRoutes = (roleParam) => {
    return AllRoutes.filter(route => {
            if (route.permission.includes(roleParam)) {
                return true;
            }
        return false;
    });
};

const RoutesConfig = () => {
    const currentUser = useSelector(state => state.auth.currentUser);
    const [role, setRole] = useState(Roles.USER);

    useEffect(() => {
        if (currentUser) {
            setRole(currentUser.role);
        }
    }, [currentUser]);

    return (
        <Switch>
            {
                filterRoutes(role).map(route =>
                    <Route key={route.path} path={route.path} exact component={route.component} />
                )
            }
        </Switch>
    );
};
export default RoutesConfig;
