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
  faAngleRight,
  faMapPin,
} from "@fortawesome/free-solid-svg-icons";
import SwipeableBottomSheet from "react-swipeable-bottom-sheet";
import "./assets/main.css";
import pruncup_cafe from "./assets/img/pruncup_cafe.png";
import rental_cafe from "./assets/img/rental_cafe.png";
import youarehere from "./assets/img/smile_icon.png";
import eco_place from "./assets/img/eco_place.png";
import Slider from "react-slick";
import axios from "axios";
import { faInstagram } from "@fortawesome/free-brands-svg-icons";

/*global kakao*/
const map_level = 5;
const panTo_latlngX = 0.009;
let update_defence = true;
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

  openBottomSheet(open, num = this.state.cafe_num) {
    const map = this.state.map;
    this.setState({ open, open_search: false, cafe_num: num });

    var panTo_latlngX_default = 0;
    if (open === true) {
      panTo_latlngX_default = panTo_latlngX;
    }

    kakao.maps.load(() => {
      var moveLatLon = new kakao.maps.LatLng(
        this.state.cafe_list[num].lat - panTo_latlngX_default,
        this.state.cafe_list[num].lng
      );
      map.setLevel(map_level);
      map.panTo(moveLatLon);
    });
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

  setMap = () => {
    kakao.maps.load(() => {
      let container = document.getElementById("Mymap");
      let options = {
        center: new kakao.maps.LatLng(33.371776, 126.543786),
        level: 9,
      };
      const map = new window.kakao.maps.Map(container, options);
      this.setState({
        map: map,
      });
    });
  };

  setCafe = () => {
    const positions = this.state.cafe_list;
    const map = this.state.map;

    function panTo(x, y) {
      var moveLatLon = new kakao.maps.LatLng(x, y);
      map.panTo(moveLatLon);
    }

    // 마커 이미지의 이미지 주소입니다
    var imageSrc = pruncup_cafe;
    var imageSrc_rental = rental_cafe;
    var imageSrc_eco = eco_place;

    // 마커 이미지의 이미지 크기 입니다
    var imageSize = new kakao.maps.Size(25, 40);
    var imageSize_eco = new kakao.maps.Size(20, 20);

    // 마커 이미지를 생성합니다
    var markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize);
    var markerImage_rental = new kakao.maps.MarkerImage(
      imageSrc_rental,
      imageSize
    );
    var markerImage_eco = new kakao.maps.MarkerImage(
      imageSrc_eco,
      imageSize_eco
    );
    var array_rental_cafe = [
      "카페 제주소녀",
      "화순별곡",
      "제레미",
      "소로소로",
      "픽스커피 공단점",
      "인더그린",
      "버터행성706",
      "죠지트럭커피",
      "발트글라스",
      "제주동네",
    ];
    var array_eco_place = [
      "핸드메이드라이프",
      "꽃마리 리필스토어",
      "올바른농민상회",
      "지구별가게",
      "벨아벨지구생각작업실",
      "제주용기",
      "마이아일랜드",
    ];
    var marker = "";
    for (var i = 0; i < positions.length; i++) {
      // 대여소
      if (array_rental_cafe.includes(positions[i].title)) {
        marker = new kakao.maps.Marker({
          map: map, // 마커를 표시할 지도
          position: new kakao.maps.LatLng(positions[i].lat, positions[i].lng), // 마커를 표시할 위치
          title: positions[i].title, // 마커의 타이틀, 마커에 마우스를 올리면 타이틀이 표시됩니다
          image: markerImage_rental, // 마커 이미지
        });
      } else if (array_eco_place.includes(positions[i].title)) {
        marker = new kakao.maps.Marker({
          map: map, // 마커를 표시할 지도
          position: new kakao.maps.LatLng(positions[i].lat, positions[i].lng), // 마커를 표시할 위치
          title: positions[i].title, // 마커의 타이틀, 마커에 마우스를 올리면 타이틀이 표시됩니다
          image: markerImage_eco, // 마커 이미지
        });
      } else {
        marker = new kakao.maps.Marker({
          map: map, // 마커를 표시할 지도
          position: new kakao.maps.LatLng(positions[i].lat, positions[i].lng), // 마커를 표시할 위치
          title: positions[i].title, // 마커의 타이틀, 마커에 마우스를 올리면 타이틀이 표시됩니다
          image: markerImage, // 마커 이미지
        });
      }
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
  };

  componentDidMount() {
    this.getData();
    this.setMap();
  }

  componentDidUpdate() {
    if (update_defence === true) {
      if (this.state.loading === false) {
        this.setCafe();
        update_defence = false;
      }
    }
  }

  render() {
    const { open, open_search, cafe_list, cafe_num } = this.state;
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
      <div className="flex overflow-hidden overscroll-none w-screen h-screen z-20 main">
        <div className="absolute bottom-36 md:bottom-20 right-6 z-10">
          <button
            onClick={() => this.get_user_position()}
            className="p-2 w-10 h-10 md:w-16 md:h-16 bg-blue-200 rounded-full hover:bg-blue-100 active:shadow-lg mouse shadow transition ease-in duration-200 focus:outline-none"
          >
            <FontAwesomeIcon icon={faMapPin} className="md:text-2xl" />
          </button>
        </div>
        {open ? null : (
          <div className="absolute top-16 md:top-28 z-10 flex flex-col space-y-1 md:space-y-3 font-medium">
            <div className="flex items-center">
              <img
                src={pruncup_cafe}
                className="w-6 ml-8 md:ml-10 md:w-8"
                alt="pruncup_cafe"
              ></img>
              <div className="text-sm text-gray-800 md:text-md ml-2">
                참여 카페
              </div>
            </div>

            <div className="flex items-center">
              <img
                src={rental_cafe}
                className="w-6 ml-8 md:ml-10 md:w-8"
                alt="rental_cafe"
              ></img>
              <div className="text-sm text-gray-800 md:text-md ml-2">
                푸른컵 대여소
              </div>
            </div>

            <div className="flex items-center">
              <img
                src={eco_place}
                className="w-6 ml-8 md:ml-10 md:w-8"
                alt="eco_place"
              ></img>
              <div className="text-sm text-gray-800 md:text-md ml-2">
                친환경 매장
              </div>
            </div>
          </div>
        )}
        <div
          id="Mymap"
          className="w-screen h-93 z-0 overflow-hidden overscroll-none"
        ></div>

        {open ? null : (
          <>
            <div className="flex justify-center md:justify-start fixed container z-30">
              {open_search ? (
                <input
                  className="w-10/12 mt-5 border pl-10 text-gray-800 placeholder-gray-400 py-2 rounded-md focus:outline-none md:ml-10 md:mt-10 md:w-1/3 text-sm"
                  name="cafe"
                  type="search"
                  placeholder="참여카페 찾기"
                  onChange={this.handleInput}
                  onClick={this.closeInputSheet.bind(this)}
                  readOnly
                />
              ) : (
                <input
                  className="w-10/12 mt-5 border pl-10 text-gray-800 placeholder-gray-400 py-2 rounded-md focus:outline-none md:ml-10 md:mt-10 md:w-1/3 text-sm"
                  name="cafe"
                  type="search"
                  placeholder="참여카페 찾기"
                  onChange={this.handleInput}
                  onClick={this.openInputSheet.bind(this)}
                  readOnly
                />
              )}
            </div>
            {open_search ? (
              <div className="flex justify-start fixed container z-30">
                <div className="fixed flex z-30 mt-8 ml-12 md:mt-11 text-lg md:text-3xl">
                  <FontAwesomeIcon icon={faAngleLeft} />
                </div>
              </div>
            ) : (
              <div className="flex justify-start fixed container z-30">
                <div className="fixed flex z-30 mt-8 md:mt-12 ml-12 text-sm md:text-xl">
                  <FontAwesomeIcon icon={faSearch} />
                </div>
              </div>
            )}
          </>
        )}
        {open_search ? (
          <>
            <div className="w-screen h-screen z-20 fixed bg-white overflow-auto py-32">
              <div className="bg-white shadow sm:rounded-md overflow-auto">
                <ul className="divide-y divide-gray-200">
                  {filteredCafe.map((cafe, index) => (
                    <li>
                      <button
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
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        ) : (
          <>
            <SwipeableBottomSheet
              overflowHeight={40}
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
                    className="mt-1 text-2xl md:text-4xl opacity-50 mb-2"
                    onClick={this.toggleBottomSheet.bind(this)}
                  />
                ) : (
                  <FontAwesomeIcon
                    icon={faAngleUp}
                    className="mt-1 text-2xl md:text-4xl opacity-50 mb-2"
                    onClick={this.toggleBottomSheet.bind(this)}
                  />
                )}
              </div>
              <Slider ref={(slider) => (this.slider = slider)} {...settings}>
                {cafe_list.map((cafe, index) => (
                  <div className="w-screen overflow-x-hidden" key={index}>
                    <div className="pt-0">
                      <div className="px-2">
                        <div className="max-w-md mx-auto shadow-lg rounded-md overflow-hidden md:max-w-2xl">
                          <div className="flex">
                            <div className="w-full">
                              <div className="flex justify-center items-center">
                                <div className="flex flex-row items-center text-center mb-4">
                                  <h3 className="text-gray-600 text-xl items-center font-bold font-mono">
                                    {cafe.title}
                                  </h3>
                                </div>
                              </div>
                              <div className="flex justify-center items-center">
                                <img
                                  className="h-48 w-48 md:w-96 md:h-96"
                                  src={cafe.image}
                                  key={cafe.title}
                                  alt="cafe_image"
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
                                <span className="px-2 text-sm">
                                  {cafe.content}
                                </span>
                              </div>
                              <div className="flex items-center mt-2 text-gray-700 ml-5 md:ml-10">
                                <FontAwesomeIcon icon={faQuestionCircle} />
                                <span className="px-2 text-sm">
                                  {cafe.name}
                                </span>
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
                                      key={`icon-0"${index + 2}`}
                                      alt="icon"
                                    />
                                  ) : null
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
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
function SampleNextArrow(props) {
  const { onClick } = props;
  return (
    <FontAwesomeIcon
      icon={faAngleRight}
      className="text-3xl md:text-4xl opacity-50 absolute top-52 right-3 z-50"
      onClick={onClick}
    />
  );
}

function SamplePrevArrow(props) {
  const { onClick } = props;
  return (
    <FontAwesomeIcon
      icon={faAngleLeft}
      className="text-3xl md:text-4xl opacity-50 absolute top-52 left-3 z-50"
      onClick={onClick}
    />
  );
}

export default App;
