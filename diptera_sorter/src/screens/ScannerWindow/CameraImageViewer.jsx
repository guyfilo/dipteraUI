import React, {useState} from "react";

export const CameraImageViewer = ({imagesByCam}) => {
    const camKeys = ["cam0", "cam1", "cam2", "cam3"];
    const [indices, setIndices] = useState({
        cam0: 0,
        cam1: 0,
        cam2: 0,
        cam3: 0,
    });
    imagesByCam = imagesByCam || {};

    const nextImage = (cam) => {
        const camImages = imagesByCam[cam] || [];
        if (camImages.length === 0) return;

        setIndices((prev) => ({
            ...prev,
            [cam]: (prev[cam] + 1) % camImages.length,
        }));
    };

    const prevImage = (cam) => {
        const camImages = imagesByCam[cam] || [];
        if (camImages.length === 0) return;

        setIndices((prev) => ({
            ...prev,
            [cam]: (prev[cam] - 1) % camImages.length,
        }));
    };

    return (
        <div className="camera-image-viewer">
            {camKeys.map((camKey) => {
                const imgList = imagesByCam[camKey] || [];
                const currentImg = imgList[indices[camKey]];

                return (
                    <div key={camKey} className="cam-row">

                        {imgList.length > 1 ? <img src="/choose-left.svg" alt="<"
                                                    onClick={() => nextImage(camKey)}></img>: null}
                        <div className="cam-image-container">
                            {currentImg ? (
                                <img src={`data:image/jpeg;base64,${currentImg}`} alt={`${camKey} image`} className="cam-image"/>
                            ) : (
                                <div className="cam-image placeholder">No Image</div>
                            )}
                        </div>
                        {imgList.length > 1 ? <img src="/choose-right.svg" alt=">"
                              onClick={() => nextImage(camKey)}></img>: null}
                    </div>
                );
            })}
        </div>
    );
};
