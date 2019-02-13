import React from 'react';
import { Tabs, Spin ,Row,Col, Radio} from 'antd';
import { GEO_OPTIONS, POS_KEY, API_ROOT, AUTH_HEADER, TOKEN_KEY,GOOGLEMAP_URL } from '../constants';
import { Gallery } from './Gallery';
import { CreatePostButton } from './CreatePostButton';
import { AroundMap } from './AroundMap';

const TabPane = Tabs.TabPane;
const RadioGroup = Radio.Group;
export class Home extends React.Component {
    state = {
        isLoadingGeoLocation: false,
        error: '',
        isLoadingPosts: false,
        posts: [],
        topic: 'around'
    }


    componentDidMount() {
        if ("geolocation" in navigator) {
            this.setState({
                isLoadingGeoLocation: true,
                error: ''
            });
            navigator.geolocation.getCurrentPosition(
                this.onSuccessLoadGeoLocation,
                this.onFailedLoadGeoLocation,
                GEO_OPTIONS);
        } else {
            // not setState isLoadingGeoLocation : false here
            // because of async call
            // 因为异步，上一句秒执行成功，没有开始load已经开始执行这句
            this.setState({ error: 'Geolocation is not supported.'});
        }
    }

    /**
     * success call back function for getCurrentPosition
     * @param position {Position Object}
     */
    onSuccessLoadGeoLocation = (position) => {
        //console.log(position);
        const { latitude, longitude } = position.coords;
        localStorage.setItem(POS_KEY, JSON.stringify({ lat: latitude, lon: longitude }));
        this.setState({ isLoadingGeoLocation: false });
        this.loadNearbyPosts();
    }


    /**
     * failure call back function for getCurrentPosition
     */
    onFailedLoadGeoLocation = () => {
        this.setState({
            isLoadingGeoLocation: false,
            error: 'Failed to load geolocation.'
        });
    }


    /**
     *
     * @param center {Position} : search center point
     * @param radius {int} : search range
     * @returns {Promise<Response | never>}
     */
    loadNearbyPosts = (center, radius) => {
        const { lat, lon } = center ? center : JSON.parse(localStorage.getItem(POS_KEY));
        const range = radius ? radius : 20;
        const token = localStorage.getItem(TOKEN_KEY);

        this.setState({
            isLoadingPosts: true,
            error: '' ,
            topic:'around'
        });

        fetch(`${API_ROOT}/search?lat=${lat}&lon=${lon}&range=${range}`, {
            method: 'GET',
            headers: {
                Authorization: `${AUTH_HEADER} ${token}`,
            },
        }).then((response) => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Failed to load posts.');
        }).then((data) => {
            //console.log(data);
            this.setState({
                isLoadingPosts: false,
                posts: data ? data : [],
            });
        }).catch((e) => {
            console.log(e.message);
            this.setState({
                isLoadingPosts: false,
                error: e.message
            });
        });
    }


    /**
     *
     * @param type {String} Panel topic type
     * @returns  getImagePosts : getVideoPosts
     */
    getPanelContent = (type) => {
        const { error, isLoadingGeoLocation, isLoadingPosts, posts } = this.state;
        if (error) {
            return <div>{error}</div>
        } else if(isLoadingGeoLocation) {
            return <Spin tip="Loading geo location..."/>
        } else if (isLoadingPosts) {
            return <Spin tip="Loading posts..." />
        } else if (posts.length > 0) {
            return type === 'image' ?   this.getImagePosts(): this.getVideoPosts()
        } else {
            return 'No nearby posts.';
        }
    }

    getVideoPosts = () => {
        const videos = this.state.posts.filter((post) => post.type === 'video');
        //console.log(videos)
        return (
            <Row gutter={32}>
                    {videos.map((video) => {
                            return (
                                <Col span={6} key={video.url} >
                                    <video src={video.url} controls className="video-block"> </video>
                                    <p>
                                        {video.user}: {video.message}
                                    </p>
                                </Col>
                            );
                        })}
            </Row>
        );
    }


    getImagePosts = () => {
        const images = this.state.posts.filter((post) => post.type === 'image')
            .map((image) => {
                return {
                    user: image.user,
                    src: image.url,
                    thumbnail: image.url,
                    caption: image.message,
                    thumbnailWidth: 400,
                    thumbnailHeight: 300,
                }
            });
        return (<Gallery images={images}/>);
    }

    /**
     *
     * @param e {Event}  click to change tab event handler
     */
    onTopicChange = (e) => {
        const topic = e.target.value;
        this.setState({topic});

        if (topic === 'around') {
            this.loadNearbyPosts();
        } else {
            const token = localStorage.getItem(TOKEN_KEY);
            this.setState({isLoadingPosts:true,error:''});
            fetch(`${API_ROOT}/cluster?term=face`, {
                method : 'GET',
                headers: {
                    Authorization: `${AUTH_HEADER} ${token}`,
                },
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error(response.statusText);
            }).then((data) => {
                //console.log(data);
                this.setState({
                    isLoadingPosts: false,
                    posts: data ? data : []
                });
            }).catch((e) => {
                console.log(e.message);
                this.setState({
                    isLoadingPosts:false,
                    error:'Loading face failed'
                });

            })
        }
    }

    render() {
        const operations = <CreatePostButton loadNearbyPosts={this.loadNearbyPosts}/>;
        return (
            <div>
                <RadioGroup onChange={this.onTopicChange} value={this.state.topic} className='topic-radio-group'>
                    <Radio value='around'>Posts Around</Radio>
                    <Radio value='face'>Faces Around World</Radio>

                </RadioGroup>

                <Tabs tabBarExtraContent={operations} className="main-tabs">
                    <TabPane tab="Image Posts" key="1">
                        {this.getPanelContent('image')}
                    </TabPane>
                    <TabPane tab="Video Posts" key="2">
                        {this.getPanelContent('video')}
                    </TabPane>
                    <TabPane tab="Map" key="3">
                        <AroundMap
                            googleMapURL={GOOGLEMAP_URL}
                            loadingElement={<div style={{ height: `100%` }} />}
                            containerElement={<div style={{ height: `800px` }} />}
                            mapElement={<div style={{ height: `100%` }} />}
                            posts={this.state.posts}
                            loadNearbyPosts={this.loadNearbyPosts}
                            topic={this.state.topic}
                        />
                    </TabPane>
                </Tabs>
            </div>


        );
    }
}

