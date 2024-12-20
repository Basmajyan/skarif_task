import React, { useRef, useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import { Canvas, Rect } from 'fabric';
import { createAnnotation } from '../../api/api';
import Alert from '@mui/material/Alert';
import './draw.scss';

const MAX_IMAGE_SIZE_MB = 5; // Maximum image size in MB

const Draw = () => {
    const [image, setImage] = useState(null);
    const [imageArrayBuffer, setImageArrayBuffer] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const canvasRef = useRef(null);
    const fabricCanvasRef = useRef(null); // create ref for canvas
    const [imageDimensions, setImageDimensions] = useState(null);

    useEffect(() => {
        // initialize fabric canvas if not already initialized
        if (canvasRef.current && !fabricCanvasRef.current) {
            const canvas = new Canvas(canvasRef.current);
            fabricCanvasRef.current = canvas;
        }
    }, [image]);

    useEffect(() => {
        const canvas = fabricCanvasRef.current;
        if (canvas && imageDimensions) {
            // counting the dimensions of image and canvas, so that the picture doesnt deform
            const maxWidth = window.innerWidth * 0.8;
            const maxHeight = window.innerHeight * 0.8;
            let width = imageDimensions.width;
            let height = imageDimensions.height;

            if (width > maxWidth) {
                height = (maxWidth / width) * height;
                width = maxWidth;
            }
            if (height > maxHeight) {
                width = (maxHeight / height) * width;
                height = maxHeight;
            }

            // set canvas dimensions
            canvas.setWidth(width);
            canvas.setHeight(height);
            // update image dimensions only if they changed
            if (width !== imageDimensions.width || height !== imageDimensions.height) {
                setImageDimensions({ width, height });
            }
        }
    }, [imageDimensions]);

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            // check size
            const fileSizeMB = file.size / 1024 / 1024;
            if (fileSizeMB > MAX_IMAGE_SIZE_MB) {
                setError(`Image size exceeds the limit of ${MAX_IMAGE_SIZE_MB} MB.`);
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    setImageDimensions({ width: img.width, height: img.height });
                    setImage(e.target.result);
                    if (fabricCanvasRef.current) {
                        fabricCanvasRef.current.clear();
                    }
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);

            // read image as arraybuffer
            const binaryReader = new FileReader();
            binaryReader.onload = (e) => {
                setImageArrayBuffer(e.target.result);
            };
            binaryReader.readAsArrayBuffer(file);
        }
    };

    const handleAddRect = () => {
        const canvas = fabricCanvasRef.current;
        const rect = new Rect({
            left: 100,
            top: 100,
            fill: 'rgba(255, 0, 0, 0.2)',
            width: 100,
            height: 100,
        });
        canvas.add(rect);
    };

    const handleDeleteSelected = () => {
        const canvas = fabricCanvasRef.current;
        const activeObject = canvas.getActiveObject();
        if (activeObject) {
            canvas.remove(activeObject);
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

        // convert ArrayBuffer to base64
        const base64String = btoa(
            new Uint8Array(imageArrayBuffer)
                .reduce((data, byte) => data + String.fromCharCode(byte), '')
        );

        const annotation = {
            image_data: base64String,
            bounding_boxes: boundingBoxes,
            meta_info: null, // add meta info if needed
        };

        try {
            const response = await createAnnotation(annotation);
            console.log('Annotation saved:', response);
            setError(null);
            setSuccess('Annotation saved successfully!');
            canvas.clear();
        } catch (error) {
            console.error('Error saving annotation:', error);
            if (error.response && error.response.status === 400) {
                setError(error.response.data.detail);
            } else {
                setError('Failed to save annotation. Please try again.');
            }
            setSuccess(null); // clear success message on error
        }
    };

    return (
        <div className='drawImg'>
            {!image && <h2>Select a image for the annotation</h2>}
            <input type="file" accept="image/*" onChange={handleImageUpload} />
            {image &&
                <>
                    <div
                        style={{
                            width: imageDimensions.width,
                            height: imageDimensions.height,
                        }}
                        className="table">
                        <img src={image} />
                        <canvas ref={canvasRef} />
                    </div>
                    <div className='buttonsBar'>
                        <Button variant="contained" onClick={handleAddRect}>Add Rectangle</Button>
                        <Button variant="contained" onClick={handleDeleteSelected}>Delete Selected</Button>
                        <Button variant="contained" onClick={handleDeleteAll}>Delete All Rectangles</Button>
                        <Button variant="contained" onClick={handleSave}>Save</Button>
                    </div>
                    <div className='alertsBar'>
                        {error && <Alert severity="error">{error}</Alert>}
                        {success && <Alert severity="success">{success}</Alert>}
                    </div>
                </>
            }
        </div>
    );
};

export default Draw;