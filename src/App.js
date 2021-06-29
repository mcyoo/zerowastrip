import React, { Component } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faAngleUp,
  faAngleDown,
  faAngleLeft,
  faMap,
  faPhone,
  faClock,
  faDirections,
  faQuestionCircle,
} from "@fortawesome/free-solid-svg-icons";
import SwipeableBottomSheet from "react-swipeable-bottom-sheet";
import "./assets/main.css";
import pruncup_cafe from "./assets/img/pruncup_cafe.png";
import youarehere from "./assets/img/youarehere.png";

import Slider from "react-slick";
import axios from "axios";
import { faInstagram } from "@fortawesome/free-brands-svg-icons";

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
      cafe_list_icon: [],
      cafe_num: 0,
      loading: true,
      map: null,
      userInput: "",
    };
  }

  // SearchBox 에 props로 넘겨줄 handleChange 메소드 정의
  handleInput = (e) => {
    this.setState({
      userInput: e.target.value,
    });
  };

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
        var imageSrc = pruncup_cafe;

        // 마커 이미지의 이미지 크기 입니다
        var imageSize = new kakao.maps.Size(43, 65);

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
  get_user_position() {
    var map = this.state.map;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function (position) {
        var lat = position.coords.latitude, // 위도
          lon = position.coords.longitude; // 경도

        var locPosition = new kakao.maps.LatLng(lat, lon); // 마커가 표시될 위치를 geolocation으로 얻어온 좌표로 생성합니다
        var imageSrc = youarehere;
        var imageSize = new kakao.maps.Size(36, 36);
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

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(function (position) {
            var lat = position.coords.latitude, // 위도
              lon = position.coords.longitude; // 경도

            var locPosition = new kakao.maps.LatLng(lat, lon); // 마커가 표시될 위치를 geolocation으로 얻어온 좌표로 생성합니다
            var imageSrc = youarehere;
            var imageSize = new kakao.maps.Size(36, 36);
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
    const { handleInput } = this;
    const filteredCafe = this.state.cafe_list.filter((cafe) => {
      return cafe.title.toLowerCase().includes(this.state.userInput);
    });

    const settings = {
      adaptiveHeight: false,
      arrows: true,
      dots: false,
      infinite: true,
      speed: 800,
      slidesToShow: 1,
      slidesToScroll: 1,
      swipeToSlide: true,
      initialSlide: cafe_num,
      nextArrow: <SampleNextArrow />,
      prevArrow: <SamplePrevArrow />,
      afterChange: (new_index) => {
        this.clickCafeSearchSheet(new_index);
      },
    };
    return (
      <div className="flex overflow-hidden overscroll-none w-screen h-screen z-0 main">
        <div class="absolute bottom-14 right-5 md:bottom-20 md:right-10 z-10">
          <button
            onClick={() => this.get_user_position()}
            class="p-0 w-10 h-10 md:w-20 md:h-20 bg-blue-200 rounded-full hover:bg-blue-200 active:shadow-lg mouse shadow transition ease-in duration-200 focus:outline-none"
          >
            <svg
              version="1.0"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 100.000000 100.000000"
              preserveAspectRatio="xMidYMid meet"
              className="w-10 h-10 md:w-20 md:h-20"
            >
              {" "}
              <g
                transform="translate(0.000000,100.000000) scale(0.100000,-0.100000)"
                fill="#000000"
                stroke="none"
              >
                {" "}
                <path d="M406 890 c-63 -16 -153 -70 -197 -117 -22 -24 -55 -74 -72 -111 -29 -61 -32 -76 -32 -163 0 -90 2 -99 37 -171 45 -91 103 -147 196 -191 61 -29 76 -32 162 -32 86 0 101 3 162 32 93 44 151 100 196 191 35 72 37 81 37 172 0 91 -2 100 -37 172 -68 136 -188 217 -336 224 -42 2 -94 -1 -116 -6z m237 -90 c61 -29 127 -95 158 -157 20 -40 24 -63 24 -143 0 -112 -20 -164 -91 -234 -70 -71 -122 -91 -234 -91 -80 0 -103 4 -143 24 -61 30 -129 97 -157 157 -28 56 -37 164 -21 231 25 101 115 197 215 229 62 21 190 13 249 -16z m-401 -52 c-23 -23 -51 -60 -62 -82 -11 -23 -20 -34 -20 -25 0 30 91 149 113 149 6 0 -9 -19 -31 -42z m553 -25 c19 -25 35 -50 35 -55 0 -5 -16 12 -37 38 -20 27 -46 57 -57 67 l-21 18 22 -11 c12 -6 38 -31 58 -57z m52 -115 c-3 -7 -5 -2 -5 12 0 14 2 19 5 13 2 -7 2 -19 0 -25z m0 -240 c-3 -8 -6 -5 -6 6 -1 11 2 17 5 13 3 -3 4 -12 1 -19z m-600 -126 c24 -24 35 -39 26 -33 -40 21 -113 119 -113 151 0 8 10 -5 22 -30 13 -25 42 -64 65 -88z m571 66 c-19 -33 -70 -88 -93 -100 -11 -5 -6 2 12 16 17 14 44 46 59 70 29 46 46 57 22 14z"></path>{" "}
                <path d="M470 615 c-85 -30 -159 -60 -164 -69 -16 -25 11 -44 88 -62 l73 -17 17 -73 c19 -78 37 -104 63 -88 13 8 65 147 118 315 5 16 -18 50 -33 48 -4 0 -77 -25 -162 -54z m160 2 c0 -24 -87 -272 -95 -272 -4 0 -16 28 -25 62 -22 80 -30 89 -93 103 -29 7 -58 16 -64 19 -7 4 40 24 105 45 64 21 120 41 124 45 13 12 48 10 48 -2z"></path>{" "}
              </g>{" "}
            </svg>
          </button>
        </div>
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
                type="search"
                placeholder="참여카페 찾기"
                onChange={this.handleInput}
                onClick={this.openInputSheet.bind(this)}
              />
            </div>
            {open_search ? (
              <div className="flex justify-start fixed container z-30">
                <div
                  className="fixed flex z-30 mt-8 md:mt-12 ml-14 text-3xl w-12 h-12"
                  onClick={this.closeInputSheet.bind(this)}
                >
                  <FontAwesomeIcon icon={faAngleLeft} />
                </div>
              </div>
            ) : (
              <div className="flex justify-start fixed container z-30">
                <div className="fixed flex z-30 mt-9 md:mt-14 ml-14 text-lg">
                  <FontAwesomeIcon icon={faSearch} />
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
                  {filteredCafe.map((cafe, index) => (
                    <li>
                      <a
                        className="block hover:bg-gray-50"
                        onClick={() => this.clickCafeSearchSheet(cafe.id - 1)}
                      >
                        <div className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-thin text-gray-700 truncate">
                              {cafe.address}
                            </p>
                            <div className="ml-2 flex-shrink-0 flex">
                              {cafe.check_time ? (
                                <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-green-800">
                                  자세히 확인
                                </p>
                              ) : cafe.cafe_open ? (
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
                    className="mt-1 text-3xl md:text-4xl opacity-50 mb-2"
                    onClick={this.toggleBottomSheet.bind(this)}
                  />
                ) : (
                  <FontAwesomeIcon
                    icon={faAngleUp}
                    className="mt-1 text-3xl md:text-4xl opacity-50 mb-2"
                    onClick={this.toggleBottomSheet.bind(this)}
                  />
                )}
              </div>
              <Slider ref={(slider) => (this.slider = slider)} {...settings}>
                {cafe_list.map((cafe, index) => (
                  <div className="flex flex-col z-50 h-99 justify-center items-center text-center">
                    <h3 className="text-gray-600 text-xl items-center font-bold font-mono">
                      {cafe.title}
                    </h3>
                    <div className="flex text-center items-center justify-center mt-2">
                      <img
                        className="h-48 w-48 md:w-96 md:h-96"
                        src={cafe.image}
                      />
                    </div>
                    <div className="flex items-center text-gray-700 ml-5 md:ml-10 justify-between">
                      <div className="flex">
                        <FontAwesomeIcon
                          className="text-xl"
                          icon={faInstagram}
                        />
                        <a
                          className="px-2 text-sm"
                          href={
                            "https://www.instagram.com/" +
                            cafe.instagram.slice(1)
                          }
                        >
                          {cafe.instagram}
                        </a>
                      </div>
                      <a href={cafe.kakaomap_url}>
                        <FontAwesomeIcon
                          className=" text-5xl text-blue-500 mr-10 mt-6"
                          icon={faDirections}
                        />
                      </a>
                    </div>
                    <div className="flex items-center -mt-4 text-gray-700 ml-5 md:ml-10">
                      <FontAwesomeIcon icon={faMap} />
                      <h1 className="px-2 text-sm">{cafe.address}</h1>
                    </div>
                    <div className="flex items-center mt-2 text-gray-700 ml-5 md:ml-10">
                      <FontAwesomeIcon icon={faPhone} />
                      <a
                        className="px-2 text-sm"
                        href={"tel:" + cafe.phone_number}
                      >
                        {cafe.phone_number}
                      </a>
                    </div>
                    <div className="flex mt-2 text-gray-700 items-center ml-5 md:ml-10">
                      <FontAwesomeIcon icon={faClock} />
                      <a className="px-2 text-sm">{cafe.content}</a>
                    </div>

                    <div className="flex items-center mt-2 text-gray-700 ml-5 md:ml-10">
                      <FontAwesomeIcon icon={faQuestionCircle} />
                      <a className="px-2 text-sm">{cafe.name}</a>
                    </div>

                    <div className="flex items-center my-3 text-gray-700 ml-5 md:ml-10">
                      {[
                        cafe.no_straw,
                        cafe.no_plasticCup,
                        cafe.use_biodegradable,
                        cafe.vegan,
                        cafe.discount_pruncup,
                        cafe.allow_pat,
                        cafe.food,
                        cafe.desert,
                        cafe.pruncup_rental,
                      ].map((icon_data, index) =>
                        icon_data ? (
                          <img
                            className="w-8 mr-2 "
                            src={
                              require(`./assets/img/icon/icon-0${
                                index + 2
                              }.png`).default
                            }
                          />
                        ) : null
                      )}
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
function SampleNextArrow(props) {
  const { className, style, onClick } = props;
  return (
    <div
      className={className}
      style={{
        ...style,
        zIndex: "60",
        marginRight: "30px",
        borderRadius: "40px",
        background: "black",
      }}
      onClick={onClick}
    ></div>
  );
}

function SamplePrevArrow(props) {
  const { className, style, onClick } = props;
  return (
    <div
      className={className}
      style={{
        ...style,
        zIndex: "60",
        marginLeft: "30px",
        background: "black",
        borderRadius: "40px",
      }}
      onClick={onClick}
    />
  );
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
