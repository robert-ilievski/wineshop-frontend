import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router';
import { Link } from 'react-router-dom';
import Roles from '../auth/Roles';
import { AuthButton } from '../components/AuthButton';

const Header = () => {
    let location = useLocation();
    const auth = useSelector(state => state.auth.currentUser);

    const [path, setPath] = useState(location);
    const [roles, setRoles] = useState(Roles.USER);

    useEffect(() => {
        setPath(location.pathname.split('/')[1]);
        if (auth) {
            setRoles(auth.roles);
        }
    }, [location, auth]);

    const activePath = (tabPath)=>{
        return path === tabPath ? 'header-active' : ''
    }

    return (
        <div className={`navbar navbar-dark bg-dark navbar-expand-lg`}>
            <div className={`container`}>
                <Link
                    to="/"
                    replace={false}
                    className={`navbar-brand shadow-outer ${activePath('')}`}
                >
                    Home
                </Link>
                <ul className={`navbar-nav`}>
                    {roles.includes(Roles.ADMIN) ?
                        (
                            <li className={`nav-item`}>
                                <React.Fragment>
                                    <Link
                                        to="/users"
                                        replace={false}
                                        className={`nav-link shadow-outer ${activePath('users')}`}
                                    >
                                        Users
                                    </Link>
                                </React.Fragment>
                            </li>
                        )
                        :
                        null
                    }
                    <li className={`nav-item`}>
                        <AuthButton path={path} />
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default Header;
