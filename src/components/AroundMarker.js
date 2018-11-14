import React from 'react';
import { Marker, InfoWindow } from 'react-google-maps';

export class AroundMarker extends React.Component {
    state = {
        isOpen: false,
    }

    toggleOpen = () => {
        this.setState((prevState) => {
            return {
                isOpen: !prevState.isOpen
            }
        });
    }

    render() {
        const { user, message, url, location,type } = this.props.post;
        const { lat, lon : lng } = location;
        const isImagePost = type === 'image';
        return (
            <Marker
                position={{ lat, lng }}
                onMouseOver={this.toggleOpen}
                onMouseOut={this.toggleOpen}
            >
                {this.state.isOpen ? (
                    <InfoWindow>
                        <div>
                            {isImagePost ?
                                <img src={url} alt={message} className="around-marker-image"/>
                                :
                                <video src={url} className="around-marker-video" controls/>
                            }
                            <img src={url} alt={message} className="around-marker-image"/>
                            <p>{`${user}: ${message}`}</p>
                        </div>
                    </InfoWindow>
                ) : null}
            </Marker>
        );
    }
}