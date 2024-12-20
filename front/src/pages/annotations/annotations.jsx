import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllAnnotations } from '../../api/api'; // import getAllAnnotations API function
import './annotations.scss';


const Annotations = () => {
    const [annotations, setAnnotations] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAnnotations = async () => {
            try {
                const data = await getAllAnnotations();
                setAnnotations(data);
            } catch (error) {
                console.error('Error fetching annotations:', error);
            }
        };

        fetchAnnotations();
    }, []);

    const handleSelectAnnotation = (annotation) => {
        navigate(`/annotation/${annotation.id}`);
    };

    return (
        <div className="annotations">
            <h2>All annotations</h2>
            <div className="annotationsList">
                {annotations.map((annotation) => (
                    <div
                        key={annotation.id}
                        className="annotationItem"
                        onClick={() => handleSelectAnnotation(annotation)}
                    >
                        <p>ID: {annotation.id}</p>
                        <img src={`data:image/jpeg;base64,${annotation.image_data}`} />
                    </div>
                ))}
                {annotations.length === 0 && <p>No annotations found</p>}
            </div>
        </div>
    );
};

export default Annotations;