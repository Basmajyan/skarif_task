import React from 'react'
import { Link } from 'react-router-dom'

const Header = () => {
    return (
        <div className='header'>
            <Link to={'/new'}>Start annotation</Link>
            <Link to={'/annotation'}>Load annotations</Link>
        </div>
    )
}

export default Header