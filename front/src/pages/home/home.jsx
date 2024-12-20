import React from 'react';
import Button from '@mui/material/Button';
import { Link } from 'react-router-dom';

function Home() {
    return (

        <div className="menu">
            <h1>Annotation Tool</h1>
            <div>
                <Link to={'/new'}><Button variant="contained">Start New Annotation</Button></Link>
                <Link to={'/annotation'}><Button variant="contained">Load Existing Annotations</Button></Link>
            </div>
        </div>

    );
}

export default Home;