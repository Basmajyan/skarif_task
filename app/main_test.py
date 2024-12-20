import requests

BASE_URL = "http://localhost:8000"
VALID_ANNOTATION_ID = 1
INVALID_IMAGE_SIZE_MB = 7


def test_create_annotation():
    valid_annotation_data = {
        "image_data": "base64encodedimagestring",
        "bounding_boxes": [
            {"x": 10, "y": 20, "width": 100, "height": 200, "rotation": 0}
        ],
        "meta_info": "test meta info",
    }
    response = requests.post(f"{BASE_URL}/api/annotations/", json=valid_annotation_data)
    assert response.status_code == 200
    assert "id" in response.json()

    invalid_annotation_data_overlap = {
        "image_data": "base64encodedimagestring",
        "bounding_boxes": [
            {"x": 10, "y": 20, "width": 100, "height": 200, "rotation": 0},
            {"x": 15, "y": 25, "width": 100, "height": 200, "rotation": 0},
        ],
        "meta_info": "test meta info",
    }
    response = requests.post(
        f"{BASE_URL}/api/annotations/", json=invalid_annotation_data_overlap
    )
    assert response.status_code == 400
    assert response.json() == {
        "detail": "Rectangles cannot overlap. Please adjust the annotations."
    }

    invalid_annotation_data_large_image = {
        "image_data": "a" * (1024 * 1024 * INVALID_IMAGE_SIZE_MB),
        "bounding_boxes": [
            {"x": 10, "y": 20, "width": 100, "height": 200, "rotation": 0}
        ],
        "meta_info": "test meta info",
    }
    response = requests.post(
        f"{BASE_URL}/api/annotations/", json=invalid_annotation_data_large_image
    )
    assert response.status_code == 400
    assert response.json() == {"detail": "Image size exceeds the limit of 1 MB"}


def test_get_all_annotations():
    response = requests.get(f"{BASE_URL}/api/annotations/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_get_annotation():
    annotation_id = VALID_ANNOTATION_ID
    response = requests.get(f"{BASE_URL}/api/annotations/{annotation_id}")
    assert response.status_code == 200
    assert "id" in response.json()


def test_update_annotation():
    annotation_id = VALID_ANNOTATION_ID
    update_data = {
        "bounding_boxes": [
            {"x": 15, "y": 25, "width": 110, "height": 222, "rotation": 0}
        ],
        "meta_info": "updated meta info",
    }
    response = requests.put(
        f"{BASE_URL}/api/annotations/{annotation_id}", json=update_data
    )
    assert response.status_code == 200
    assert response.json()["meta_info"] == "updated meta info"


def test_delete_annotation():
    annotation_id = VALID_ANNOTATION_ID
    response = requests.delete(f"{BASE_URL}/api/annotations/{annotation_id}")
    assert response.status_code == 200
    assert response.json() == {"detail": "annotation deleted"}
