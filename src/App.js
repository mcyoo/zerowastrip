import React, { Component } from "react";
import "./assets/main.css";

/*global kakao*/

class App extends Component {
  componentDidMount() {
    const script = document.createElement("script");
    script.async = true;
    script.src =
      "//dapi.kakao.com/v2/maps/sdk.js?appkey=9fcfc5ba629ae84b1930d4ba4e458ccb&libraries=services,clusterer&autoload=false";
    document.head.appendChild(script);

    script.onload = () => {
      kakao.maps.load(() => {
        let container = document.getElementById("Mymap");
        let options = {
          center: new kakao.maps.LatLng(33.371776, 126.543786),
          level: 9,
        };
        const map = new window.kakao.maps.Map(container, options);
      });
    };
  }
  render() {
    return <div id="Mymap" className="w-screen h-screen"></div>; // 이부분이 지도를 띄우게 될 부분.
  }
}

export default App;
