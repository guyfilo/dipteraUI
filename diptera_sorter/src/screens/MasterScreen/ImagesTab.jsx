import React, {useState, useRef, useEffect, useContext} from "react";
import ReactImageMagnify from "react-image-magnify";
import "./style.css";
import {DataContext} from "../../communication/DataContext.jsx";

export const ImagesTab = ({machineData}) => {
    const bg_images = machineData?.bg_images ?? {};
    const {clearImages, sendCommand} = useContext(DataContext);


    const camKeys = Object.keys(bg_images);
    const [camKey, setCamKey] = useState(camKeys[0] || "cam0");
    const imgList = bg_images[camKey] || [];
    const [zoomPos, setZoomPos] = useState(null);
    const zoomFactor = 2; // You can set 2x, 3x, etc.
    const zoomSize = 200; // Size of the circular lens in pixels
    const [origSize, setOrigSize] = useState({ width: null, height: null });

    const displayWidth = 850;
    const origWidth = origSize.width;
    const origHeight = origSize.height;

    const displayHeight = origWidth
        ? (origHeight / origWidth) * displayWidth
        : 0;

    const scaleFactor = origHeight
        ? origHeight / displayHeight
        : 1;
    const [hoverColor, setHoverColor] = useState(null);

    const [meanRGB, setMeanRGB] = useState(null);

    const [index, setIndex] = useState(0);
    const [roi, setRoi] = useState({top: null, bottom: null});
    const [capBounds, setCapBounds] = useState({top: null, bottom: null});


    useEffect(() => {
        const bounds = machineData?.cap_bounds?.[camKey] ?? {top: null, bottom: null};
        setCapBounds({
            top: bounds.top !== null ? bounds.top / origHeight * displayHeight : null,
            bottom: bounds.bottom !== null ? bounds.bottom / origHeight * displayHeight : null,
        });
        setRoi({
            top: null, bottom: null
        })
    }, [camKey]);
    const containerRef = useRef(null);

    const currentImg = imgList[index];
    const imageSrc = currentImg?.startsWith("data:image")
        ? currentImg
        : `data:image/jpeg;base64,${currentImg}`;

    const setBoundaries = () => {
        if (roi.top && roi.bottom) {
            sendCommand(
                "set_capillary",
                [machineData.machine_id],
                [],
                {
                    cam_id: camKey,
                    lower_bound: Math.round(roi.bottom * scaleFactor),
                    upper_bound: Math.round(roi.top * scaleFactor)
                }
            );
        }
    }

    const handleClick = (e) => {
        const rect = containerRef.current.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const prevTop = roi.top;


        // Ignore double clicks
        if (e.detail > 1) return;

        setRoi(prev => {
            // First click → set top
            if (prev.top === null) return {...prev, top: y};
            // Second click → set bottom
            if (prev.bottom === null) return {top: Math.min(y, prevTop), bottom: Math.max(y, prevTop)};

            // Both set → replace the closer one
            const distToTop = Math.abs(prev.top - y);
            const distToBottom = Math.abs(prev.bottom - y);

            if (distToTop < distToBottom) {
                return {...prev, top: y};
            } else {
                return {...prev, bottom: y};
            }
        });
    };


    const renderLines = () => {
        const lines = [];

        if (capBounds.top !== null) {
            lines.push(
                <div key="cap-top" className="roi-line" style={{top: capBounds.top, backgroundColor: "blue"}}/>
            );
        }
        if (capBounds.bottom !== null) {
            lines.push(
                <div key="cap-bottom" className="roi-line" style={{top: capBounds.bottom, backgroundColor: "blue"}}/>
            );
        }

        if (roi.top !== null) {
            lines.push(
                <div key="roi-top" className="roi-line" style={{top: roi.top, backgroundColor: "red"}}/>
            );
        }
        if (roi.bottom !== null) {
            lines.push(
                <div key="roi-bottom" className="roi-line" style={{top: roi.bottom, backgroundColor: "red"}}/>
            );
        }

        return lines;
    };

    // Decode image to get mean RGB
    useEffect(() => {
        if (
            (roi.top || capBounds.top) &&
            (roi.bottom || capBounds.bottom) &&
            imageSrc.startsWith("data:image")
        ) {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => {
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");
                const top = roi.top || capBounds.top;
                const bottom = roi.bottom || capBounds.bottom;

                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);

                const displayToImageY = (y) => Math.floor(y * scaleFactor);

                const roiY1 = displayToImageY(Math.min(top, bottom));
                const roiY2 = displayToImageY(Math.max(top, bottom));
                const roiHeight = roiY2 - roiY1;

                if (roiHeight <= 0) return;

                const imageData = ctx.getImageData(0, roiY1, img.width, roiHeight);
                const data = imageData.data;

                let r = 0, g = 0, b = 0, count = 0;
                for (let i = 0; i < data.length; i += 4) {
                    r += data[i];
                    g += data[i + 1];
                    b += data[i + 2];
                    count++;
                }

                setMeanRGB({
                    r: Math.round(r / count),
                    g: Math.round(g / count),
                    b: Math.round(b / count),
                });
            };
            img.src = imageSrc;
        } else {
            setMeanRGB(null);
        }
    }, [roi, imageSrc]);
    let orgCapBounds = machineData?.cap_bounds?.[camKey]
    return (
        <div>
            {imgList.length === 0 ? (
                <div>No images</div>
            ) : (
                <div className={"master-images-tab-content"}>
                    <div className={"img-tab-buttons"}>
                        <div className={"master-button"}
                             onClick={setBoundaries}
                        >Save
                        </div>
                        <div className={"master-button"}
                             onClick={() => clearImages(machineData.machine_id)}
                        >Clear images
                        </div>
                        <div className={"master-button"}
                             onClick={() => {
                                 const link = document.createElement("a");
                                 link.href = imageSrc;
                                 link.download = `image_${index + 1}_${camKey}_${machineData.machine_id}.jpg`;
                                 document.body.appendChild(link);
                                 link.click();
                                 document.body.removeChild(link);
                             }}
                        >Download Image
                        </div>
                    </div>


                    <div style={{display: 'flex', alignItems: 'center', gap: 10}}>

                        <button onClick={() => setIndex((index - 1 + imgList.length) % imgList.length)}>◀</button>
                        <span>Image {index + 1} / {imgList.length}</span>
                        <button onClick={() => setIndex((index + 1) % imgList.length)}>▶</button>
                        <div>
                            {roi.top !== null ? Math.round(roi.top * scaleFactor) : orgCapBounds.top}px
                            to {roi.bottom !== null ? Math.round(roi.bottom * scaleFactor): orgCapBounds.bottom}px
                        </div>
                        {camKeys.length > 1 && (
                            <select value={camKey} onChange={(e) => {
                                setCamKey(e.target.value);
                                setIndex(0); // Reset index on cam change
                            }}>
                                {camKeys.map(k => <option key={k} value={k}>{k}</option>)}
                            </select>
                        )}
                        {meanRGB && (
                            <div style={{display: "flex", alignItems: "center", gap: 5}}>
                                Mean RGB: R={meanRGB.r}, G={meanRGB.g}, B={meanRGB.b}
                                <div style={{
                                    width: 30,
                                    height: 30,
                                    backgroundColor: `rgb(${meanRGB.r}, ${meanRGB.g}, ${meanRGB.b})`,
                                    display: "inline-block",
                                    marginLeft: 10,
                                    border: "1px solid #ccc"
                                }}/>
                            </div>
                        )}
                        {hoverColor && (
                            <div style={{display: "flex", alignItems: "center", gap: 5}}>
                                Hover RGB: R={hoverColor.r}, G={hoverColor.g}, B={hoverColor.b}
                                <div style={{
                                    width: 30,
                                    height: 30,
                                    backgroundColor: `rgb(${hoverColor.r}, ${hoverColor.g}, ${hoverColor.b})`,
                                    marginLeft: 10,

                                    border: "1px solid #ccc"
                                }}/>
                            </div>
                        )}

                    </div>

                    <div
                        ref={containerRef}
                        style={{
                            position: "relative",
                            width: "fit-content",
                            marginTop: 10,
                            cursor: "crosshair"
                        }}
                    >
                        <div
                            ref={containerRef}
                            onClick={handleClick}
                            onMouseMove={(e) => {
                                const {left, top} = containerRef.current.getBoundingClientRect();
                                const x = e.clientX - left;
                                const y = e.clientY - top;
                                setZoomPos({x, y});

                                // Read pixel color from canvas
                                const img = new Image();
                                img.onload = () => {
                                    const canvas = document.createElement("canvas");
                                    const ctx = canvas.getContext("2d");
                                    canvas.width = img.width;
                                    canvas.height = img.height;
                                    ctx.drawImage(img, 0, 0);

                                    const displayToImageX = (x) => Math.floor(x * (origWidth / displayWidth));
                                    const displayToImageY = (y) => Math.floor(y * (origHeight / displayHeight));

                                    const px = displayToImageX(x);
                                    const py = displayToImageY(y);

                                    try {
                                        const pixel = ctx.getImageData(px, py, 1, 1).data;
                                        setHoverColor({r: pixel[0], g: pixel[1], b: pixel[2]});
                                    } catch (err) {
                                        setHoverColor(null);
                                    }
                                };
                                img.crossOrigin = "anonymous";
                                img.src = imageSrc;
                            }}
                            onMouseLeave={() => setZoomPos(null)}
                            style={{
                                position: "relative",
                                width: "fit-content",
                                marginTop: 10,
                                cursor: "crosshair"
                            }}
                        >
                            <img
                                src={imageSrc}
                                alt="Zoom target"
                                width={displayWidth}
                                style={{ display: "block" }}
                                onLoad={(e) => {
                                    const img = e.currentTarget;
                                    setOrigSize({
                                        width: img.naturalWidth,
                                        height: img.naturalHeight
                                    });
                                }}
                            />


                            {zoomPos && (
                                <div
                                    style={{
                                        position: "absolute",
                                        top: zoomPos.y - zoomSize / 2,
                                        left: zoomPos.x - zoomSize / 2,
                                        width: zoomSize,
                                        height: zoomSize,
                                        borderRadius: "50%",
                                        overflow: "hidden",
                                        boxShadow: "0 0 10px rgba(0,0,0,0.4)",
                                        pointerEvents: "none",
                                        border: "2px solid #fff",
                                        zIndex: 10,
                                    }}
                                >
                                    <img
                                        src={imageSrc}
                                        alt="Zoomed area"
                                        style={{
                                            position: "absolute",
                                            left: -zoomPos.x * zoomFactor + zoomSize / 2,
                                            top: -zoomPos.y * zoomFactor + zoomSize / 2,
                                            width: displayWidth * zoomFactor,
                                        }}
                                    />
                                    {roi.top !== null && (
                                        <div
                                            style={{
                                                position: "absolute",
                                                top: roi.top * zoomFactor - zoomPos.y * zoomFactor + zoomSize / 2,
                                                left: 0,
                                                width: "100%",
                                                height: 2,
                                                backgroundColor: "red"
                                            }}
                                        />
                                    )}
                                    {roi.bottom !== null && (
                                        <div
                                            style={{
                                                position: "absolute",
                                                top: roi.bottom * zoomFactor - zoomPos.y * zoomFactor + zoomSize / 2,
                                                left: 0,
                                                width: "100%",
                                                height: 2,
                                                backgroundColor: "red"
                                            }}
                                        />
                                    )}
                                    {capBounds.bottom !== null && (
                                        <div
                                            style={{
                                                position: "absolute",
                                                top: capBounds.bottom * zoomFactor - zoomPos.y * zoomFactor + zoomSize / 2,
                                                left: 0,
                                                width: "100%",
                                                height: 2,
                                                backgroundColor: "blue"
                                            }}
                                        />
                                    )}
                                    {capBounds.top !== null && (
                                        <div
                                            style={{
                                                position: "absolute",
                                                top: capBounds.top * zoomFactor - zoomPos.y * zoomFactor + zoomSize / 2,
                                                left: 0,
                                                width: "100%",
                                                height: 2,
                                                backgroundColor: "blue"
                                            }}
                                        />
                                    )}
                                </div>
                            )}

                            {renderLines()}
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};
