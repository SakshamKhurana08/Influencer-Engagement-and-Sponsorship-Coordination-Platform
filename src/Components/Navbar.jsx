// import React from 'react'
// import AuthPage from "./AuthPage";
import { Link } from 'react-router-dom';
const Navbar = () => {
    return (
        <div>
            <div>
                <nav className="flex justify-between py-1 items-center ">
                    <img src="./assets/2nd-logo.jpg" className="w-20 h-20" />
                    <h1 className="text-xl text-gray-800 font-bold absolute left-20">CollabSphere</h1>
                    <div className="flex items-center">
                        <div className="flex items-center">
                            {/* <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 pt-0.5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg> */}
                            {/* <input className="ml-2 outline-none bg-transparent font-medium" type="text" name="search" id="search" placeholder="Search..." /> */}
                        </div>
                        <ul className="flex items-center space-x-6">
                            <Link className="font-semibold text-gray-700" to='/about'><li>About</li></Link>
                            <Link className="font-semibold text-gray-700" to='/signup'><li>Register</li></Link>
                            <Link className="font-semibold text-gray-700" to='/login'><li>Login</li></Link>
                            <li>
                                {/* <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path d="M12 14l9-5-9-5-9 5 9 5z" />
                                    <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                                </svg> */}
                            </li>
                            <li>
                                {/* <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg> */}
                            </li>
                            <li>
                                {/* <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg> */}
                            </li>
                        </ul>
                    </div>
                </nav>
            </div>

        </div>
    )
}

export default Navbar;