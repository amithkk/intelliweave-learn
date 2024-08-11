import React from "react";

const useInterval = (callback, delay) => {
    const intervalRef = React.useRef<null | number>(null);
    const savedCallback = React.useRef(callback);

    React.useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    React.useEffect(() => {
        const tick = () => savedCallback.current();
        if (typeof delay === "number") {
            intervalRef.current = window.setInterval(tick, delay);
            return () => window.clearInterval(intervalRef.current);
        }
    }, [delay]);

    return intervalRef;
};

export default useInterval;