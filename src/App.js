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

        // 커스텀 오버레이에 표시할 내용입니다
        // HTML 문자열 또는 Dom Element 입니다
        var content = '<div class="overlay_info">';
        content +=
          '    <a href="https://place.map.kakao.com/m/322286925" target="_blank"><strong>지구별가게</strong></a>';
        content += '    <div class="desc">';
        content += '        <img src="jigubul.jpeg" alt="">';
        content +=
          '        <span class="address">제주특별자치도 제주시 월랑북2길 16 1층</span>';
        content += "</div>";
        content += "</div>";

        // 마커를 표시할 위치입니다
        var position = new kakao.maps.LatLng(33.492789, 126.475179);

        // 마커를 생성합니다
        var marker = new kakao.maps.Marker({
          position: position,
          clickable: true, // 마커를 클릭했을 때 지도의 클릭 이벤트가 발생하지 않도록 설정합니다
        });

        // 아래 코드는 위의 마커를 생성하는 코드에서 clickable: true 와 같이
        // 마커를 클릭했을 때 지도의 클릭 이벤트가 발생하지 않도록 설정합니다
        // marker.setClickable(true);

        // 마커를 지도에 표시합니다.
        marker.setMap(map);

        // 마커를 클릭했을 때 마커 위에 표시할 인포윈도우를 생성합니다
        var iwContent = content, // 인포윈도우에 표출될 내용으로 HTML 문자열이나 document element가 가능합니다
          iwRemoveable = true; // removeable 속성을 ture 로 설정하면 인포윈도우를 닫을 수 있는 x버튼이 표시됩니다

        // 인포윈도우를 생성합니다
        var infowindow = new kakao.maps.InfoWindow({
          content: iwContent,
          removable: iwRemoveable,
        });
        // 커스텀 오버레이를 생성합니다
        var mapCustomOverlay = new kakao.maps.CustomOverlay({
          position: position,
          content: content,
          xAnchor: 0.5, // 커스텀 오버레이의 x축 위치입니다. 1에 가까울수록 왼쪽에 위치합니다. 기본값은 0.5 입니다
          yAnchor: 1.3, // 커스텀 오버레이의 y축 위치입니다. 1에 가까울수록 위쪽에 위치합니다. 기본값은 0.5 입니다
        });

        // 마커에 클릭이벤트를 등록합니다
        var click_bool = true;
        kakao.maps.event.addListener(marker, "click", function () {
          // 마커 위에 인포윈도우를 표시합니다
          //infowindow.open(map, marker);
          // 커스텀 오버레이를 지도에 표시합니다
          if (click_bool) {
            mapCustomOverlay.setMap(map);
            click_bool = false;
          } else {
            mapCustomOverlay.setMap(null); // 지도에서 제거한다.
            click_bool = true;
          }
        });
      });
    };
  }
  render() {
    return <div id="Mymap" className="w-screen h-screen"></div>; // 이부분이 지도를 띄우게 될 부분.
  }
}

export default App;
