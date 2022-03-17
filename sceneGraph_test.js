import * as THREE from "three";
import { OrbitControls } from "../examples/jsm/controls/OrbitControls.js";

class App {
	constructor() {
		const divContainer = document.querySelector("#webgl-container");
		this._divContainer = divContainer; //객체 필드화. divContainer를 this._divContainer로 다른 method에서 참조할 수 있도록 함

		const renderer = new THREE.WebGLRenderer({ antialias: true }); //antialias는 3차원 장면이 렌더링될 때 오브젝트들의 경계선이 계단 현상없이 부드럽게 표현할 수 있게 함
		renderer.setPixelRatio(window.devicePixelRatio);
		divContainer.appendChild(renderer.domElement); //renderer의 domElement를 divContainer의 자식으로 추가. renderer.comElement는 canvas 타입의 dom 객체

		this._renderer = renderer;

		const scene = new THREE.Scene(); //Scene 객체 생성
		this._scene = scene;

		this._setupCamera();
		this._setupLight();
		this._setupModel();
		this._setupControls();

		window.onresize = this.resize.bind(this); //renderer나 camera는 창 크기가 변경될 때마다 속성값을 재설정해줘야 하기때문에 onresize 이벤트 method 지정
		//bind를 사용해서 지정하는 이유는 resize method 안에서 this가 가르키는 객체가 이벤트 객체가 아닌 App 클래스의 객체가 되도록 하기 위해서
		this.resize();

		requestAnimationFrame(this.render.bind(this)); //render method는 3차원 그래픽 장면을 만들어 requestAnimationFrame에 넘겨 줘서 적당한 시점에 최대한 빠르게 이 render 메소드 호출
		//bind 사용 이유는 위와 같음
	}

	_setupControls() {
		new OrbitControls(this._camera, this._divContainer);
	}

	_setupModel() {
		// Object3D 타입의 solarSystem 객체 생성, scene에 추가
		const solarSystem = new THREE.Object3D();
		this._scene.add(solarSystem);

		// 구 모양 geometry 생성
		const radius = 1;
		const widthSegments = 12;
		const heightSegments = 12;
		const sphereGeometry = new THREE.SphereGeometry(
			radius,
			widthSegments,
			heightSegments
		);
		//텍스쳐 매핑을 위해 TextureLoader 클래스 선언
		const loader = new THREE.TextureLoader();
		// 태양 재질 생성, 콜백함수 지정
		const sunMaterial = new THREE.MeshBasicMaterial({
			map: loader.load(
				"./img/8k_sun.jpg",
				undefined,
				undefined,
				function (err) {
					alert("Error");
				}
			),
		});
		// sunMesh 객체 생성
		const sunMesh = new THREE.Mesh(sphereGeometry, sunMaterial);

		// 원래 지오메트리 크기보다 3배의 크기로 표시
		sunMesh.scale.set(3, 3, 3);
		solarSystem.add(sunMesh);

		// Object3D 타입의 earthOrbit 객체 생성
		const earthOrbit = new THREE.Object3D();
		// earthOrbit 객체를 solarSystem의 자식으로 추가함
		solarSystem.add(earthOrbit);

		// 지구 재질 생성
		const earthMaterial = new THREE.MeshBasicMaterial({
			map: loader.load(
				"./img/8k_earth_daymap.jpg",
				undefined,
				undefined,
				function (err) {
					alert("Error");
				}
			),
		});

		const earthMesh = new THREE.Mesh(sphereGeometry, earthMaterial); // earthMesh 객체 생성
		earthOrbit.position.x = 10; // 태양에서 x축으로 거리 10만큼 떨어진 위치로 지구 배치
		earthOrbit.add(earthMesh); // earthMesh 객체를 earthOrbit의 자식으로 추가

		const moonOrbit = new THREE.Object3D(); // Object3D 타입의 moonOrbit 객체 생성

		/* 
		 moonorbit은 earthOrbit의 자식이므로, earthOrbit 기준으로 x축 거리 2만큼 떨어진 곳에 배치됨
		 태양 관점에서 보면 moonOrbit은 거리 12만큼 떨어짐
		 */
		moonOrbit.position.x = 2;

		earthOrbit.add(moonOrbit); // 생성한 moonOrbit 객체를 earthOrbit의 자식으로 추가함

		// 달 재질 생성
		const moonMaterial = new THREE.MeshBasicMaterial({
			map: loader.load(
				"./img/8k_moon.jpg",
				undefined,
				undefined,
				function (err) {
					alert("Error");
				}
			),
		});
		// moonMesh 생성
		const moonMesh = new THREE.Mesh(sphereGeometry, moonMaterial);

		moonMesh.scale.set(0.5, 0.5, 0.5); // 원래 구 반지름 절반 크기로 달이 생성됨

		moonOrbit.add(moonMesh); // moonMesh를 moonOrbit의 자식으로 추가

		// 객체를 다른 메서드에서 참조할수 있도록함
		this._solarSystem = solarSystem;
		this._earthOrbit = earthOrbit;
		this._moonOrbit = moonOrbit;
	}

	_setupCamera() {
		const width = this._divContainer.clientWidth; // three.js가 3차원 그래픽을 출력할 영역에 대한 가로와 세로에 대한 크기 얻어옴
		const height = this._divContainer.clientHeight;
		const camera = new THREE.PerspectiveCamera(
			75,
			window.innerWidth / window.innerHeight,
			0.1,
			100
		);

		camera.position.z = 50;
		this._camera = camera;
	}

	_setupLight() {
		// 광원의 색상과 세기로 광원 생성하고 위치(position)잡음.
		const color = 0xffffff;
		const intensity = 1;
		const light = new THREE.DirectionalLight(color, intensity);
		light.position.set(-1, 2, 4);
		this._scene.add(light); //scene객체에 추가
	}

	update(time) {
		time *= 0.001;
		// solarSystem은 y축에 대해 계속 회전
		this._solarSystem.rotation.y = time / 1;
		// 지구의 자전
		this._earthOrbit.rotation.y = time * 2;
		// 달의 자전
		this._moonOrbit.rotation.y = time * 6;
	}

	render(time) {
		//인자인 time은 렌더링이 처음 시작된 이후 경과된 시간 값으로  milli-sec.
		this._renderer.render(this._scene, this._camera); //renderer가 scene을 카메라시점으로 렌더링하게끔
		this.update(time); //속성값 변경으로 애니메이션 효과 발생

		requestAnimationFrame(this.render.bind(this));
	}

	resize() {
		//창 크기가 변경될때 발생하는 이벤트를 통해서 호출되는 method
		const width = this._divContainer.clientWidth;
		const height = this._divContainer.clientHeight;

		this._camera.aspect = width / height;
		this._camera.updateProjectionMatrix();

		this._renderer.setSize(width, height);
	}
}

window.onload = function () {
	new App();
};
