import React from 'react';
import { Tabs, Button } from 'antd';
import {GEO_OPTIONS, POS_KEY, API_ROOT, AUTH_HEADER, TOKEN_KEY} from "../constants"
import {Gallery} from "./Gallery"

const TabPane = Tabs.TabPane;
export class Home extends React.Component {

    state = {
        isLoadingGeolocation: false,
        error: '',
        isLoadingPosts: false,
        posts: [],
    }

    componentDidMount() {
        if ("geolocation" in navigator) {
            this.setState({isLoadingGeolocation:true, error: ''});
            navigator.geolocation.getCurrentPosition(
                this.onSuccessLoadGeoLocation,
                this.onFailedLoadGeoLocation,
                GEO_OPTIONS);

            // 不可以在这边 setState fasle，因为异步，上一句秒执行成功，没有开始load已经开始执行这句
        } else {
            this.setState({error: 'GeoLocation is not supported'})
        }
    }

    onSuccessLoadGeoLocation = (position) => {
        console.log(position)
        const {latitude, longitude} = position.coords;
        localStorage.setItem(POS_KEY,JSON.stringify({lat:latitude, lon:longitude}));
        this.setState({isLoadingGeolocation:false})
        this.loadNearbyPosts();
    }

    onFailedLoadGeoLocation = (position) => {
        this.setState({isLoadingGeolocation:false, error: 'Failed Load Location'})

    }

    loadNearbyPosts = () => {
        const {lat,lon} = JSON.parse(localStorage.getItem(POS_KEY));

        const token = localStorage.getItem(TOKEN_KEY);

        this.setState({isLoadingPosts: true,error: ''})
        //API login then store to localstorage
        fetch(`${API_ROOT}/search?lat=${lat}&lon=${lon}&range=2000`,{
            method: 'GET',
            //jkt token ==> Bearer<token>
            headers: {
              Authorization: `${AUTH_HEADER} ${token}`
            },

        }).then((response) => {
            if (response.ok) {
                return response.json();
            }
            throw new Error ('Failed to load posts');
        }).then((data) => {
            console.log(data);
            this.setState({isLoadingPosts: false, posts: data ? data:[]});
        }).catch((e) => {
            console.log(e.message);
            this.setState({isLoadingPosts: false});
        });

        //fetch return promise, use then to call , the function
    }

    getImagePost = () => {
        const {error, isLoadingGeolocation,isLoadingPosts,posts} = this.state;
        if (error) {
            return <div> {error} </div>
        } else if (isLoadingGeolocation) {
            return <spin tip="Loading Geolocation"/>
        } else if(isLoadingPosts) {
            return <spin tip="Loading Posts"/>
        } else if (posts.length > 0) {
            //[1,2,3].map((x) => {return 2 * x});
            //[2,4,6]
            const images = this.state.posts.map((post) => {
                return {
                    user: post.user,
                    src: post.url,
                    thumbnail: post.url,
                    caption: post.message,
                    thumbnailWidth: 400,
                    thumbnailHeight: 300

                }
            })

            return (<Gallery images={images}/>)
        } else {
                return <div>Content of tab 1</div>
        }

    }

    render() {
        const operations = <Button type="primary">Create New Post</Button>;
        return (
            <Tabs tabBarExtraContent={operations} className='main-tabs'>
                <TabPane tab="Image Posts" key="1">
                    {this.getImagePost()}
                </TabPane>
                <TabPane tab="Video" key="2">Content of tab 2</TabPane>
                <TabPane tab="Map" key="3">Content of tab 3</TabPane>
            </Tabs>
        );
    }
}
