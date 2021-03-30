import React, { Component } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faAngleUp,
  faAngleDown,
} from "@fortawesome/free-solid-svg-icons";
import SwipeableBottomSheet from "react-swipeable-bottom-sheet";
import "./assets/main.css";
import smile_icon from "./assets/img/smile_icon.png";

/*global kakao*/

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      open: false,
      cafe_list: [],
      cafe_num: 0,
      map: null,
    };
  }

  openBottomSheet(open) {
    this.setState({ open });
  }

  toggleBottomSheet() {
    this.openBottomSheet(!this.state.open);
  }

  getJson = () => {
    let data = fetch("cafe_data.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    }).then(function (response) {
      return response.json();
    });
    return data;
  };

  getData = async () => {
    const { cafe_list } = await this.getJson();
    this.setState({
      cafe_list,
    });
  };
  componentDidMount() {
    this.getData();
    const script = document.createElement("script");
    script.async = true;
    script.src =
      "//dapi.kakao.com/v2/maps/sdk.js?appkey=9fcfc5ba629ae84b1930d4ba4e458ccb&libraries=services,clusterer&autoload=false";
    document.head.appendChild(script);

    script.onload = () => {
      kakao.maps.load(() => {
        function panTo(x, y) {
          // 이동할 위도 경도 위치를 생성합니다
          var moveLatLon = new kakao.maps.LatLng(x, y);

          // 지도 중심을 부드럽게 이동시킵니다
          // 만약 이동할 거리가 지도 화면보다 크면 부드러운 효과 없이 이동합니다
          map.panTo(moveLatLon);
        }
        let container = document.getElementById("Mymap");
        let options = {
          center: new kakao.maps.LatLng(33.371776, 126.543786),
          level: 9,
        };
        const map = new window.kakao.maps.Map(container, options);

        // 마커를 표시할 위치와 title 객체 배열입니다
        var positions = this.state.cafe_list;

        // 마커 이미지의 이미지 주소입니다
        var imageSrc = smile_icon;

        for (var i = 0; i < positions.length; i++) {
          // 마커 이미지의 이미지 크기 입니다
          var imageSize = new kakao.maps.Size(35, 35);

          // 마커 이미지를 생성합니다
          var markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize);

          // 마커를 생성합니다
          var marker = new kakao.maps.Marker({
            map: map, // 마커를 표시할 지도
            position: new kakao.maps.LatLng(
              positions[i].latlngX,
              positions[i].latlngY
            ), // 마커를 표시할 위치
            title: positions[i].title, // 마커의 타이틀, 마커에 마우스를 올리면 타이틀이 표시됩니다
            image: markerImage, // 마커 이미지
          });

          // 마커에 클릭이벤트를 등록합니다
          kakao.maps.event.addListener(
            marker,
            "click",
            makeOverListener(map, positions[i], this, i)
          );
          // 인포윈도우를 표시하는 클로저를 만드는 함수입니다
          function makeOverListener(map, cafe_data, react_function, num) {
            return function () {
              map.setLevel(4);
              panTo(cafe_data.latlngX - 0.004, cafe_data.latlngY);
              react_function.setState({ open: true, cafe_num: num });
              //this.state.open = true;
              //console.log(this.state.open);
            };
          }
        }
      });
    };
  }
  render() {
    return (
      <div className="flex justify-center md:justify-start">
        <input
          className="w-10/12 mt-5 border px-5 font-medium text-gray-900 placeholder-gray-400 py-2 md:py-3 rounded-md shadow-md hover:shadow-md focus:outline-none z-40 fixed md:ml-10 md:mt-10 md:w-1/3"
          name="cafe"
          placeholder="환경카페 검색"
        ></input>
        <FontAwesomeIcon
          icon={faSearch}
          className="fixed z-50 mt-8 ml-98 md:mt-14"
        />
        <div id="Mymap" className="w-screen h-screen z-0"></div>
        <SwipeableBottomSheet
          overflowHeight={46}
          shadowTip={false}
          topShadow={false}
          open={this.state.open}
          onChange={this.openBottomSheet.bind(this)}
        >
          <div className="h-99 z-50 flex justify-center">
            {this.state.open ? (
              <FontAwesomeIcon
                icon={faAngleDown}
                className="mt-1 text-2xl opacity-50"
                onClick={this.toggleBottomSheet.bind(this)}
              />
            ) : (
              <FontAwesomeIcon
                icon={faAngleUp}
                className="mt-1 text-2xl opacity-50"
                onClick={this.toggleBottomSheet.bind(this)}
              />
            )}
          </div>
          <div></div>
        </SwipeableBottomSheet>
      </div>
    ); // 이부분이 지도를 띄우게 될 부분.
  }
}

export default App;
