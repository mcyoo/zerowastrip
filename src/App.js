import React, { Component } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faAngleUp,
  faAngleDown,
  faAngleLeft,
  faAlignJustify,
  faSmile,
  faMap,
} from "@fortawesome/free-solid-svg-icons";
import SwipeableBottomSheet from "react-swipeable-bottom-sheet";
import "./assets/main.css";
import smile_icon from "./assets/img/green_cafe.png";
import Slider from "react-slick";

/*global kakao*/

const map_level = 3;
const panTo_latlngX = 0.0025;

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      open: false,
      open_search: false,
      cafe_list: [],
      cafe_num: 0,
      map: null,
    };
  }

  openBottomSheet(open, num = this.state.cafe_num) {
    this.setState({ open, open_search: false, cafe_num: num });
    var panTo_latlngX_default = 0;
    if (open === true) {
      panTo_latlngX_default = panTo_latlngX;
    }
    const script = document.createElement("script");
    script.async = true;
    script.src =
      "//dapi.kakao.com/v2/maps/sdk.js?appkey=9fcfc5ba629ae84b1930d4ba4e458ccb&libraries=services,clusterer&autoload=false";
    document.head.appendChild(script);

    const map = this.state.map;
    script.onload = () => {
      kakao.maps.load(() => {
        var moveLatLon = new kakao.maps.LatLng(
          this.state.cafe_list[num].lat - panTo_latlngX_default,
          this.state.cafe_list[num].lng
        );
        map.setLevel(map_level);
        map.panTo(moveLatLon);
      });
    };
  }

  toggleBottomSheet() {
    this.openBottomSheet(!this.state.open);
  }

  closeInputSheet() {
    this.setState({ open_search: false, open: false });
  }
  openInputSheet() {
    this.setState({ open_search: true, open: false });
  }
  clickCafeSearchSheet(num) {
    this.openBottomSheet(true, num);
  }

  getJson = () => {
    let data = fetch(
      "http://ec2-15-165-235-103.ap-northeast-2.compute.amazonaws.com/api/v1/cafes/",
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    ).then(function (response) {
      return response.json();
    });
    return data;
  };

  getData = async () => {
    const { results } = await this.getJson();
    this.setState({
      cafe_list: results,
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
        this.setState({ map });
        // 마커를 표시할 위치와 title 객체 배열입니다
        var positions = this.state.cafe_list;

        // 마커 이미지의 이미지 주소입니다
        var imageSrc = smile_icon;

        for (var i = 0; i < positions.length; i++) {
          // 마커 이미지의 이미지 크기 입니다
          var imageSize = new kakao.maps.Size(45, 45);

          // 마커 이미지를 생성합니다
          var markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize);

          // 마커를 생성합니다
          var marker = new kakao.maps.Marker({
            map: map, // 마커를 표시할 지도
            position: new kakao.maps.LatLng(positions[i].lat, positions[i].lng), // 마커를 표시할 위치
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
              map.setLevel(map_level);
              panTo(cafe_data.lat - panTo_latlngX, cafe_data.lng);
              react_function.setState({ open: true, cafe_num: num });
              react_function.slider.slickGoTo(num);
            };
          }
        }
      });
    };
  }
  render() {
    const { open, open_search, cafe_list, cafe_num, map } = this.state;
    const settings = {
      dots: true,
      infinite: true,
      speed: 300,
      slidesToShow: 1,
      slidesToScroll: 1,
      initialSlide: cafe_num,
      afterChange: (new_index) => {
        this.clickCafeSearchSheet(new_index);
        console.log(new_index);
      },
    };
    return (
      <div className="flex z-0">
        <div id="Mymap" className="w-screen h-screen z-0"></div>
        {open ? null : (
          <>
            <div className="flex justify-center md:justify-start fixed container z-30">
              <input
                className="w-10/12 border mt-5 pl-12 font-medium text-gray-900 placeholder-gray-400 py-3 md:py-3 rounded-md focus:outline-none md:ml-10 md:mt-10 md:w-1/3"
                name="cafe"
                placeholder="환경카페 찾기"
                onClick={this.openInputSheet.bind(this)}
              />
            </div>
            <div className="flex justify-end md:justify-start fixed container z-30">
              <div className="fixed flex z-30 mt-9 md:mt-14 pr-14 md:ml-98 text-lg">
                <FontAwesomeIcon icon={faSearch} />
              </div>
            </div>
            {open_search ? (
              <div className="flex justify-start fixed container z-30">
                <div
                  className="fixed flex z-30 mt-8 md:mt-14 ml-12 text-2xl w-12 h-12"
                  onClick={this.closeInputSheet.bind(this)}
                >
                  <FontAwesomeIcon icon={faAngleLeft} />
                </div>
              </div>
            ) : (
              <div className="flex justify-start fixed container z-30">
                <div className="fixed flex z-30 mt-9 md:mt-14 ml-12 text-lg">
                  <FontAwesomeIcon icon={faAlignJustify} />
                </div>
              </div>
            )}
          </>
        )}
        {open_search ? (
          <>
            <div className="w-screen h-screen z-20 fixed bg-white">
              <div className="bg-white shadow overflow-hidden sm:rounded-md mt-24">
                <ul className="divide-y divide-gray-200">
                  {cafe_list.map((cafe, index) => (
                    <li>
                      <a
                        className="block hover:bg-gray-50"
                        onClick={() => this.clickCafeSearchSheet(index)}
                      >
                        <div className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-thin text-gray-700 truncate">
                              {cafe.address}
                            </p>
                            <div className="ml-2 flex-shrink-0 flex">
                              {cafe.cafe_open ? (
                                <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                  Open
                                </p>
                              ) : (
                                <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                  Close
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="mt-2 sm:flex sm:justify-between">
                            <div className="sm:flex">
                              <p className="flex items-center text-lg font-bold text-gray-500">
                                {cafe.title}
                              </p>
                            </div>
                          </div>
                        </div>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        ) : (
          <>
            <SwipeableBottomSheet
              overflowHeight={48}
              shadowTip={false}
              topShadow={false}
              open={open}
              onChange={this.openBottomSheet.bind(this)}
            >
              <div className="h-99 z-30 text-center">
                {open ? (
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
                <div className="w-screen mt-6 pb-16">
                  <Slider
                    ref={(slider) => (this.slider = slider)}
                    {...settings}
                  >
                    {cafe_list.map((cafe, index) => (
                      <div className="w-screen">
                        <div className="min-h-screen min-w-screen bg-gray-100 flex items-center justify-center">
                          <div>
                            <div className="flex flex-col max-w-md bg-white px-8 py-6 rounded-xl space-y-3 items-center">
                              <h3 className="font-serif font-bold text-gray-900 text-xl">
                                {cafe.title}
                              </h3>
                              <img
                                className="w-full rounded-md"
                                src={cafe.file}
                                alt="motivation"
                                key={index}
                              />
                              <div className="flex items-center mt-4 text-gray-700">
                                <FontAwesomeIcon icon={faSmile} />
                                <h1 className="px-2 text-sm"> {cafe.name}</h1>
                              </div>
                              <div className="flex items-center mt-4 text-gray-700">
                                <h1 className="px-2 text-sm">
                                  {cafe.instagram}
                                </h1>
                              </div>
                              <div className="flex items-center mt-4 text-gray-700">
                                <FontAwesomeIcon icon={faMap} />
                                <h1 className="px-2 text-sm">{cafe.address}</h1>
                              </div>
                              <span className="text-center">
                                {cafe.phone_number}
                              </span>
                              <p className="text-center leading-relaxed">
                                {cafe.content}
                              </p>
                              <button className="px-24 py-4 bg-gray-900 rounded-md text-white text-sm focus:border-transparent">
                                Read article
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </Slider>
                </div>
              </div>
            </SwipeableBottomSheet>
          </>
        )}
      </div>
    );
  }
}

export default App;

/*
 <li>
                    <a class="block hover:bg-gray-50">
                      <div class="px-4 py-4 sm:px-6">
                        <div class="flex items-center justify-between">
                          <p class="text-sm font-thin text-gray-700 truncate"></p>
                          <div class="ml-2 flex-shrink-0 flex">
                            <p class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              마감
                            </p>
                          </div>
                        </div>
                        <div class="mt-2 sm:flex sm:justify-between">
                          <div class="sm:flex">
                            <p class="flex items-center text-lg font-light text-gray-500">
                              카페스물다섯
                            </p>
                          </div>
                        </div>
                      </div>
                    </a>
                  </li>
*/
