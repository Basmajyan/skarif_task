import { getAnnotation, updateAnnotation, deleteAnnotation } from '../../api/api'; // import API functions
import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import { Canvas, Rect } from 'fabric';
import './annotations.scss';

const AnnotationsItem = () => {
    const { id } = useParams();
    const [annotation, setAnnotation] = useState(null);
    const [image, setImage] = useState(null);
    const [imageDimensions, setImageDimensions] = useState(null);
    const canvasRef = useRef(null);
    const fabricCanvasRef = useRef(null); // create ref for canvas
    const [error, setError] = useState(null); // state to store error message
    const [success, setSuccess] = useState(null); // state to store success message
    const hasFetchedAnnotation = useRef(false); // ref to track if annotation has been fetched
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAnnotation = async () => {
            try {
                const data = await getAnnotation(id);
                setAnnotation(data);
                setImage(`data:image/jpeg;base64,${data.image_data}`);
            } catch (error) {
                if (error.response && error.response.status === 404) {
                    setError('Annotation not found');
                }
                {
                    console.error('Error fetching annotation:', error);
                }
            }
        };

        if (!hasFetchedAnnotation.current) {
            fetchAnnotation();
            hasFetchedAnnotation.current = true;
        }
    }, [id]);

    useEffect(() => {
        // initialize fabric canvas if not already initialized
        if (canvasRef.current && !fabricCanvasRef.current) {
            const canvas = new Canvas(canvasRef.current);
            fabricCanvasRef.current = canvas;
        }
    }, [annotation]);

    useEffect(() => {
        const canvas = fabricCanvasRef.current;

        if (canvas && annotation) {
            canvas.clear();
            const img = new Image();
            img.onload = () => {
                setImageDimensions({ width: img.width, height: img.height });
                canvas.setWidth(img.width);
                canvas.setHeight(img.height);
                annotation.bounding_boxes.forEach((box) => {
                    const rect = new Rect({
                        left: box.x,
                        top: box.y,
                        width: box.width,
                        height: box.height,
                        angle: box.rotation,
                        fill: 'rgba(255, 0, 0, 0.2)',
                    });
                    canvas.add(rect);
                });
            };
            img.src = `data:image/jpeg;base64,${annotation.image_data}`;
        }
    }, [annotation]);

    const handleAddRect = () => {
        const canvas = fabricCanvasRef.current;
        if (canvas) {
            const rect = new Rect({
                left: 100,
                top: 100,
                fill: 'rgba(255, 0, 0, 0.2)',
                width: 100,
                height: 100,
            });
            canvas.add(rect);
        }
    };

    const handleDeleteSelected = () => {
        const canvas = fabricCanvasRef.current;
        if (canvas) {
            const activeObject = canvas.getActiveObject();
            if (activeObject) {
                canvas.remove(activeObject);
            }
        }
    };

    const handleDeleteAll = () => {
        const canvas = fabricCanvasRef.current;
        canvas.getObjects('rect').forEach((rect) => {
            canvas.remove(rect);
        });
    };

    const checkForOverlaps = (rectangles) => {
        // check if any rectangles overlap
        for (let i = 0; i < rectangles.length; i++) {
            for (let j = i + 1; j < rectangles.length; j++) {
                const rect1 = rectangles[i];
                const rect2 = rectangles[j];
                if (
                    rect1.x < rect2.x + rect2.width &&
                    rect1.x + rect1.width > rect2.x &&
                    rect1.y < rect2.y + rect2.height &&
                    rect1.y + rect1.height > rect2.y
                ) {
                    return true;
                }
            }
        }
        return false;
    };

    const handleSave = async () => {
        const canvas = fabricCanvasRef.current;
        if (!canvas) return;

        const objects = canvas.getObjects('rect');
        if (objects.length === 0) {
            setError('No rectangles to save. Please add at least one rectangle.');
            return;
        }

        const boundingBoxes = objects.map((rect) => ({
            rotation: Math.round(rect.angle),
            width: Math.round(rect.width * rect.scaleX),
            height: Math.round(rect.height * rect.scaleY),
            x: Math.round(rect.left),
            y: Math.round(rect.top),
        }));

        if (checkForOverlaps(boundingBoxes)) {
            setError('Rectangles cannot overlap. Please adjust the annotations.');
            return;
        }

        const updatedAnnotation = {
            bounding_boxes: boundingBoxes,
            meta_info: annotation.meta_info, // retain existing meta info
        };

        try {
            const response = await updateAnnotation(annotation.id, updatedAnnotation);
            console.log('Annotation updated:', response);
            setError(null);
            setSuccess('Annotation updated successfully!');
        } catch (error) {
            console.error('Error updating annotation:', error);
            setError('Failed to update annotation. Please try again.');
            setSuccess(null); // clear success message on error
        }
    };

    const handleDeleteAnnotation = async () => {
        try {
            await deleteAnnotation(annotation.id);
            navigate('/annotation');
        } catch (error) {
            console.error('Error deleting annotation:', error);
            setError('Failed to delete annotation. Please try again.');
        }
    };

    return (
        <div className='drawImg'>
            {annotation ? (
                <>
                    <div
                        style={{
                            width: imageDimensions?.width,
                            height: imageDimensions?.height,
                        }}
                        className="table">
                        <img src={image} alt="Annotation" />
                        <canvas ref={canvasRef} />
                    </div>
                    <div className='buttonsBar'>
                        <Button variant="contained" onClick={handleAddRect}>Add Rectangle</Button>
                        <Button variant="contained" onClick={handleDeleteSelected}>Delete Selected</Button>
                        <Button variant="contained" onClick={handleDeleteAll}>Delete All Rectangles</Button>
                        <Button variant="contained" onClick={handleSave}>Save</Button>
                        <Button variant="contained" onClick={handleDeleteAnnotation}>Delete annotation</Button>
                    </div>
                    <div className='alertsBar'>
                        {error && <Alert severity="error">{error}</Alert>}
                        {success && <Alert severity="success">{success}</Alert>}
                    </div>
                </>
            ) : (
                error ?
                    <Alert severity="error">{error}</Alert> :
                    <p>Loading...</p>
            )}
        </div>
    );
};

export default AnnotationsItem;