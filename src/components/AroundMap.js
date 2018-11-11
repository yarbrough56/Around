import React from 'react';
import {withScriptjs, withGoogleMap, GoogleMap, Marker,} from "react-google-maps";

class NormalAroundMap extends React.Component {
    render() {
        return (
            <GoogleMap
                defaultZoom={11}
                defaultCenter={{ lat: -34.397, lng: 150.644 }}
            >
                <Marker
                    position={{ lat: -34.397, lng: 150.644 }}
                />

                <Marker
                    position={{ lat: -34.377, lng: 150.648 }}
                />
            </GoogleMap>
        );
    }
}


export const AroundMap = withScriptjs(withGoogleMap(NormalAroundMap));
