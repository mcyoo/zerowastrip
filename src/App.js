import React, { Component } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faAngleUp,
  faAngleDown,
  faAngleLeft,
  faAlignJustify,
  faMap,
  faPhone,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import SwipeableBottomSheet from "react-swipeable-bottom-sheet";
import "./assets/main.css";
import bottle from "./assets/img/symbol.png";
import you_here from "./assets/img/you_here.png";
import Slider from "react-slick";
import axios from "axios";

/*global kakao*/

var temp = 0;
const map_level = 5;
const panTo_latlngX = 0.009;
class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      open: false,
      open_search: false,
      cafe_list: [],
      cafe_num: 0,
      loading: true,
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

  cafeSetMap() {
    const script = document.createElement("script");
    script.async = true;
    script.src =
      "//dapi.kakao.com/v2/maps/sdk.js?appkey=9fcfc5ba629ae84b1930d4ba4e458ccb&libraries=services,clusterer&autoload=false";
    document.head.appendChild(script);

    const map = this.state.map;
    const positions = this.state.cafe_list;

    script.onload = () => {
      kakao.maps.load(() => {
        function panTo(x, y) {
          var moveLatLon = new kakao.maps.LatLng(x, y);
          map.panTo(moveLatLon);
        }

        // 마커 이미지의 이미지 주소입니다
        var imageSrc = bottle;

        // 마커 이미지의 이미지 크기 입니다
        var imageSize = new kakao.maps.Size(20, 30);

        // 마커 이미지를 생성합니다
        var markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize);

        for (var i = 0; i < positions.length; i++) {
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
              react_function.slider.slickGoTo(num, true);
            };
          }
        }
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

  getJson = async () => {
    const data = await axios
      .get("https://powerbyjeseok.link/api/v1/cafes/", {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })
      .then(function (response) {
        return response.data;
      })
      .catch((Error) => {
        console.log(Error);
      });

    return data;
  };

  getData = async () => {
    const { results } = await this.getJson();
    this.setState({
      cafe_list: results,
      loading: false,
    });
  };

  componentDidUpdate() {
    if (temp < 2) {
      this.cafeSetMap();
      temp++;
    }
  }
  componentDidMount() {
    this.getData();
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
          level: 10,
        };
        const map = new window.kakao.maps.Map(container, options);
        this.setState({
          map: map,
        });
        // 마커를 표시할 위치와 title 객체 배열입니다
        // HTML5의 geolocation으로 사용할 수 있는지 확인합니다
        if (navigator.geolocation) {
          // GeoLocation을 이용해서 접속 위치를 얻어옵니다
          navigator.geolocation.getCurrentPosition(function (position) {
            var lat = position.coords.latitude, // 위도
              lon = position.coords.longitude; // 경도

            var locPosition = new kakao.maps.LatLng(lat, lon); // 마커가 표시될 위치를 geolocation으로 얻어온 좌표로 생성합니다
            var imageSrc = you_here;
            var imageSize = new kakao.maps.Size(30, 30);
            var markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize);

            // 마커를 생성합니다
            var marker = new kakao.maps.Marker({
              map: map, // 마커를 표시할 지도
              position: locPosition, // 마커를 표시할 위치
              image: markerImage, // 마커 이미지
            });
            map.setLevel(8);
            map.panTo(locPosition);
            marker.setMap(map);
          });
        } else {
          alert("사용자 위치정보를 확인 할 수 없습니다.");
        }
      });
    };
  }
  render() {
    const { open, open_search, cafe_list, cafe_num } = this.state;
    const settings = {
      adaptiveHeight: true,
      arrows: false,
      dots: false,
      infinite: true,
      speed: 500,
      slidesToShow: 1,
      slidesToScroll: 1,
      swipeToSlide: true,
      initialSlide: cafe_num,

      afterChange: (new_index) => {
        this.clickCafeSearchSheet(new_index);
      },
    };
    return (
      <div className="flex overflow-hidden overscroll-none w-screen h-screen z-0 main">
        <div
          id="Mymap"
          className="w-screen h-93 z-0 overflow-hidden overscroll-none"
        ></div>
        {open ? null : (
          <>
            <div className="flex justify-center md:justify-start fixed container z-30">
              <input
                className="w-10/12 border mt-5 pl-12 font-medium text-gray-900 placeholder-gray-400 py-3 md:py-3 rounded-md focus:outline-none md:ml-10 md:mt-10 md:w-1/3"
                name="cafe"
                placeholder="참여카페 찾기"
                onClick={this.openInputSheet.bind(this)}
                readOnly
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
            <div className="w-screen h-screen z-20 fixed bg-white overflow-auto py-24">
              <div className="bg-white shadow sm:rounded-md overflow-auto">
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
              overflowHeight={46}
              shadowTip={false}
              topShadow={false}
              open={open}
              onChange={this.openBottomSheet.bind(this)}
              bodyStyle={{}}
            >
              <div className="text-center">
                {open ? (
                  <FontAwesomeIcon
                    icon={faAngleDown}
                    className="mt-1 text-3xl opacity-50 mb-6"
                    onClick={this.toggleBottomSheet.bind(this)}
                  />
                ) : (
                  <FontAwesomeIcon
                    icon={faAngleUp}
                    className="mt-1 text-3xl opacity-50 mb-6"
                    onClick={this.toggleBottomSheet.bind(this)}
                  />
                )}
              </div>
              <Slider ref={(slider) => (this.slider = slider)} {...settings}>
                {cafe_list.map((cafe, index) => (
                  <div className="flex justify-center text-center bg-gray-100 z-50">
                    <div className="flex justify-center">
                      <div className="flex flex-col max-w-xl h-99 bg-white px-8 py-2 space-y-4 z-50 overflow-y-scroll overflow-x-hidden">
                        <h3 className=" text-gray-800 text-xl items-center font-bold text-center">
                          {cafe.title}
                        </h3>
                        <h1 className="text-md font-bold text-blue-500">
                          "{cafe.name}"
                        </h1>
                        <img
                          className="rounded-md"
                          src={cafe.image1}
                          alt="motivation"
                          key={index}
                        />

                        <div className="flex items-center mt-4 text-gray-700">
                          <FontAwesomeIcon icon={faSearch} />
                          <a className="px-2 text-sm" href={cafe.instagram}>
                            {cafe.instagram}
                          </a>
                        </div>
                        <div className="flex items-center mt-4 text-gray-700">
                          <FontAwesomeIcon icon={faMap} />
                          <h1 className="px-2 text-sm">{cafe.address}</h1>
                        </div>
                        <div className="flex items-center mt-4 text-gray-700">
                          <FontAwesomeIcon icon={faPhone} />
                          <h1 className="px-2 text-sm">{cafe.phone_number}</h1>
                        </div>
                        <div className="flex mt-4 text-gray-700 items-center">
                          <FontAwesomeIcon icon={faClock} />
                          {cafe.cafe_open ? (
                            <p className="ml-2 px-2 inline-flex text-sm leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Open
                            </p>
                          ) : (
                            <p className="ml-2 px-2 inline-flex text-sm leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                              Close
                            </p>
                          )}
                        </div>
                        <p className="text-left leading-relaxed pt-5 break-words">
                          {cafe.content.split("\n").map((line) => {
                            return (
                              <span>
                                {line}
                                <br />
                              </span>
                            );
                          })}
                        </p>
                        <a
                          className="px-24 py-4 bg-blue-500 rounded-md text-white text-lg focus:border-transparent"
                          href={cafe.kakaomap_url}
                        >
                          찾아가기
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </Slider>
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
