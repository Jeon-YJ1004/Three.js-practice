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
		const shape = new THREE.Shape(); // Shape 클래스 생성
		shape.moveTo(0, 1.5);
		shape.bezierCurveTo(2, 3.5, 4, 1.5, 2, -0.5);
		shape.lineTo(0, -2.5);
		shape.lineTo(-2, -0.5);
		shape.bezierCurveTo(-4, 1.5, -2, 3.5, 0, 1.5);
		const settings = {
			steps: 1, //깊이 방향으로의 분할 수 default 1
			depth: 1, //깊이 값 default 1
			bevelEnabled: true, // beveling 처리 여부 default true
			bevelThickness: 1.4, //beveling 두께값 default 6
			bevelSize: 1.3, //shape의 외곽선으로부터 얼마나 멀리 beveling 할 것인지=> 커질수록 부푸는것 같음 default 2
			bevelSegments: 2, //beveling 단계수
		};

		const geometry = new THREE.ExtrudeGeometry(shape, settings);

		const fillMaterial = new THREE.MeshPhongMaterial({ color: 0x515151 }); // 회색 색상의 재질로 mesh 타입 오브젝트 생성
		const cube = new THREE.Mesh(geometry, fillMaterial);

		const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffff00 }); // 노란색 선 재질 생성

		const line = new THREE.LineSegments(
			new THREE.WireframeGeometry(geometry),
			lineMaterial
		); // 앞에서 만든 geometry를 이용해 line타입 오브젝트 생성
		//WireframeGeometry 클래스: 와이어프레임 형태로 지오메트리 표현
		//만약 WireframeGeometry 적용하지 않고 생성하면 모델의 모든 외곽선이 표시되지 않음.

		const group = new THREE.Group();
		// mesh 오브젝트와 line 오브젝트를 하나의 오브젝트로 다루기 위해 그룹으로 묶음

		group.add(cube);
		group.add(line); //group에 추가하지 않으면 추가한 geometry만 표시.

		this._scene.add(group);
		this._cube = group; // 그룹 객체를 scene에 추가
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
		camera.position.x = -15;

		camera.position.z = 10;
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
		time *= 0.001; // second unit
		// this._cube.rotation.x = time; //this._cube(_setupModel에서 만들어 둔 정육면체 mesh)에 x,y축에 대한 회전값에 time 값 지정->회전
		// this._cube.rotation.y = time;
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
